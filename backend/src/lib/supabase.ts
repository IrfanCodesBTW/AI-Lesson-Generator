import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from '../config/env';
import { getLogger } from './logger';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const env = loadEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    getLogger().warn('Supabase env not configured; admin client unavailable');
  }
  _client = createClient(
    env.SUPABASE_URL ?? 'https://placeholder.supabase.co',
    env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder',
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
  return _client;
}
