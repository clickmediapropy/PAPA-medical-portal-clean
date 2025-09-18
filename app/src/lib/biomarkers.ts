import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleClient } from './supabase';
import { logError } from './logging';
import type { Database } from './supabase';

export interface BiomarkerData {
  id: string;
  name: string;
  displayName: string;
  category: string;
  currentValue?: number;
  currentUnit?: string;
  lastTestDate?: string;
  status: 'normal' | 'abnormal' | 'critical';
  trend: 'up' | 'down' | 'stable';
  referenceMin?: number;
  referenceMax?: number;
  historicalData: HistoricalDataPoint[];
  percentChange?: number;
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
  unit?: string;
  isAbnormal: boolean;
}

export interface BiomarkerStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  latest: number;
  trend: 'improving' | 'worsening' | 'stable';
}

// Map lab test names to standardized biomarker names
const biomarkerNameMapping: Record<string, string> = {
  'Creatinina suero': 'creatinine',
  'Hemoglobina': 'hemoglobin',
  'Glucosa': 'glucose',
  'Colesterol total': 'total_cholesterol',
  'Colesterol LDL': 'ldl_cholesterol',
  'Colesterol HDL': 'hdl_cholesterol',
  'Triglicéridos': 'triglycerides',
  'Urea suero': 'bun',
  'Calcio suero': 'calcium',
  'Potasio suero': 'potassium',
  'Sodio suero': 'sodium',
  'Cloro suero': 'chloride',
  'Fosfato suero': 'phosphate',
  'Magnesio': 'magnesium',
  'Bilirrubina total': 'total_bilirubin',
  'Bilirrubina directa': 'direct_bilirubin',
  'Alanina aminotransferasa': 'alt',
  'Aspartato amino transferasa': 'ast',
  'Fosfatasa alcalina': 'alkaline_phosphatase',
  'Albúmina suero': 'albumin',
  'Proteínas totales': 'total_protein',
  'Ferritina': 'ferritin',
  'Hemoglobina A1c': 'hba1c',
  'PTH (Paratohormona)': 'pth',
  'Tirotropina': 'tsh',
  'Tiroxina libre (T4 libre)': 't4_free',
  'T3 total (Triiodotironina)': 't3_total',
  'Hematocrito': 'hematocrit',
  'Leucocitos': 'wbc',
  'Plaquetas': 'platelets',
  'Neutrófilos segmentados': 'neutrophils',
  'Linfocitos': 'lymphocytes',
  'Ácido úrico suero': 'uric_acid'
};

export async function getPatientBiomarkers(
  patientId: string,
  client?: SupabaseClient<Database>
): Promise<BiomarkerData[]> {
  const supabase = client ?? getSupabaseServiceRoleClient();

  try {
    // Fetch all lab results for the patient
    const { data: labResults, error: labError } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('test_date', { ascending: false });

    if (labError) {
      logError('biomarkers', 'Error fetching lab results', { error: labError.message });
      return [];
    }

    // Fetch biomarker reference data
    const { data: biomarkers, error: bioError } = await supabase
      .from('biomarkers')
      .select('*');

    if (bioError) {
      logError('biomarkers', 'Error fetching biomarker references', { error: bioError.message });
    }

    // Group lab results by biomarker
    interface LabResultType {
      created_at: string;
      document_id: string | null;
      id: string;
      is_critical: boolean | null;
      patient_id: string;
      reference_max: number | null;
      reference_min: number | null;
      test_code: string | null;
      test_date: string;
      test_name: string;
      unit: string | null;
      value: number | null;
    }
    const groupedResults = new Map<string, LabResultType[]>();

    labResults?.forEach(result => {
      const testName = result.test_name;
      if (!groupedResults.has(testName)) {
        groupedResults.set(testName, []);
      }
      groupedResults.get(testName)?.push(result);
    });

    // Process each biomarker group
    const biomarkerDataList: BiomarkerData[] = [];

    groupedResults.forEach((results, testName) => {
      const latestResult = results[0]; // Already sorted by date desc
      const standardName = biomarkerNameMapping[testName] || testName.toLowerCase().replace(/\s+/g, '_');

      // Find matching biomarker reference
      const biomarkerRef = biomarkers?.find(b =>
        b.name === standardName ||
        b.display_name === testName
      );

      // Calculate trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let percentChange = 0;

      if (results.length >= 2 && latestResult.value !== null) {
        const previousResult = results[1];
        if (previousResult.value !== null) {
          const change = ((latestResult.value - previousResult.value) / previousResult.value) * 100;
          percentChange = Math.round(change * 10) / 10;

          if (Math.abs(change) < 5) {
            trend = 'stable';
          } else {
            trend = change > 0 ? 'up' : 'down';
          }
        }
      }

      // Determine status
      let status: 'normal' | 'abnormal' | 'critical' = 'normal';

      if (latestResult.is_critical) {
        status = 'critical';
      } else if (latestResult.value !== null) {
        const refMin = latestResult.reference_min ?? biomarkerRef?.reference_min;
        const refMax = latestResult.reference_max ?? biomarkerRef?.reference_max;
        const critMin = biomarkerRef?.critical_min;
        const critMax = biomarkerRef?.critical_max;

        if (critMin !== null && critMin !== undefined && latestResult.value < critMin) {
          status = 'critical';
        } else if (critMax !== null && critMax !== undefined && latestResult.value > critMax) {
          status = 'critical';
        } else if (refMin !== null && refMin !== undefined && latestResult.value < refMin) {
          status = 'abnormal';
        } else if (refMax !== null && refMax !== undefined && latestResult.value > refMax) {
          status = 'abnormal';
        }
      }

      // Build historical data (only include non-null values)
      const historicalData: HistoricalDataPoint[] = results
        .filter(result => result.value !== null)
        .map(result => ({
          date: result.test_date,
          value: result.value as number, // Safe cast after filter
          unit: result.unit ?? undefined,
          isAbnormal: result.is_critical || false
        }));

      biomarkerDataList.push({
        id: standardName,
        name: testName,
        displayName: biomarkerRef?.display_name || testName,
        category: biomarkerRef?.category || 'other',
        currentValue: latestResult.value ?? undefined,
        currentUnit: latestResult.unit ?? undefined,
        lastTestDate: latestResult.test_date,
        status,
        trend,
        referenceMin: latestResult.reference_min ?? biomarkerRef?.reference_min ?? undefined,
        referenceMax: latestResult.reference_max ?? biomarkerRef?.reference_max ?? undefined,
        historicalData,
        percentChange
      });
    });

    // Sort by category and name
    biomarkerDataList.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.displayName.localeCompare(b.displayName);
    });

    return biomarkerDataList;
  } catch (error) {
    logError('biomarkers', 'Error processing biomarkers', { error });
    return [];
  }
}

// Note: calculateBiomarkerStats moved to biomarkers-client.ts for client-side usage