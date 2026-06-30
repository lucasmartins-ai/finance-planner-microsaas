# Finance Planner MicroSaaS

Finance Planner MicroSaaS helps freelancers understand revenue, expenses, profit, runway, and monthly income targets.

This project is a public portfolio-grade SaaS concept for freelancers, consultants, and small service businesses that need a simple way to separate revenue, tax reserves, fixed costs, variable costs, profit, cash runway, and owner income goals.

## Project Status

The repository now contains a portfolio-ready Next.js demo backed by an in-memory SQLite seed. It is designed to be visible in a public GitHub repository without requiring Supabase credentials, private financial data, or a hosted database.

Supabase Auth, PostgreSQL persistence, Row Level Security, and PDF reports remain documented as the hosted SaaS evolution path.

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
- **Demo data:** SQLite in memory with synthetic seed data
- **Validation:** Zod for route inputs
- **Charts:** Recharts
- **CSV exports:** Route handler export endpoint
- **Testing:** Unit, integration, and Playwright end-to-end tests
- **Future SaaS path:** Supabase Auth, PostgreSQL, RLS, and PDF reports

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
- Use Supabase Row Level Security before introducing real user-owned data.
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

Quality gates expected before publishing a release:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment Variables

The portfolio demo does not require environment variables. See [.env.example](./.env.example) for the optional app URL placeholder.

## Database

The running demo uses an in-memory SQLite database created from synthetic seed data in [`lib/database/demo-sqlite.ts`](./lib/database/demo-sqlite.ts).

The initial Supabase/PostgreSQL migration remains available at [supabase/migrations/0001_initial_schema.sql](./supabase/migrations/0001_initial_schema.sql) as the reference for turning the portfolio demo into a hosted multi-user SaaS.

## Commercial Expansion

This product can evolve into a paid template or lightweight SaaS for freelancers, consultants, and microbusinesses. The first commercial expansion should focus on repeatable monthly reports, onboarding templates by profession, multi-currency support, and simple tax reserve presets by region.

## Disclaimer

This project is for financial planning and portfolio demonstration. It is not accounting, tax, legal, or investment advice.
