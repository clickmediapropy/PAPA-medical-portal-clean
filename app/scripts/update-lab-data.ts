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

// Airtable lab data extracted from MCP
const airtableLabData = [
  {"id":"recGhLGfS13oucpEL","fields":{"Fecha":"2025-09-16","Hemoglobina":16.09,"Hematocrito":6.09,"Leucocitos":6.09,"Estado Renal":"Normal","Alerta Anemia":"✅ Normal"}},
  {"id":"reclhHoZO2LNjWQvh","fields":{"Fecha":"2025-06-09","Hemoglobina":11,"Hematocrito":33,"Notas":"Control hematológico\nAnemia crónica secundaria a IRC","Estado Renal":"Normal","Alerta Anemia":"✅ Normal"}},
  {"id":"reckTQMP4Xecqyfaw","fields":{"Fecha":"2024-10-08","Hora":"08:00","Hemoglobina":8.9,"Hematocrito":28,"Leucocitos":6760,"Notas":"Importado desde CSV","Estado Renal":"Normal","Alerta Anemia":"🟡 Moderada"}},
  {"id":"recP4SW9mYd0TB99x","fields":{"Fecha":"2024-10-08","Hora":"08:00","Hemoglobina":8.9,"Hematocrito":28,"Glucosa":100,"Plaquetas":248000,"Leucocitos":3110000,"Notas":"Importado desde PDF","Estado Renal":"Normal","Alerta Anemia":"🟡 Moderada"}},
  {"id":"reccDcDq8KqMQfygr","fields":{"Fecha":"2024-09-24","Hora":"07:30","Hemoglobina":9.2,"Hematocrito":28.6,"Creatinina":8.4,"Urea":168,"Glucosa":97,"Sodio":139,"Potasio":5.2,"TSH":1.12,"Plaquetas":168000,"Leucocitos":6090,"Notas":"Laboratorio completo del 24/09/2024. Persisten signos de insuficiencia renal severa y anemia moderada. Observaciones: anisocitosis (++), macrocitosis (+), aumento de VCM. Sin signos de infección aguda. Reporte validado por Dra. Celeste Maciel.","Estado Renal":"⚠️ Severo","Alerta Anemia":"🟡 Moderada"}},
  {"id":"recq2vAMGCiPpr4tH","fields":{"Fecha":"2024-09-24","Hora":"08:00","Hemoglobina":9.2,"Hematocrito":29,"Glucosa":78,"Plaquetas":152000,"Leucocitos":3150000,"Notas":"Importado desde PDF","Estado Renal":"Normal","Alerta Anemia":"🟡 Moderada"}},
  {"id":"recojHBAWA6bzfZdh","fields":{"Fecha":"2024-09-09","Hora":"08:00","Hemoglobina":9.4,"Hematocrito":28.1,"Glucosa":91,"Plaquetas":164000,"Leucocitos":6940,"Notas":"Importado desde PDF","Estado Renal":"Normal","Alerta Anemia":"🟡 Moderada"}},
  {"id":"recQPLnNZMugtkWDy","fields":{"Fecha":"2024-05-23","Hora":"08:00","Hemoglobina":10,"Hematocrito":30,"Glucosa":88,"Plaquetas":219000,"Leucocitos":7160,"Notas":"Importado desde PDF","Estado Renal":"Normal","Alerta Anemia":"✅ Normal"}}
]

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
  { airtableField: 'Plaquetas', testName: 'Plaquetas', unit: '/μL', referenceMin: 150000, referenceMax: 450000 }
]

async function getOrCreatePatient() {
  // First, check if patient exists
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('id')
    .eq('email', 'papa@demo.com')
    .single()

  if (existingPatient) {
    return existingPatient.id
  }

  // Create new patient if doesn't exist
  const { data: newPatient, error } = await supabase
    .from('patients')
    .insert({
      full_name: 'Papa',
      email: 'papa@demo.com',
      phone: '+123456789',
      date_of_birth: '1950-01-01',
      emergency_contact: 'Familia'
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Error creating patient: ${error.message}`)
  }

  return newPatient.id
}

function isCriticalValue(testName: string, value: number, mapping: TestMapping): boolean {
  const { referenceMin, referenceMax } = mapping

  // Define critical thresholds for specific tests
  const criticalThresholds: Record<string, { min?: number, max?: number }> = {
    'Hemoglobina': { min: 8 },
    'Creatinina': { max: 10 },
    'Potasio': { max: 6 },
    'TSH': { max: 50 }
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

async function updateLabResults() {
  try {
    console.log('Starting lab results update...')

    const patientId = await getOrCreatePatient()
    console.log(`Using patient ID: ${patientId}`)

    let totalInserted = 0
    let totalUpdated = 0

    for (const record of airtableLabData) {
      const { fields } = record
      const testDate = fields.Fecha

      if (!testDate) {
        console.warn(`Skipping record ${record.id} - no date`)
        continue
      }

      for (const mapping of testMappings) {
        const value = fields[mapping.airtableField as keyof typeof fields] as number

        if (value !== undefined && value !== null) {
          const isCritical = isCriticalValue(mapping.testName, value, mapping)

          // Check if this exact lab result already exists
          const { data: existing } = await supabase
            .from('lab_results')
            .select('id, value')
            .eq('patient_id', patientId)
            .eq('test_date', testDate)
            .eq('test_name', mapping.testName)
            .single()

          const labResult = {
            patient_id: patientId,
            test_date: testDate,
            test_name: mapping.testName,
            value: value,
            unit: mapping.unit,
            reference_min: mapping.referenceMin,
            reference_max: mapping.referenceMax,
            is_critical: isCritical
          }

          if (existing) {
            // Update existing record if value is different
            if (existing.value !== value) {
              const { error } = await supabase
                .from('lab_results')
                .update(labResult)
                .eq('id', existing.id)

              if (error) {
                console.error(`Error updating lab result: ${error.message}`)
              } else {
                totalUpdated++
                console.log(`Updated: ${mapping.testName} = ${value} on ${testDate}`)
              }
            }
          } else {
            // Insert new record
            const { error } = await supabase
              .from('lab_results')
              .insert(labResult)

            if (error) {
              console.error(`Error inserting lab result: ${error.message}`)
            } else {
              totalInserted++
              console.log(`Inserted: ${mapping.testName} = ${value} on ${testDate}`)
            }
          }
        }
      }
    }

    console.log(`\n✅ Lab results update completed!`)
    console.log(`📊 Total inserted: ${totalInserted}`)
    console.log(`🔄 Total updated: ${totalUpdated}`)

  } catch (error) {
    console.error('❌ Error updating lab results:', error)
    process.exit(1)
  }
}

updateLabResults()