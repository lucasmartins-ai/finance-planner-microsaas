# Data Model

## Principles

- Use SQLite in-memory seed data for the current public portfolio demo.
- Use PostgreSQL and Supabase Auth when evolving to a hosted multi-user SaaS.
- Store monetary values as integer minor units, such as pence for GBP.
- Store percentages as basis points when precision matters.
- Scope every future user-owned row with `user_id`.
- Enable Row Level Security on every future user-owned table.
- Keep calculation inputs auditable and easy to query by month.

## Current Demo Model

The current app creates an in-memory SQLite database from synthetic seed data in [`lib/database/demo-sqlite.ts`](../lib/database/demo-sqlite.ts). It includes only the fields needed to render the dashboard and CSV export:

- `revenue_entries`
- `expense_categories`
- `expense_entries`
- `monthly_goals`
- `tax_settings`
- `cash_reserve_snapshots`

This data is not real, not user-owned, and not persisted after the process/request lifecycle. Browser-session mock form changes stay in client state and are not written back to SQLite.

## Hosted SaaS Entity Relationship Summary

```text
auth.users
  |
  v
profiles
  |
  |-- revenue_sources
  |-- revenue_entries
  |-- expense_categories
  |-- expense_entries
  |-- monthly_goals
  |-- tax_settings
  |-- cash_reserve_snapshots
  |-- report_exports
```

## Tables

The tables below describe the future Supabase/PostgreSQL hosted SaaS model. They are not required to run the current public demo.

### `profiles`

Stores app-specific user settings.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, references `auth.users(id)` |
| `display_name` | `text` | Optional |
| `currency_code` | `char(3)` | Default `GBP` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Maintained by trigger |

### `revenue_sources`

Optional grouping for revenue entries.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `name` | `text` | Example: "Consulting", "Retainer", "Workshop" |
| `created_at` | `timestamptz` | Default `now()` |

### `revenue_entries`

Revenue received or expected for a given month.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `source_id` | `uuid` | Nullable reference to `revenue_sources(id)` |
| `client_name` | `text` | Optional |
| `amount_pence` | `integer` | Must be greater than 0 |
| `received_on` | `date` | Actual or planned date |
| `month` | `date` | First day of reporting month |
| `notes` | `text` | Optional |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Maintained by trigger |

### `expense_categories`

User-defined expense categories.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `name` | `text` | Example: "Software", "Office", "Contractors" |
| `expense_type` | `expense_type` | `fixed` or `variable` |
| `created_at` | `timestamptz` | Default `now()` |

### `expense_entries`

Expenses paid or planned for a given month.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `category_id` | `uuid` | References `expense_categories(id)` |
| `vendor_name` | `text` | Optional |
| `amount_pence` | `integer` | Must be greater than 0 |
| `paid_on` | `date` | Actual or planned date |
| `month` | `date` | First day of reporting month |
| `notes` | `text` | Optional |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Maintained by trigger |

### `monthly_goals`

Stores planning targets by month.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `month` | `date` | First day of reporting month |
| `target_revenue_pence` | `integer` | Optional |
| `target_owner_income_pence` | `integer` | Optional |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Maintained by trigger |

Unique constraint:

```sql
unique (user_id, month)
```

### `tax_settings`

Stores simple user-defined tax assumptions.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `tax_rate_bps` | `integer` | Example: `2000` means 20.00% |
| `applies_to` | `tax_basis` | `profit` for MVP |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Maintained by trigger |

### `cash_reserve_snapshots`

Stores available cash at the start or end of a month for runway calculations.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `month` | `date` | First day of reporting month |
| `cash_pence` | `integer` | Must be greater than or equal to 0 |
| `snapshot_type` | `cash_snapshot_type` | `start_of_month` or `end_of_month` |
| `created_at` | `timestamptz` | Default `now()` |

### `report_exports`

Optional audit log for generated reports.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `month` | `date` | First day of reporting month |
| `format` | `report_format` | `csv` or `pdf` |
| `created_at` | `timestamptz` | Default `now()` |

## Enums

```sql
create type expense_type as enum ('fixed', 'variable');
create type tax_basis as enum ('profit');
create type cash_snapshot_type as enum ('start_of_month', 'end_of_month');
create type report_format as enum ('csv', 'pdf');
```

## RLS Policy Pattern

Every user-owned table should follow this pattern:

```sql
alter table revenue_entries enable row level security;

create policy "Users can read their own revenue entries"
on revenue_entries
for select
using (auth.uid() = user_id);

create policy "Users can create their own revenue entries"
on revenue_entries
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own revenue entries"
on revenue_entries
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own revenue entries"
on revenue_entries
for delete
using (auth.uid() = user_id);
```

## Indexes

Minimum useful indexes:

```sql
create index revenue_entries_user_month_idx
on revenue_entries (user_id, month);

create index expense_entries_user_month_idx
on expense_entries (user_id, month);

create index monthly_goals_user_month_idx
on monthly_goals (user_id, month);

create index cash_reserve_snapshots_user_month_idx
on cash_reserve_snapshots (user_id, month);
```

## Migration Notes

The initial executable schema is available at [`supabase/migrations/0001_initial_schema.sql`](../supabase/migrations/0001_initial_schema.sql).

This migration remains the hosted SaaS reference. If the current demo schema or hosted migration changes, update this document in the same pull request.
