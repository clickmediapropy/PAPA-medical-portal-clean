'use client';

import { useState } from 'react';
interface TimelineEvent {
  id: string;
  title: string;
  event_type: 'surgery' | 'procedure' | 'evaluation' | 'dialysis' | 'status' | 'medication' | 'lab_result' | 'imaging' | 'consultation' | 'transfer' | 'admission' | 'discharge';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'completed' | 'ongoing' | 'pending' | 'cancelled';
  event_date: string;
  event_time: string | null;
  description: string | null;
  details: string | null;
}

interface TimelineTableProps {
  events: TimelineEvent[];
}

export default function TimelineTable({ events }: TimelineTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Fecha</th>
            <th scope="col" className="px-4 py-3">Evento</th>
            <th scope="col" className="px-4 py-3">Tipo</th>
            <th scope="col" className="px-4 py-3">Severidad</th>
            <th scope="col" className="px-4 py-3">Descripción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
          {events && events.length > 0 ? (
            events.map((event) => {
              const dateLabel = event.event_date
                ? new Date(event.event_date + 'T00:00:00').toLocaleDateString('es-PY', {
                    timeZone: 'America/Asuncion',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })
                : 'Sin fecha';
              const timeLabel = event.event_time ? ` ${event.event_time}` : '';
              const isExpanded = expandedRows.has(event.id);
              const description = event.description ?? 'Sin descripción';
              const shouldShowExpand = description.length > 100;

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
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-lg">
                    <div className="space-y-2">
                      <div className={`whitespace-pre-wrap ${!isExpanded && shouldShowExpand ? 'line-clamp-3' : ''}`}>
                        {description}
                      </div>
                      {shouldShowExpand && (
                        <button
                          onClick={() => toggleExpanded(event.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                        >
                          {isExpanded ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                Aún no hay eventos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}