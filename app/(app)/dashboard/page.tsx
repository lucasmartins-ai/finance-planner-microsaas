import { DashboardClient } from "@/features/dashboard/components/dashboard-client";
import {
  formatMonthLabel,
  getDashboardViewModel,
} from "@/features/dashboard/view-model";
import { listDemoMonths } from "@/lib/database/demo-sqlite";
import {
  dateToMonthQuery,
  monthQuerySchema,
  monthQueryToDate,
} from "@/lib/validation/common";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}): Promise<React.ReactNode> {
  const months = listDemoMonths();
  const parsed = monthQuerySchema.safeParse(await searchParams);
  const requestedMonth = parsed.success ? monthQueryToDate(parsed.data.month) : null;
  const month =
    requestedMonth && months.includes(requestedMonth) ? requestedMonth : months[0];

  const viewModel = getDashboardViewModel(month);
  const monthOptions = months.map((value) => ({
    value: dateToMonthQuery(value),
    label: formatMonthLabel(value),
  }));

  return (
    <DashboardClient
      initialViewModel={viewModel}
      monthOptions={monthOptions}
      currentMonth={dateToMonthQuery(month)}
    />
  );
}
