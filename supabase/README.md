# Supabase

This directory contains the hosted SaaS database migration surface for Finance Planner MicroSaaS.

The current public portfolio demo uses in-memory SQLite synthetic data and does not require Supabase to run.

## Migration Order

1. `migrations/0001_initial_schema.sql`

The initial schema creates:

- App profile records linked to Supabase Auth users.
- Revenue sources and revenue entries.
- Expense categories and expense entries.
- Monthly goals.
- Tax settings.
- Cash reserve snapshots.
- Report export audit entries.
- Row Level Security policies for user-owned data.

## Security Expectations

- Run migrations against a development project first.
- Verify RLS with at least two test users before production.
- Never use the service role key in browser code.
- Keep generated types in source control once the app is scaffolded.
