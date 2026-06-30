# ADR 0002 - SQLite Public Demo Scope

## Status

Accepted for current portfolio implementation.

## Context

The project is public and intended to work as a visible portfolio piece. Requiring Supabase credentials, authentication setup, and hosted PostgreSQL creates friction for reviewers who only need to see the product thinking, calculations, dashboard, and export behavior.

The existing Supabase/PostgreSQL design remains useful as the SaaS evolution path, but it is more infrastructure than the first public demo needs.

## Decision

Use:

- Next.js App Router for the web application.
- TypeScript for application code.
- In-memory SQLite with synthetic seed data for the public demo.
- Browser-session mock forms for revenue, expenses, goals, and assumptions.
- Pure TypeScript modules for financial calculations.
- Recharts for dashboard charts.
- A route handler for CSV export.

Do not require Supabase credentials for the current demo. Keep the Supabase migration as the hosted multi-user reference.

## Consequences

Positive:

- The app runs locally after `npm install` without external services.
- The public repo contains no credentials and no real financial data.
- Reviewers can inspect a working dashboard quickly.
- Calculations remain testable and portable to the future hosted version.

Tradeoffs:

- Browser mock changes are not persisted.
- There is no real authentication or RLS in the running demo.
- SQLite data is synthetic and intentionally small.
- PDF reports remain a next step.

## Follow-up

When evolving beyond portfolio demo scope, reintroduce Supabase Auth, PostgreSQL persistence, RLS tests, and authenticated Server Actions using the existing migration as the starting point.
