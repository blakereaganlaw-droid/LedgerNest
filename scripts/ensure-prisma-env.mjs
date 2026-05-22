/**
 * Prisma generate needs DATABASE_URL/DIRECT_URL in the environment even when
 * no database is reachable (e.g. Vercel install). Runtime uses real values from
 * the project env; placeholders are only for client generation at build time.
 */
import { execSync } from "node:child_process";

const placeholder =
  "postgresql://build:build@127.0.0.1:5432/ledgernest_build?schema=public";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = placeholder;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

execSync("prisma generate", { stdio: "inherit" });
