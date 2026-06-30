import { describe, expect, it } from "vitest";

import { buildMonthlyCsv, escapeCsvCell } from "@/features/reports/csv";
import { getDashboardViewModel } from "@/features/dashboard/view-model";

describe("CSV export helpers", () => {
  it("escapes commas, quotes, and line breaks", () => {
    expect(escapeCsvCell('Client, "A"\nLine')).toBe('"Client, ""A""\nLine"');
  });

  it("builds a deterministic monthly CSV from the dashboard model", () => {
    const csv = buildMonthlyCsv(getDashboardViewModel("2026-06-01"));

    expect(csv).toContain(
      'Revenue,2026-06-03,Northstar Studio,Retainer,"£2,400.00"',
    );
    expect(csv).toContain('Summary,,Profit after tax reserve,,"£3,272.00"');
  });
});
