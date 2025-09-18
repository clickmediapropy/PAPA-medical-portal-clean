'use client';

import { z } from 'zod';

const clientEnvSchema = z.object({
  SUPABASE_URL: z.string().url({ message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL' }),
  SUPABASE_ANON_KEY: z
    .string({ required_error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required' })
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  CLERK_PUBLISHABLE_KEY: z
    .string({ required_error: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required' })
    .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
});

export const clientEnv = clientEnvSchema.parse({
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});
