# API Contracts

## Scope

The current portfolio demo uses browser-session mock forms for revenue, expense, goal, and simulator interaction. No authenticated mutation API is implemented yet.

Route Handlers are used for downloadable exports. The authenticated Server Action contracts below are retained as a future hosted SaaS reference.

## Shared Response Shape

Server actions should return typed results rather than throwing raw errors into the UI.

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```

Route handlers should use normal HTTP status codes and return JSON for errors.

```json
{
  "ok": false,
  "error": {
    "code": "report_month_invalid",
    "message": "Select a valid report month."
  }
}
```

## Future Server Actions

These contracts should be implemented when the project moves from public mock data to authenticated persistence.

### Revenue

```ts
createRevenueEntry(input: {
  sourceId?: string;
  clientName?: string;
  amountPence: number;
  receivedOn: string;
  notes?: string;
}): Promise<ActionResult<{ id: string }>>
```

```ts
updateRevenueEntry(input: {
  id: string;
  sourceId?: string;
  clientName?: string;
  amountPence: number;
  receivedOn: string;
  notes?: string;
}): Promise<ActionResult<{ id: string }>>
```

```ts
deleteRevenueEntry(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>>
```

### Expenses

```ts
createExpenseCategory(input: {
  name: string;
  expenseType: "fixed" | "variable";
}): Promise<ActionResult<{ id: string }>>
```

```ts
createExpenseEntry(input: {
  categoryId: string;
  vendorName?: string;
  amountPence: number;
  paidOn: string;
  notes?: string;
}): Promise<ActionResult<{ id: string }>>
```

### Goals

```ts
upsertMonthlyGoal(input: {
  month: string;
  targetRevenuePence?: number;
  targetOwnerIncomePence?: number;
}): Promise<ActionResult<{ id: string }>>
```

### Simulator

The simulator can be implemented as a pure client call when inputs are already local. If exposed through a route or server action, validate all values.

```ts
simulateIncomeTarget(input: {
  desiredOwnerIncomePence: number;
  fixedExpensesPence: number;
  variableExpenseRatioBps: number;
  taxRateBps: number;
}): ActionResult<{
  requiredRevenuePence: number;
  desiredProfitBeforeTaxPence: number;
}>
```

## Route Handlers

### `GET /api/exports/monthly`

Exports synthetic monthly rows as CSV in the current demo.

Query parameters:

| Name | Required | Example | Notes |
| --- | --- | --- | --- |
| `month` | Yes | `2026-06` | Reporting month |

Success:

- `200 OK`
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="finance-planner-2026-06.csv"`

Failure:

- `400` if month is invalid
- `500` if export generation fails

### `GET /api/reports/monthly`

PDF generation is intentionally not implemented in the current portfolio demo. The route returns `501` with a structured JSON error.

Query parameters:

| Name | Required | Example | Notes |
| --- | --- | --- | --- |
| `month` | Yes | `2026-06` | Reporting month |

Future success:

- `200 OK`
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="finance-report-2026-06.pdf"`

Failure:

- `501` while PDF reports remain out of scope
- `400` if month is invalid
- `404` if no reportable data exists and product chooses not to generate empty reports
- `500` if report generation fails

## Validation Rules

- Amounts must be integers greater than 0 unless the field explicitly allows zero.
- Dates must be valid ISO dates.
- Reporting month should be normalized to the first day of the month.
- Text fields should be trimmed.
- User-created names should have maximum lengths.
- Future authenticated mutations must derive `user_id` from the authenticated session, not from client input.

## Error Codes

| Code | Meaning |
| --- | --- |
| `auth_required` | User must sign in |
| `amount_invalid` | Amount is missing, non-integer, or out of range |
| `date_invalid` | Date is missing or invalid |
| `month_invalid` | Month query is missing or invalid |
| `record_not_found` | Record does not exist for the current user |
| `category_required` | Expense entry needs a category |
| `simulator_ratio_invalid` | Tax or variable ratio is outside supported range |
| `export_failed` | CSV export could not be generated |
| `report_failed` | PDF report could not be generated |
| `pdf_not_implemented` | PDF reports are documented but not part of the current demo |
