import 'dotenv/config';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { getLogger } from './lib/logger';
import { runMigrations } from './lib/migrate';

const env = loadEnv();
const logger = getLogger();

async function main(): Promise<void> {
  if (env.NODE_ENV === 'production') {
    logger.info('running database migrations');
    await runMigrations('up');
    logger.info('migrations complete');
  }
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'backend started');
  });
  registerShutdown(server);
}

function shutdown(server: import('http').Server, signal: string): void {
  logger.info({ signal }, 'shutting down');
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'error during shutdown');
      process.exit(1);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

function registerShutdown(server: import('http').Server): void {
  process.on('SIGINT', () => shutdown(server, 'SIGINT'));
  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'unhandled rejection');
  });
}

main().catch((err) => {
  logger.error({ err }, 'fatal startup error');
  process.exit(1);
});
