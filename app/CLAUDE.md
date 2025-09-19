# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
npm run dev         # Start development server with Turbopack
npm run build       # Build for production with Turbopack
npm run start       # Start production server
```

**Code Quality:**
```bash
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript compiler checks (tsc --noEmit)
npm run test        # Run tests with Vitest
```

**Running Single Tests:**
```bash
npm run test -- src/lib/__tests__/validation.test.ts  # Run specific test file
npm run test -- --watch                               # Run tests in watch mode
```

## Architecture

This is a Next.js 15 medical portal application using:
- **Authentication**: Clerk for user authentication (currently disabled in middleware due to Next.js 15 header issues)
- **Database**: Supabase with PostgreSQL, organized into clear schemas
- **Styling**: Tailwind CSS v4 with PostCSS
- **Testing**: Vitest for unit tests

### Key Directories

- `/src/app/(dashboard)/` - Protected dashboard routes for medical management
- `/src/app/(auth)/` - Authentication routes (login)
- `/src/app/api/` - API routes for server-side operations
- `/src/components/` - Reusable React components organized by feature
- `/src/lib/` - Core utilities and configurations:
  - `supabase/` - Database clients (server, browser, admin)
  - `validation.ts` - Zod schemas for data validation
  - `patients.ts` & `patients-client.ts` - Patient data management

### Database Structure

Migrations in `/supabase/migrations/` define:
- Core patient and medical professional schemas
- Laboratory test results and biomarker tracking
- Care plans with tasks and protocols
- Document storage policies

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key

### Current State

- Authentication is temporarily disabled in middleware (`/src/middleware.ts`) to avoid Next.js 15 header compatibility issues
- Dashboard layout uses demo user (`usuario@demo.com`) until auth is re-enabled
- Main features include patient management, laboratory results, care plans, timeline, medications, and document upload
- no need to deploy on vercel if you already deploy on github. vercel picks up from gh automatically