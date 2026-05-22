import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const markerPath = join(process.cwd(), ".playwright-db-ok");

async function globalSetup() {
  if (!process.env.DATABASE_URL) {
    if (existsSync(markerPath)) unlinkSync(markerPath);
    return;
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    writeFileSync(markerPath, "1");
  } catch {
    if (existsSync(markerPath)) unlinkSync(markerPath);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
