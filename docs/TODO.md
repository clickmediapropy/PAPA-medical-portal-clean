# Portal Médico v2 — Todo List

- [x] Initialize Next.js 15 project structure and connect it to this repo.
- [x] Configure Supabase CLI (`supabase init`), link project `pyammxdbnqgkmphxfvmk`, and commit baseline config.
- [x] Create base SQL migration for auth (`profiles`, `patients`, `patient_memberships`) with RLS and helper functions.
- [x] Add domain migrations for `updates`, `documents`, `lab_results`, `medications`, `timeline_events`, `activity_log`, and storage bucket policies.
- [x] Scaffold Supabase typed clients (server/client) and Zod validators for all domain entities.
- [x] Implement auth flow and layout: login, protected routes, session handling.
- [x] Build `/dashboard`, `/timeline`, `/laboratory`, `/medications`, `/upload` pages using RSC-first data fetching.
- [x] Implement upload server action + pre-signed storage flow and Edge Function `process_document` with JSON schema validation.
- [x] Add activity logging, idempotency, and dedupe scaffolding for processed lab results and timeline events.
- [x] Integrate Clerk auth (login, protected dashboard, sign-out) and configure environment keys.
- [x] Add Supabase data dictionary + backup script groundwork.
- [ ] Expand testing beyond scaffolding (Vitest unit tests ready) to include contract tests against Supabase and key E2E flows.
- [ ] Wire full observability (structured logging stubs in place, pending Sentry/metrics integration) and basic CI pipeline.
- [ ] Prepare deployment scripts/config for Supabase migrations, Edge Functions, and Vercel hosting.
