'use client';

import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import type { BiomarkerData } from '@/lib/biomarkers';

interface BiomarkerCardProps {
  biomarker: BiomarkerData;
  isSelected?: boolean;
  onClick?: () => void;
}

export function BiomarkerCard({ biomarker, isSelected, onClick }: BiomarkerCardProps) {
  const getTrendIcon = () => {
    switch (biomarker.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (biomarker.status) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'abnormal':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-green-500 bg-green-50';
    }
  };

  const getStatusTextColor = () => {
    switch (biomarker.status) {
      case 'critical':
        return 'text-red-700';
      case 'abnormal':
        return 'text-yellow-700';
      default:
        return 'text-green-700';
    }
  };

  const getTrendColor = () => {
    if (biomarker.percentChange === undefined || biomarker.percentChange === 0) {
      return 'text-gray-500';
    }
    // For some biomarkers, increase is bad
    const increaseIsBad = ['glucose', 'cholesterol', 'triglycerides', 'creatinine'].some(
      name => biomarker.id.includes(name)
    );

    if (biomarker.percentChange > 0) {
      return increaseIsBad ? 'text-red-500' : 'text-green-500';
    } else {
      return increaseIsBad ? 'text-green-500' : 'text-red-500';
    }
  };

  // Create mini sparkline data (simplified - just shows trend line)
  const sparklinePoints = biomarker.historicalData
    .slice(0, 7)
    .reverse()
    .map((point, index, arr) => {
      const maxVal = Math.max(...arr.map(p => p.value));
      const minVal = Math.min(...arr.map(p => p.value));
      const range = maxVal - minVal || 1;
      const y = 30 - ((point.value - minVal) / range) * 25;
      const x = (index / (arr.length - 1)) * 80;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md
        ${getStatusColor()}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      {/* Status indicator */}
      {biomarker.status === 'critical' && (
        <AlertCircle className="absolute right-2 top-2 h-4 w-4 text-red-500" />
      )}

      {/* Biomarker name */}
      <h3 className="text-sm font-medium text-gray-900">{biomarker.displayName}</h3>

      {/* Current value */}
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${getStatusTextColor()}`}>
          {biomarker.currentValue?.toFixed(1) || '--'}
        </span>
        <span className="text-sm text-gray-500">{biomarker.currentUnit}</span>
      </div>

      {/* Reference range */}
      <div className="mt-1 text-xs text-gray-500">
        Ref: {biomarker.referenceMin || 0} - {biomarker.referenceMax || 0} {biomarker.currentUnit}
      </div>

      {/* Trend and change */}
      <div className="mt-3 flex items-center justify-between">
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          {biomarker.percentChange !== undefined && (
            <span className="text-xs font-medium">
              {biomarker.percentChange > 0 ? '+' : ''}{biomarker.percentChange}%
            </span>
          )}
        </div>

        {/* Mini sparkline */}
        {biomarker.historicalData.length > 1 && (
          <svg width="80" height="30" className="opacity-50">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              points={sparklinePoints}
              className={getStatusTextColor()}
            />
          </svg>
        )}
      </div>

      {/* Last test date */}
      <div className="mt-2 text-xs text-gray-400">
        {biomarker.lastTestDate
          ? new Date(biomarker.lastTestDate).toLocaleDateString('es-ES')
          : 'Sin datos'}
      </div>
    </div>
  );
}