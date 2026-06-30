# Financial Calculations

## Rules

- All formulas must be implemented as pure TypeScript functions.
- Inputs and outputs should use integer minor units, such as pence.
- UI formatting must happen after calculations.
- Percentages should use basis points where possible.
- Rounding must be explicit and tested.
- Calculations are planning estimates, not tax or accounting advice.

## Canonical Inputs

```ts
type MonthlyInputs = {
  revenuePence: number;
  fixedExpensesPence: number;
  variableExpensesPence: number;
  taxRateBps: number;
  cashReservePence: number;
  targetOwnerIncomePence?: number;
  targetRevenuePence?: number;
};
```

## Monthly Revenue

```text
monthly_revenue = sum(revenue_entries.amount_pence for selected month)
```

Revenue should be grouped by the reporting month stored on each entry.

## Monthly Expenses

```text
fixed_expenses = sum(expense_entries.amount_pence where category.expense_type = fixed)
variable_expenses = sum(expense_entries.amount_pence where category.expense_type = variable)
total_expenses = fixed_expenses + variable_expenses
```

Fixed and variable classification belongs to the expense category at the time of reporting. If historical classification changes become a concern, snapshot the type onto `expense_entries`.

## Profit Before Tax

```text
profit_before_tax = monthly_revenue - total_expenses
```

If the result is negative, the dashboard should show a loss and tax reserve should be zero for the month.

## Estimated Tax Reserve

MVP tax setting:

```text
tax_rate = tax_rate_bps / 10000
taxable_profit = max(profit_before_tax, 0)
tax_reserve = round_down(taxable_profit * tax_rate)
```

The MVP assumes tax is reserved from profit. This is intentionally simple and user-configurable.

## Profit After Tax Reserve

```text
profit_after_tax_reserve = profit_before_tax - tax_reserve
```

This value represents estimated cash available after setting aside tax reserve, before discretionary owner decisions.

## Goal Progress

Revenue goal:

```text
revenue_goal_progress = monthly_revenue / target_revenue
```

Owner income goal:

```text
owner_income_goal_progress = profit_after_tax_reserve / target_owner_income
```

If the target is missing or zero, return `null` rather than dividing by zero.

## Runway

Runway estimates how many months available cash can cover current burn.

MVP definition:

```text
monthly_burn = fixed_expenses + variable_expenses
runway_months = cash_reserve / monthly_burn
```

If `monthly_burn` is zero:

- Return `null` for runway.
- Display "No monthly burn recorded yet" rather than infinity.

Optional later model:

```text
monthly_burn = fixed_expenses + average_variable_expenses + planned_owner_income
```

## Income Target Simulator

Question:

```text
How much revenue do I need to take home GBP X per month?
```

Inputs:

- Desired owner income after tax reserve.
- Fixed expenses.
- Variable expense ratio.
- Tax rate.

Formula:

```text
desired_profit_before_tax = desired_owner_income / (1 - tax_rate)
required_revenue = (desired_profit_before_tax + fixed_expenses) / (1 - variable_expense_ratio)
```

Constraints:

- `tax_rate` must be greater than or equal to 0 and less than 1.
- `variable_expense_ratio` must be greater than or equal to 0 and less than 1.
- If tax rate plus variable expense ratio makes revenue impossible, return a validation error.

Example:

```text
desired_owner_income = GBP 3,000
fixed_expenses = GBP 800
tax_rate = 20%
variable_expense_ratio = 10%

desired_profit_before_tax = 3000 / 0.8 = 3750
required_revenue = (3750 + 800) / 0.9 = 5055.56
```

Rounded display:

```text
Required monthly revenue: GBP 5,056
```

## Rounding

Recommended defaults:

- Internal money values: integer pence.
- Percentage multiplication: round down for reserves to avoid overstating available cash.
- User display: format with `Intl.NumberFormat`.
- Simulator required revenue: round up to the nearest whole pound for a conservative target.

## Required Unit Tests

- Zero revenue and zero expenses.
- Revenue with fixed expenses only.
- Revenue with variable expenses only.
- Negative profit.
- Tax reserve does not apply to negative profit.
- Goal progress with missing target.
- Goal progress with zero target.
- Runway with zero burn.
- Simulator with 0% tax and 0% variable ratio.
- Simulator with realistic tax and variable ratio.
- Simulator rejects invalid ratios.
- Rounding is deterministic.
