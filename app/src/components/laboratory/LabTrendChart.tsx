'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DataPoint {
  date: string;
  value: number | null;
  is_critical: boolean | null;
}

interface LabTrendChartProps {
  data: DataPoint[];
  testName: string;
  unit?: string | null;
  referenceMin?: number | null;
  referenceMax?: number | null;
}

export function LabTrendChart({
  data,
  testName,
  unit,
  referenceMin,
  referenceMax
}: LabTrendChartProps) {
  const chartData = data.map(point => ({
    ...point,
    formattedDate: format(new Date(point.date), 'dd MMM', { locale: es }),
    fullDate: format(new Date(point.date), 'dd/MM/yyyy', { locale: es })
  }));

  const validValues = data.filter(d => d.value !== null).map(d => d.value as number);
  const minValue = Math.min(...validValues);
  const maxValue = Math.max(...validValues);

  const yDomain: [number, number] = [minValue * 0.9, maxValue * 1.1];

  if (referenceMin !== null && referenceMin !== undefined) {
    yDomain[0] = Math.min(yDomain[0], referenceMin * 0.9);
  }
  if (referenceMax !== null && referenceMax !== undefined) {
    yDomain[1] = Math.max(yDomain[1], referenceMax * 1.1);
  }

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: DataPoint & { fullDate: string } }>;
    label?: string;
  }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.fullDate}</p>
          <p className={`text-sm ${data.is_critical ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            {testName}: {data.value} {unit || ''}
          </p>
          {data.is_critical && (
            <p className="text-xs text-red-500 mt-1">Fuera del rango normal</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: {
    cx: number;
    cy: number;
    payload: DataPoint;
  }) => {
    const { cx, cy, payload } = props;
    if (payload.is_critical) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#dc2626" stroke="#fff" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={8} fill="none" stroke="#dc2626" strokeWidth={1} opacity={0.5} />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={2} />;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="formattedDate"
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />

          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            domain={yDomain}
            tickFormatter={(value) => value.toFixed(1)}
          />

          <Tooltip content={<CustomTooltip />} />

          {referenceMin !== null && referenceMax !== null && (
            <ReferenceArea
              y1={referenceMin}
              y2={referenceMax}
              strokeOpacity={0}
              fill="#10b981"
              fillOpacity={0.1}
              label={{
                value: "Rango Normal",
                position: "insideTopRight",
                fill: "#10b981",
                fontSize: 11,
                fontWeight: 500
              }}
            />
          )}

          {referenceMin !== null && (
            <ReferenceLine
              y={referenceMin}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={1}
              opacity={0.7}
            />
          )}

          {referenceMax !== null && (
            <ReferenceLine
              y={referenceMax}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={1}
              opacity={0.7}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(props) => <CustomDot {...props} />}
            activeDot={{ r: 8 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}