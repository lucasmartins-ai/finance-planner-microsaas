export function assertIntegerPence(value: number, fieldName = "amount"): void {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${fieldName} must be an integer minor-unit value.`);
  }
}

export function sumPence(values: number[]): number {
  return values.reduce((total, value) => {
    assertIntegerPence(value);
    return total + value;
  }, 0);
}

export function multiplyBasisPointsRoundDown(amountPence: number, basisPoints: number): number {
  assertIntegerPence(amountPence);
  assertBasisPoints(basisPoints);

  return Math.floor((amountPence * basisPoints) / 10_000);
}

export function divideRoundUp(numerator: number, denominator: number): number {
  assertIntegerPence(numerator, "numerator");

  if (!Number.isInteger(denominator) || denominator <= 0) {
    throw new RangeError("denominator must be a positive integer.");
  }

  return Math.ceil(numerator / denominator);
}

export function roundUpToWholePound(amountPence: number): number {
  assertIntegerPence(amountPence);

  return Math.ceil(amountPence / 100) * 100;
}

export function assertBasisPoints(basisPoints: number, fieldName = "basisPoints"): void {
  if (!Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints >= 10_000) {
    throw new RangeError(`${fieldName} must be an integer from 0 to 9999.`);
  }
}

export function parsePoundsToPence(input: string): number {
  const trimmed = input.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new RangeError("Enter a valid GBP amount with up to two decimals.");
  }

  const [pounds, pence = ""] = trimmed.split(".");
  return Number.parseInt(pounds, 10) * 100 + Number.parseInt(pence.padEnd(2, "0"), 10);
}
