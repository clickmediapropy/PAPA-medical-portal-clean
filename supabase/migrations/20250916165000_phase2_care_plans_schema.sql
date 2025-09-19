-- Phase 2: Personalized Care Plan & Tasks Schema
-- Add care_plans, care_tasks, and care_task_logs tables

-- Care plans table
create table public.care_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  title text not null,
  description text,
  goal text not null,
  status text check (status in ('active', 'completed', 'paused', 'cancelled')) default 'active',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  start_date date not null default current_date,
  target_date date,
  completion_date date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Care tasks table
create table public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  care_plan_id uuid not null references public.care_plans(id) on delete cascade,
  title text not null,
  description text,
  task_type text check (task_type in ('medication', 'exercise', 'diet', 'monitoring', 'appointment', 'lifestyle', 'other')) not null,
  frequency text not null, -- e.g., 'daily', 'weekly', 'twice_daily', 'as_needed'
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  estimated_duration_minutes integer,
  instructions text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Care task logs for tracking completion
create table public.care_task_logs (
  id uuid primary key default gen_random_uuid(),
  care_task_id uuid not null references public.care_tasks(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  completed_at timestamptz not null default now(),
  completed_by uuid references public.profiles(id) on delete set null,
  status text check (status in ('completed', 'skipped', 'partial')) default 'completed',
  notes text,
  duration_minutes integer,
  metadata jsonb, -- for storing additional data like medication dosage, exercise intensity, etc.
  created_at timestamptz not null default now()
);

-- Add indexes for performance
create index idx_care_plans_patient on public.care_plans(patient_id);
create index idx_care_plans_status on public.care_plans(status);
create index idx_care_plans_priority on public.care_plans(priority);
create index idx_care_tasks_care_plan on public.care_tasks(care_plan_id);
create index idx_care_tasks_type on public.care_tasks(task_type);
create index idx_care_tasks_active on public.care_tasks(is_active);
create index idx_care_task_logs_task on public.care_task_logs(care_task_id);
create index idx_care_task_logs_patient on public.care_task_logs(patient_id);
create index idx_care_task_logs_date on public.care_task_logs(completed_at desc);

-- Add triggers for updated_at
create trigger care_plans_set_updated_at
before update on public.care_plans
for each row execute procedure public.set_updated_at();

create trigger care_tasks_set_updated_at
before update on public.care_tasks
for each row execute procedure public.set_updated_at();

-- Enable RLS
alter table public.care_plans enable row level security;
alter table public.care_tasks enable row level security;
alter table public.care_task_logs enable row level security;

-- RLS policies
create policy "Care plans readable by members" on public.care_plans
  for select using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.care_plans.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Care plans insertable by members" on public.care_plans
  for insert with check (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.care_plans.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Care plans updatable by members" on public.care_plans
  for update using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.care_plans.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Care tasks readable by members" on public.care_tasks
  for select using (
    exists (
      select 1
      from public.care_plans cp
      join public.patient_memberships pm on pm.patient_id = cp.patient_id
      where cp.id = public.care_tasks.care_plan_id
        and pm.user_id = public.uid()
    )
  );

create policy "Care tasks insertable by members" on public.care_tasks
  for insert with check (
    exists (
      select 1
      from public.care_plans cp
      join public.patient_memberships pm on pm.patient_id = cp.patient_id
      where cp.id = public.care_tasks.care_plan_id
        and pm.user_id = public.uid()
    )
  );

create policy "Care tasks updatable by members" on public.care_tasks
  for update using (
    exists (
      select 1
      from public.care_plans cp
      join public.patient_memberships pm on pm.patient_id = cp.patient_id
      where cp.id = public.care_tasks.care_plan_id
        and pm.user_id = public.uid()
    )
  );

create policy "Care task logs readable by members" on public.care_task_logs
  for select using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.care_task_logs.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Care task logs insertable by members" on public.care_task_logs
  for insert with check (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.care_task_logs.patient_id
        and pm.user_id = public.uid()
    )
  );

create policy "Care task logs updatable by members" on public.care_task_logs
  for update using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.care_task_logs.patient_id
        and pm.user_id = public.uid()
    )
  );
