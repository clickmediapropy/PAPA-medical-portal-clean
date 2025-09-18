import type { Metadata } from 'next';

import { getDefaultPatient } from '@/lib/patients';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';
import { logError } from '@/lib/logging';
import { LaboratoryDashboard } from '@/components/laboratory/laboratory-dashboard';

export const metadata: Metadata = {
  title: 'Resultados de laboratorio',
};

export default async function LaboratoryPage() {
  const supabase = getSupabaseServiceRoleClient();
  const patient = await getDefaultPatient(supabase);

  if (!patient) {
    return (
      <section className="space-y-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Aún no se ha configurado un paciente
        </h2>
        <p className="text-sm text-slate-600">
          Crea un paciente y carga documentos para ver resultados de laboratorio.
        </p>
      </section>
    );
  }

  // Fetch lab results with biomarker information
  const { error: labError } = await supabase
    .from('lab_results')
    .select(`
      id,
      test_name,
      value,
      unit,
      reference_min,
      reference_max,
      is_critical,
      test_date,
      created_at,
      lab_parsed_values (
        id,
        biomarker_id,
        raw_name,
        raw_value,
        parsed_value,
        confidence_score,
        extraction_method,
        biomarkers (
          id,
          name,
          display_name,
          category,
          unit,
          description,
          lifestyle_notes
        )
      )
    `)
    .eq('patient_id', patient.id)
    .order('test_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (labError) {
    logError('laboratory', 'Error fetching lab results', { error: labError.message });
  }

  // Fetch biomarkers for reference
  const { error: biomarkerError } = await supabase
    .from('biomarkers')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (biomarkerError) {
    logError('laboratory', 'Error fetching biomarkers', { error: biomarkerError.message });
  }

  // Fetch lab sources
  const { error: labSourceError } = await supabase
    .from('lab_sources')
    .select('*')
    .order('name', { ascending: true });

  if (labSourceError) {
    logError('laboratory', 'Error fetching lab sources', { error: labSourceError.message });
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Resultados de laboratorio</h1>
          <p className="text-sm text-slate-606">
            Análisis agrupados por categoría con tendencias y valores de referencia.
          </p>
        </div>
      </header>

      <LaboratoryDashboard
        patientId={patient.id}
      />
    </section>
  );
}