-- Phase 1: Lab Ingestion Pipeline Schema
-- Add biomarkers, lab_sources, and lab_parsed_values tables

-- Biomarkers reference table
create table public.biomarkers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  category text not null, -- e.g., 'cardiac', 'metabolic', 'renal', 'liver'
  unit text not null,
  reference_min numeric,
  reference_max numeric,
  critical_min numeric,
  critical_max numeric,
  description text,
  lifestyle_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lab sources reference table
create table public.lab_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- Lab parsed values for detailed extraction (will be created after lab_results exists)
-- This table will be created in a separate migration after the core schema is applied

-- Add indexes for performance
create index idx_biomarkers_category on public.biomarkers(category);
create index idx_biomarkers_name on public.biomarkers(name);

-- Add triggers for updated_at
create trigger biomarkers_set_updated_at
before update on public.biomarkers
for each row execute procedure public.set_updated_at();

-- Enable RLS
alter table public.biomarkers enable row level security;
alter table public.lab_sources enable row level security;

-- RLS policies
create policy "Biomarkers readable by all authenticated users" on public.biomarkers
  for select using (auth.role() = 'authenticated');

create policy "Lab sources readable by all authenticated users" on public.lab_sources
  for select using (auth.role() = 'authenticated');
