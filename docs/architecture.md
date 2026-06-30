# Architecture

## Overview

Finance Planner MicroSaaS is currently implemented as a public portfolio demo built with Next.js, TypeScript, SQLite, deterministic calculation modules, Recharts, and CSV export.

The current implementation optimizes for visibility, correctness, and easy review without requiring live credentials. Financial calculations must remain deterministic, testable, and isolated from UI rendering. Supabase Auth, PostgreSQL, and Row Level Security remain the hosted SaaS path, not the default portfolio demo runtime.

## System Context

```text
User
  |
  v
Next.js App Router on Vercel
  |
  |-- Server Components
  |-- Client-side mock forms for portfolio interaction
  |-- Route Handlers for CSV export
  |-- Calculation services
  |
  v
In-memory SQLite seed data
```

## Architectural Priorities

1. **Correct financial logic:** formulas are centralized and covered by unit tests.
2. **Public demo safety:** the shipped app uses synthetic data and no secrets.
3. **Small feature modules:** each business area owns its UI, validation, repository calls, and tests.
4. **Typed boundaries:** input validation happens before writes and before calculation execution.
5. **Public maintainability:** docs explain the product, data model, formulas, and API behavior.

## Application Structure

```text
app/
  (app)/
    layout.tsx
    dashboard/
      page.tsx
    revenue/
      page.tsx
    expenses/
      page.tsx
    goals/
      page.tsx
    reports/
      page.tsx
    settings/
      page.tsx
  api/
    exports/
      monthly/
        route.ts
    reports/
      monthly/
        route.ts

features/
  dashboard/
    components/
    view-model.ts
  reports/
    csv.ts
  shared/
    format.ts

lib/
  calculations/
    money.ts
    monthly-summary.ts
    runway.ts
    simulator.ts
    tax.ts
  database/
    demo-sqlite.ts
    types.ts
  validation/
    common.ts

supabase/
  migrations/  # future hosted SaaS reference

tests/
  e2e/
  unit/
```

## Module Boundaries

| Module | Owns | Does Not Own |
| --- | --- | --- |
| `features/dashboard` | Dashboard UI, mock forms, charts, and view model mapping | Core formulas |
| `features/reports` | CSV export rendering | PDF generation |
| `features/shared` | Display formatting | Financial calculations |
| `lib/calculations` | Pure financial calculations | UI, database, auth |
| `lib/database` | SQLite demo seed and data loading | Real customer persistence |
| `supabase/migrations` | Future hosted SaaS schema reference | Current portfolio runtime |

## Data Flow

### Add Revenue or Expense in Demo

1. User submits a form from the public dashboard.
2. The client validates the basic input shape.
3. The record is added to browser state for the current session.
4. Pure calculation functions recompute the summary.
5. No real data is persisted.

### Monthly Dashboard

1. Server component reads the selected demo month.
2. SQLite seed data loads revenue, expenses, goals, tax settings, and cash snapshot.
3. Pure calculation functions build the monthly summary.
4. View model maps values to cards, tables, and chart series.
5. UI renders already-formatted values.

### Export CSV

1. Route handler receives the selected `month`.
2. Zod validates the month query.
3. Report model loads the same SQLite-backed mock inputs used by the dashboard.
4. CSV renderer produces a deterministic export.

## Calculation Layer

Financial logic must live in `lib/calculations`, not inside React components or database queries.

Rules:

- Accept plain typed inputs.
- Return plain typed outputs.
- Do not read environment variables.
- Do not query SQLite or Supabase.
- Do not format currency for display.
- Cover zero, negative, missing, and rounding cases in unit tests.

See [Financial Calculations](./calculations.md).

## Persistence Model

SQLite seed data is the current portfolio demo source. It is recreated in memory and contains only synthetic records.

The Supabase/PostgreSQL schema remains the source-of-truth design for a future hosted SaaS version.

Key persistence rules:

- Store money in integer minor units, such as pence.
- Store reporting month as the first day of the month in a `date` column.
- Use `timestamptz` for audit timestamps in the future hosted schema.
- Keep user-owned records scoped by `user_id` in the future hosted schema.
- Prefer explicit categories and type enums over free-form business logic.

See [Data Model](./data-model.md).

## Auth and Authorization

The portfolio demo is public and unauthenticated because it contains only synthetic data. Before storing real user-owned data, reintroduce:

- Supabase Auth for identity.
- Protected app routes.
- Server-side session checks for mutations and exports.
- RLS policies for all user-owned tables.

## Error Handling

User-facing errors should be specific but not leak internals.

Examples:

- "Enter an amount greater than zero."
- "This report could not be generated for the selected month."
- "You need to sign in again before exporting data."

Server logs may include request context, user id, route, and safe error codes. They must not include full financial payloads unless explicitly redacted and needed for debugging.

## Deployment

Target deployment:

- Vercel for Next.js.
- No required database credentials for the portfolio demo.
- Supabase hosted project for the future multi-user SaaS version.

## Quality Gates

Before a public release:

- Lint passes.
- Typecheck passes.
- Unit tests cover financial calculations.
- Unit tests cover CSV export helpers.
- Build passes.
- Playwright tests cover dashboard rendering, mock record creation, simulator, and CSV export when configured.
- Security review confirms synthetic-only data and no secret leakage.
- README and docs match the actual implementation.
