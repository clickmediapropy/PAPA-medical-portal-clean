# Portal Médico v2 — Ornament-Inspired Roadmap

Vision: deliver an Ornament-style health companion for a single patient (your dad) that unifies lab interpretation, personalized plans, AI coaching, lifestyle tracking, and family collaboration. Below is the implementation plan, broken into phases with detailed Supabase, backend, and UI tasks.

## Phase 0 – Baseline & Safety Nets
- Re-enable Supabase Auth/RLS once flows are ready; for now, keep service-role limited to server actions/edge functions.
- Nightly database backups (`supabase db dump`) and documented recovery plan.
- Draft biomarker dictionary (name, units, ranges, lifestyle notes) and compile patient history (conditions, meds, key events).

## Phase 1 – Lab Ingestion Pipeline
- **Schema additions**: `biomarkers`, `lab_sources`, `lab_parsed_values`.
- **Edge function** `process-lab-document`: OCR → LLM parsing → map analytes to biomarkers → populate `lab_results` + parsed values.
- **UI**: redesigned `/laboratory` with biomarker grouping, abnormalities highlighted, trend sparklines, and upload dialog (supporting PDF/photo/manual entry).

## Phase 2 – Personalized Care Plan & Tasks
- **Schema**: `care_plans`, `care_tasks`, `care_task_logs`.
- **Services**: AI generator for task plans based on goals/labs; actions to complete/snooze tasks.
- **UI**: dashboard “Today’s Priorities” card; care plan detail timeline.

## Phase 3 – AI Health Coach & Education
- **Schema**: `ai_sessions`, `ai_messages`, `education_articles`.
- **Services**: `askCoach` server action with retrieval (labs, meds, tasks) + guardrailed OpenAI responses citing articles.
- **UI**: `/coach` chat interface; inline “Explain” buttons linking to education snippets.

## Phase 4 – Nutrition & Lifestyle Tracking
- **Schema**: `meal_logs`, `symptom_logs`, `sleep_logs`, `weight_logs` (as needed).
- **Services**: photo-based meal recognition (edge function `analyze-meal`), nutrient mapping, lifestyle correlations with biomarkers.
- **UI**: `/nutrition` and `/symptoms` dashboards showing logs and correlation visuals.

## Phase 5 – Specialized Modes & Alerts
- JSON-configured modes (e.g., dialysis prep, hypertension) altering dashboards/tasks.
- **Schema**: `alerts` table; background job evaluating thresholds (lab deltas, missed tasks) and sending notifications (email/SMS) logged to `activity_log`.
- **UI**: mode selector, alert center with status and recommended actions.

## Phase 6 – Security & Polish
- Reintroduce Supabase Auth with role-based caregiver access via `patient_memberships`.
- Reinstate RLS, add audit logging, finalize testing (unit/integration/E2E), and ensure CI covers lint/typecheck/test.

## UI Principles
- Tailwind-based, RSC-first components; navigation tabs: Dashboard, Labs, Care Plan, Coach, Lifestyle, Alerts.
- Visual cues: color-coded badges, sparkline charts (`recharts` or `@tanstack/react-charts`).
- Accessibility and clear clinical disclaimers.

## Implementation Workflow
1. Write Supabase migration.
2. Seed reference data (biomarkers, articles) via scripts.
3. Implement server actions/edge functions.
4. Build UI components (server/client as needed).
5. Add tests and documentation.
6. Deploy, verify backups, review.

We’ll execute phases sequentially and pause after each for review. Say the word when you want to kick off Phase 1.
