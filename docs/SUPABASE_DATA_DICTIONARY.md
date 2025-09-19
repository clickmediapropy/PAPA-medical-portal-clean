# Supabase Data Dictionary

_Current schema snapshot — update whenever migrations change._

## Core Tables

| Table | Purpose | Key Columns |
| --- | --- | --- |
| `profiles` | Clerk user profile mirror (role, full name). | `id` (uuid, auth user id), `role`, `full_name`, timestamps |
| `patients` | Managed patients (currently single patient). | `id`, `external_id`, `full_name` |
| `patient_memberships` | Relationship between users and patients (caregiver roles). | `user_id`, `patient_id`, `role` |

## Domain Tables

| Table | Purpose | Key Columns |
| --- | --- | --- |
| `updates` | High-level medical updates (documents or text entries). | `id`, `patient_id`, `title`, `status`, `ai_processed` |
| `documents` | Uploaded medical files and parsed metadata. | `id`, `update_id`, `document_type`, `file_path`, `ai_extracted_data` |
| `lab_results` | Normalized lab values with references. | `id`, `patient_id`, `test_name`, `value`, `reference_min`, `reference_max`, `test_date` |
| `medications` | Patient medication list with status. | `id`, `patient_id`, `name`, `dosage`, `frequency`, `is_active` |
| `timeline_events` | Chronological clinical events. | `id`, `patient_id`, `event_type`, `event_date`, `severity`, `status` |
| `activity_log` | Audit log of user/system actions. | `id`, `user_id`, `patient_id`, `action`, `metadata` |

## To Be Added (Phase 1+)

Planned tables to support Ornament parity:

- `biomarkers`
- `lab_sources`
- `lab_parsed_values`
- `care_plans`, `care_tasks`, `care_task_logs`
- `ai_sessions`, `ai_messages`
- `meal_logs`, `symptom_logs`, etc.

Document each new table (purpose, columns, relationships) as migrations land.
