"use client";

import {
  CircleDollarSign,
  FileDown,
  Goal,
  Info,
  Landmark,
  Plus,
  ReceiptText,
  Save,
  Target,
  Wallet,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { calculateMonthlySummary } from "@/lib/calculations/monthly-summary";
import { parsePoundsToPence, sumPence } from "@/lib/calculations/money";
import { simulateIncomeTarget } from "@/lib/calculations/simulator";
import type { DashboardViewModel } from "@/features/dashboard/view-model";
import { formatPence, formatPercentage, formatRunway } from "@/features/shared/format";
import type {
  ExpenseCategory,
  ExpenseEntry,
  ExpenseType,
  MonthlyGoal,
  RevenueEntry,
} from "@/lib/database/types";
import { dateToMonthQuery } from "@/lib/validation/common";

type DashboardClientProps = {
  initialViewModel: DashboardViewModel;
  monthOptions: Array<{ value: string; label: string }>;
  currentMonth: string;
};

type FormStatus = {
  type: "idle" | "success" | "error";
  message: string;
};

const categoryColours = ["#047857", "#4f46e5", "#b45309", "#be123c", "#0f766e"];

export function DashboardClient({
  initialViewModel,
  monthOptions,
  currentMonth,
}: DashboardClientProps): React.ReactNode {
  const [revenueEntries, setRevenueEntries] = useState(initialViewModel.revenueEntries);
  const [expenseCategories, setExpenseCategories] = useState(initialViewModel.expenseCategories);
  const [expenseEntries, setExpenseEntries] = useState(initialViewModel.expenseEntries);
  const [monthlyGoal, setMonthlyGoal] = useState<MonthlyGoal | null>(
    initialViewModel.monthlyGoal,
  );
  const [cashReservePence, setCashReservePence] = useState(
    initialViewModel.cashReservePence,
  );
  const [taxRateBps, setTaxRateBps] = useState(initialViewModel.taxRateBps);
  const [status, setStatus] = useState<FormStatus>({
    type: "idle",
    message: "Changes in this demo stay in the browser session.",
  });

  const [revenueForm, setRevenueForm] = useState({
    clientName: "",
    sourceName: "Consulting",
    amount: "",
    receivedOn: "2026-06-30",
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    expenseType: "fixed" as ExpenseType,
  });
  const [expenseForm, setExpenseForm] = useState({
    vendorName: "",
    categoryId: initialViewModel.expenseCategories[0]?.id ?? "",
    amount: "",
    paidOn: "2026-06-30",
  });
  const [goalForm, setGoalForm] = useState({
    targetRevenue: penceToPoundsInput(initialViewModel.monthlyGoal?.targetRevenuePence),
    targetOwnerIncome: penceToPoundsInput(
      initialViewModel.monthlyGoal?.targetOwnerIncomePence,
    ),
    cashReserve: penceToPoundsInput(initialViewModel.cashReservePence),
    taxRatePercent: String(initialViewModel.taxRateBps / 100),
  });
  const [simulatorForm, setSimulatorForm] = useState({
    desiredOwnerIncome: "3000",
    fixedExpenses: "800",
    taxRatePercent: "20",
    variableExpensePercent: "10",
  });

  const summary = useMemo(() => {
    const fixedExpensesPence = sumPence(
      expenseEntries
        .filter((expense) => expense.expenseType === "fixed")
        .map((expense) => expense.amountPence),
    );
    const variableExpensesPence = sumPence(
      expenseEntries
        .filter((expense) => expense.expenseType === "variable")
        .map((expense) => expense.amountPence),
    );

    return calculateMonthlySummary({
      revenuePence: sumPence(revenueEntries.map((entry) => entry.amountPence)),
      fixedExpensesPence,
      variableExpensesPence,
      taxRateBps,
      cashReservePence,
      targetOwnerIncomePence: monthlyGoal?.targetOwnerIncomePence,
      targetRevenuePence: monthlyGoal?.targetRevenuePence,
    });
  }, [cashReservePence, expenseEntries, monthlyGoal, revenueEntries, taxRateBps]);

  const categoryBreakdown = useMemo(
    () =>
      expenseCategories
        .map((category) => ({
          name: category.name,
          type: category.expenseType,
          amountPence: sumPence(
            expenseEntries
              .filter((expense) => expense.categoryId === category.id)
              .map((expense) => expense.amountPence),
          ),
        }))
        .filter((category) => category.amountPence > 0)
        .sort((left, right) => right.amountPence - left.amountPence),
    [expenseCategories, expenseEntries],
  );

  const barData = [
    { label: "Revenue", amount: summary.revenuePence / 100 },
    { label: "Expenses", amount: summary.totalExpensesPence / 100 },
    { label: "After tax", amount: summary.profitAfterTaxReservePence / 100 },
  ];
  const pieData = categoryBreakdown.map((category) => ({
    name: category.name,
    value: category.amountPence / 100,
  }));
  const simulatorResult = useMemo(() => {
    try {
      return simulateIncomeTarget({
        desiredOwnerIncomePence: parseOptionalPounds(simulatorForm.desiredOwnerIncome),
        fixedExpensesPence: parseOptionalPounds(simulatorForm.fixedExpenses),
        taxRateBps: percentToBps(simulatorForm.taxRatePercent),
        variableExpenseRatioBps: percentToBps(simulatorForm.variableExpensePercent),
      });
    } catch {
      return null;
    }
  }, [simulatorForm]);

  function addRevenue(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    try {
      const amountPence = parsePoundsToPence(revenueForm.amount);
      if (amountPence <= 0) {
        throw new RangeError("Revenue must be greater than zero.");
      }

      const entry: RevenueEntry = {
        id: createLocalId("revenue"),
        sourceName: revenueForm.sourceName.trim() || "Manual entry",
        clientName: revenueForm.clientName.trim() || "Unnamed client",
        amountPence,
        receivedOn: revenueForm.receivedOn,
        month: initialViewModel.month,
        notes: "Added in browser demo",
      };

      setRevenueEntries((current) => [entry, ...current]);
      setRevenueForm({
        clientName: "",
        sourceName: "Consulting",
        amount: "",
        receivedOn: "2026-06-30",
      });
      setStatus({ type: "success", message: "Revenue added to this browser session." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Check the revenue amount.",
      });
    }
  }

  function addCategory(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const name = categoryForm.name.trim();
    if (!name) {
      setStatus({ type: "error", message: "Enter a category name." });
      return;
    }

    const category: ExpenseCategory = {
      id: createLocalId("category"),
      name,
      expenseType: categoryForm.expenseType,
    };

    setExpenseCategories((current) => [...current, category]);
    setExpenseForm((current) => ({ ...current, categoryId: current.categoryId || category.id }));
    setCategoryForm({ name: "", expenseType: "fixed" });
    setStatus({ type: "success", message: "Expense category added to this browser session." });
  }

  function addExpense(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    try {
      const category = expenseCategories.find(
        (candidate) => candidate.id === expenseForm.categoryId,
      );
      const amountPence = parsePoundsToPence(expenseForm.amount);

      if (!category) {
        throw new Error("Choose an expense category.");
      }

      if (amountPence <= 0) {
        throw new RangeError("Expense must be greater than zero.");
      }

      const entry: ExpenseEntry = {
        id: createLocalId("expense"),
        categoryId: category.id,
        categoryName: category.name,
        expenseType: category.expenseType,
        vendorName: expenseForm.vendorName.trim() || "Unnamed vendor",
        amountPence,
        paidOn: expenseForm.paidOn,
        month: initialViewModel.month,
        notes: "Added in browser demo",
      };

      setExpenseEntries((current) => [entry, ...current]);
      setExpenseForm((current) => ({
        vendorName: "",
        categoryId: current.categoryId,
        amount: "",
        paidOn: "2026-06-30",
      }));
      setStatus({ type: "success", message: "Expense added to this browser session." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Check the expense details.",
      });
    }
  }

  function saveGoals(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    try {
      setMonthlyGoal({
        month: initialViewModel.month,
        targetRevenuePence: parseNullablePounds(goalForm.targetRevenue),
        targetOwnerIncomePence: parseNullablePounds(goalForm.targetOwnerIncome),
      });
      setCashReservePence(parseOptionalPounds(goalForm.cashReserve));
      setTaxRateBps(percentToBps(goalForm.taxRatePercent));
      setStatus({ type: "success", message: "Planning assumptions updated for this session." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Check the planning inputs.",
      });
    }
  }

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">SQLite mock data - {initialViewModel.monthLabel}</p>
          <h1>Monthly financial planner for freelancers</h1>
          <p className="page-lede">
            A public portfolio demo that shows revenue, expenses, profit, tax reserve,
            runway, goals, a sales target simulator, and CSV export without requiring
            live credentials.
          </p>
        </div>
        <div className="header-actions">
          <label className="month-switcher">
            Month
            <select
              aria-label="Month"
              value={currentMonth}
              onChange={(event) => {
                window.location.assign(`/dashboard?month=${event.target.value}`);
              }}
            >
              {monthOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <a
            className="primary-action"
            href={`/api/exports/monthly?month=${dateToMonthQuery(initialViewModel.month)}`}
          >
            <FileDown aria-hidden="true" size={18} />
            Export CSV
          </a>
        </div>
      </header>

      <section className="kpi-grid" aria-label="Monthly summary">
        <MetricCard
          icon={<Landmark aria-hidden="true" size={18} />}
          label="Revenue"
          value={formatPence(summary.revenuePence)}
          detail={`${formatPercentage(summary.revenueGoalProgress)} of revenue goal`}
        />
        <MetricCard
          icon={<ReceiptText aria-hidden="true" size={18} />}
          label="Expenses"
          value={formatPence(summary.totalExpensesPence)}
          detail={`${formatPence(summary.fixedExpensesPence)} fixed, ${formatPence(
            summary.variableExpensesPence,
          )} variable`}
        />
        <MetricCard
          icon={<CircleDollarSign aria-hidden="true" size={18} />}
          label="After tax reserve"
          value={formatPence(summary.profitAfterTaxReservePence)}
          detail={`${formatPence(summary.taxReservePence)} set aside for tax`}
        />
        <MetricCard
          icon={<Wallet aria-hidden="true" size={18} />}
          label="Runway"
          value={formatRunway(summary.runwayMonths)}
          detail={`${formatPence(cashReservePence)} cash reserve`}
        />
      </section>

      <section className="status-row" aria-live="polite">
        <Info aria-hidden="true" size={18} />
        <span className={`status-message ${status.type}`}>{status.message}</span>
      </section>

      <section className="content-grid">
        <div className="panel chart-panel" aria-label="Revenue, expenses, and profit chart">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Monthly shape</p>
              <h2>Revenue converts into reserved cash</h2>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(value) => `GBP ${value}`} width={76} />
                <Tooltip formatter={(value) => formatPence(Number(value) * 100)} />
                <Bar
                  dataKey="amount"
                  name="GBP"
                  radius={[6, 6, 0, 0]}
                  fill="#047857"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel" id="goals">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Goals</p>
              <h2>Targets and assumptions</h2>
            </div>
            <Goal aria-hidden="true" size={22} />
          </div>

          <div className="progress-list">
            <ProgressRow
              label="Revenue goal"
              value={summary.revenueGoalProgress}
              amount={summary.revenuePence}
              target={monthlyGoal?.targetRevenuePence}
            />
            <ProgressRow
              label="Owner income goal"
              value={summary.ownerIncomeGoalProgress}
              amount={summary.profitAfterTaxReservePence}
              target={monthlyGoal?.targetOwnerIncomePence}
            />
          </div>

          <form className="stacked-form" onSubmit={saveGoals}>
            <label>
              Revenue target
              <input
                inputMode="decimal"
                value={goalForm.targetRevenue}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    targetRevenue: event.target.value,
                  }))
                }
                placeholder="6000"
              />
            </label>
            <label>
              Owner income target
              <input
                inputMode="decimal"
                value={goalForm.targetOwnerIncome}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    targetOwnerIncome: event.target.value,
                  }))
                }
                placeholder="3000"
              />
            </label>
            <label>
              Cash reserve
              <input
                inputMode="decimal"
                value={goalForm.cashReserve}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    cashReserve: event.target.value,
                  }))
                }
                placeholder="7200"
              />
            </label>
            <label>
              Tax reserve rate (%)
              <input
                inputMode="decimal"
                value={goalForm.taxRatePercent}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    taxRatePercent: event.target.value,
                  }))
                }
                placeholder="20"
              />
            </label>
            <button className="secondary-action" type="submit">
              <Save aria-hidden="true" size={17} />
              Save assumptions
            </button>
          </form>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel" id="expenses">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Expense mix</p>
              <h2>Category breakdown</h2>
            </div>
          </div>
          <div className="split-panel">
            <div className="chart-frame small">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        fill={categoryColours[index % categoryColours.length]}
                        key={entry.name}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatPence(Number(value) * 100)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="breakdown-list">
              {categoryBreakdown.map((category) => (
                <div className="breakdown-row" key={category.name}>
                  <span>
                    <strong>{category.name}</strong>
                    <small>{category.type}</small>
                  </span>
                  <span>{formatPence(category.amountPence)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel formula-panel" id="settings">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Formula audit</p>
              <h2>How this month is calculated</h2>
            </div>
          </div>
          <dl className="formula-list">
            <div>
              <dt>Profit before tax</dt>
              <dd>Revenue - fixed expenses - variable expenses</dd>
            </div>
            <div>
              <dt>Tax reserve</dt>
              <dd>max(profit before tax, 0) x tax rate</dd>
            </div>
            <div>
              <dt>Runway</dt>
              <dd>Cash reserve / monthly expenses</dd>
            </div>
            <div>
              <dt>Simulator</dt>
              <dd>(desired income / (1 - tax) + fixed costs) / (1 - variable ratio)</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="content-grid wide-left">
        <div className="panel" id="revenue">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Mock CRUD</p>
              <h2>Revenue entries</h2>
            </div>
            <Landmark aria-hidden="true" size={22} />
          </div>

          <form className="inline-form" onSubmit={addRevenue}>
            <label>
              Client
              <input
                value={revenueForm.clientName}
                onChange={(event) =>
                  setRevenueForm((current) => ({
                    ...current,
                    clientName: event.target.value,
                  }))
                }
                placeholder="Client name"
              />
            </label>
            <label>
              Source
              <input
                value={revenueForm.sourceName}
                onChange={(event) =>
                  setRevenueForm((current) => ({
                    ...current,
                    sourceName: event.target.value,
                  }))
                }
                placeholder="Consulting"
              />
            </label>
            <label>
              Amount
              <input
                inputMode="decimal"
                value={revenueForm.amount}
                onChange={(event) =>
                  setRevenueForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="1200"
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={revenueForm.receivedOn}
                onChange={(event) =>
                  setRevenueForm((current) => ({
                    ...current,
                    receivedOn: event.target.value,
                  }))
                }
              />
            </label>
            <button className="secondary-action" type="submit">
              <Plus aria-hidden="true" size={17} />
              Add revenue
            </button>
          </form>

          <DataTable
            headers={["Date", "Client", "Source", "Amount"]}
            rows={revenueEntries.map((entry) => [
              entry.receivedOn,
              entry.clientName,
              entry.sourceName,
              formatPence(entry.amountPence),
            ])}
          />
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Categories</p>
              <h2>Expense types</h2>
            </div>
          </div>
          <form className="stacked-form" onSubmit={addCategory}>
            <label>
              Category name
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Insurance"
              />
            </label>
            <label>
              Expense type
              <select
                value={categoryForm.expenseType}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    expenseType: event.target.value as ExpenseType,
                  }))
                }
              >
                <option value="fixed">Fixed</option>
                <option value="variable">Variable</option>
              </select>
            </label>
            <button className="secondary-action" type="submit">
              <Plus aria-hidden="true" size={17} />
              Add category
            </button>
          </form>
        </div>
      </section>

      <section className="content-grid wide-left">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Mock CRUD</p>
              <h2>Expense entries</h2>
            </div>
            <ReceiptText aria-hidden="true" size={22} />
          </div>
          <form className="inline-form" onSubmit={addExpense}>
            <label>
              Vendor
              <input
                value={expenseForm.vendorName}
                onChange={(event) =>
                  setExpenseForm((current) => ({
                    ...current,
                    vendorName: event.target.value,
                  }))
                }
                placeholder="Vendor name"
              />
            </label>
            <label>
              Category
              <select
                value={expenseForm.categoryId}
                onChange={(event) =>
                  setExpenseForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
              >
                {expenseCategories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name} ({category.expenseType})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount
              <input
                inputMode="decimal"
                value={expenseForm.amount}
                onChange={(event) =>
                  setExpenseForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="120"
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={expenseForm.paidOn}
                onChange={(event) =>
                  setExpenseForm((current) => ({
                    ...current,
                    paidOn: event.target.value,
                  }))
                }
              />
            </label>
            <button className="secondary-action" type="submit">
              <Plus aria-hidden="true" size={17} />
              Add expense
            </button>
          </form>

          <DataTable
            headers={["Date", "Vendor", "Category", "Amount"]}
            rows={expenseEntries.map((entry) => [
              entry.paidOn,
              entry.vendorName,
              `${entry.categoryName} (${entry.expenseType})`,
              formatPence(entry.amountPence),
            ])}
          />
        </div>

        <div className="panel" id="reports">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Exports</p>
              <h2>Monthly CSV</h2>
            </div>
            <FileDown aria-hidden="true" size={22} />
          </div>
          <p className="muted">
            The CSV route reads the same SQLite-backed mock month as the dashboard.
            PDF is intentionally left as a documented next step.
          </p>
          <a
            className="secondary-action full-width"
            href={`/api/exports/monthly?month=${dateToMonthQuery(initialViewModel.month)}`}
          >
            <FileDown aria-hidden="true" size={17} />
            Download June CSV
          </a>
        </div>
      </section>

      <section className="panel simulator-panel" id="simulator">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Simulator</p>
            <h2>How much do I need to sell to take home a target income?</h2>
          </div>
          <Target aria-hidden="true" size={22} />
        </div>
        <div className="simulator-grid">
          <form className="inline-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              Desired owner income
              <input
                inputMode="decimal"
                value={simulatorForm.desiredOwnerIncome}
                onChange={(event) =>
                  setSimulatorForm((current) => ({
                    ...current,
                    desiredOwnerIncome: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Fixed expenses
              <input
                inputMode="decimal"
                value={simulatorForm.fixedExpenses}
                onChange={(event) =>
                  setSimulatorForm((current) => ({
                    ...current,
                    fixedExpenses: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Tax rate (%)
              <input
                inputMode="decimal"
                value={simulatorForm.taxRatePercent}
                onChange={(event) =>
                  setSimulatorForm((current) => ({
                    ...current,
                    taxRatePercent: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Variable expense ratio (%)
              <input
                inputMode="decimal"
                value={simulatorForm.variableExpensePercent}
                onChange={(event) =>
                  setSimulatorForm((current) => ({
                    ...current,
                    variableExpensePercent: event.target.value,
                  }))
                }
              />
            </label>
          </form>
          <div className="result-box">
            <span>Required monthly revenue</span>
            <strong>
              {simulatorResult ? formatPence(simulatorResult.requiredRevenuePence) : "Check inputs"}
            </strong>
            <p>
              Desired pre-tax profit:{" "}
              {simulatorResult
                ? formatPence(simulatorResult.desiredProfitBeforeTaxPence)
                : "Unavailable"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}): React.ReactNode {
  return (
    <article className="metric-card">
      <span className="metric-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function ProgressRow({
  label,
  value,
  amount,
  target,
}: {
  label: string;
  value: number | null;
  amount: number;
  target?: number | null;
}): React.ReactNode {
  const percent = value === null ? 0 : Math.min(value * 100, 100);

  return (
    <div className="progress-row">
      <div>
        <strong>{label}</strong>
        <span>
          {formatPence(amount)} / {target ? formatPence(target) : "No target"}
        </span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
      <small>{formatPercentage(value)}</small>
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}): React.ReactNode {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.join("-")}>
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length}>No records yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function createLocalId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function penceToPoundsInput(value?: number | null): string {
  if (!value) {
    return "";
  }

  return String(value / 100);
}

function parseNullablePounds(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  return parsePoundsToPence(value);
}

function parseOptionalPounds(value: string): number {
  if (!value.trim()) {
    return 0;
  }

  return parsePoundsToPence(value);
}

function percentToBps(value: string): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue >= 100) {
    throw new RangeError("Percent values must be from 0 to less than 100.");
  }

  return Math.round(numericValue * 100);
}
