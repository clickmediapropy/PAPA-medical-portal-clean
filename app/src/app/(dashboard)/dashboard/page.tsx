import type { Metadata } from 'next';
import Link from 'next/link';

import { getDefaultPatient } from '@/lib/patients';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';
import { getTodaysTasks } from '@/lib/care-plans';

interface Update {
  id: string;
  title: string;
  status: string | null;
  created_at: string;
}

interface LabResult {
  id: string;
  test_name: string;
  value: number | null;
  unit: string | null;
  test_date: string;
  is_critical: boolean | null;
}

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  is_active: boolean | null;
  start_date: string | null;
}

interface TimelineEvent {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

export const metadata: Metadata = {
  title: 'Resumen del paciente',
};

export default async function DashboardPage() {
  const supabase = getSupabaseServiceRoleClient();

  const patient = await getDefaultPatient(supabase);

  if (!patient) {
    return (
      <section className="space-y-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          No hay pacientes registrados
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Necesitas registrar un paciente primero para poder usar todas las funcionalidades del portal médico.
        </p>
        <Link
          href="/patients"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Registrar Primer Paciente
        </Link>
      </section>
    );
  }

  const patientId = patient.id;

  const [{ data: updates, count: updateCount }, { data: labResults, count: labCount }, { data: medications, count: medicationCount }, { data: timelineEvents }, todaysTasksResult ] =
    await Promise.all([
      supabase
        .from('updates')
        .select('id,title,status,created_at', { count: 'exact' })
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('lab_results')
        .select('id,test_name,value,unit,test_date,is_critical', { count: 'exact' })
        .eq('patient_id', patientId)
        .order('test_date', { ascending: false })
        .limit(5),
      supabase
        .from('medications')
        .select('id,name,dosage,frequency,is_active,start_date', { count: 'exact' })
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('timeline_events')
        .select('id,title,event_type,event_date,severity,status')
        .eq('patient_id', patientId)
        .order('event_date', { ascending: false })
        .limit(5),
      getTodaysTasks(patientId),
    ]);

  const todaysTasks = todaysTasksResult || [];

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{patient.full_name}</h1>
        {patient.external_id ? (
          <p className="text-sm text-slate-600">Identificador: {patient.external_id}</p>
        ) : null}
      </section>

      {/* Today's Priorities */}
      {todaysTasks.length > 0 && (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-900">Prioridades de Hoy</h2>
            <Link
              href="/care-plan"
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Ver Plan Completo
            </Link>
          </div>
          <div className="space-y-2">
            {todaysTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-md bg-white p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {task.title.toLowerCase().includes('medicamento') || task.title.toLowerCase().includes('medicina') ? '💊' :
                     task.title.toLowerCase().includes('ejercicio') || task.title.toLowerCase().includes('actividad') ? '🏃' :
                     task.title.toLowerCase().includes('dieta') || task.title.toLowerCase().includes('comida') ? '🍎' :
                     task.title.toLowerCase().includes('monitor') || task.title.toLowerCase().includes('control') ? '📊' : '📋'}
                  </span>
                  <div>
                    <h3 className="font-medium text-slate-900">{task.title}</h3>
                    <p className="text-sm text-slate-500">{task.frequency}</p>
                  </div>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  task.priority === 'urgent' ? 'text-red-600 bg-red-50' :
                  task.priority === 'high' ? 'text-orange-600 bg-orange-50' :
                  task.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                  'text-green-600 bg-green-50'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {todaysTasks.length > 3 && (
              <p className="text-sm text-blue-700">
                Y {todaysTasks.length - 3} tarea{todaysTasks.length - 3 !== 1 ? 's' : ''} más...
              </p>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Actualizaciones" value={updateCount ?? 0} href="/timeline" />
        <SummaryCard label="Resultados de laboratorio" value={labCount ?? 0} href="/laboratory" />
        <SummaryCard label="Plan de Cuidados" value={todaysTasks.length} href="/care-plan" />
        <SummaryCard label="Medicaciones" value={medicationCount ?? 0} href="/medications" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardList
          title="Actualizaciones recientes"
          href="/timeline"
          items={
            updates?.map((update: Update) => ({
              id: update.id,
              title: update.title,
              subtitle: new Date(update.created_at).toLocaleString('es-ES'),
              badge: update.status || 'Sin estado',
            })) ?? []
          }
          emptyMessage="Sin actualizaciones registradas"
        />

        <DashboardList
          title="Resultados de laboratorio"
          href="/laboratory"
          items={
            labResults?.map((lab: LabResult) => ({
              id: lab.id,
              title: lab.test_name,
              subtitle: lab.test_date
                ? new Date(lab.test_date).toLocaleDateString('es-ES')
                : 'Sin fecha registrada',
              badge: lab.is_critical
                ? 'Crítico'
                : lab.unit
                  ? `${lab.value !== null ? String(lab.value) : '-'} ${lab.unit}`
                  : `${lab.value !== null ? String(lab.value) : '-'}`,
            })) ?? []
          }
          emptyMessage="Sin resultados de laboratorio"
        />

        <DashboardList
          title="Medicaciones activas"
          href="/medications"
          items={medications?.map((med: Medication) => ({
            id: med.id,
            title: med.name,
            subtitle: med.dosage ?? 'Sin dosis registrada',
            badge: med.is_active === true ? 'Activa' : 'Inactiva',
          })) ?? []}
          emptyMessage="Sin medicaciones registradas"
        />

        <DashboardList
          title="Últimos eventos"
          href="/timeline"
          items={
            timelineEvents?.map((event: TimelineEvent) => ({
              id: event.id,
              title: event.title,
              subtitle: event.event_date
                ? new Date(event.event_date).toLocaleDateString('es-ES')
                : 'Sin fecha registrada',
              badge: event.event_type,
            })) ?? []
          }
          emptyMessage="Sin eventos en la cronología"
        />
      </div>
    </div>
  );
}

type DashboardListProps = {
  title: string;
  href?: string;
  items: { id: string; title: string; subtitle: string; badge?: string | null }[];
  emptyMessage: string;
};

function DashboardList({ title, items, emptyMessage, href }: DashboardListProps) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-900">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Ver todo
          </Link>
        ) : null}
      </header>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.subtitle}</p>
              </div>
              {item.badge ? (
                <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {item.badge}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  href: string;
};

function SummaryCard({ label, value, href }: SummaryCardProps) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </Link>
  );
}
