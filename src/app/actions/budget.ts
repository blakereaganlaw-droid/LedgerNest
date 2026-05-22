"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import { logAuditEvent, headersToAuditMeta } from "@/lib/audit";

const PublishBudgetSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

export async function publishBudgetMonthAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const parsed = PublishBudgetSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid budget month." };
  }

  const hdrs = await headers();
  const meta = headersToAuditMeta(hdrs);

  const budget = await prisma.budgetMonth.upsert({
    where: {
      userId_year_month: {
        userId,
        year: parsed.data.year,
        month: parsed.data.month,
      },
    },
    create: {
      userId,
      year: parsed.data.year,
      month: parsed.data.month,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    update: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await logAuditEvent({
    type: "BUDGET_PUBLISH",
    userId,
    context: { year: parsed.data.year, month: parsed.data.month },
    ...meta,
  });

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { success: true as const, id: budget.id };
}
