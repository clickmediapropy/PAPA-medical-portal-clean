-- Lab parsed values table (created after lab_results exists)
create table public.lab_parsed_values (
  id uuid primary key default gen_random_uuid(),
  lab_result_id uuid not null references public.lab_results(id) on delete cascade,
  biomarker_id uuid references public.biomarkers(id) on delete set null,
  raw_name text not null, -- original name from document
  raw_value text not null, -- original value as extracted
  parsed_value numeric, -- parsed numeric value
  unit text,
  confidence_score numeric check (confidence_score >= 0 and confidence_score <= 1),
  extraction_method text, -- 'ai', 'manual', 'ocr'
  created_at timestamptz not null default now()
);

-- Add indexes for performance
create index idx_lab_parsed_values_lab_result on public.lab_parsed_values(lab_result_id);
create index idx_lab_parsed_values_biomarker on public.lab_parsed_values(biomarker_id);

-- Enable RLS
alter table public.lab_parsed_values enable row level security;

-- RLS policies
create policy "Lab parsed values readable by members" on public.lab_parsed_values
  for select using (
    exists (
      select 1
      from public.lab_results lr
      join public.patient_memberships pm on pm.patient_id = lr.patient_id
      where lr.id = public.lab_parsed_values.lab_result_id
        and pm.user_id = public.uid()
    )
  );

create policy "Lab parsed values insertable by members" on public.lab_parsed_values
  for insert with check (
    exists (
      select 1
      from public.lab_results lr
      join public.patient_memberships pm on pm.patient_id = lr.patient_id
      where lr.id = public.lab_parsed_values.lab_result_id
        and pm.user_id = public.uid()
    )
  );
