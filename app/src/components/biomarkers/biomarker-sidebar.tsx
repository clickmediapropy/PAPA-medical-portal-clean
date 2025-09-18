'use client';

import { Search, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { BiomarkerData } from '@/lib/biomarkers';

interface BiomarkerSidebarProps {
  biomarkers: BiomarkerData[];
  selectedBiomarker?: BiomarkerData;
  onSelectBiomarker: (biomarker: BiomarkerData) => void;
}

export function BiomarkerSidebar({
  biomarkers,
  selectedBiomarker,
  onSelectBiomarker
}: BiomarkerSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = Array.from(new Set(biomarkers.map(b => b.category)));

  // Filter biomarkers
  const filteredBiomarkers = biomarkers.filter(biomarker => {
    const matchesSearch = biomarker.displayName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || biomarker.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedBiomarkers = filteredBiomarkers.reduce((acc, biomarker) => {
    if (!acc[biomarker.category]) {
      acc[biomarker.category] = [];
    }
    acc[biomarker.category].push(biomarker);
    return acc;
  }, {} as Record<string, BiomarkerData[]>);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      cardiac: 'Cardíaco',
      metabolic: 'Metabólico',
      lipid: 'Lípidos',
      renal: 'Renal',
      liver: 'Hepático',
      electrolyte: 'Electrolitos',
      hematology: 'Hematología',
      hormonal: 'Hormonal',
      other: 'Otros'
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 w-full md:w-80">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Biomarcadores</h2>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar biomarcador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {getCategoryLabel(cat)}
            </option>
          ))}
        </select>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">{biomarkers.length}</div>
            <div className="text-gray-500">Total</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">
              {biomarkers.filter(b => b.status === 'critical' || b.status === 'abnormal').length}
            </div>
            <div className="text-red-500">Anormal</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-700">
              {biomarkers.filter(b => b.status === 'normal').length}
            </div>
            <div className="text-green-500">Normal</div>
          </div>
        </div>
      </div>

      {/* Biomarker list */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedBiomarkers).map(([category, biomarkers]) => (
          <div key={category}>
            <div className="px-4 py-2 bg-gray-50 border-y border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {getCategoryLabel(category)}
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {biomarkers.map(biomarker => (
                <button
                  key={biomarker.id}
                  onClick={() => onSelectBiomarker(biomarker)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    ${selectedBiomarker?.id === biomarker.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {biomarker.displayName}
                        </span>
                        {(biomarker.status === 'critical' || biomarker.status === 'abnormal') && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          {biomarker.currentValue?.toFixed(1)} {biomarker.currentUnit}
                        </span>
                        <span className={`
                          px-1.5 py-0.5 text-xs rounded-full border
                          ${getStatusColor(biomarker.status)}
                        `}>
                          {biomarker.status === 'normal' ? 'Normal' :
                           biomarker.status === 'abnormal' ? 'Anormal' : 'Crítico'}
                        </span>
                      </div>
                    </div>

                    {/* Mini sparkline */}
                    {biomarker.historicalData.length > 1 && (
                      <svg width="40" height="20" className="opacity-40">
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          points={
                            biomarker.historicalData
                              .slice(0, 5)
                              .reverse()
                              .map((point, index, arr) => {
                                const maxVal = Math.max(...arr.map(p => p.value));
                                const minVal = Math.min(...arr.map(p => p.value));
                                const range = maxVal - minVal || 1;
                                const y = 18 - ((point.value - minVal) / range) * 16;
                                const x = (index / (arr.length - 1)) * 36 + 2;
                                return `${x},${y}`;
                              })
                              .join(' ')
                          }
                          className="text-gray-400"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}