'use client';

import type { HistoricalDataPoint, BiomarkerStats } from './biomarkers';

export function calculateBiomarkerStats(data: HistoricalDataPoint[]): BiomarkerStats | null {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d.value).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const latest = values[0]; // Assuming data is already sorted by date desc
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  // Determine trend (simple linear regression)
  let trend: 'improving' | 'worsening' | 'stable' = 'stable';
  if (values.length >= 3) {
    const firstThird = values.slice(Math.floor(values.length * 0.67));
    const lastThird = values.slice(0, Math.floor(values.length * 0.33));
    const firstAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;

    const changePercent = ((lastAvg - firstAvg) / firstAvg) * 100;

    if (Math.abs(changePercent) > 10) {
      // For some biomarkers, increase is bad (e.g., glucose, cholesterol)
      // For others, decrease is bad (e.g., hemoglobin)
      // This is a simplified approach - ideally we'd check the specific biomarker type
      trend = changePercent > 0 ? 'worsening' : 'improving';
    }
  }

  return {
    min,
    max,
    avg: Math.round(avg * 10) / 10,
    median: Math.round(median * 10) / 10,
    latest,
    trend
  };
}