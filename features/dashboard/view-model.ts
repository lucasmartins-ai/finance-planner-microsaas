import { calculateMonthlySummary } from "@/lib/calculations/monthly-summary";
import { sumPence } from "@/lib/calculations/money";
import { loadDemoFinanceMonth } from "@/lib/database/demo-sqlite";
import type {
  ExpenseCategory,
  ExpenseEntry,
  MonthlyGoal,
  RevenueEntry,
} from "@/lib/database/types";

export type DashboardViewModel = {
  month: string;
  monthLabel: string;
  revenueEntries: RevenueEntry[];
  expenseCategories: ExpenseCategory[];
  expenseEntries: ExpenseEntry[];
  monthlyGoal: MonthlyGoal | null;
  taxRateBps: number;
  cashReservePence: number;
  summary: ReturnType<typeof calculateMonthlySummary>;
};

export function getDashboardViewModel(month = "2026-06-01"): DashboardViewModel {
  const dataset = loadDemoFinanceMonth(month);

  return buildDashboardViewModel(dataset);
}

export function buildDashboardViewModel(
  dataset: ReturnType<typeof loadDemoFinanceMonth>,
): DashboardViewModel {
  const fixedExpensesPence = sumPence(
    dataset.expenseEntries
      .filter((expense) => expense.expenseType === "fixed")
      .map((expense) => expense.amountPence),
  );
  const variableExpensesPence = sumPence(
    dataset.expenseEntries
      .filter((expense) => expense.expenseType === "variable")
      .map((expense) => expense.amountPence),
  );
  const summary = calculateMonthlySummary({
    revenuePence: sumPence(dataset.revenueEntries.map((entry) => entry.amountPence)),
    fixedExpensesPence,
    variableExpensesPence,
    taxRateBps: dataset.taxSetting.taxRateBps,
    cashReservePence: dataset.cashReserve?.cashPence ?? 0,
    targetOwnerIncomePence: dataset.monthlyGoal?.targetOwnerIncomePence,
    targetRevenuePence: dataset.monthlyGoal?.targetRevenuePence,
  });

  return {
    month: dataset.month,
    monthLabel: formatMonthLabel(dataset.month),
    revenueEntries: dataset.revenueEntries,
    expenseCategories: dataset.expenseCategories,
    expenseEntries: dataset.expenseEntries,
    monthlyGoal: dataset.monthlyGoal,
    taxRateBps: dataset.taxSetting.taxRateBps,
    cashReservePence: dataset.cashReserve?.cashPence ?? 0,
    summary,
  };
}

export function formatMonthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(month));
}
