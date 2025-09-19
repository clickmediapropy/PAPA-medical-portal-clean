#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/lib/supabase/types.gen'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Datos correctos consolidados de Airtable con fechas precisas
const correctLabData = [
  {
    "fecha": "2025-09-16",
    "hora": "08:00",
    "valores": {
      "Hemoglobina": 16.09,
      "Hematocrito": 6.09,
      "Leucocitos": 6.09
    },
    "notas": "Análisis reciente septiembre 2025"
  },
  {
    "fecha": "2025-06-09",
    "hora": "08:00",
    "valores": {
      "Hemoglobina": 11,
      "Hematocrito": 33
    },
    "notas": "Control hematológico - Anemia crónica secundaria a IRC"
  },
  {
    "fecha": "2024-10-08",
    "hora": "08:00",
    "valores": {
      "Hemoglobina": 8.9,
      "Hematocrito": 28,
      "Leucocitos": 6760,
      "Glucosa": 100,
      "Plaquetas": 248000,
      "Eritrocitos": 2.86,
      "Linfocitos": 0.26,
      "Monocitos": 0.14,
      "Segmentados": 2.71,
      "Magnesio": 2.08,
      "Osmolalidad": 280,
      "aminotransferasa": 10,
      "Bilirrubina directa": 0.1,
      "Blastos": 6760
    },
    "notas": "Laboratorio completo octubre 2024"
  },
  {
    "fecha": "2024-10-06",
    "hora": "08:00",
    "valores": {
      "Hemoglobina": 15.5,
      "Hematocrito": 44.5,
      "Plaquetas": 257000,
      "Leucocitos": 10120,
      "Eritrocitos": 4.65,
      "Linfocitos": 0.43,
      "Monocitos": 0.37,
      "Segmentados": 8.82,
      "Osmolalidad": 287,
      "aminotransferasa": 25,
      "Bilirrubina directa": 0.2
    },
    "notas": "Control pre-tratamiento octubre 2024"
  },
  {
    "fecha": "2024-09-24",
    "hora": "07:30",
    "valores": {
      "Hemoglobina": 9.2,
      "Hematocrito": 28.6,
      "Creatinina": 8.4,
      "Urea": 168,
      "Glucosa": 97,
      "Sodio": 139,
      "Potasio": 5.2,
      "TSH": 1.12,
      "Plaquetas": 168000,
      "Leucocitos": 6090,
      "Eritrocitos": 3.11,
      "Linfocitos": 0.13,
      "Monocitos": 0.06,
      "Segmentados": 2.76,
      "Magnesio": 2.09,
      "Osmolalidad": 283,
      "aminotransferasa": 10,
      "Bilirrubina directa": 0.1
    },
    "notas": "Laboratorio completo del 24/09/2024. Persisten signos de insuficiencia renal severa y anemia moderada. Observaciones: anisocitosis (++), macrocitosis (+), aumento de VCM. Sin signos de infección aguda. Reporte validado por Dra. Celeste Maciel."
  },
  {
    "fecha": "2024-09-09",
    "hora": "08:00",
    "valores": {
      "Hemoglobina": 9.4,
      "Hematocrito": 28.1,
      "Glucosa": 91,
      "Plaquetas": 164000,
      "Leucocitos": 6940,
      "Osmolalidad": 277,
      "aminotransferasa": 10,
      "Bilirrubina directa": 0.1
    },
    "notas": "Control septiembre 2024"
  },
  {
    "fecha": "2024-05-23",
    "hora": "08:00",
    "valores": {
      "Hemoglobina": 10,
      "Hematocrito": 30,
      "Glucosa": 88,
      "Plaquetas": 219000,
      "Leucocitos": 7160,
      "Osmolalidad": 280,
      "aminotransferasa": 11,
      "Bilirrubina directa": 0.1
    },
    "notas": "Control mayo 2024"
  }
];

interface TestMapping {
  airtableField: string
  testName: string
  unit: string
  referenceMin?: number
  referenceMax?: number
}

