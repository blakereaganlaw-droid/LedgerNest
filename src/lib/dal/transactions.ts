import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import { startOfMonth, endOfMonth } from "date-fns";

export type TransactionDTO = {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
  type: string;
  amountCents: number;
  memo: string | null;
  date: string;
};

export const getTransactionsDTO = async (
  limit = 100,
): Promise<TransactionDTO[]> => {
  const { userId } = await verifySession();

  const rows = await prisma.transaction.findMany({
    where: { userId, isArchived: false },
    select: {
      id: true,
      accountId: true,
      categoryId: true,
      type: true,
      amountCents: true,
      memo: true,
      date: true,
      account: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: limit,
  });

  return rows.map((t) => ({
    id: t.id,
    accountId: t.accountId,
    accountName: t.account.name,
    categoryId: t.categoryId,
    categoryName: t.category?.name ?? null,
    type: t.type,
    amountCents: Number(t.amountCents),
    memo: t.memo,
    date: t.date.toISOString(),
  }));
};

export async function getMonthTransactionRows(userId: string, ref: Date) {
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);

  return prisma.transaction.findMany({
    where: {
      userId,
      isArchived: false,
      date: { gte: start, lte: end },
    },
    select: {
      type: true,
      amountCents: true,
      category: {
        select: {
          parent: {
            select: { parent: { select: { slug: true } } },
          },
        },
      },
    },
  });
}
