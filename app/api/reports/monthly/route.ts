import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "pdf_not_implemented",
        message: "PDF reports are documented as a next step for the portfolio demo.",
      },
    },
    { status: 501 },
  );
}
