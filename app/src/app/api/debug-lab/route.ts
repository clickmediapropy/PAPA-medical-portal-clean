import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseServiceRoleClient();

  // Get patient
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .limit(1)
    .single();

  // Get lab results count
  const { count, error: countError } = await supabase
    .from('lab_results')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', patient?.id || '');

  // Get first 5 lab results
  const { data: results, error: resultsError } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patient?.id || '')
    .limit(5);

  return NextResponse.json({
    patient: patient || null,
    patientError: patientError?.message || null,
    labResultsCount: count || 0,
    countError: countError?.message || null,
    sampleResults: results || [],
    resultsError: resultsError?.message || null
  });
}