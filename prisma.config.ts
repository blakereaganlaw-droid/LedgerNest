import "dotenv/config";
import { defineConfig } from "prisma/config";

const buildTimeDatabaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://build:build@127.0.0.1:5432/ledgernest_build?schema=public";

export default defineConfig({
  datasource: {
    url: buildTimeDatabaseUrl,
  },
  schema: "./prisma/schema.prisma",
});
