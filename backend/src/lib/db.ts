import { Pool, PoolClient, QueryResultRow } from 'pg';
import { loadEnv } from '../config/env';
import { getLogger } from './logger';

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (_pool) return _pool;
  const env = loadEnv();
  _pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  _pool.on('error', (err) => {
    getLogger().error({ err }, 'pg pool error');
  });
  return _pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await getPool().query<T>(text, params);
  return res.rows;
}

export async function withClient<R>(fn: (client: PoolClient) => Promise<R>): Promise<R> {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
