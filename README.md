# Finance Planner MicroSaaS

Finance Planner MicroSaaS is a public portfolio demo for freelancers,
consultants, and small service businesses that want a simple monthly view of
revenue, expenses, profit, tax reserve, cash runway, and owner income targets.

The application is intentionally scoped as a reviewable mock SaaS product, not
a full production finance platform. It runs locally with synthetic in-memory
SQLite data and does not require Supabase, PostgreSQL, authentication, or live
credentials.

## Project Status

The repository contains a portfolio-ready Next.js dashboard backed by an
in-memory SQLite seed. It is designed for a public GitHub repository without
private financial data, hosted database setup, or secrets.

Supabase Auth, PostgreSQL persistence, Row Level Security, and PDF reports are
documented as the optional hosted SaaS evolution path only.

## Product Scope

The MVP focuses on practical financial planning, not accounting replacement.

- Register revenue by date, source, client, and notes.
- Register fixed and variable expenses by category.
- Calculate monthly revenue, expenses, profit, estimated tax reserve, and owner income.
- Track monthly revenue goals and desired take-home income.
- Project runway from available cash and monthly burn.
- Run a simulator for "how much do I need to sell to take home GBP X per month?"
- Review a monthly dashboard with charts and summary cards.
- Export monthly data to CSV.
- Keep PDF report generation as a documented next step.

## Target Users

- Freelancers with inconsistent monthly income.
- Consultants who need a clean monthly view of revenue and profit.
- Microbusiness owners separating business cash from personal income.
- Portfolio reviewers evaluating product thinking, calculations, UX, and technical architecture.

## Current Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Demo data:** in-memory SQLite with synthetic seed data
- **Validation:** Zod for route inputs
- **Charts:** Recharts
- **CSV export:** Next.js route handler
- **Tests:** Vitest unit tests and Playwright E2E tests
- **Future SaaS path:** optional Supabase Auth, PostgreSQL, RLS, and PDF reports

## Documentation

- [Product Spec](./docs/product-spec.md)
- [Architecture](./docs/architecture.md)
- [Data Model](./docs/data-model.md)
- [Financial Calculations](./docs/calculations.md)
- [API Contracts](./docs/api-contracts.md)
- [Security](./docs/security.md)
- [Testing Strategy](./docs/testing-strategy.md)
- [Development Guide](./docs/development.md)
- [Roadmap](./docs/roadmap.md)
- [Architecture Decision Records](./docs/adr/0001-public-mvp-stack.md)

## Repository Principles

- Keep product language specific and useful.
- Keep financial calculations explicit, tested, and easy to audit.
- Store money as integer minor units, such as pence for GBP.
- Validate all user input at system boundaries.
- Use synthetic demo data in the public portfolio app.
- Do not require Supabase to run the current demo.
- Use Supabase Row Level Security before introducing real user-owned data in a
  future hosted version.
- Prefer small feature modules over broad technical folders.
- Do not expose secrets, credentials, or personal financial data.

## Expected App Structure

```text
app/
  (marketing)/
  (app)/
  api/
features/
  dashboard/
  expenses/
  goals/
  reports/
  revenue/
  simulator/
lib/
  calculations/
  database/
  validation/
supabase/
  migrations/  # future hosted SaaS reference
tests/
  e2e/
  integration/
  unit/
```

## Local Setup

```bash
npm install
npm run dev
```

Open the dashboard at:

```text
http://127.0.0.1:3000/dashboard
```

The demo works without `.env.local` and without a Supabase project.

## Test And Build Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

`npm run test:e2e` starts the local Next.js dev server through Playwright.

## Environment Variables

The portfolio demo does not require environment variables. See
[.env.example](./.env.example) for the optional app URL placeholder.

Do not commit real `.env` files, Supabase keys, database passwords, API tokens,
or private financial data.

## Database

The running demo uses an in-memory SQLite database created from synthetic seed
data in [`lib/database/demo-sqlite.ts`](./lib/database/demo-sqlite.ts). The
database is rebuilt in memory for each server-side read and does not persist
browser form edits.

Supabase/PostgreSQL is optional. The SQL files in
[`supabase/migrations/`](./supabase/migrations/) are provided for users who want
to evolve the demo into a hosted multi-user SaaS later.

To apply the migration in your own Supabase or PostgreSQL project:

1. Create a separate Supabase/PostgreSQL project.
2. Review [`supabase/migrations/0001_initial_schema.sql`](./supabase/migrations/0001_initial_schema.sql).
3. Apply the SQL with your preferred migration workflow, such as the Supabase
   SQL editor or Supabase CLI.
4. Verify Row Level Security policies with separate test users before storing
   real user-owned financial data.

These migrations are not needed to install, run, test, or review the current
portfolio demo.

## CSV And PDF Reports

CSV export is implemented at `/api/exports/monthly?month=YYYY-MM` and is
available from the dashboard through the "Export CSV" action.

PDF generation is intentionally left as a next step. The current placeholder
route documents that PDF reports are not implemented in this demo.

## Commercial Expansion

This product can evolve into a paid template or lightweight SaaS for freelancers, consultants, and microbusinesses. The first commercial expansion should focus on repeatable monthly reports, onboarding templates by profession, multi-currency support, and simple tax reserve presets by region.

## Disclaimer

This project is for financial planning and portfolio demonstration only. It is
not financial, tax, accounting, legal, or investment advice.
