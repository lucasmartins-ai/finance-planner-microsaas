import {
  assertBasisPoints,
  divideRoundUp,
  roundUpToWholePound,
} from "@/lib/calculations/money";

export type IncomeTargetSimulationInput = {
  desiredOwnerIncomePence: number;
  fixedExpensesPence: number;
  variableExpenseRatioBps: number;
  taxRateBps: number;
};

export type IncomeTargetSimulation = {
  desiredProfitBeforeTaxPence: number;
  requiredRevenuePence: number;
};

export function simulateIncomeTarget(
  input: IncomeTargetSimulationInput,
): IncomeTargetSimulation {
  if (!Number.isInteger(input.desiredOwnerIncomePence) || input.desiredOwnerIncomePence < 0) {
    throw new RangeError("desiredOwnerIncomePence must be a non-negative integer.");
  }

  if (!Number.isInteger(input.fixedExpensesPence) || input.fixedExpensesPence < 0) {
    throw new RangeError("fixedExpensesPence must be a non-negative integer.");
  }

  assertBasisPoints(input.taxRateBps, "taxRateBps");
  assertBasisPoints(input.variableExpenseRatioBps, "variableExpenseRatioBps");

  const taxDenominator = 10_000 - input.taxRateBps;
  const variableExpenseDenominator = 10_000 - input.variableExpenseRatioBps;
  const desiredProfitBeforeTaxPence = divideRoundUp(
    input.desiredOwnerIncomePence * 10_000,
    taxDenominator,
  );
  const requiredRevenuePence = roundUpToWholePound(
    divideRoundUp(
      (desiredProfitBeforeTaxPence + input.fixedExpensesPence) * 10_000,
      variableExpenseDenominator,
    ),
  );

  return {
    desiredProfitBeforeTaxPence,
    requiredRevenuePence,
  };
}
