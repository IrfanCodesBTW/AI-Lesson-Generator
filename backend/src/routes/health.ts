import { Router, Request, Response } from 'express';
import { isGeminiConfigured } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'ai-lesson-generator-backend',
    version: '0.1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    gemini: isGeminiConfigured() ? 'configured' : 'fallback',
  });
});
