'use client';

import { useState, useMemo } from 'react';
import { Activity, AlertCircle, TrendingUp, FileText } from 'lucide-react';
import { BiomarkerSidebar } from './biomarker-sidebar';
import { BiomarkerDetail } from './biomarker-detail';
import { BiomarkerCard } from './biomarker-card';
import { calculateBiomarkerStats } from '@/lib/biomarkers-client';
import type { BiomarkerData } from '@/lib/biomarkers';

interface BiomarkersDashboardProps {
  biomarkers: BiomarkerData[];
  patientName?: string;
}

export function BiomarkersDashboard({ biomarkers, patientName }: BiomarkersDashboardProps) {
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerData | null>(
    biomarkers.length > 0 ? biomarkers[0] : null
  );
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('detail');

  // Calculate stats for selected biomarker
  const selectedBiomarkerStats = useMemo(() => {
    if (!selectedBiomarker) return null;
    return calculateBiomarkerStats(selectedBiomarker.historicalData);
  }, [selectedBiomarker]);

  // Calculate summary stats
  const totalBiomarkers = biomarkers.length;
  const abnormalCount = biomarkers.filter(b =>
    b.status === 'abnormal' || b.status === 'critical'
  ).length;
  const criticalCount = biomarkers.filter(b => b.status === 'critical').length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Historial de Biomarcadores</h1>
            {patientName && (
              <p className="text-sm text-gray-500 mt-1">Paciente: {patientName}</p>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('detail')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'detail'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Vista detallada
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Vista de cuadrícula
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
          <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Total Análisis</p>
              <p className="text-xl font-bold text-blue-900">{totalBiomarkers}</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Normales</p>
              <p className="text-xl font-bold text-green-900">
                {totalBiomarkers - abnormalCount}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600">Requieren Atención</p>
              <p className="text-xl font-bold text-yellow-900">{abnormalCount - criticalCount}</p>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">Críticos</p>
              <p className="text-xl font-bold text-red-900">{criticalCount}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {viewMode === 'detail' ? (
          <>
            {/* Mobile biomarker selector */}
            <div className="md:hidden border-b border-gray-200 bg-white px-4 py-3">
              <select
                value={selectedBiomarker?.id || ''}
                onChange={(e) => {
                  const biomarker = biomarkers.find(b => b.id === e.target.value);
                  if (biomarker) setSelectedBiomarker(biomarker);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecciona un biomarcador</option>
                {biomarkers.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.displayName} - {b.currentValue} {b.currentUnit} ({
                      b.status === 'critical' ? 'Crítico' :
                      b.status === 'abnormal' ? 'Anormal' :
                      'Normal'
                    })
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block md:w-80 flex-shrink-0">
              <BiomarkerSidebar
                biomarkers={biomarkers}
                selectedBiomarker={selectedBiomarker || undefined}
                onSelectBiomarker={setSelectedBiomarker}
              />
            </div>

            {/* Detail view */}
            <div className="flex-1 overflow-hidden">
              {selectedBiomarker ? (
                <BiomarkerDetail biomarker={selectedBiomarker} stats={selectedBiomarkerStats} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-500">Selecciona un biomarcador para ver detalles</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Grid view */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {biomarkers.map(biomarker => (
                <BiomarkerCard
                  key={biomarker.id}
                  biomarker={biomarker}
                  isSelected={selectedBiomarker?.id === biomarker.id}
                  onClick={() => {
                    setSelectedBiomarker(biomarker);
                    setViewMode('detail');
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}