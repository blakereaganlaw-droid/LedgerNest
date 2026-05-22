import { test, expect } from "@playwright/test";
import {
  ensureOwnerExists,
  isE2eDatabaseAvailable,
  loginAsOwner,
} from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("Authenticated flows", () => {
  test.skip(!isE2eDatabaseAvailable(), "Requires reachable PostgreSQL for e2e");

  test("login and logout", async ({ page }) => {
    await ensureOwnerExists(page);
    await page.getByTestId("sign-out").click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    await loginAsOwner(page);
    await expect(page).toHaveURL("/dashboard");
  });

  test("adds a transaction", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/accounts");
    const accountName = `E2E Checking ${Date.now()}`;
    await page.fill('input[name="name"]', accountName);
    await page.selectOption('select[name="type"]', "CHECKING");
    await page.fill('input[name="openingBalance"]', "100");
    await page.getByRole("button", { name: /add account/i }).click();
    await expect(page.getByText(accountName)).toBeVisible({ timeout: 10000 });

    await page.goto("/transactions");
    await page.selectOption('select[name="accountId"]', { label: accountName });
    const categorySelect = page.locator('select[name="categoryId"]');
    await categorySelect.selectOption({ index: 1 });
    await page.selectOption('select[name="type"]', "EXPENSE");
    await page.fill('input[name="amount"]', "12.50");
    await page.fill('input[name="date"]', "2026-05-22");
    await page.getByRole("button", { name: /add transaction/i }).click();

    await expect(page.getByText("$12.50")).toBeVisible({ timeout: 10000 });
  });

  test("adds a custom dashboard widget", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/settings/widgets");
    await page.getByRole("button", { name: /add widget/i }).click();
    await page.goto("/dashboard");
    await expect(page.getByText("Category spend")).toBeVisible({ timeout: 10000 });
  });
});
