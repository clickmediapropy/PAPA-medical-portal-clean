-- Seed care plans, tasks, and logs for testing the Care Plan page
-- This migration is idempotent: it only inserts sample data if there are no existing care_plans.

-- Temporarily disable RLS to allow seeding
alter table if exists public.patients disable row level security;
alter table if exists public.care_task_logs disable row level security;
alter table if exists public.care_tasks disable row level security;
alter table if exists public.care_plans disable row level security;

do $$
declare
  v_patient_id uuid;
  v_plan_id uuid;
begin
  -- If there are already care plans, do nothing
  if exists (select 1 from public.care_plans) then
    raise notice 'Skipping seed: care_plans already contain data';
    return;
  end if;

  -- Pick any existing patient; if none, create one
  select id into v_patient_id
  from public.patients
  order by created_at
  limit 1;

  if v_patient_id is null then
    v_patient_id := gen_random_uuid();
    insert into public.patients (id, full_name)
    values (v_patient_id, 'Paciente Demo');
  end if;

  v_plan_id := gen_random_uuid();

  insert into public.care_plans (
    id, patient_id, title, description, status, priority, start_date, created_at, updated_at
  ) values (
    v_plan_id, v_patient_id, 'Plan Inicial', 'Plan de cuidados de prueba', 'active', 'high', current_date, now(), now()
  );

  -- Insert two tasks
  insert into public.care_tasks (
    id, care_plan_id, title, description, task_type, priority, frequency, is_active, created_at, updated_at
  ) values
    (gen_random_uuid(), v_plan_id, 'Tomar medicación', 'Tomar medicación según prescripción', 'medication', 'high', 'daily', true, now(), now()),
    (gen_random_uuid(), v_plan_id, 'Caminata 20 min', 'Realizar caminata diaria de 20 minutos', 'exercise', 'medium', 'daily', true, now(), now());

  -- Optionally insert a sample log for the first task created today
  insert into public.care_task_logs (
    id, care_task_id, patient_id, status, notes, completed_at, created_at, updated_at
  )
  select gen_random_uuid(), t.id, v_patient_id, 'completed', 'Tarea completada (seed)', now(), now(), now()
  from public.care_tasks t
  where t.care_plan_id = v_plan_id
  order by t.created_at
  limit 1;

  raise notice 'Seed data inserted for patient % and plan %', v_patient_id, v_plan_id;
end $$;

-- Re-enable RLS
alter table if exists public.care_plans enable row level security;
alter table if exists public.care_tasks enable row level security;
alter table if exists public.care_task_logs enable row level security;
alter table if exists public.patients enable row level security;

