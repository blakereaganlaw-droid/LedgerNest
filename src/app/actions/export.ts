"use server";

import { verifySession } from "@/lib/dal/dal-core";
import { prisma } from "@/lib/prisma";

export async function exportJsonBackupAction(): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  const { userId } = await verifySession();

  const [
    accounts,
    transactions,
    categories,
    budgetMonths,
    goals,
    debts,
    recurring,
    widgets,
  ] = await Promise.all([
    prisma.financialAccount.findMany({ where: { userId } }),
    prisma.transaction.findMany({ where: { userId } }),
    prisma.categoryNode.findMany({ where: { userId } }),
    prisma.budgetMonth.findMany({
      where: { userId },
      include: { lines: true },
    }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.debtPlan.findMany({ where: { userId } }),
    prisma.recurringItem.findMany({ where: { userId } }),
    prisma.dashboardWidget.findMany({ where: { userId } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    accounts: serializeBigInt(accounts),
    transactions: serializeBigInt(transactions),
    categories: serializeBigInt(categories),
    budgetMonths: serializeBigInt(budgetMonths),
    goals: serializeBigInt(goals),
    debts: serializeBigInt(debts),
    recurring: serializeBigInt(recurring),
    widgets,
  };

  return { success: true, data: JSON.stringify(payload, null, 2) };
}

export async function exportTransactionsCsvAction(): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  const { userId } = await verifySession();

  const rows = await prisma.transaction.findMany({
    where: { userId, isArchived: false },
    include: {
      account: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  const header = "date,account,category,type,amount_cents,memo";
  const lines = rows.map(
    (r) =>
      `${r.date.toISOString()},${escapeCsv(r.account.name)},${escapeCsv(r.category?.name ?? "")},${r.type},${r.amountCents},${escapeCsv(r.memo ?? "")}`,
  );

  return { success: true, data: [header, ...lines].join("\n") };
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function serializeBigInt<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  ) as T;
}
