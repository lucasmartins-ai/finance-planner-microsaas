export function formatPence(amountPence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amountPence / 100);
}

export function formatPercentage(value: number | null): string {
  if (value === null) {
    return "No target";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRunway(value: number | null): string {
  if (value === null) {
    return "No burn yet";
  }

  return `${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 1,
  }).format(value)} months`;
}
