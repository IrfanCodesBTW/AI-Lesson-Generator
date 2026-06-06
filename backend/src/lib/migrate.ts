import { runner, RunnerOption } from 'node-pg-migrate';
import { loadEnv } from '../config/env';
import path from 'path';

export async function runMigrations(direction: 'up' | 'down' = 'up'): Promise<void> {
  const env = loadEnv();
  if (!env.DATABASE_DIRECT_URL) {
    throw new Error('DATABASE_DIRECT_URL is required for migrations');
  }
  const config: RunnerOption = {
    databaseUrl: env.DATABASE_DIRECT_URL,
    migrationsTable: 'pgmigrations',
    dir: path.join(process.cwd(), 'migrations'),
    direction,
    count: Infinity,
    ignorePattern: '\\..*',
    logger: {
      info: (m) => console.log(m),
      warn: (m) => console.warn(m),
      error: (m) => console.error(m),
    },
  };
  await runner(config);
}
