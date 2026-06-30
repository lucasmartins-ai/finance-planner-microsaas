import Database from "better-sqlite3";

import type {
  ExpenseCategory,
  ExpenseEntry,
  FinanceMonthDataset,
  MonthlyGoal,
  RevenueEntry,
} from "@/lib/database/types";

export const DEMO_MONTH = "2026-06-01";

type RevenueRow = {
  id: string;
  source_name: string;
  client_name: string;
  amount_pence: number;
  received_on: string;
  month: string;
  notes: string | null;
};

type ExpenseCategoryRow = {
  id: string;
  name: string;
  expense_type: "fixed" | "variable";
};

type ExpenseRow = {
  id: string;
  category_id: string;
  category_name: string;
  expense_type: "fixed" | "variable";
  vendor_name: string;
  amount_pence: number;
  paid_on: string;
  month: string;
  notes: string | null;
};

type GoalRow = {
  month: string;
  target_revenue_pence: number | null;
  target_owner_income_pence: number | null;
};

type CashRow = {
  month: string;
  cash_pence: number;
};

export function loadDemoFinanceMonth(month = DEMO_MONTH): FinanceMonthDataset {
  const db = createDemoDatabase();

  try {
    const revenueEntries = db
      .prepare(
        `
        select id, source_name, client_name, amount_pence, received_on, month, notes
        from revenue_entries
        where month = ?
        order by received_on desc, client_name asc
      `,
      )
      .all(month)
      .map(mapRevenueRow);

    const expenseCategories = db
      .prepare(
        `
        select id, name, expense_type
        from expense_categories
        order by expense_type asc, name asc
      `,
      )
      .all()
      .map(mapExpenseCategoryRow);

    const expenseEntries = db
      .prepare(
        `
        select
          expense_entries.id,
          expense_entries.category_id,
          expense_categories.name as category_name,
          expense_categories.expense_type,
          expense_entries.vendor_name,
          expense_entries.amount_pence,
          expense_entries.paid_on,
          expense_entries.month,
          expense_entries.notes
        from expense_entries
        join expense_categories on expense_categories.id = expense_entries.category_id
        where expense_entries.month = ?
        order by paid_on desc, vendor_name asc
      `,
      )
      .all(month)
      .map(mapExpenseRow);

    const monthlyGoal = db
      .prepare(
        `
        select month, target_revenue_pence, target_owner_income_pence
        from monthly_goals
        where month = ?
      `,
      )
      .get(month) as GoalRow | undefined;

    const cashReserve = db
      .prepare(
        `
        select month, cash_pence
        from cash_reserve_snapshots
        where month = ?
      `,
      )
      .get(month) as CashRow | undefined;

    const taxRateBps = db
      .prepare("select tax_rate_bps from tax_settings limit 1")
      .pluck()
      .get() as number;

    return {
      month,
      revenueEntries,
      expenseCategories,
      expenseEntries,
      monthlyGoal: monthlyGoal ? mapGoalRow(monthlyGoal) : null,
      cashReserve: cashReserve
        ? { month: cashReserve.month, cashPence: cashReserve.cash_pence }
        : null,
      taxSetting: { taxRateBps },
    };
  } finally {
    db.close();
  }
}

export function listDemoMonths(): string[] {
  const db = createDemoDatabase();

  try {
    return db
      .prepare(
        `
        select month from monthly_goals
        union
        select month from revenue_entries
        union
        select month from expense_entries
        order by month desc
      `,
      )
      .pluck()
      .all() as string[];
  } finally {
    db.close();
  }
}

function createDemoDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec(`
    create table revenue_entries (
      id text primary key,
      source_name text not null,
      client_name text not null,
      amount_pence integer not null check (amount_pence > 0),
      received_on text not null,
      month text not null,
      notes text
    );

    create table expense_categories (
      id text primary key,
      name text not null,
      expense_type text not null check (expense_type in ('fixed', 'variable'))
    );

    create table expense_entries (
      id text primary key,
      category_id text not null references expense_categories(id),
      vendor_name text not null,
      amount_pence integer not null check (amount_pence > 0),
      paid_on text not null,
      month text not null,
      notes text
    );

    create table monthly_goals (
      month text primary key,
      target_revenue_pence integer,
      target_owner_income_pence integer
    );

    create table tax_settings (
      id integer primary key check (id = 1),
      tax_rate_bps integer not null check (tax_rate_bps >= 0 and tax_rate_bps < 10000)
    );

    create table cash_reserve_snapshots (
      month text primary key,
      cash_pence integer not null check (cash_pence >= 0)
    );
  `);

  seedDemoData(db);
  return db;
}

