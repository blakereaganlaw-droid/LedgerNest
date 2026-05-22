import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";

export type BudgetLineDTO = {
  id: string;
  categoryId: string;
  categoryName: string;
  allocatedCents: number;
  rolloverCents: number;
  spentCents: number;
  remainingCents: number;
};

export type BudgetMonthDTO = {
  id: string;
  year: number;
  month: number;
  status: string;
  lines: BudgetLineDTO[];
};

export async function getCurrentBudgetMonthDTO(
  year: number,
  month: number,
): Promise<BudgetMonthDTO | null> {
  const { userId } = await verifySession();

  const budget = await prisma.budgetMonth.findUnique({
    where: { userId_year_month: { userId, year, month } },
    include: {
      lines: {
        include: { category: { select: { name: true } } },
      },
    },
  });

  if (!budget) return null;

  return {
    id: budget.id,
    year: budget.year,
    month: budget.month,
    status: budget.status,
    lines: budget.lines.map((line) => {
      const allocated = line.allocatedCents;
      const rollover = line.rolloverCents;
      const spent = line.spentCents;
      const remaining = allocated + rollover - spent;
      return {
        id: line.id,
        categoryId: line.categoryId,
        categoryName: line.category.name,
        allocatedCents: Number(allocated),
        rolloverCents: Number(rollover),
        spentCents: Number(spent),
        remainingCents: Number(remaining),
      };
    }),
  };
}
