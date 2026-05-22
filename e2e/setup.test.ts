import { test, expect } from "@playwright/test";
import { isE2eDatabaseAvailable } from "./helpers";

test.describe("Security and Isolation Boundaries", () => {
  test.skip(!isE2eDatabaseAvailable(), "Requires reachable PostgreSQL for e2e");

  test("should execute first-run setup and block subsequent registrations", async ({
    page,
  }) => {
    await page.goto("/setup");
    await page.fill('input[name="email"]', "owner@ledgernest.com");
    await page.fill('input[name="password"]', "SecureOwnerPassword123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard", { timeout: 15000 });

    await page.goto("/setup");
    await expect(page).not.toHaveURL("/setup");
  });
});
