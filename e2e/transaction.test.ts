import { test, expect } from "@playwright/test";

test.describe("Transactions", () => {
  test("transactions page requires auth", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page).toHaveURL(/\/login/);
  });
});
