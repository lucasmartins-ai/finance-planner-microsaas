import { z } from "zod";

export const monthQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format."),
});

export function monthQueryToDate(month: string): string {
  return `${month}-01`;
}

export function dateToMonthQuery(monthDate: string): string {
  return monthDate.slice(0, 7);
}
