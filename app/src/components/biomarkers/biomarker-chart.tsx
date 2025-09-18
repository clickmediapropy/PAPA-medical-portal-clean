'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { BiomarkerData } from '@/lib/biomarkers';

interface BiomarkerChartProps {
  biomarker: BiomarkerData;
  height?: number;
}

export function BiomarkerChart({ biomarker, height = 300 }: BiomarkerChartProps) {
  // Prepare data for chart
  const chartData = biomarker.historicalData
    .slice()
    .reverse()
    .map(point => ({
      date: point.date,
      value: point.value,
      isAbnormal: point.isAbnormal
    }));

  // Custom dot to highlight abnormal values
  const CustomDot = (props: { cx: number; cy: number; payload: { isAbnormal: boolean } }) => {
    const { cx, cy, payload } = props;
    if (payload.isAbnormal) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#ef4444"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#10b981"
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  // Format date for x-axis
  const formatXAxisDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM', { locale: es });
    } catch {
      return dateStr;
    }
  };

  // Format date for tooltip
  const formatTooltipDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  };

  // Custom tooltip
  interface TooltipPayload {
    value: number;
    payload: { isAbnormal: boolean };
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            {label ? formatTooltipDate(label) : ''}
          </p>
          <p className="mt-1 text-lg font-bold">
            <span className={payload[0].payload.isAbnormal ? 'text-red-600' : 'text-green-600'}>
              {payload[0].value?.toFixed(1)} {biomarker.currentUnit}
            </span>
          </p>
          {payload[0].payload.isAbnormal && (
            <p className="text-xs text-red-500 mt-1">Fuera del rango normal</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate Y-axis domain with padding
  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1;
  const yDomain = [
    Math.min(minValue - padding, biomarker.referenceMin || minValue),
    Math.max(maxValue + padding, biomarker.referenceMax || maxValue)
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisDate}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />

          <YAxis
            domain={yDomain}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            label={{
              value: biomarker.currentUnit || '',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 12 }
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Reference area for normal range */}
          {biomarker.referenceMin !== undefined && biomarker.referenceMax !== undefined && (
            <ReferenceArea
              y1={biomarker.referenceMin}
              y2={biomarker.referenceMax}
              fill="#10b981"
              fillOpacity={0.1}
              strokeOpacity={0}
            />
          )}

          {/* Reference lines for min/max */}
          {biomarker.referenceMin !== undefined && (
            <ReferenceLine
              y={biomarker.referenceMin}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            >
              <Label value="Min" position="left" />
            </ReferenceLine>
          )}

          {biomarker.referenceMax !== undefined && (
            <ReferenceLine
              y={biomarker.referenceMax}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            >
              <Label value="Max" position="left" />
            </ReferenceLine>
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(props) => {
              const { key, ...restProps } = props as unknown as Record<string, unknown>;
              return <CustomDot key={key as string} {...(restProps as { cx: number; cy: number; payload: { isAbnormal: boolean } })} />;
            }}
            activeDot={{ r: 6 }}
          />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            content={() => (
              <div className="flex items-center justify-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>
                  Normal
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-red-500"></span>
                  Anormal
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-20 w-4 bg-green-100 border border-green-300"></span>
                  Rango de referencia
                </span>
              </div>
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Helper component for reference line labels
function Label({ value, position }: { value: string; position: string }) {
  return (
    <text
      x={position === 'left' ? 5 : undefined}
      y={0}
      dy={-5}
      fill="#10b981"
      fontSize={10}
      textAnchor={position === 'left' ? 'start' : 'end'}
    >
      {value}
    </text>
  );
}