-- Domain entities for medical updates, documents, lab results, medications, timeline, and activity log

create type public.document_type as enum ('lab_result', 'imaging', 'prescription', 'medical_report', 'other');
create type public.timeline_event_type as enum ('surgery','procedure','evaluation','dialysis','status','medication','lab_result','imaging','consultation','transfer','admission','discharge');
create type public.timeline_severity as enum ('critical','high','medium','low','info');
create type public.timeline_status as enum ('completed','ongoing','pending','cancelled');

create table public.updates (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  content_type text check (content_type in ('document','text')) default 'document',
  text_content text,
  status text check (status in ('pending','processing','completed','error')) default 'pending',
  ai_processed boolean default false,
  ai_summary jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  update_id uuid references public.updates(id) on delete cascade,
  document_type public.document_type not null,
  file_name text not null,
  file_path text not null,
  file_size integer,
  mime_type text,
  ai_extracted_data jsonb,
  created_at timestamptz not null default now()
);

create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  update_id uuid references public.updates(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  test_code text,
  test_name text not null,
  value numeric,
  unit text,
  reference_min numeric,
  reference_max numeric,
  is_critical boolean default false,
  test_date date not null,
  created_at timestamptz not null default now()
);

create table public.medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  update_id uuid references public.updates(id) on delete set null,
  name text not null,
  dosage text,
  frequency text,
  route text,
  start_date date,
  end_date date,
  is_active boolean default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  event_date date not null,
  event_time text,
  event_type public.timeline_event_type not null,
  severity public.timeline_severity not null default 'medium',
  status public.timeline_status not null default 'completed',
  title text not null,
  description text,
  details text,
  related_update_id uuid references public.updates(id) on delete set null,
  related_document_id uuid references public.documents(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  patient_id uuid references public.patients(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_updates_patient on public.updates(patient_id);
create index idx_documents_update on public.documents(update_id);
create index idx_lab_results_patient_date on public.lab_results(patient_id, test_date desc);
create index idx_medications_patient_active on public.medications(patient_id, is_active);
create index idx_timeline_patient_date on public.timeline_events(patient_id, event_date desc);
create index idx_activity_log_patient on public.activity_log(patient_id, created_at desc);

create trigger updates_set_updated_at
before update on public.updates
for each row execute procedure public.set_updated_at();

create trigger medications_set_updated_at
before update on public.medications
for each row execute procedure public.set_updated_at();

create trigger timeline_events_set_updated_at
before update on public.timeline_events
for each row execute procedure public.set_updated_at();

alter table public.updates enable row level security;
alter table public.documents enable row level security;
alter table public.lab_results enable row level security;
alter table public.medications enable row level security;
alter table public.timeline_events enable row level security;
alter table public.activity_log enable row level security;

create policy "Updates readable by members" on public.updates
  for select using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.updates.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Updates insert by members" on public.updates
  for insert with check (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.updates.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Documents readable by members" on public.documents
  for select using (
    exists (
      select 1
      from public.updates u
      join public.patient_memberships pm on pm.patient_id = u.patient_id
      where u.id = public.documents.update_id
        and pm.user_id = public.uid()
    )
  );

create policy "Lab results readable by members" on public.lab_results
  for select using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.lab_results.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Medications readable by members" on public.medications
  for select using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.medications.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Timeline readable by members" on public.timeline_events
  for select using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.timeline_events.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Activity readable by members" on public.activity_log
  for select using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.activity_log.patient_id
        and pm.user_id = public.uid()
    )
  );
create policy "Documents insert by members" on public.documents
  for insert with check (
    exists (
      select 1
      from public.updates u
      join public.patient_memberships pm on pm.patient_id = u.patient_id
      where u.id = public.documents.update_id
        and pm.user_id = public.uid()
    )
  );

create policy "Lab results insert by members" on public.lab_results
  for insert with check (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.lab_results.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Medications insert by members" on public.medications
  for insert with check (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.medications.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Timeline insert by members" on public.timeline_events
  for insert with check (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.timeline_events.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Activity insert by members" on public.activity_log
  for insert with check (
    public.activity_log.user_id = public.uid()
    and exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.activity_log.patient_id
        and pm.user_id = public.uid()
    )
  );
