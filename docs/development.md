# Development Guide

## Current State

This repository currently contains a Next.js portfolio demo using TypeScript, in-memory SQLite seed data, pure financial calculation modules, Recharts, and CSV export.

## Local Requirements

Planned requirements:

- Node.js LTS
- npm
- Vercel account for deployment, if publishing the demo

## Local Setup

```bash
npm install
npm run dev
```

## Environment Variables

The portfolio demo does not require local environment variables.

Optional:

```bash
NEXT_PUBLIC_APP_URL=
```

If the project is expanded into a hosted Supabase SaaS, add Supabase environment variables at that time and keep service role keys server-only.

## Branch and Commit Style

Use clear conventional commits:

```text
feat: add monthly dashboard summary
fix: correct simulator rounding
docs: document revenue data model
test: cover runway edge cases
```

## Implementation Rules

- Keep calculation functions pure.
- Keep route handlers small and validated.
- Keep public demo data synthetic.
- Do not add real client names or financial records to seeds.
- Do not mix chart formatting with calculation logic.
- Keep feature folders cohesive.
- Add tests with each formula, query, and export behavior.
- Update docs when a public behavior changes.

## Definition of Done

A portfolio-demo feature is done when:

- It works without credentials.
- It fails safely for invalid input.
- It is covered by relevant tests.
- It is usable on mobile and desktop.
- It does not introduce secrets or real financial data.
- Documentation is updated when behavior changes.

## Suggested First Implementation Order

1. Scaffold Next.js with TypeScript.
2. Add pure calculation module and unit tests.
3. Add SQLite demo seed and dashboard view model.
4. Add dashboard summary cards and charts.
5. Add browser-session mock forms for revenue, expenses, goals, and assumptions.
6. Add simulator.
7. Add CSV export.
8. Add Playwright critical flows.
9. Add Supabase Auth/PostgreSQL/RLS only when moving beyond mock data.
10. Add PDF report after CSV and dashboard are stable.

## Useful Commands

Expected scripts once the app is scaffolded:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```
