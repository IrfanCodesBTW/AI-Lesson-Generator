import { runner, RunnerOption } from 'node-pg-migrate';
import { loadEnv } from '../config/env';
import path from 'path';

export async function runMigrations(direction: 'up' | 'down' = 'up'): Promise<void> {
  const env = loadEnv();
  const databaseUrl = env.DATABASE_DIRECT_URL || env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL (or DATABASE_DIRECT_URL) is required for migrations');
  }
  const config: RunnerOption = {
    databaseUrl,
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
