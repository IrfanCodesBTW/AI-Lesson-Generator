import { Request, Response, NextFunction } from 'express';
import { verifyToken, syncUserToDb } from '../services/auth.service';
import { UnauthorizedError } from './error';
import { getSupabase } from '../lib/supabase';

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
  try {
    if (process.env.NODE_ENV === 'test') {
      const { userId } = verifyToken(token);
      req.userId = userId;
      return next();
    }

    const {
      data: { user },
      error,
    } = await getSupabase().auth.getUser(token);
    if (error || !user) {
      return next(new UnauthorizedError('Invalid or expired token'));
    }

    // Sync the Supabase user to our local users database table
    await syncUserToDb(user.id, user.email || '', user.user_metadata?.name || 'User');

    req.userId = user.id;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
