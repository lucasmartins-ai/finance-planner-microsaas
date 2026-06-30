import { describe, expect, it } from "vitest";

import {
  multiplyBasisPointsRoundDown,
  parsePoundsToPence,
  roundUpToWholePound,
  sumPence,
} from "@/lib/calculations/money";

describe("money helpers", () => {
  it("sums integer minor units", () => {
    expect(sumPence([100, 250, 650])).toBe(1_000);
  });

  it("rounds basis point multiplication down deterministically", () => {
    expect(multiplyBasisPointsRoundDown(10_001, 2_000)).toBe(2_000);
  });

  it("rounds simulator targets up to the nearest whole pound", () => {
    expect(roundUpToWholePound(505_501)).toBe(505_600);
  });

  it("parses GBP strings into pence without floating point math", () => {
    expect(parsePoundsToPence("123.45")).toBe(12_345);
    expect(parsePoundsToPence("123")).toBe(12_300);
    expect(parsePoundsToPence("123.4")).toBe(12_340);
  });
});