function seedDemoData(db: Database.Database): void {
  const insertRevenue = db.prepare(`
    insert into revenue_entries (id, source_name, client_name, amount_pence, received_on, month, notes)
    values (@id, @sourceName, @clientName, @amountPence, @receivedOn, @month, @notes)
  `);
  const insertCategory = db.prepare(`
    insert into expense_categories (id, name, expense_type)
    values (@id, @name, @expenseType)
  `);
  const insertExpense = db.prepare(`
    insert into expense_entries (id, category_id, vendor_name, amount_pence, paid_on, month, notes)
    values (@id, @categoryId, @vendorName, @amountPence, @paidOn, @month, @notes)
  `);

  const transaction = db.transaction(() => {
    db.prepare("insert into tax_settings (id, tax_rate_bps) values (1, 2000)").run();

    for (const category of [
      { id: "cat-software", name: "Software", expenseType: "fixed" },
      { id: "cat-office", name: "Office", expenseType: "fixed" },
      { id: "cat-contractors", name: "Contractors", expenseType: "variable" },
      { id: "cat-travel", name: "Travel", expenseType: "variable" },
    ]) {
      insertCategory.run(category);
    }

    for (const revenue of [
      {
        id: "rev-001",
        sourceName: "Retainer",
        clientName: "Northstar Studio",
        amountPence: 240_000,
        receivedOn: "2026-06-03",
        month: "2026-06-01",
        notes: "Monthly product strategy retainer",
      },
      {
        id: "rev-002",
        sourceName: "Consulting",
        clientName: "Atlas Legal",
        amountPence: 185_000,
        receivedOn: "2026-06-14",
        month: "2026-06-01",
        notes: "Workflow audit and delivery sprint",
      },
      {
        id: "rev-003",
        sourceName: "Workshop",
        clientName: "Foundry Labs",
        amountPence: 95_000,
        receivedOn: "2026-06-22",
        month: "2026-06-01",
        notes: "Pricing workshop",
      },
      {
        id: "rev-004",
        sourceName: "Retainer",
        clientName: "Northstar Studio",
        amountPence: 220_000,
        receivedOn: "2026-05-03",
        month: "2026-05-01",
        notes: "Previous month retainer",
      },
    ]) {
      insertRevenue.run(revenue);
    }

    for (const expense of [
      {
        id: "exp-001",
        categoryId: "cat-software",
        vendorName: "Design tools",
        amountPence: 12_900,
        paidOn: "2026-06-02",
        month: "2026-06-01",
        notes: "Seat and plugins",
      },
      {
        id: "exp-002",
        categoryId: "cat-software",
        vendorName: "Cloud hosting",
        amountPence: 8_600,
        paidOn: "2026-06-07",
        month: "2026-06-01",
        notes: "Production hosting",
      },
      {
        id: "exp-003",
        categoryId: "cat-office",
        vendorName: "Coworking",
        amountPence: 28_000,
        paidOn: "2026-06-01",
        month: "2026-06-01",
        notes: "Desk plan",
      },
      {
        id: "exp-004",
        categoryId: "cat-contractors",
        vendorName: "Research assistant",
        amountPence: 45_000,
        paidOn: "2026-06-18",
        month: "2026-06-01",
        notes: "Client research support",
      },
      {
        id: "exp-005",
        categoryId: "cat-travel",
        vendorName: "Client visit",
        amountPence: 16_500,
        paidOn: "2026-06-20",
        month: "2026-06-01",
        notes: "Train and local transport",
      },
      {
        id: "exp-006",
        categoryId: "cat-software",
        vendorName: "Design tools",
        amountPence: 12_900,
        paidOn: "2026-05-02",
        month: "2026-05-01",
        notes: "Previous month software",
      },
    ]) {
      insertExpense.run(expense);
    }

    for (const goal of [
      {
        month: "2026-05-01",
        targetRevenuePence: 450_000,
        targetOwnerIncomePence: 260_000,
      },
      {
        month: "2026-06-01",
        targetRevenuePence: 600_000,
        targetOwnerIncomePence: 300_000,
      },
    ]) {
      db.prepare(
        `
        insert into monthly_goals (month, target_revenue_pence, target_owner_income_pence)
        values (@month, @targetRevenuePence, @targetOwnerIncomePence)
      `,
      ).run(goal);
    }

    for (const cash of [
      { month: "2026-05-01", cashPence: 540_000 },
      { month: "2026-06-01", cashPence: 720_000 },
    ]) {
      db.prepare(
        `
        insert into cash_reserve_snapshots (month, cash_pence)
        values (@month, @cashPence)
      `,
      ).run(cash);
    }
  });

  transaction();
}

function mapRevenueRow(row: unknown): RevenueEntry {
  const revenue = row as RevenueRow;

  return {
    id: revenue.id,
    sourceName: revenue.source_name,
    clientName: revenue.client_name,
    amountPence: revenue.amount_pence,
    receivedOn: revenue.received_on,
    month: revenue.month,
    notes: revenue.notes ?? undefined,
  };
}

function mapExpenseCategoryRow(row: unknown): ExpenseCategory {
  const category = row as ExpenseCategoryRow;

  return {
    id: category.id,
    name: category.name,
    expenseType: category.expense_type,
  };
}

function mapExpenseRow(row: unknown): ExpenseEntry {
  const expense = row as ExpenseRow;

  return {
    id: expense.id,
    categoryId: expense.category_id,
    categoryName: expense.category_name,
    expenseType: expense.expense_type,
    vendorName: expense.vendor_name,
    amountPence: expense.amount_pence,
    paidOn: expense.paid_on,
    month: expense.month,
    notes: expense.notes ?? undefined,
  };
}

function mapGoalRow(row: GoalRow): MonthlyGoal {
  return {
    month: row.month,
    targetRevenuePence: row.target_revenue_pence,
    targetOwnerIncomePence: row.target_owner_income_pence,
  };
}
