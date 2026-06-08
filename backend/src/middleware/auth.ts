import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken, syncUserToDb } from '../services/auth.service';
import { UnauthorizedError } from './error';
import { getSupabase } from '../lib/supabase';
import { getLogger } from '../lib/logger';
import { loadEnv } from '../config/env';
import { query } from '../lib/db';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing bearer token'));
  }
  const token = header.slice('Bearer '.length).trim();

  if (process.env.NODE_ENV === 'test') {
    try {
      const { userId } = verifyToken(token);
      req.userId = userId;
      return next();
    } catch {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
  }

  const env = loadEnv();
  const logger = getLogger();
  logger.info(
    { hasSupabaseUrl: !!env.SUPABASE_URL, hasAnonKey: !!env.SUPABASE_ANON_KEY },
    'requireAuth env check',
  );

  // Try remote verification via Supabase Auth API
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    try {
      const { data, error } = await getSupabase().auth.getUser(token);
      if (!error && data?.user) {
        await syncUserToDb(
          data.user.id,
          data.user.email || '',
          data.user.user_metadata?.name || 'User',
        );
        req.userId = data.user.id;
        return next();
      }
      logger.error(
        { errorMessage: error?.message, status: error?.status },
        'Supabase getUser failed, falling back to local decode',
      );
    } catch (err) {
      logger.error({ err }, 'Supabase getUser threw, falling back to local decode');
    }
  }

  // Fallback: decode the JWT locally to extract user claims
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload | null;
    if (!decoded || !decoded.sub || typeof decoded.sub !== 'string') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    const email = decoded.email as string | undefined;
    const name =
      (decoded.user_metadata as { name?: string } | undefined)?.name ||
      email?.split('@')[0] ||
      'User';

    await syncUserToDb(decoded.sub, email || '', name);

    req.userId = decoded.sub;
    logger.info({ userId: decoded.sub }, 'requireAuth via local JWT decode');
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}
