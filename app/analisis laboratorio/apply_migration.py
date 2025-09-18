#!/usr/bin/env python3
"""
Apply SQL migration to Supabase database
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)

# Read migration file
migration_path = '/Users/nicodelgadob/Desktop/PAPA/supabase/migrations/20250917_allow_public_lab_read.sql'
with open(migration_path, 'r') as f:
    migration_sql = f.read()

# Split into individual statements
statements = [s.strip() for s in migration_sql.split(';') if s.strip() and not s.strip().startswith('--')]

url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not url or not key:
    raise ValueError("Supabase credentials not found")

# We need to use the REST API directly for DDL statements
import requests

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}

for i, statement in enumerate(statements, 1):
    print(f"Executing statement {i}/{len(statements)}...")
    print(f"Statement: {statement[:100]}...")

    response = requests.post(
        f'{url}/rest/v1/rpc/query',
        headers=headers,
        json={'query': statement}
    )

    if response.status_code == 404:
        # Try direct execution through different endpoint
        print("RPC endpoint not available, using direct SQL execution...")
        # Note: Supabase doesn't expose a direct SQL endpoint via REST
        # We'll need to use psycopg2 or another PostgreSQL client
        print("Cannot execute DDL via REST API. Please run the migration manually in Supabase dashboard.")
        break
    elif response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
    else:
        print(f"Statement {i} executed successfully")

print("\n⚠️  Migration needs to be applied manually:")
print("1. Go to https://supabase.com/dashboard")
print("2. Select your project")
print("3. Go to SQL Editor")
print("4. Paste and run the following SQL:\n")
print(migration_sql)