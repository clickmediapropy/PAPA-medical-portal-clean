import type { Metadata } from 'next';

import { getDefaultPatient } from '@/lib/patients';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';
import { logError } from '@/lib/logging';

export const metadata: Metadata = {
  title: 'Medicaciones',
};

export default async function MedicationsPage() {
  const supabase = getSupabaseServiceRoleClient();
  const patient = await getDefaultPatient(supabase);

  if (!patient) {
    return (
      <section className="space-y-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Aún no se ha configurado un paciente
        </h2>
        <p className="text-sm text-slate-600">
          Una vez registrado un paciente podrás listar las medicaciones activas.
        </p>
      </section>
    );
  }

  const { data: medications, error } = await supabase
    .from('medications')
    .select('id,name,dosage,frequency,route,start_date,end_date,is_active,notes')
    .eq('patient_id', patient.id)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    logError('medications', 'Error fetching medications', { error: error.message });
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Medicaciones</h1>
        <p className="text-sm text-slate-600">
          Registro de medicaciones activas e históricas del paciente.
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">Medicamento</th>
              <th scope="col" className="px-4 py-3">Dosis</th>
              <th scope="col" className="px-4 py-3">Frecuencia</th>
              <th scope="col" className="px-4 py-3">Vía</th>
              <th scope="col" className="px-4 py-3">Inicio</th>
              <th scope="col" className="px-4 py-3">Fin</th>
              <th scope="col" className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {medications && medications.length > 0 ? (
              medications.map((medication) => (
                <tr key={medication.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{medication.name}</td>
                  <td className="px-4 py-3 text-slate-600">{medication.dosage ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{medication.frequency ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{medication.route ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {medication.start_date
                      ? new Date(medication.start_date).toLocaleDateString('es-ES')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {medication.end_date
                      ? new Date(medication.end_date).toLocaleDateString('es-ES')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {medication.is_active ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        Inactiva
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No hay medicaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
