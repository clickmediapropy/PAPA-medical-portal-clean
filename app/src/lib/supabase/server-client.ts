import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import type { Database } from './types.gen';
import { serverEnv } from '../env';

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    serverEnv.SUPABASE_URL,
    serverEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        get: async (name) => cookieStore.get(name)?.value,
        set: async (name, value, options) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: async (name, options) => {
          cookieStore.delete({ name, ...options });
        },
      },
    },
  );
}
