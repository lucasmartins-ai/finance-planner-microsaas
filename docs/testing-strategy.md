# Testing Strategy

## Goals

Testing should prove that the app is safe to use for planning decisions and credible as a public portfolio project.

The highest-risk area in the current demo is incorrect financial calculations and broken exports. Cross-user data access becomes a risk only when the hosted Supabase path is implemented.

## Test Pyramid

### Unit Tests

Required for:

- Money helpers.
- Monthly summary calculations.
- Tax reserve calculations.
- Runway calculations.
- Income target simulator.
- CSV escaping helpers.
- Date/month normalization.

Financial calculation coverage should be effectively complete, including edge cases.

### Integration Tests

Future hosted SaaS tests:

- Revenue repository create/read/update/delete.
- Expense repository create/read/update/delete.
- Monthly dashboard query.
- Export route authentication.
- CSV export payload.
- PDF report generation smoke test.
- RLS behavior with two users.

### End-to-End Tests

Required Playwright flows:

- Reviewer reaches the public dashboard.
- Reviewer adds a mock revenue entry.
- Reviewer adds fixed and variable mock expenses.
- Reviewer updates monthly goals.
- Dashboard updates summary cards and charts.
- Simulator returns a required revenue target.
- CSV export downloads for selected month.
- PDF route shows the documented not-implemented state.

## Coverage Target

The project target is 80%+ total coverage, but calculation modules should aim for 100% branch coverage because formula errors damage user trust.

## Test Data

Use deterministic synthetic data:

- No real names.
- No real financial records.
- No live credentials in fixtures.

## Example Unit Test Cases

| Area | Case |
| --- | --- |
| Profit | Revenue 500000, expenses 120000, profit 380000 |
| Loss | Revenue 100000, expenses 150000, tax reserve 0 |
| Tax | Profit 100000, tax 20%, reserve 20000 |
| Runway | Cash 600000, burn 200000, runway 3 months |
| Runway | Burn 0 returns null |
| Simulator | Desired 300000, fixed 80000, tax 20%, variable 10% |
| Goal | Missing target returns null progress |

## CI Expectations

Public CI should run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run `npm run test:e2e` once browser binaries are installed in the environment.
