import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { loadEnv } from './config/env';
import { healthRouter } from './routes/health';
import { errorHandler, notFoundHandler } from './middleware/error';
import { getLogger } from './lib/logger';

export function createApp(): Application {
  const env = loadEnv();
  const app = express();
  const logger = getLogger();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use((req, _res, next) => {
    logger.debug({ method: req.method, url: req.url }, 'request');
    next();
  });

  app.use('/health', healthRouter);

  app.get('/', (_req, res) => {
    res.json({
      service: 'ai-lesson-generator-backend',
      docs: '/health',
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
