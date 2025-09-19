-- Core domain schema: profiles, patients, memberships, helpers

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'clinician', 'family', 'viewer');

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'viewer',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patient_memberships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  role public.user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (user_id, patient_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patients_set_updated_at
before update on public.patients
for each row
execute procedure public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

create or replace function public.uid()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role public.user_role := 'viewer';
begin
  if new.raw_user_meta_data ? 'role' then
    begin
      new_role := (new.raw_user_meta_data->>'role')::public.user_role;
    exception when others then
      new_role := 'viewer';
    end;
  end if;

  insert into public.profiles (id, role, full_name)
  values (new.id, new_role, coalesce(new.raw_user_meta_data->>'full_name', new.email::text))
  on conflict (id) do update
    set role = excluded.role,
        full_name = excluded.full_name,
        updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.patients enable row level security;
alter table public.profiles enable row level security;
alter table public.patient_memberships enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (id = public.uid());

create policy "Profiles are updatable by owner" on public.profiles
  for update using (id = public.uid())
  with check (id = public.uid());

create policy "Memberships viewable by member" on public.patient_memberships
  for select using (user_id = public.uid());

create policy "Memberships manageable by member" on public.patient_memberships
  for delete using (user_id = public.uid());

create policy "Memberships allow self-insert" on public.patient_memberships
  for insert with check (user_id = public.uid());

create policy "Patients readable by members" on public.patients
  for select using (
    exists (
      select 1
      from public.patient_memberships pm
      where pm.patient_id = public.patients.id
        and pm.user_id = public.uid()
    )
  );
