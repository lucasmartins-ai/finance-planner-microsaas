create extension if not exists pgcrypto;

create type public.expense_type as enum ('fixed', 'variable');
create type public.tax_basis as enum ('profit');
create type public.cash_snapshot_type as enum ('start_of_month', 'end_of_month');
create type public.report_format as enum ('csv', 'pdf');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  currency_code char(3) not null default 'GBP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_currency_code_uppercase_chk
    check (currency_code = upper(currency_code))
);

create table public.revenue_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint revenue_sources_name_length_chk
    check (char_length(trim(name)) between 1 and 80)
);

create unique index revenue_sources_user_name_uidx
  on public.revenue_sources (user_id, lower(trim(name)));

create table public.revenue_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_id uuid references public.revenue_sources (id) on delete set null,
  client_name text,
  amount_pence integer not null,
  received_on date not null,
  month date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint revenue_entries_amount_positive_chk
    check (amount_pence > 0),
  constraint revenue_entries_month_start_chk
    check (month = date_trunc('month', month::timestamp)::date)
);

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  expense_type public.expense_type not null,
  created_at timestamptz not null default now(),
  constraint expense_categories_name_length_chk
    check (char_length(trim(name)) between 1 and 80)
);

create unique index expense_categories_user_name_uidx
  on public.expense_categories (user_id, lower(trim(name)));

create table public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.expense_categories (id) on delete restrict,
  vendor_name text,
  amount_pence integer not null,
  paid_on date not null,
  month date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expense_entries_amount_positive_chk
    check (amount_pence > 0),
  constraint expense_entries_month_start_chk
    check (month = date_trunc('month', month::timestamp)::date)
);

create table public.monthly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null,
  target_revenue_pence integer,
  target_owner_income_pence integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_goals_month_start_chk
    check (month = date_trunc('month', month::timestamp)::date),
  constraint monthly_goals_target_revenue_positive_chk
    check (target_revenue_pence is null or target_revenue_pence > 0),
  constraint monthly_goals_target_owner_income_positive_chk
    check (target_owner_income_pence is null or target_owner_income_pence > 0),
  constraint monthly_goals_user_month_uidx
    unique (user_id, month)
);

create table public.tax_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tax_rate_bps integer not null default 2000,
  applies_to public.tax_basis not null default 'profit',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tax_settings_user_uidx
    unique (user_id),
  constraint tax_settings_tax_rate_range_chk
    check (tax_rate_bps >= 0 and tax_rate_bps < 10000)
);

create table public.cash_reserve_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null,
  cash_pence integer not null,
  snapshot_type public.cash_snapshot_type not null,
  created_at timestamptz not null default now(),
  constraint cash_reserve_snapshots_month_start_chk
    check (month = date_trunc('month', month::timestamp)::date),
  constraint cash_reserve_snapshots_cash_non_negative_chk
    check (cash_pence >= 0),
  constraint cash_reserve_snapshots_user_month_type_uidx
    unique (user_id, month, snapshot_type)
);

create table public.report_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null,
  format public.report_format not null,
  created_at timestamptz not null default now(),
  constraint report_exports_month_start_chk
    check (month = date_trunc('month', month::timestamp)::date)
);

create index revenue_entries_user_month_idx
  on public.revenue_entries (user_id, month);

create index expense_entries_user_month_idx
  on public.expense_entries (user_id, month);

create index monthly_goals_user_month_idx
  on public.monthly_goals (user_id, month);

create index cash_reserve_snapshots_user_month_idx
  on public.cash_reserve_snapshots (user_id, month);

create index report_exports_user_month_idx
  on public.report_exports (user_id, month);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger revenue_entries_set_updated_at
before update on public.revenue_entries
for each row execute function public.set_updated_at();

create trigger expense_entries_set_updated_at
before update on public.expense_entries
for each row execute function public.set_updated_at();

create trigger monthly_goals_set_updated_at
before update on public.monthly_goals
for each row execute function public.set_updated_at();

