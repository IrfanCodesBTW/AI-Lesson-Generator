import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { UnauthorizedError } from './error';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing bearer token'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
