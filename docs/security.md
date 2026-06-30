# Security

## Security Goals

- Keep the public portfolio demo free from real financial data.
- Prevent secrets from being committed to the public repository.
- Validate route inputs before export generation.
- Avoid leaking detailed financial payloads through logs or error messages.

## Current Demo Authentication

The current portfolio demo is public and unauthenticated. This is intentional because it uses only synthetic in-memory SQLite data and browser-session mock form state.

There are no protected routes in the current demo.

## Future Hosted Authentication

If the project becomes a hosted multi-user SaaS, Supabase Auth should own identity. The app should use Supabase SSR helpers for server-side session access and route protection.

Protected routes:

- `/dashboard`
- `/revenue`
- `/expenses`
- `/goals`
- `/reports`
- `/settings`
- `/api/exports/*`
- `/api/reports/*`

## Authorization

For the current public demo, authorization is not required because there is no real user-owned data.

For a hosted SaaS version, authorization must be enforced in two places:

1. Server actions and route handlers derive the authenticated user from the session.
2. Supabase Row Level Security prevents cross-user reads and writes.

Client-side checks are useful for UX, but they are not a security boundary.

## Row Level Security

Every future user-owned Supabase table must enable RLS. Policies must compare `auth.uid()` to the table's `user_id`.

Tables requiring RLS:

- `profiles`
- `revenue_sources`
- `revenue_entries`
- `expense_categories`
- `expense_entries`
- `monthly_goals`
- `tax_settings`
- `cash_reserve_snapshots`
- `report_exports`

## Input Validation

Use Zod schemas at server boundaries.

Validation requirements:

- Amounts are integers in minor units.
- Dates are ISO dates.
- Months are normalized.
- Text fields are length-limited and trimmed.
- Ratios are bounded.
- IDs are UUIDs.

Never trust `user_id` from client input in the future hosted SaaS version. Always use the authenticated session.

## Export Safety

Current CSV exports contain synthetic demo data. If exports later contain user data, treat CSV and PDF as sensitive.

Current rules:

- Use synthetic data only.
- Avoid including internal ids unless needed.
- Set download headers intentionally.
- Do not cache future private reports publicly.

## Secrets

Do not commit:

- Supabase service role keys.
- Database passwords.
- Vercel tokens.
- API keys.
- Real customer financial data.

The demo does not require `.env.local`. Use managed environment variables only when adding hosted services.

## Logging

Safe to log:

- Error code.
- Route.
- Request id.
- Month.

Avoid logging:

- Full revenue or expense rows.
- Export contents.
- Access tokens.
- Refresh tokens.
- Supabase service keys.

## Public Demo Data

The public demo must use synthetic data only. Do not seed real client names, invoices, email addresses, or bank-like details.

## Pre-release Checklist

- Demo seed data is synthetic.
- Export routes validate month input.
- `.env.local` is ignored.
- `.env.example` contains placeholders only.
- No hardcoded secrets in source.
- RLS enabled and tested before adding real Supabase user data.
- Dependency audit reviewed.
