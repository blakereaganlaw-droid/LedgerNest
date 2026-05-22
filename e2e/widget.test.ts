import { test, expect } from "@playwright/test";

test.describe("Custom widgets", () => {
  test("widgets settings requires auth", async ({ page }) => {
    await page.goto("/settings/widgets");
    await expect(page).toHaveURL(/\/login/);
  });
});
