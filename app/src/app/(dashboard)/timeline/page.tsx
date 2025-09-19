import type { Metadata } from 'next';

import { getDefaultPatient } from '@/lib/patients';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';
import { logError } from '@/lib/logging';
import TimelineTable from '@/components/timeline/timeline-table';

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

      <TimelineTable events={events || []} />
    </section>
  );
}
