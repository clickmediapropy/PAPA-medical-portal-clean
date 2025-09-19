-- Enhance patients table with additional fields
alter table public.patients add column if not exists date_of_birth date;
alter table public.patients add column if not exists gender text check (gender in ('male', 'female', 'other'));
alter table public.patients add column if not exists phone text;
alter table public.patients add column if not exists email text;
alter table public.patients add column if not exists address text;
alter table public.patients add column if not exists emergency_contact text;
alter table public.patients add column if not exists medical_conditions text;
alter table public.patients add column if not exists allergies text;
alter table public.patients add column if not exists medications text;

-- Add index for email lookup
create index if not exists idx_patients_email on public.patients(email);

-- Add index for external_id lookup
create index if not exists idx_patients_external_id on public.patients(external_id);

