'use client';

import { useState, useEffect } from 'react';
import { FileText, Activity, TrendingUp, Download, Calendar, Search, ChartBar } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { TrendAnalysisCard } from './TrendAnalysisCard';
import { groupResultsByTest } from '@/lib/laboratory-analysis';
import type { LabResult } from '@/lib/laboratory-analysis';

interface LabResultExtended extends LabResult {
  patient_id: string;
  created_at: string;
}

interface LaboratoryDashboardProps {
  patientId?: string;
}

export function LaboratoryDashboard({ patientId }: LaboratoryDashboardProps) {
  const [results, setResults] = useState<LabResultExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showTrends, setShowTrends] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchResults = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();

        const { data, error } = await supabase
          .from('lab_results')
          .select('*')
          .eq('patient_id', patientId)
          .order('test_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching laboratory results:', error);
        } else {
          setResults(data || []);
        }
      } catch (error) {
        console.error('Error fetching laboratory results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [patientId]);


  const filteredResults = results.filter(result => {
    const matchesSearch = result.test_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || result.test_date.startsWith(dateFilter);
    return matchesSearch && matchesDate;
  });

  const getStatusColor = (is_critical: boolean) => {
    return is_critical ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  };

  const formatReferenceRange = (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) {
      return `${min} - ${max}`;
    } else if (min !== undefined) {
      return `≥ ${min}`;
    } else if (max !== undefined) {
      return `≤ ${max}`;
    }
    return '-';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedResults = groupResultsByTest(results);
  const testsWithMultipleResults = Array.from(groupedResults.entries())
    .filter(([_, results]) => results.length >= 2)
    .sort(([nameA, resultsA], [nameB, resultsB]) => {
      const latestA = resultsA[resultsA.length - 1].is_critical ? 0 : 1;
      const latestB = resultsB[resultsB.length - 1].is_critical ? 0 : 1;
      if (latestA !== latestB) return latestA - latestB;
      return resultsB.length - resultsA.length;
    });

  return (
    <div className="space-y-6">
      {testsWithMultipleResults.length > 0 && showTrends && (
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <ChartBar className="h-6 w-6 text-blue-600" />
                  Tendencias y Análisis
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Evolución temporal de los análisis con múltiples resultados
                </p>
              </div>
              <button
                onClick={() => setShowTrends(!showTrends)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showTrends ? 'Ocultar' : 'Mostrar'} tendencias
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testsWithMultipleResults.map(([testName, testResults]) => (
              <TrendAnalysisCard
                key={testName}
                testName={testName}
                results={testResults}
                isExpanded={expandedCards.has(testName)}
              />
            ))}
          </div>

          {testsWithMultipleResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ChartBar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay suficientes datos para mostrar tendencias</p>
              <p className="text-sm mt-1">Se requieren al menos 2 resultados por análisis</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Tabla de Resultados</h2>
          <p className="text-sm sm:text-base text-gray-600">Vista detallada de todos los análisis clínicos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total de Análisis</p>
                <p className="text-2xl font-bold text-blue-900">{results.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Resultados Normales</p>
                <p className="text-2xl font-bold text-green-900">
                  {results.filter(r => !r.is_critical).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Requieren Atención</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {results.filter(r => r.is_critical).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar análisis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Análisis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resultado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rango de Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{result.test_name}</div>
                    {result.is_critical && (
                      <div className="text-xs text-red-500">Valor fuera del rango normal</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.test_date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {result.value ?? '-'} {result.unit || ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatReferenceRange(result.reference_min, result.reference_max)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(result.is_critical)}`}>
                      {result.is_critical ? 'Anormal' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron resultados de laboratorio
            </div>
          )}
        </div>
      </div>
    </div>
  );
}