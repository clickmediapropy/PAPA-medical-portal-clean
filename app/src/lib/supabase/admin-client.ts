import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { Database } from './types.gen';
import { serverEnv } from '../env';

let adminClient: ReturnType<typeof createClient<Database>>;

export function getSupabaseServiceRoleClient() {
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada');
  }

  if (!adminClient) {
    adminClient = createClient<Database>(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
