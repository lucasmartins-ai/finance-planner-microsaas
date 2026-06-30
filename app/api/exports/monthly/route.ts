import { NextResponse } from "next/server";

import { getDashboardViewModel } from "@/features/dashboard/view-model";
import { buildMonthlyCsv } from "@/features/reports/csv";
import { monthQuerySchema, monthQueryToDate } from "@/lib/validation/common";

export function GET(request: Request): NextResponse {
  const url = new URL(request.url);
  const parsed = monthQuerySchema.safeParse({
    month: url.searchParams.get("month"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "month_invalid",
          message: "Select a valid report month.",
        },
      },
      { status: 400 },
    );
  }

  const viewModel = getDashboardViewModel(monthQueryToDate(parsed.data.month));
  const csv = buildMonthlyCsv(viewModel);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="finance-planner-${parsed.data.month}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
