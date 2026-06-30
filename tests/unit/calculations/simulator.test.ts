import { describe, expect, it } from "vitest";

import { simulateIncomeTarget } from "@/lib/calculations/simulator";

describe("simulateIncomeTarget", () => {
  it("handles 0% tax and 0% variable expense ratio", () => {
    expect(
      simulateIncomeTarget({
        desiredOwnerIncomePence: 300_000,
        fixedExpensesPence: 80_000,
        taxRateBps: 0,
        variableExpenseRatioBps: 0,
      }),
    ).toEqual({
      desiredProfitBeforeTaxPence: 300_000,
      requiredRevenuePence: 380_000,
    });
  });

  it("handles realistic tax and variable expense ratios", () => {
    expect(
      simulateIncomeTarget({
        desiredOwnerIncomePence: 300_000,
        fixedExpensesPence: 80_000,
        taxRateBps: 2_000,
        variableExpenseRatioBps: 1_000,
      }),
    ).toEqual({
      desiredProfitBeforeTaxPence: 375_000,
      requiredRevenuePence: 505_600,
    });
  });

  it("rejects invalid tax and variable ratios", () => {
    expect(() =>
      simulateIncomeTarget({
        desiredOwnerIncomePence: 300_000,
        fixedExpensesPence: 80_000,
        taxRateBps: 10_000,
        variableExpenseRatioBps: 1_000,
      }),
    ).toThrow(/taxRateBps/);

    expect(() =>
      simulateIncomeTarget({
        desiredOwnerIncomePence: 300_000,
        fixedExpensesPence: 80_000,
        taxRateBps: 2_000,
        variableExpenseRatioBps: 10_000,
      }),
    ).toThrow(/variableExpenseRatioBps/);
  });
});
