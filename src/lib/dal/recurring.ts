import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import { addDays } from "date-fns";

export type RecurringItemDTO = {
  id: string;
  name: string;
  amountCents: number;
  frequency: string;
  nextDueDate: string;
  daysUntilDue: number;
};

export const getUpcomingRecurringDTO = async (
  withinDays = 30,
): Promise<RecurringItemDTO[]> => {
  const { userId } = await verifySession();
  const now = new Date();
  const horizon = addDays(now, withinDays);

  const items = await prisma.recurringItem.findMany({
    where: {
      userId,
      isArchived: false,
      nextDueDate: { lte: horizon },
    },
    orderBy: { nextDueDate: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    amountCents: Number(item.amountCents),
    frequency: item.frequency,
    nextDueDate: item.nextDueDate.toISOString(),
    daysUntilDue: Math.max(
      0,
      Math.ceil(
        (item.nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    ),
  }));
};
