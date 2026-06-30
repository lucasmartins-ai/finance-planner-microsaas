import { multiplyBasisPointsRoundDown } from "@/lib/calculations/money";

export function calculateTaxReservePence(profitBeforeTaxPence: number, taxRateBps: number): number {
  if (profitBeforeTaxPence <= 0) {
    return 0;
  }

  return multiplyBasisPointsRoundDown(profitBeforeTaxPence, taxRateBps);
}
