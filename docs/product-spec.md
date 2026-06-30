# Product Spec

## Finance Planner MicroSaaS

**Status:** Portfolio demo implemented  
**Audience:** Freelancers, consultants, and microbusiness owners  
**Product type:** Financial planning SaaS  
**Primary currency for MVP:** GBP

## Summary

Finance Planner MicroSaaS helps freelancers understand how revenue becomes profit, owner income, tax reserve, and business runway.

The first public version should be small, fast, and trustworthy: reviewers can inspect a realistic monthly dashboard, interact with mock revenue and expense forms, set goals, and see clear monthly numbers without needing credentials.

The product should demonstrate real SaaS thinking in a public portfolio: data modeling, business calculations, dashboard UX, exports, testing, and clean documentation. Authentication and real persistence are reserved for the hosted SaaS evolution.

## Problem

Freelancers often know how much money entered the bank account, but not how much is actually available to pay themselves. Revenue, tax, fixed costs, variable costs, reserves, and profit are mixed together, which makes pricing, saving, and planning harder than necessary.

Representative user quote:

> I made good money this month, but I still do not know what I can safely take out of the business.

## Goals

- Show monthly financial health in less than one minute.
- Make revenue, fixed costs, variable costs, tax reserve, profit, and owner income visible.
- Help users answer "how much do I need to sell to take home GBP X?"
- Make exported CSV credible enough for a portfolio review.
- Keep the MVP small enough to implement and test thoroughly.

## Non-goals

- Full accounting ledger.
- Bank feed integrations.
- Payroll.
- Invoicing.
- Tax filing.
- Investment advice.
- Multi-entity bookkeeping.

## Success Metrics

| Metric | Target | Measurement |
| --- | ---: | --- |
| Time to first useful dashboard | Under 5 minutes | New user creates revenue, expenses, and goal |
| Calculation correctness | 100% deterministic unit tests | Unit tests for each formula and edge case |
| Export reliability | 100% for valid months | Tests for CSV helpers and route validation |
| Dashboard clarity | No critical UX issues on mobile or desktop | Playwright screenshots and manual review |
| Public repo readiness | Docs match implementation | README plus architecture, data model, calculations, API, security, tests |

## User Stories

- As a freelancer, I want to record revenue by date and source so that I can understand monthly income.
- As a freelancer, I want to record fixed and variable expenses so that I can see what the business costs to run.
- As a consultant, I want to set monthly revenue and take-home goals so that I can price work with a target in mind.
- As a small business owner, I want to see estimated tax reserve so that I avoid spending money that should be set aside.
- As a freelancer, I want a runway projection so that I know how many months my cash reserve covers.
- As a user, I want to export a CSV so that I can keep a simple offline record.
- As a future user, I want a monthly PDF report so that I can review performance or share a clean summary.

## MVP Scope

### Current Portfolio Demo

- Next.js app shell.
- SQLite in-memory synthetic seed data.
- Pure calculation module and unit tests.
- Monthly dashboard cards.
- Revenue and expense charts.
- Profit and tax reserve calculation.
- Runway projection.
- Income target simulator.
- Browser-session mock forms for revenue, expense categories, expenses, and goals.
- CSV monthly export.
- Responsive QA for mobile and desktop.
- Public documentation pass.

### Hosted SaaS Evolution

- Supabase Auth.
- PostgreSQL persistence with RLS.
- Authenticated CRUD.
- Cash reserve snapshots stored per user.
- PDF monthly reports.
- RLS and two-user authorization tests.

## UX Principles

- First fold should show the current month, revenue, expenses, profit, runway, and goal progress.
- Use compact operational UI, not a marketing-heavy dashboard.
- Use plain financial labels and short helper text only where it prevents mistakes.
- Avoid hiding calculation details behind vague "AI insights" or black-box summaries.
- Make empty states actionable with one clear next action.

## Open Questions

| Question | Default Decision | Revisit When |
| --- | --- | --- |
| Which tax model should MVP support? | Simple user-defined tax rate on profit | Adding country-specific presets |
| Should users connect bank accounts? | No | After manual entry is proven useful |
| Should multi-currency be included? | No, GBP first | Commercial template expansion |
| Should reports be stored or generated on demand? | Generate on demand, optionally log exports | Reports become shareable or billable |
| Should the app support teams? | No, single owner workspace | Serving agencies or small firms |
