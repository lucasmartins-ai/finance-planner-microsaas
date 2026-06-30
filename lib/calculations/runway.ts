export function calculateRunwayMonths(
  cashReservePence: number,
  monthlyBurnPence: number,
): number | null {
  if (!Number.isInteger(cashReservePence) || cashReservePence < 0) {
    throw new RangeError("cashReservePence must be a non-negative integer.");
  }

  if (!Number.isInteger(monthlyBurnPence) || monthlyBurnPence < 0) {
    throw new RangeError("monthlyBurnPence must be a non-negative integer.");
  }

  if (monthlyBurnPence === 0) {
    return null;
  }

  return cashReservePence / monthlyBurnPence;
}
