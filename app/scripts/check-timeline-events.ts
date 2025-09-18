#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTimelineEvents() {
  const { data, error, count } = await supabase
    .from('timeline_events')
    .select('*', { count: 'exact' })
    .order('event_date', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching timeline events:', error);
    return;
  }

  console.log(`\nTotal timeline events in database: ${count}`);
  console.log('\nLatest 5 events:');
  console.log('================\n');

  data?.forEach((event, i) => {
    console.log(`${i + 1}. ${event.event_date} ${event.event_time || ''} - ${event.title}`);
    console.log(`   Type: ${event.event_type}, Severity: ${event.severity}, Status: ${event.status}`);
    if (event.description) {
      console.log(`   Description: ${event.description.substring(0, 100)}...`);
    }
    console.log();
  });
}

checkTimelineEvents();