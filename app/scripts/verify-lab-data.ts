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

async function verifyLabData() {
  try {
    console.log('🔍 Verifying lab data...\n')

    // Get patient
    const { data: patient } = await supabase
      .from('patients')
      .select('id, full_name')
      .eq('email', 'papa@demo.com')
      .single()

    if (!patient) {
      console.error('❌ Patient not found')
      return
    }

    console.log(`👤 Patient: ${patient.full_name} (${patient.id})\n`)

    // Get lab results summary
    const { data: labResults, error } = await supabase
      .from('lab_results')
      .select('test_date, test_name, value, unit, is_critical')
      .eq('patient_id', patient.id)
      .order('test_date', { ascending: false })
      .order('test_name')

    if (error) {
      console.error('❌ Error fetching lab results:', error.message)
      return
    }

    if (!labResults || labResults.length === 0) {
      console.log('⚠️ No lab results found')
      return
    }

    // Group by date
    const resultsByDate: Record<string, typeof labResults> = {}
    labResults.forEach(result => {
      if (!resultsByDate[result.test_date]) {
        resultsByDate[result.test_date] = []
      }
      resultsByDate[result.test_date].push(result)
    })

    console.log(`📊 Found ${labResults.length} lab results across ${Object.keys(resultsByDate).length} dates\n`)

    // Display results by date
    Object.keys(resultsByDate).forEach(date => {
      const results = resultsByDate[date]
      console.log(`📅 ${date}:`)

      results.forEach(result => {
        const criticalFlag = result.is_critical ? '⚠️' : '✅'
        console.log(`  ${criticalFlag} ${result.test_name}: ${result.value} ${result.unit || ''}`)
      })
      console.log('')
    })

    // Show critical values
    const criticalResults = labResults.filter(r => r.is_critical)
    if (criticalResults.length > 0) {
      console.log(`🚨 Critical values found (${criticalResults.length}):`)
      criticalResults.forEach(result => {
        console.log(`  ⚠️ ${result.test_date}: ${result.test_name} = ${result.value} ${result.unit || ''}`)
      })
    } else {
      console.log('✅ No critical values found')
    }

  } catch (error) {
    console.error('❌ Error verifying lab data:', error)
  }
}

verifyLabData()