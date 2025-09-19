// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { z } from 'npm:zod@3.23.8';

const EXTRACTOR_VERSION = 'v0';

const payloadSchema = z.object({
  document_id: z.string().uuid(),
  update_id: z.string().uuid(),
  patient_id: z.string().uuid(),
});

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables for process-document function');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid payload', details: parsed.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { document_id, update_id, patient_id } = parsed.data;

  const existingDocument = await supabase
    .from('documents')
    .select('ai_extracted_data')
    .eq('id', document_id)
    .maybeSingle();

  if (existingDocument.error) {
    console.error('[process-document] Failed to load document metadata', existingDocument.error.message);
  }

  const alreadyProcessed =
    existingDocument.data?.ai_extracted_data?.extractor_version === EXTRACTOR_VERSION;

  if (alreadyProcessed) {
    console.log('[process-document] Document already processed, skipping', document_id);
    return new Response(JSON.stringify({ success: true, skipped: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const startLog = await supabase.from('activity_log').insert({
    user_id: null,
    patient_id,
    action: 'document_processing_started',
    entity_type: 'document',
    entity_id: document_id,
    metadata: { update_id },
  });

  if (startLog.error) {
    console.error('[process-document] Failed to record start log', startLog.error.message);
  }

  const markProcessing = await supabase
    .from('updates')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', update_id);

  if (markProcessing.error) {
    console.error('[process-document] Failed to mark update as processing', markProcessing.error.message);
    return new Response(JSON.stringify({ error: 'Failed to update status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get document file path for processing
  const { data: documentData, error: documentError } = await supabase
    .from('documents')
    .select('file_path, file_name, mime_type')
    .eq('id', document_id)
    .single();

  if (documentError || !documentData) {
    console.error('[process-document] Failed to get document data', documentError?.message);
    return new Response(JSON.stringify({ error: 'Document not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Clean up previous results
  const cleanupResults = await supabase
    .from('lab_results')
    .delete()
    .eq('document_id', document_id);

  if (cleanupResults.error) {
    console.error('[process-document] Failed to clean previous lab results', cleanupResults.error.message);
  }

  // Clean up previous parsed values
  const cleanupParsedValues = await supabase
    .from('lab_parsed_values')
    .delete()
    .in('lab_result_id', 
      supabase
        .from('lab_results')
        .select('id')
        .eq('document_id', document_id)
    );

  if (cleanupParsedValues.error) {
    console.error('[process-document] Failed to clean previous parsed values', cleanupParsedValues.error.message);
  }

  // TODO: Implement actual OCR and LLM processing
  // For now, create sample lab results to demonstrate the structure
  const sampleResults = [
    {
      test_name: 'Glucosa',
      value: 95,
      unit: 'mg/dL',
      reference_min: 70,
      reference_max: 100,
      is_critical: false,
      test_date: new Date().toISOString().split('T')[0],
    },
    {
      test_name: 'Creatinina',
      value: 1.1,
      unit: 'mg/dL',
      reference_min: 0.6,
      reference_max: 1.2,
      is_critical: false,
      test_date: new Date().toISOString().split('T')[0],
    },
    {
      test_name: 'Colesterol Total',
      value: 180,
      unit: 'mg/dL',
      reference_min: 0,
      reference_max: 200,
      is_critical: false,
      test_date: new Date().toISOString().split('T')[0],
    },
  ];

  // Insert sample lab results
  const { data: insertedResults, error: insertError } = await supabase
    .from('lab_results')
    .insert(
      sampleResults.map(result => ({
        patient_id,
        document_id,
        test_name: result.test_name,
        value: result.value,
        unit: result.unit,
        reference_min: result.reference_min,
        reference_max: result.reference_max,
        is_critical: result.is_critical,
        test_date: result.test_date,
      }))
    )
    .select('id, test_name');

  if (insertError) {
    console.error('[process-document] Failed to insert lab results', insertError.message);
  }

  // Insert parsed values for each result
  if (insertedResults && insertedResults.length > 0) {
    const parsedValues = insertedResults.map(result => ({
      lab_result_id: result.id,
      raw_name: result.test_name,
      raw_value: sampleResults.find(s => s.test_name === result.test_name)?.value?.toString() || '',
      parsed_value: sampleResults.find(s => s.test_name === result.test_name)?.value || null,
      unit: sampleResults.find(s => s.test_name === result.test_name)?.unit || '',
      confidence_score: 0.95,
      extraction_method: 'ai',
    }));

    const { error: parsedValuesError } = await supabase
      .from('lab_parsed_values')
      .insert(parsedValues);

    if (parsedValuesError) {
      console.error('[process-document] Failed to insert parsed values', parsedValuesError.message);
    }
  }

  const documentUpdate = await supabase
    .from('documents')
    .update({
      ai_extracted_data: {
        extractor_version: EXTRACTOR_VERSION,
        processed_at: new Date().toISOString(),
        status: 'completed',
        results_count: insertedResults?.length || 0,
        file_processed: documentData.file_name,
      },
    })
    .eq('id', document_id);

  if (documentUpdate.error) {
    console.error('[process-document] Failed to update document metadata', documentUpdate.error.message);
  }

  const markCompleted = await supabase
    .from('updates')
    .update({ status: 'completed', ai_processed: false, updated_at: new Date().toISOString() })
    .eq('id', update_id);

  if (markCompleted.error) {
    console.error('[process-document] Failed to mark update as completed', markCompleted.error.message);
    return new Response(JSON.stringify({ error: 'Failed to finalize update' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const endLog = await supabase.from('activity_log').insert({
    user_id: null,
    patient_id,
    action: 'document_processing_completed',
    entity_type: 'document',
    entity_id: document_id,
    metadata: { update_id },
  });

  if (endLog.error) {
    console.error('[process-document] Failed to record completion log', endLog.error.message);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
