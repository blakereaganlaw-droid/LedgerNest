import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import { getDebtPlansDTO } from "@/lib/dal/debts";
import { getSavingsSummaryDTO } from "@/lib/dal/goals";
import { getUpcomingRecurringDTO } from "@/lib/dal/recurring";
import { getDashboardWidgetsDTO } from "@/lib/dal/widgets";
import { getMonthTransactionRows } from "@/lib/dal/transactions";
import { sumMonthTotals, monthRemaining } from "@/lib/finance/aggregates";
import { daysUntilPayday, nearestPayday } from "@/lib/finance/paycheck";
import { TRANSFER_GROUP_NAME } from "../../../prisma/data/category-taxonomy";

export type DashboardSummaryDTO = {
  daysUntilPaycheck: number | null;
  nextPaycheckDate: string | null;
  monthIncomeCents: number;
  monthSpendCents: number;
  monthRemainingCents: number;
  savingsTotalCents: number;
  retirementTotalCents: number;
  debts: Awaited<ReturnType<typeof getDebtPlansDTO>>;
  recurring: Awaited<ReturnType<typeof getUpcomingRecurringDTO>>;
  customWidgets: Awaited<ReturnType<typeof getDashboardWidgetsDTO>>;
};

export const getDashboardSummaryDTO = async (): Promise<DashboardSummaryDTO> => {
  const { userId } = await verifySession();
  const now = new Date();

  const paychecks = await prisma.paycheckSchedule.findMany({
    where: { userId, isActive: true },
    select: {
      id: true,
      frequency: true,
      anchorDate: true,
      isActive: true,
    },
  });

  const days = daysUntilPayday(
    paychecks.map((p) => ({
      id: p.id,
      frequency: p.frequency,
      anchorDate: p.anchorDate,
      isActive: p.isActive,
    })),
    now,
  );
  const nearest = nearestPayday(
    paychecks.map((p) => ({
      id: p.id,
      frequency: p.frequency,
      anchorDate: p.anchorDate,
      isActive: p.isActive,
    })),
    now,
  );

  const txRows = await getMonthTransactionRows(userId, now);
  const mapped = txRows.map((r) => ({
    type: r.type,
    amountCents: r.amountCents,
    groupSlug:
      r.category?.parent?.parent?.slug?.toUpperCase() ??
      (r.type === "TRANSFER" ? TRANSFER_GROUP_NAME : null),
  }));
  const totals = sumMonthTotals(mapped, "transfers");

  const budgetMonth = await prisma.budgetMonth.findFirst({
    where: {
      userId,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
    include: { lines: true },
  });
  const allocated = budgetMonth
    ? budgetMonth.lines.reduce((s, l) => s + l.allocatedCents, 0n)
    : 0n;

  const remaining = monthRemaining({
    allocatedCents: allocated,
    incomeCents: totals.incomeCents,
    spendCents: totals.spendCents,
  });

  const savings = await getSavingsSummaryDTO();

  return {
    daysUntilPaycheck: days,
    nextPaycheckDate: nearest?.date.toISOString() ?? null,
    monthIncomeCents: Number(totals.incomeCents),
    monthSpendCents: Number(totals.spendCents),
    monthRemainingCents: Number(remaining),
    savingsTotalCents: savings.totalSavings,
    retirementTotalCents: savings.totalRetirement,
    debts: await getDebtPlansDTO(),
    recurring: await getUpcomingRecurringDTO(),
    customWidgets: await getDashboardWidgetsDTO(),
  };
};
