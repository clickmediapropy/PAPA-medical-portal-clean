'use client';

import { Download, Share2, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { BiomarkerChart } from './biomarker-chart';
import type { BiomarkerData, BiomarkerStats } from '@/lib/biomarkers';

interface BiomarkerDetailProps {
  biomarker: BiomarkerData;
  stats?: BiomarkerStats | null;
}

export function BiomarkerDetail({ biomarker, stats }: BiomarkerDetailProps) {

  const getTrendIcon = () => {
    switch (biomarker.trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5" />;
      case 'down':
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Minus className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (biomarker.status) {
      case 'critical':
        return 'text-red-600';
      case 'abnormal':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  };

  const exportData = () => {
    const csv = [
      ['Fecha', 'Valor', 'Unidad', 'Estado'],
      ...biomarker.historicalData.map(point => [
        point.date,
        point.value.toString(),
        point.unit || biomarker.currentUnit || '',
        point.isAbnormal ? 'Anormal' : 'Normal'
      ])
    ];

    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${biomarker.name}_history.csv`;
    a.click();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{biomarker.displayName}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Última actualización: {biomarker.lastTestDate ? formatDate(biomarker.lastTestDate) : 'Sin datos'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Exportar datos"
            >
              <Download className="h-4 w-4 text-gray-600" />
            </button>
            <button
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Compartir"
            >
              <Share2 className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Current value and status */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current value */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Valor actual</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getStatusColor()}`}>
                {biomarker.currentValue?.toFixed(1) || '--'}
              </span>
              <span className="text-lg text-gray-500">{biomarker.currentUnit}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`flex items-center gap-1 ${
                biomarker.percentChange && biomarker.percentChange > 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {getTrendIcon()}
                {biomarker.percentChange !== undefined && (
                  <span className="text-sm font-medium">
                    {biomarker.percentChange > 0 ? '+' : ''}{biomarker.percentChange}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reference range */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Rango de referencia</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {biomarker.referenceMin} - {biomarker.referenceMax}
            </div>
            <div className="text-sm text-gray-500">{biomarker.currentUnit}</div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Estadísticas</div>
              <div className="mt-1 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Promedio:</span>
                  <span className="font-medium text-gray-900">{stats.avg} {biomarker.currentUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mín/Máx:</span>
                  <span className="font-medium text-gray-900">
                    {stats.min} / {stats.max} {biomarker.currentUnit}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia histórica</h2>
        <BiomarkerChart biomarker={biomarker} height={400} />
      </div>

      {/* Historical data table */}
      <div className="border-t border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de resultados</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rango Ref.
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {biomarker.historicalData.slice(0, 10).map((point, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {formatDate(point.date)}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`font-medium ${
                      point.isAbnormal ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {point.value.toFixed(1)} {point.unit || biomarker.currentUnit}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {biomarker.referenceMin} - {biomarker.referenceMax} {biomarker.currentUnit}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`
                      inline-flex px-2 py-1 text-xs rounded-full
                      ${point.isAbnormal
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'}
                    `}>
                      {point.isAbnormal ? 'Anormal' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}