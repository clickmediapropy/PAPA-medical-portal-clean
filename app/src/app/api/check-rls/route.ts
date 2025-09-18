import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseServiceRoleClient();

  // Check RLS policies on lab_results table
  // Note: check_policies RPC doesn't exist, commenting out
  const policies = null;
  const policiesError: { message?: string } | null = null;
  // const { data: policies, error } = await supabase
  //   .rpc('check_policies', { table_name: 'lab_results' })
  //   .single();

  // Try a simple query to see what's accessible
  const { data: testData, error: testError } = await supabase
    .from('lab_results')
    .select('id')
    .limit(1);

  return NextResponse.json({
    policies: policies || 'No policies info available',
    policiesError: null,
    canAccessTable: !testError,
    testError: testError?.message || null,
    hasData: !!testData?.length
  });
}