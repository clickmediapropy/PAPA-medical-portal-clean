import type { Metadata } from 'next';

import { getDefaultPatient } from '@/lib/patients';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';
import { UploadDocumentForm } from '@/components/upload/upload-form';

export const metadata: Metadata = {
  title: 'Subir documento médico',
};

export default async function UploadPage() {
  const supabase = getSupabaseServiceRoleClient();
  const patient = await getDefaultPatient(supabase);

  if (!patient) {
    return (
      <section className="space-y-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Necesitas registrar un paciente primero
        </h2>
        <p className="text-sm text-slate-600">
          Agrega un paciente en la base de datos para poder subir documentos y disparar el proceso
          de análisis automatizado.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Subir documento médico</h1>
        <p className="text-sm text-slate-600">
          Los documentos se almacenarán de forma segura y se procesarán con el pipeline de IA para
          extraer resultados clínicos estructurados.
        </p>
      </header>

      <UploadDocumentForm patientId={patient.id} />
    </section>
  );
}
