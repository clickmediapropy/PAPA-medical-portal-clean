import type { Metadata } from 'next';

import { getDefaultPatient } from '@/lib/patients';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';
import { logError } from '@/lib/logging';

export const metadata: Metadata = {
  title: 'Cronología clínica',
};

export default async function TimelinePage() {
  const supabase = getSupabaseServiceRoleClient();
  const patient = await getDefaultPatient(supabase);

  if (!patient) {
    return (
      <section className="space-y-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Registra un paciente para ver la cronología
        </h2>
        <p className="text-sm text-slate-600">
          Cuando se carguen eventos clínicos aparecerán aquí ordenados por fecha.
        </p>
      </section>
    );
  }

  const { data: events, error } = await supabase
    .from('timeline_events')
    .select('id,title,event_type,severity,status,event_date,event_time,description,details')
    .eq('patient_id', patient.id)
    .order('event_date', { ascending: false })
    .order('event_time', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    logError('timeline', 'Error fetching timeline events', { error: error.message });
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Cronología del paciente</h1>
        <p className="text-sm text-slate-600">
          Eventos clínicos ordenados cronológicamente. Se actualizan automáticamente cuando se
          procesan documentos o se registran eventos manuales.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">Fecha</th>
              <th scope="col" className="px-4 py-3">Evento</th>
              <th scope="col" className="px-4 py-3">Tipo</th>
              <th scope="col" className="px-4 py-3">Severidad</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {events && events.length > 0 ? (
              events.map((event) => {
                const dateLabel = event.event_date
                  ? new Date(event.event_date).toLocaleDateString('es-ES')
                  : 'Sin fecha';
                const timeLabel = event.event_time ? ` ${event.event_time}` : '';

                return (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {dateLabel}
                      {timeLabel}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{event.title}</td>
                    <td className="px-4 py-3 capitalize">{
                      event.event_type === 'surgery' ? 'Cirugía' :
                      event.event_type === 'procedure' ? 'Procedimiento' :
                      event.event_type === 'evaluation' ? 'Evaluación' :
                      event.event_type === 'dialysis' ? 'Diálisis' :
                      event.event_type === 'status' ? 'Estado' :
                      event.event_type === 'medication' ? 'Medicación' :
                      event.event_type === 'lab_result' ? 'Laboratorio' :
                      event.event_type === 'imaging' ? 'Imagenología' :
                      event.event_type === 'consultation' ? 'Consulta' :
                      event.event_type === 'transfer' ? 'Traslado' :
                      event.event_type === 'admission' ? 'Ingreso' :
                      event.event_type === 'discharge' ? 'Alta' :
                      String(event.event_type).replace(/_/g, ' ')
                    }</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        event.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        event.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        event.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        event.severity === 'low' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {event.severity === 'critical' ? 'Crítico' :
                         event.severity === 'high' ? 'Alto' :
                         event.severity === 'medium' ? 'Medio' :
                         event.severity === 'low' ? 'Bajo' :
                         event.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-slate-600">{
                      event.status === 'completed' ? 'Completado' :
                      event.status === 'ongoing' ? 'En curso' :
                      event.status === 'pending' ? 'Pendiente' :
                      event.status === 'cancelled' ? 'Cancelado' :
                      event.status
                    }</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-md">
                      <div className="line-clamp-2" title={event.description ?? ''}>
                        {event.description ?? 'Sin descripción'}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  Aún no hay eventos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
