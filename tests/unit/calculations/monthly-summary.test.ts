import { describe, expect, it } from "vitest";

import { calculateMonthlySummary } from "@/lib/calculations/monthly-summary";

describe("calculateMonthlySummary", () => {
  it("handles zero revenue and zero expenses", () => {
    expect(
      calculateMonthlySummary({
        revenuePence: 0,
        fixedExpensesPence: 0,
        variableExpensesPence: 0,
        taxRateBps: 2_000,
        cashReservePence: 0,
      }),
    ).toMatchObject({
      totalExpensesPence: 0,
      profitBeforeTaxPence: 0,
      taxReservePence: 0,
      runwayMonths: null,
    });
  });

  it("handles expenses zero and positive profit", () => {
    expect(
      calculateMonthlySummary({
        revenuePence: 500_000,
        fixedExpensesPence: 0,
        variableExpensesPence: 0,
        taxRateBps: 2_000,
        cashReservePence: 100_000,
      }),
    ).toMatchObject({
      profitBeforeTaxPence: 500_000,
      taxReservePence: 100_000,
      profitAfterTaxReservePence: 400_000,
      runwayMonths: null,
    });
  });

  it("calculates positive profit with fixed and variable expenses", () => {
    expect(
      calculateMonthlySummary({
        revenuePence: 500_000,
        fixedExpensesPence: 80_000,
        variableExpensesPence: 40_000,
        taxRateBps: 2_000,
        cashReservePence: 600_000,
        targetRevenuePence: 600_000,
        targetOwnerIncomePence: 300_000,
      }),
    ).toMatchObject({
      totalExpensesPence: 120_000,
      profitBeforeTaxPence: 380_000,
      taxReservePence: 76_000,
      profitAfterTaxReservePence: 304_000,
      runwayMonths: 5,
      revenueGoalProgress: 500_000 / 600_000,
      ownerIncomeGoalProgress: 304_000 / 300_000,
    });
  });

  it("handles a loss and keeps tax reserve at zero", () => {
    expect(
      calculateMonthlySummary({
        revenuePence: 100_000,
        fixedExpensesPence: 120_000,
        variableExpensesPence: 30_000,
        taxRateBps: 2_000,
        cashReservePence: 600_000,
      }),
    ).toMatchObject({
      profitBeforeTaxPence: -50_000,
      taxReservePence: 0,
      profitAfterTaxReservePence: -50_000,
      runwayMonths: 4,
    });
  });

  it("returns null goal progress when targets are missing or zero", () => {
    const missing = calculateMonthlySummary({
      revenuePence: 100_000,
      fixedExpensesPence: 10_000,
      variableExpensesPence: 0,
      taxRateBps: 2_000,
      cashReservePence: 200_000,
    });

    const zero = calculateMonthlySummary({
      revenuePence: 100_000,
      fixedExpensesPence: 10_000,
      variableExpensesPence: 0,
      taxRateBps: 2_000,
      cashReservePence: 200_000,
      targetOwnerIncomePence: 0,
      targetRevenuePence: 0,
    });

    expect(missing.revenueGoalProgress).toBeNull();
    expect(missing.ownerIncomeGoalProgress).toBeNull();
    expect(zero.revenueGoalProgress).toBeNull();
    expect(zero.ownerIncomeGoalProgress).toBeNull();
  });
});
