'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { LabTrendChart } from './LabTrendChart';
import { analyzeTrend, getTestDisplayInfo } from '@/lib/laboratory-analysis';

interface LabResult {
  id: string;
  test_name: string;
  test_date: string;
  value: number | null;
  unit?: string | null;
  reference_min?: number | null;
  reference_max?: number | null;
  is_critical: boolean | null;
}

interface TrendAnalysisCardProps {
  testName: string;
  results: LabResult[];
  isExpanded?: boolean;
}

export function TrendAnalysisCard({ testName, results, isExpanded: initialExpanded = false }: TrendAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const analysis = analyzeTrend(results);
  const testInfo = getTestDisplayInfo(testName);
  const latestResult = results[results.length - 1];

  const getTrendIcon = () => {
    switch (analysis.trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'worsening':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'stable':
        return <Minus className="h-5 w-5 text-blue-600" />;
      case 'variable':
        return <Activity className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (analysis.trend) {
      case 'improving':
        return 'border-green-200 bg-green-50';
      case 'worsening':
        return 'border-red-200 bg-red-50';
      case 'stable':
        return 'border-blue-200 bg-blue-50';
      case 'variable':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200';
    }
  };

  const getImportanceBadge = () => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      high: 'Alta prioridad',
      medium: 'Prioridad media',
      low: 'Prioridad baja'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[testInfo.importance]}`}>
        {labels[testInfo.importance]}
      </span>
    );
  };

  const chartData = results.map(r => ({
    date: r.test_date,
    value: r.value,
    is_critical: r.is_critical
  }));

  return (
    <div className={`border rounded-lg shadow-sm transition-all ${getTrendColor()}`}>
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{testName}</h3>
              {getTrendIcon()}
              {getImportanceBadge()}
            </div>
            <p className="text-sm text-gray-600">{testInfo.description}</p>
          </div>
          <button className="p-1 hover:bg-white/50 rounded transition-colors">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div>
            <p className="text-xs text-gray-500">Último valor</p>
            <p className={`text-sm font-semibold ${latestResult.is_critical ? 'text-red-600' : 'text-gray-900'}`}>
              {analysis.lastValue !== null ? `${analysis.lastValue} ${latestResult.unit || ''}` : '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Promedio</p>
            <p className="text-sm font-semibold text-gray-900">
              {analysis.averageValue !== null ? `${analysis.averageValue.toFixed(1)} ${latestResult.unit || ''}` : '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Cambio</p>
            <p className="text-sm font-semibold text-gray-900">
              {analysis.changeFromPrevious !== null ? (
                <span className={analysis.changeFromPrevious > 0 ? 'text-orange-600' : 'text-blue-600'}>
                  {analysis.changeFromPrevious > 0 ? '+' : ''}{analysis.changeFromPrevious.toFixed(1)}%
                </span>
              ) : '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Resultados</p>
            <p className="text-sm font-semibold text-gray-900">{results.length}</p>
          </div>
        </div>

        {latestResult.reference_min !== null && latestResult.reference_max !== null && (
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <p className="text-xs text-gray-500 mb-1">Rango de referencia</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                {latestResult.reference_min} - {latestResult.reference_max} {latestResult.unit || ''}
              </span>
              {latestResult.is_critical && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  Fuera de rango
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200/50">
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Evolución temporal</h4>
            <LabTrendChart
              data={chartData}
              testName={testName}
              unit={latestResult.unit}
              referenceMin={latestResult.reference_min}
              referenceMax={latestResult.reference_max}
            />
          </div>

          <div className="px-4 pb-4">
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Análisis de tendencia por IA</h4>
              <p className="text-sm text-gray-600 mb-3">{analysis.summary}</p>

              {analysis.insights.length > 0 && (
                <div className="space-y-2">
                  {analysis.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              )}

              {analysis.percentageOutOfRange > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Valores fuera de rango</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${analysis.percentageOutOfRange}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {analysis.percentageOutOfRange.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}