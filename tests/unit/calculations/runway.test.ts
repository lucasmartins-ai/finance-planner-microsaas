import { describe, expect, it } from "vitest";

import { calculateRunwayMonths } from "@/lib/calculations/runway";

describe("calculateRunwayMonths", () => {
  it("returns null when monthly burn is zero", () => {
    expect(calculateRunwayMonths(600_000, 0)).toBeNull();
  });

  it("calculates runway from available cash and burn", () => {
    expect(calculateRunwayMonths(600_000, 200_000)).toBe(3);
  });
});
