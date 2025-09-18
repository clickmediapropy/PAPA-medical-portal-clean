#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { format, parse as parseDate } from 'date-fns';
import { es } from 'date-fns/locale';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Type mappings from CSV to database enum
const typeMapping: Record<string, string> = {
  'Síntoma': 'status',
  'Episodio agudo': 'status',
  'Consulta': 'consultation',
  'Evolución Médica': 'consultation',
  'Evolución Clínica': 'consultation',
  'Diálisis': 'dialysis',
  'Procedimiento': 'procedure',
  'Intervención': 'procedure',
  'Estudio por imágenes': 'imaging',
  'Imagenología': 'imaging',
  'Observación clínica': 'evaluation',
  'Solicitud': 'evaluation',
};

// Severity mappings
const severityMapping: Record<string, string> = {
  'crítico': 'critical',
  'alta': 'high',
  'alto': 'high',
  'Media': 'medium',
  'media': 'medium',
  'medio': 'medium',
  'baja': 'low',
  'No urgente': 'low',
};

async function getDefaultPatientId() {
  const { data, error } = await supabase
    .from('patients')
    .select('id')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching patient:', error);
    return null;
  }

  return data.id;
}

function parseCSVDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;

  try {
    // Handle different date formats
    if (dateStr.includes('-')) {
      // Already in YYYY-MM-DD format
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        return dateStr;
      }
      // DD-MM-YYYY format
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    // Try parsing with date-fns
    const parsed = parseDate(dateStr, 'yyyy-MM-dd', new Date());
    return format(parsed, 'yyyy-MM-dd');
  } catch (error) {
    console.warn(`Could not parse date: ${dateStr}`);
    return null;
  }
}

async function importTimelineEvents() {
  try {
    // Get default patient ID
    const patientId = await getDefaultPatientId();
    if (!patientId) {
      console.error('No patient found. Please create a patient first.');
      return;
    }

    console.log(`Using patient ID: ${patientId}`);

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'Eventos Médicos-Grid view.csv');
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at: ${csvPath}`);
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relax_column_count: true,
    }) as Record<string, string>[];

    console.log(`Found ${records.length} records in CSV`);

    const timelineEvents = [];
    let skippedCount = 0;

    for (const record of records) {
      // Skip empty rows
      if (!record['Título'] || record['Título'].trim() === '') {
        skippedCount++;
        continue;
      }

      const eventDate = parseCSVDate(record['Fecha']);
      if (!eventDate) {
        console.warn(`Skipping record with invalid date: ${record['Fecha']} - ${record['Título']}`);
        skippedCount++;
        continue;
      }

      const csvType = record['Tipo'];
      const eventType = typeMapping[csvType] || 'status';

      const csvSeverity = record['Urgencia'];
      const severity = severityMapping[csvSeverity] || 'medium';

      // Build details object with additional info
      const details: any = {};
      if (record['Tags']) details.tags = record['Tags'];
      if (record['Institución']) details.institution = record['Institución'];
      if (record['Médico']) details.doctor = record['Médico'];
      if (record['Creado vía']) details.source = record['Creado vía'];
      if (record['Días Desde Evento']) details.daysSinceEvent = record['Días Desde Evento'];

      const event = {
        patient_id: patientId,
        event_date: eventDate,
        event_time: record['Hora'] || null,
        event_type: eventType,
        severity: severity,
        status: 'completed', // Historical events are completed
        title: record['Título'].trim(),
        description: record['Descripción'] || null,
        details: Object.keys(details).length > 0 ? JSON.stringify(details) : null,
      };

      timelineEvents.push(event);
    }

    console.log(`Prepared ${timelineEvents.length} events for import (${skippedCount} skipped)`);

    if (timelineEvents.length === 0) {
      console.log('No events to import');
      return;
    }

    // Insert events in batches of 50
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < timelineEvents.length; i += batchSize) {
      const batch = timelineEvents.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('timeline_events')
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        continue;
      }

      inserted += data?.length || 0;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length} events`);
    }

    console.log(`\n✅ Successfully imported ${inserted} timeline events`);

  } catch (error) {
    console.error('Error importing timeline events:', error);
  }
}

// Run the import
importTimelineEvents();