// Define test mappings
const testMappings: TestMapping[] = [
  { airtableField: 'Hemoglobina', testName: 'Hemoglobina', unit: 'g/dL', referenceMin: 12, referenceMax: 16 },
  { airtableField: 'Hematocrito', testName: 'Hematocrito', unit: '%', referenceMin: 36, referenceMax: 48 },
  { airtableField: 'Leucocitos', testName: 'Leucocitos', unit: '/μL', referenceMin: 4000, referenceMax: 11000 },
  { airtableField: 'Creatinina', testName: 'Creatinina', unit: 'mg/dL', referenceMin: 0.7, referenceMax: 1.3 },
  { airtableField: 'Urea', testName: 'Urea', unit: 'mg/dL', referenceMin: 15, referenceMax: 45 },
  { airtableField: 'Glucosa', testName: 'Glucosa', unit: 'mg/dL', referenceMin: 70, referenceMax: 100 },
  { airtableField: 'Sodio', testName: 'Sodio', unit: 'mEq/L', referenceMin: 135, referenceMax: 145 },
  { airtableField: 'Potasio', testName: 'Potasio', unit: 'mEq/L', referenceMin: 3.5, referenceMax: 5.0 },
  { airtableField: 'TSH', testName: 'TSH', unit: 'μIU/mL', referenceMin: 0.4, referenceMax: 4.0 },
  { airtableField: 'Plaquetas', testName: 'Plaquetas', unit: '/μL', referenceMin: 150000, referenceMax: 450000 },
  { airtableField: 'Eritrocitos', testName: 'Eritrocitos', unit: 'millones/μL', referenceMin: 4.2, referenceMax: 5.4 },
  { airtableField: 'Linfocitos', testName: 'Linfocitos', unit: '%', referenceMin: 20, referenceMax: 40 },
  { airtableField: 'Monocitos', testName: 'Monocitos', unit: '%', referenceMin: 2, referenceMax: 8 },
  { airtableField: 'Segmentados', testName: 'Segmentados', unit: '%', referenceMin: 50, referenceMax: 70 },
  { airtableField: 'Magnesio', testName: 'Magnesio', unit: 'mg/dL', referenceMin: 1.7, referenceMax: 2.2 },
  { airtableField: 'Osmolalidad', testName: 'Osmolalidad', unit: 'mOsm/kg', referenceMin: 275, referenceMax: 295 },
  { airtableField: 'aminotransferasa', testName: 'ALT (Aminotransferasa)', unit: 'U/L', referenceMin: 7, referenceMax: 56 },
  { airtableField: 'Bilirrubina directa', testName: 'Bilirrubina directa', unit: 'mg/dL', referenceMin: 0, referenceMax: 0.3 },
  { airtableField: 'Blastos', testName: 'Blastos', unit: '%', referenceMin: 0, referenceMax: 2 }
]

async function getPatientId() {
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('email', 'papa@demo.com')
    .single()

  if (!patient) {
    throw new Error('Patient not found')
  }

  return patient.id
}

function isCriticalValue(testName: string, value: number, mapping: TestMapping): boolean {
  const { referenceMin, referenceMax } = mapping

  // Define critical thresholds for specific tests
  const criticalThresholds: Record<string, { min?: number, max?: number }> = {
    'Hemoglobina': { min: 8 },
    'Creatinina': { max: 10 },
    'Potasio': { max: 6 },
    'TSH': { max: 50 },
    'Hematocrito': { min: 20 }
  }

  const threshold = criticalThresholds[testName]
  if (threshold) {
    if (threshold.min && value < threshold.min) return true
    if (threshold.max && value > threshold.max) return true
  }

  // Fallback to reference ranges
  if (referenceMin && value < referenceMin * 0.5) return true
  if (referenceMax && value > referenceMax * 2) return true

  return false
}

async function fixLabData() {
  try {
    console.log('🔧 Iniciando corrección de datos de laboratorio...')

    const patientId = await getPatientId()
    console.log(`👤 Usando paciente ID: ${patientId}`)

    // Paso 1: Limpiar todos los datos existentes
    console.log('🗑️ Eliminando datos incorrectos existentes...')
    const { error: deleteError } = await supabase
      .from('lab_results')
      .delete()
      .eq('patient_id', patientId)

    if (deleteError) {
      console.error('Error eliminando datos:', deleteError.message)
      throw deleteError
    }

    console.log('✅ Datos antiguos eliminados')

    // Paso 2: Insertar datos correctos consolidados
    console.log('📊 Insertando datos corregidos...')

    let totalInserted = 0

    for (const labRecord of correctLabData) {
      const { fecha, valores, notas } = labRecord

      for (const mapping of testMappings) {
        const value = valores[mapping.airtableField as keyof typeof valores] as number

        if (value !== undefined && value !== null) {
          const isCritical = isCriticalValue(mapping.testName, value, mapping)

          const labResult = {
            patient_id: patientId,
            test_date: fecha,
            test_name: mapping.testName,
            value: value,
            unit: mapping.unit,
            reference_min: mapping.referenceMin,
            reference_max: mapping.referenceMax,
            is_critical: isCritical
          }

          const { error } = await supabase
            .from('lab_results')
            .insert(labResult)

          if (error) {
            console.error(`Error insertando ${mapping.testName} del ${fecha}:`, error.message)
          } else {
            totalInserted++
            console.log(`✅ ${mapping.testName} = ${value} ${mapping.unit} en ${fecha} ${isCritical ? '⚠️' : '✅'}`)
          }
        }
      }
    }

    console.log(`\n🎉 ¡Corrección completada exitosamente!`)
    console.log(`📊 Total de resultados insertados: ${totalInserted}`)
    console.log(`📅 Fechas procesadas: ${correctLabData.length}`)
    console.log(`🔍 Datos ahora reflejan las fechas correctas de Airtable`)

  } catch (error) {
    console.error('❌ Error corrigiendo datos de laboratorio:', error)
    process.exit(1)
  }
}

fixLabData()