create trigger tax_settings_set_updated_at
before update on public.tax_settings
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email))
  on conflict (id) do nothing;

  insert into public.tax_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger create_profile_after_auth_user_insert
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.assert_revenue_source_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.source_id is not null and not exists (
    select 1
    from public.revenue_sources
    where id = new.source_id
      and user_id = new.user_id
  ) then
    raise exception 'Revenue source does not belong to user';
  end if;

  return new;
end;
$$;

create trigger revenue_entries_assert_source_owner
before insert or update on public.revenue_entries
for each row execute function public.assert_revenue_source_owner();

create or replace function public.assert_expense_category_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.expense_categories
    where id = new.category_id
      and user_id = new.user_id
  ) then
    raise exception 'Expense category does not belong to user';
  end if;

  return new;
end;
$$;

create trigger expense_entries_assert_category_owner
before insert or update on public.expense_entries
for each row execute function public.assert_expense_category_owner();

alter table public.profiles enable row level security;
alter table public.revenue_sources enable row level security;
alter table public.revenue_entries enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expense_entries enable row level security;
alter table public.monthly_goals enable row level security;
alter table public.tax_settings enable row level security;
alter table public.cash_reserve_snapshots enable row level security;
alter table public.report_exports enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "revenue_sources_select_own"
on public.revenue_sources for select
using (auth.uid() = user_id);

create policy "revenue_sources_insert_own"
on public.revenue_sources for insert
with check (auth.uid() = user_id);

create policy "revenue_sources_update_own"
on public.revenue_sources for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "revenue_sources_delete_own"
on public.revenue_sources for delete
using (auth.uid() = user_id);

create policy "revenue_entries_select_own"
on public.revenue_entries for select
using (auth.uid() = user_id);

create policy "revenue_entries_insert_own"
on public.revenue_entries for insert
with check (auth.uid() = user_id);

create policy "revenue_entries_update_own"
on public.revenue_entries for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "revenue_entries_delete_own"
on public.revenue_entries for delete
using (auth.uid() = user_id);

create policy "expense_categories_select_own"
on public.expense_categories for select
using (auth.uid() = user_id);

create policy "expense_categories_insert_own"
on public.expense_categories for insert
with check (auth.uid() = user_id);

create policy "expense_categories_update_own"
on public.expense_categories for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "expense_categories_delete_own"
on public.expense_categories for delete
using (auth.uid() = user_id);

create policy "expense_entries_select_own"
on public.expense_entries for select
using (auth.uid() = user_id);

create policy "expense_entries_insert_own"
on public.expense_entries for insert
with check (auth.uid() = user_id);

create policy "expense_entries_update_own"
on public.expense_entries for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "expense_entries_delete_own"
on public.expense_entries for delete
using (auth.uid() = user_id);

create policy "monthly_goals_select_own"
on public.monthly_goals for select
using (auth.uid() = user_id);

create policy "monthly_goals_insert_own"
on public.monthly_goals for insert
with check (auth.uid() = user_id);

create policy "monthly_goals_update_own"
on public.monthly_goals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "monthly_goals_delete_own"
on public.monthly_goals for delete
using (auth.uid() = user_id);

create policy "tax_settings_select_own"
on public.tax_settings for select
using (auth.uid() = user_id);

create policy "tax_settings_insert_own"
on public.tax_settings for insert
with check (auth.uid() = user_id);

create policy "tax_settings_update_own"
on public.tax_settings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "cash_reserve_snapshots_select_own"
on public.cash_reserve_snapshots for select
using (auth.uid() = user_id);

create policy "cash_reserve_snapshots_insert_own"
on public.cash_reserve_snapshots for insert
with check (auth.uid() = user_id);

create policy "cash_reserve_snapshots_update_own"
on public.cash_reserve_snapshots for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "cash_reserve_snapshots_delete_own"
on public.cash_reserve_snapshots for delete
using (auth.uid() = user_id);

create policy "report_exports_select_own"
on public.report_exports for select
using (auth.uid() = user_id);

create policy "report_exports_insert_own"
on public.report_exports for insert
with check (auth.uid() = user_id);
