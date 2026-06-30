import type { DashboardViewModel } from "@/features/dashboard/view-model";
import { formatPence } from "@/features/shared/format";

export function buildMonthlyCsv(viewModel: DashboardViewModel): string {
  const rows = [
    ["Section", "Date", "Name", "Type", "Amount", "Notes"],
    ...viewModel.revenueEntries.map((entry) => [
      "Revenue",
      entry.receivedOn,
      entry.clientName,
      entry.sourceName,
      formatPence(entry.amountPence),
      entry.notes ?? "",
    ]),
    ...viewModel.expenseEntries.map((entry) => [
      "Expense",
      entry.paidOn,
      entry.vendorName,
      `${entry.categoryName} (${entry.expenseType})`,
      formatPence(entry.amountPence),
      entry.notes ?? "",
    ]),
    [],
    ["Summary", "", "Revenue", "", formatPence(viewModel.summary.revenuePence), ""],
    ["Summary", "", "Expenses", "", formatPence(viewModel.summary.totalExpensesPence), ""],
    ["Summary", "", "Profit before tax", "", formatPence(viewModel.summary.profitBeforeTaxPence), ""],
    ["Summary", "", "Tax reserve", "", formatPence(viewModel.summary.taxReservePence), ""],
    [
      "Summary",
      "",
      "Profit after tax reserve",
      "",
      formatPence(viewModel.summary.profitAfterTaxReservePence),
      "",
    ],
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}
