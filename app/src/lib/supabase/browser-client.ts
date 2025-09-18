'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types.gen';
import { clientEnv } from '../env.client';

let client: ReturnType<typeof createBrowserClient<Database>>;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      clientEnv.SUPABASE_URL,
      clientEnv.SUPABASE_ANON_KEY,
    );
  }

  return client;
}
