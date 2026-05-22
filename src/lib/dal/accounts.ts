import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";

export type AccountDTO = {
  id: string;
  name: string;
  type: string;
  balanceCents: number;
};

export const getAccountsDTO = async (): Promise<AccountDTO[]> => {
  const { userId } = await verifySession();

  try {
    const accounts = await prisma.financialAccount.findMany({
      where: { userId, isArchived: false },
      select: {
        id: true,
        name: true,
        type: true,
        balanceCents: true,
      },
      orderBy: { name: "asc" },
    });

    return accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balanceCents: Number(acc.balanceCents),
    }));
  } catch (error) {
    console.error("Database access error within DAL:", error);
    return [];
  }
};
