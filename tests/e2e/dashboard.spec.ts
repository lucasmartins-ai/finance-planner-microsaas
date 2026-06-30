import { expect, test } from "@playwright/test";

test("public dashboard renders the monthly finance summary", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", {
      name: "Monthly financial planner for freelancers",
    }),
  ).toBeVisible();
  await expect(page.getByText("SQLite mock data - June 2026")).toBeVisible();
  await expect(
    page.locator(".metric-card").filter({ hasText: "Revenue" }).getByText("£5,200.00"),
  ).toBeVisible();
  await expect(page.locator(".chart-panel").getByText("GBP 6000")).toBeVisible();
  await expect(page.getByText("Required monthly revenue")).toBeVisible();
});

test("reviewer can add a mock revenue entry in browser state", async ({ page }) => {
  await page.goto("/dashboard#revenue");

  const revenuePanel = page.locator("#revenue");
  await revenuePanel.getByLabel("Client").fill("Demo Client");
  await revenuePanel.getByLabel("Source").fill("Advisory");
  await revenuePanel.getByLabel("Amount").fill("1200");
  await revenuePanel.getByLabel("Date").fill("2026-06-30");
  await revenuePanel.getByRole("button", { name: "Add revenue" }).click();

  await expect(page.getByText("Revenue added to this browser session.")).toBeVisible();
  await expect(revenuePanel.getByText("Demo Client")).toBeVisible();
  await expect(revenuePanel.getByText("£1,200.00")).toBeVisible();
});

test("the month switcher reflects and deep-links to a selected month", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page.getByLabel("Month", { exact: true })).toHaveValue("2026-06");

  await page.goto("/dashboard?month=2026-05");
  await expect(page.getByText("SQLite mock data - May 2026")).toBeVisible();
  await expect(page.getByLabel("Month", { exact: true })).toHaveValue("2026-05");
});

test("monthly CSV export is available", async ({ page }) => {
  const response = await page.request.get("/api/exports/monthly?month=2026-06");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("text/csv");
  expect(body).toContain("Northstar Studio");
  expect(body).toContain("Profit after tax reserve");
});
