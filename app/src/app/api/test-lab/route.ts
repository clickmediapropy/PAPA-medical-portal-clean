import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  // Use server client for API routes
  const supabase = getSupabaseServiceRoleClient();

  const patientId = '11efa66e-5dbc-42b6-a276-96800b8f5d6d';

  const { data, error, count } = await supabase
    .from('lab_results')
    .select('*', { count: 'exact' })
    .eq('patient_id', patientId)
    .limit(5);

  return NextResponse.json({
    patientId,
    count,
    data,
    error: error?.message || null,
  });
}