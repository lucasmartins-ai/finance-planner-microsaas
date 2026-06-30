import { sumPence } from "@/lib/calculations/money";
import { calculateRunwayMonths } from "@/lib/calculations/runway";
import { calculateTaxReservePence } from "@/lib/calculations/tax";

export type MonthlyInputs = {
  revenuePence: number;
  fixedExpensesPence: number;
  variableExpensesPence: number;
  taxRateBps: number;
  cashReservePence: number;
  targetOwnerIncomePence?: number | null;
  targetRevenuePence?: number | null;
};

export type MonthlySummary = {
  revenuePence: number;
  fixedExpensesPence: number;
  variableExpensesPence: number;
  totalExpensesPence: number;
  profitBeforeTaxPence: number;
  taxReservePence: number;
  profitAfterTaxReservePence: number;
  runwayMonths: number | null;
  revenueGoalProgress: number | null;
  ownerIncomeGoalProgress: number | null;
};

export function calculateGoalProgress(currentPence: number, targetPence?: number | null): number | null {
  if (!targetPence || targetPence <= 0) {
    return null;
  }

  return currentPence / targetPence;
}

export function calculateMonthlySummary(inputs: MonthlyInputs): MonthlySummary {
  const totalExpensesPence = sumPence([
    inputs.fixedExpensesPence,
    inputs.variableExpensesPence,
  ]);
  const profitBeforeTaxPence = inputs.revenuePence - totalExpensesPence;
  const taxReservePence = calculateTaxReservePence(
    profitBeforeTaxPence,
    inputs.taxRateBps,
  );
  const profitAfterTaxReservePence = profitBeforeTaxPence - taxReservePence;

  return {
    revenuePence: inputs.revenuePence,
    fixedExpensesPence: inputs.fixedExpensesPence,
    variableExpensesPence: inputs.variableExpensesPence,
    totalExpensesPence,
    profitBeforeTaxPence,
    taxReservePence,
    profitAfterTaxReservePence,
    runwayMonths: calculateRunwayMonths(inputs.cashReservePence, totalExpensesPence),
    revenueGoalProgress: calculateGoalProgress(
      inputs.revenuePence,
      inputs.targetRevenuePence,
    ),
    ownerIncomeGoalProgress: calculateGoalProgress(
      profitAfterTaxReservePence,
      inputs.targetOwnerIncomePence,
    ),
  };
}
