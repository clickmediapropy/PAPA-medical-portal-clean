import type { Metadata } from 'next';

import { getDefaultPatient } from '@/lib/patients';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';
import { getPatientBiomarkers } from '@/lib/biomarkers';
import { BiomarkersDashboard } from '@/components/biomarkers/biomarkers-dashboard';

export const metadata: Metadata = {
  title: 'Biomarcadores',
  description: 'Historial y seguimiento de biomarcadores'
};

export default async function BiomarkersPage() {
  const supabase = getSupabaseServiceRoleClient();
  const patient = await getDefaultPatient(supabase);

  if (!patient) {
    return (
      <section className="space-y-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          No se ha configurado un paciente
        </h2>
        <p className="text-sm text-slate-600">
          Crea un paciente para ver el historial de biomarcadores.
        </p>
      </section>
    );
  }

  const biomarkers = await getPatientBiomarkers(patient.id, supabase);

  return <BiomarkersDashboard biomarkers={biomarkers} patientName={patient.full_name} />;
}