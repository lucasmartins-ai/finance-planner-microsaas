export type ExpenseType = "fixed" | "variable";

export type RevenueEntry = {
  id: string;
  sourceName: string;
  clientName: string;
  amountPence: number;
  receivedOn: string;
  month: string;
  notes?: string;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  expenseType: ExpenseType;
};

export type ExpenseEntry = {
  id: string;
  categoryId: string;
  categoryName: string;
  expenseType: ExpenseType;
  vendorName: string;
  amountPence: number;
  paidOn: string;
  month: string;
  notes?: string;
};

export type MonthlyGoal = {
  month: string;
  targetRevenuePence: number | null;
  targetOwnerIncomePence: number | null;
};

export type CashReserveSnapshot = {
  month: string;
  cashPence: number;
};

export type TaxSetting = {
  taxRateBps: number;
};

export type FinanceMonthDataset = {
  month: string;
  revenueEntries: RevenueEntry[];
  expenseCategories: ExpenseCategory[];
  expenseEntries: ExpenseEntry[];
  monthlyGoal: MonthlyGoal | null;
  cashReserve: CashReserveSnapshot | null;
  taxSetting: TaxSetting;
};
