import pino, { Logger as PinoLogger } from 'pino';
import { loadEnv } from '../config/env';

let _logger: PinoLogger | null = null;

function buildLogger(): PinoLogger {
  const env = loadEnv();
  const isDev = env.NODE_ENV === 'development';
  return pino({
    level: env.LOG_LEVEL,
    ...(isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:standard' },
          },
        }
      : {}),
    redact: {
      paths: ['req.headers.authorization', '*.password', '*.passwordHash', '*.token'],
      censor: '[REDACTED]',
    },
  });
}

export function getLogger(): PinoLogger {
  if (!_logger) _logger = buildLogger();
  return _logger;
}

export const logger = new Proxy({} as PinoLogger, {
  get(_target, prop) {
    return Reflect.get(getLogger(), prop);
  },
});

export type Logger = PinoLogger;
