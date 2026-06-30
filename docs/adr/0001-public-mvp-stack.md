# ADR 0001 - Public MVP Stack

## Status

Accepted for MVP planning.

## Context

The project needs to demonstrate a useful freelancer finance product while staying small enough to build, test, and explain in a public portfolio repository.

The product requires:

- Authenticated user data.
- Relational financial records.
- Deterministic financial calculations.
- Dashboard UI.
- CSV and PDF exports.
- Simple deployment.
- Strong documentation.

## Decision

Use:

- Next.js App Router for the web application.
- TypeScript for application code.
- Supabase Auth for authentication.
- PostgreSQL through Supabase for persistence.
- Supabase Row Level Security for user data isolation.
- Vercel for deployment.
- Pure TypeScript modules for financial calculations.

## Consequences

Positive:

- Fast SaaS implementation path.
- Clear portfolio signal for modern full-stack development.
- PostgreSQL fits financial records and reporting.
- Supabase RLS provides a strong data isolation story.
- Vercel keeps deployment simple.

Tradeoffs:

- Supabase-specific auth and RLS patterns become part of the architecture.
- PDF generation needs careful implementation to avoid brittle rendering.
- Local testing needs a strategy for database and RLS behavior.
- Full accounting features are intentionally out of scope.

## Alternatives Considered

### Firebase

Rejected for MVP because relational financial reporting and SQL queries are a better fit for PostgreSQL.

### Custom Node API Server

Rejected for MVP because Next.js route handlers and server actions are enough for this product scope.

### Spreadsheet-only Tool

Rejected because the portfolio goal is to show SaaS architecture, authentication, persistence, dashboards, and exports.
