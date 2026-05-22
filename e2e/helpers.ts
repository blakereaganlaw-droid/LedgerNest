import { existsSync } from "fs";
import { join } from "path";
import type { Page } from "@playwright/test";

export function isE2eDatabaseAvailable(): boolean {
  return (
    Boolean(process.env.DATABASE_URL) &&
    existsSync(join(process.cwd(), ".playwright-db-ok"))
  );
}

export const E2E_OWNER = {
  email: "owner@ledgernest.com",
  password: "SecureOwnerPassword123!",
  name: "Owner",
};

export async function loginAsOwner(page: Page): Promise<void> {
  await page.goto("/login");
  await page.fill('input[name="email"]', E2E_OWNER.email);
  await page.fill('input[name="password"]', E2E_OWNER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard", { timeout: 15000 });
}

export async function ensureOwnerExists(page: Page): Promise<void> {
  await page.goto("/setup");
  const onSetup = page.url().includes("/setup");
  if (!onSetup) {
    await loginAsOwner(page);
    return;
  }
  await page.fill('input[name="email"]', E2E_OWNER.email);
  await page.fill('input[name="password"]', E2E_OWNER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard", { timeout: 15000 });
}
