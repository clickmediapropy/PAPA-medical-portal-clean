#!/usr/bin/env python3
"""
Fix RLS policies for lab_results table to allow public read access
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)

url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not url or not key:
    raise ValueError("Supabase credentials not found")

print("=" * 60)
print("FIX RLS POLICIES FOR LAB RESULTS")
print("=" * 60)

print("\n⚠️  IMPORTANT: RLS policies need to be updated manually")
print("\nPlease follow these steps:\n")
print("1. Go to your Supabase Dashboard:")
print(f"   {url.replace('https://', 'https://supabase.com/dashboard/project/')}")
print("\n2. Navigate to: Authentication → Policies")
print("\n3. Find the 'lab_results' table")
print("\n4. Edit the SELECT policy:")
print("   - Change from: checking patient_memberships")
print("   - Change to: true (allows all reads)")
print("\n5. Do the same for 'lab_parsed_values' table")

print("\nAlternatively, go to SQL Editor and run this SQL:\n")

sql = """
-- Allow public read access to lab_results (temporary for development)
DROP POLICY IF EXISTS "Lab results readable by members" ON public.lab_results;

CREATE POLICY "Lab results readable by all" ON public.lab_results
  FOR SELECT
  USING (true);

-- Allow public read access to lab_parsed_values
DROP POLICY IF EXISTS "Lab parsed values readable by members" ON public.lab_parsed_values;

CREATE POLICY "Lab parsed values readable by all" ON public.lab_parsed_values
  FOR SELECT
  USING (true);
"""

print(sql)

print("\n" + "=" * 60)
print("After updating the policies, refresh your browser to see the lab results!")
print("=" * 60)