import bcrypt from 'bcryptjs';
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { loadEnv } from '../config/env';
import { query, withClient } from '../lib/db';
import { ConflictError, UnauthorizedError, BadRequestError } from '../middleware/error';
import { getLogger } from '../lib/logger';
import { getSupabase } from '../lib/supabase';

const BCRYPT_COST = 12;

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === '23505'
  );
}

export interface AuthResult {
  user: User;
  token: string;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at.toISOString(),
  };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(userId: string): string {
  const env = loadEnv();
  const payload: JwtPayload = { sub: userId };
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): { userId: string } {
  const env = loadEnv();
  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  if (!decoded.sub || typeof decoded.sub !== 'string') {
    throw new UnauthorizedError('Invalid token payload');
  }
  return { userId: decoded.sub };
}

export async function syncUserToDb(id: string, email: string, name: string): Promise<void> {
  await query(
    `INSERT INTO users (id, name, email, password_hash)
     VALUES ($1, $2, $3, '')
     ON CONFLICT (id) DO NOTHING`,
    [id, email, name],
  );
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const { name, email, password } = input;

  if (process.env.NODE_ENV !== 'test') {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      if (error.status === 409) {
        throw new ConflictError('Email already registered');
      }
      throw new BadRequestError(error.message);
    }
    if (!data.user) {
      throw new BadRequestError('Failed to create user in Supabase');
    }
    const user = {
      id: data.user.id,
      name,
      email,
      createdAt: data.user.created_at || new Date().toISOString(),
    };
    await syncUserToDb(user.id, user.email, user.name);
    const token = data.session?.access_token || '';
    return { user, token };
  }

  // Local/Test Fallback
  const passwordHash = await hashPassword(password);
  try {
    const row = await withClient<UserRow>(async (client) => {
      const result = await client.query<UserRow>(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, password_hash, created_at`,
        [name, email, passwordHash],
      );
      if (!result.rows[0]) throw new Error('Insert returned no row');
      return result.rows[0];
    });
    const user = toUser(row);
    const token = signToken(user.id);
    return { user, token };
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError('Email already registered');
    }
    getLogger().error({ err }, 'registerUser failed');
    throw err;
  }
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthResult> {
  const { email, password } = input;

  if (process.env.NODE_ENV !== 'test') {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new UnauthorizedError(error.message);
    }
    if (!data.user || !data.session) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const user = {
      id: data.user.id,
      name: data.user.user_metadata?.name || 'User',
      email: data.user.email || '',
      createdAt: data.user.created_at || new Date().toISOString(),
    };
    await syncUserToDb(user.id, user.email, user.name);
    return { user, token: data.session.access_token };
  }

  // Local/Test Fallback
  const rows = await query<UserRow>(
    `SELECT id, name, email, password_hash, created_at
     FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );
  const row = rows[0];
  if (!row) {
    throw new UnauthorizedError('Invalid credentials');
  }
  if (!row.password_hash) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const ok = await comparePassword(password, row.password_hash);
  if (!ok) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const user = toUser(row);
  const token = signToken(user.id);
  return { user, token };
}
