export interface LabResult {
  id: string;
  test_name: string;
  test_date: string;
  value: number | null;
  unit?: string | null;
  reference_min?: number | null;
  reference_max?: number | null;
  is_critical: boolean | null;
}

interface TrendAnalysis {
  trend: 'improving' | 'worsening' | 'stable' | 'variable';
  summary: string;
  insights: string[];
  lastValue: number | null;
  averageValue: number | null;
  percentageOutOfRange: number;
  changeFromPrevious: number | null;
}

export function analyzeTrend(results: LabResult[]): TrendAnalysis {
  if (results.length === 0) {
    return {
      trend: 'stable',
      summary: 'No hay datos suficientes para análisis',
      insights: [],
      lastValue: null,
      averageValue: null,
      percentageOutOfRange: 0,
      changeFromPrevious: null
    };
  }

  const sortedResults = [...results].sort(
    (a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
  );

  const validResults = sortedResults.filter(r => r.value !== null);
  const values = validResults.map(r => r.value as number);

  if (values.length === 0) {
    return {
      trend: 'stable',
      summary: 'No hay valores numéricos para analizar',
      insights: [],
      lastValue: null,
      averageValue: null,
      percentageOutOfRange: 0,
      changeFromPrevious: null
    };
  }

  const lastValue = values[values.length - 1];
  const averageValue = values.reduce((a, b) => a + b, 0) / values.length;

  const criticalCount = validResults.filter(r => r.is_critical).length;
  const percentageOutOfRange = (criticalCount / validResults.length) * 100;

  let changeFromPrevious: number | null = null;
  if (values.length > 1) {
    const previousValue = values[values.length - 2];
    changeFromPrevious = ((lastValue - previousValue) / previousValue) * 100;
  }

  const trend = determineTrend(values, validResults);
  const insights = generateInsights(
    validResults,
    lastValue,
    averageValue,
    percentageOutOfRange,
    changeFromPrevious,
    trend
  );

  const summary = generateSummary(
    validResults[validResults.length - 1],
    trend,
    percentageOutOfRange
  );

  return {
    trend,
    summary,
    insights,
    lastValue,
    averageValue,
    percentageOutOfRange,
    changeFromPrevious
  };
}

function determineTrend(
  values: number[],
  results: LabResult[]
): 'improving' | 'worsening' | 'stable' | 'variable' {
  if (values.length < 2) return 'stable';

  const recentValues = values.slice(-3);
  const olderValues = values.slice(-6, -3);

  if (olderValues.length === 0) {
    if (values.length === 2) {
      const diff = values[1] - values[0];
      const percentChange = Math.abs(diff / values[0]) * 100;
      if (percentChange < 5) return 'stable';

      const lastResult = results[results.length - 1];
      if (lastResult.reference_min !== null && lastResult.reference_min !== undefined &&
          lastResult.reference_max !== null && lastResult.reference_max !== undefined) {
        const midRange = (lastResult.reference_min + lastResult.reference_max) / 2;
        const isGettingCloser = Math.abs(values[1] - midRange) < Math.abs(values[0] - midRange);
        return isGettingCloser ? 'improving' : 'worsening';
      }
    }
    return 'stable';
  }

  const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;

  const coefficientOfVariation = calculateCV(values);

  if (coefficientOfVariation > 20) {
    return 'variable';
  }

  const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (Math.abs(percentChange) < 5) {
    return 'stable';
  }

  const lastResult = results[results.length - 1];
  if (lastResult.reference_min !== null && lastResult.reference_min !== undefined &&
      lastResult.reference_max !== null && lastResult.reference_max !== undefined) {
    const midRange = (lastResult.reference_min + lastResult.reference_max) / 2;
    const isGettingCloser = Math.abs(recentAvg - midRange) < Math.abs(olderAvg - midRange);
    return isGettingCloser ? 'improving' : 'worsening';
  }

  return percentChange > 0 ? 'improving' : 'worsening';
}

function calculateCV(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return (stdDev / mean) * 100;
}

function generateInsights(
  results: LabResult[],
  lastValue: number,
  averageValue: number,
  percentageOutOfRange: number,
  changeFromPrevious: number | null,
  trend: string
): string[] {
  const insights: string[] = [];
  const lastResult = results[results.length - 1];

  if (trend === 'improving') {
    insights.push('📈 Los valores muestran una tendencia de mejora');
  } else if (trend === 'worsening') {
    insights.push('📉 Los valores muestran una tendencia de empeoramiento');
  } else if (trend === 'variable') {
    insights.push('📊 Los valores presentan alta variabilidad');
  } else {
    insights.push('➡️ Los valores se mantienen estables');
  }

  if (percentageOutOfRange > 50) {
    insights.push(`⚠️ ${percentageOutOfRange.toFixed(0)}% de los valores están fuera del rango normal`);
  } else if (percentageOutOfRange > 0) {
    insights.push(`ℹ️ ${percentageOutOfRange.toFixed(0)}% de los valores están fuera del rango`);
  }

  if (changeFromPrevious !== null && Math.abs(changeFromPrevious) > 20) {
    const direction = changeFromPrevious > 0 ? 'aumentó' : 'disminuyó';
    insights.push(`🔄 El último valor ${direction} ${Math.abs(changeFromPrevious).toFixed(1)}% respecto al anterior`);
  }

  if (lastResult.is_critical) {
    insights.push('🔴 El último resultado está fuera del rango normal');
  } else if (lastResult.reference_min !== null && lastResult.reference_min !== undefined &&
             lastResult.reference_max !== null && lastResult.reference_max !== undefined) {
    const range = lastResult.reference_max - lastResult.reference_min;
    const position = ((lastValue - lastResult.reference_min) / range) * 100;

    if (position < 20) {
      insights.push('⬇️ El valor actual está en el límite inferior del rango normal');
    } else if (position > 80) {
      insights.push('⬆️ El valor actual está en el límite superior del rango normal');
    } else {
      insights.push('✅ El valor actual está dentro del rango óptimo');
    }
  }

  if (results.length >= 3) {
    const consecutiveCritical = results.slice(-3).every(r => r.is_critical);
    if (consecutiveCritical) {
      insights.push('⚠️ Los últimos 3 resultados están fuera del rango normal');
    }
  }

  return insights;
}

function generateSummary(
  lastResult: LabResult,
  trend: string,
  percentageOutOfRange: number
): string {
  let summary = '';

  const trendText = {
    improving: 'mejorando',
    worsening: 'empeorando',
    stable: 'estable',
    variable: 'variable'
  }[trend];

  summary = `Tendencia ${trendText}. `;

  if (lastResult.value !== null) {
    summary += `Último valor: ${lastResult.value} ${lastResult.unit || ''}.`;

    if (lastResult.is_critical) {
      summary += ' Requiere atención médica.';
    } else if (percentageOutOfRange === 0) {
      summary += ' Todos los valores en rango normal.';
    }
  }

  return summary;
}

export function groupResultsByTest(results: LabResult[]): Map<string, LabResult[]> {
  const grouped = new Map<string, LabResult[]>();

  for (const result of results) {
    const key = result.test_name;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(result);
  }

  for (const [key, values] of grouped.entries()) {
    grouped.set(key, values.sort(
      (a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
    ));
  }

  return grouped;
}

export function getTestDisplayInfo(testName: string): {
  category: string;
  importance: 'high' | 'medium' | 'low';
  description: string;
} {
  const testInfo: Record<string, { category: string; importance: 'high' | 'medium' | 'low'; description: string }> = {
    'Glucosa': {
      category: 'Metabolismo',
      importance: 'high',
      description: 'Nivel de azúcar en sangre'
    },
    'Hemoglobina': {
      category: 'Hematología',
      importance: 'high',
      description: 'Proteína que transporta oxígeno'
    },
    'Colesterol Total': {
      category: 'Lípidos',
      importance: 'high',
      description: 'Nivel total de colesterol'
    },
    'HDL': {
      category: 'Lípidos',
      importance: 'high',
      description: 'Colesterol bueno'
    },
    'LDL': {
      category: 'Lípidos',
      importance: 'high',
      description: 'Colesterol malo'
    },
    'Triglicéridos': {
      category: 'Lípidos',
      importance: 'high',
      description: 'Grasas en la sangre'
    },
    'Creatinina': {
      category: 'Función Renal',
      importance: 'high',
      description: 'Función de los riñones'
    },
    'TSH': {
      category: 'Tiroides',
      importance: 'high',
      description: 'Hormona estimulante de la tiroides'
    },
    'T3': {
      category: 'Tiroides',
      importance: 'medium',
      description: 'Hormona tiroidea T3'
    },
    'T4': {
      category: 'Tiroides',
      importance: 'medium',
      description: 'Hormona tiroidea T4'
    },
    'Vitamina D': {
      category: 'Vitaminas',
      importance: 'medium',
      description: 'Vitamina D en sangre'
    },
    'Vitamina B12': {
      category: 'Vitaminas',
      importance: 'medium',
      description: 'Vitamina B12 en sangre'
    },
    'Hierro': {
      category: 'Minerales',
      importance: 'medium',
      description: 'Nivel de hierro'
    },
    'Ferritina': {
      category: 'Minerales',
      importance: 'medium',
      description: 'Reservas de hierro'
    }
  };

  const normalizedName = testName.trim();
  const info = testInfo[normalizedName];

  if (info) {
    return info;
  }

  for (const [key, value] of Object.entries(testInfo)) {
    if (normalizedName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return {
    category: 'Otros',
    importance: 'low',
    description: 'Análisis clínico'
  };
}