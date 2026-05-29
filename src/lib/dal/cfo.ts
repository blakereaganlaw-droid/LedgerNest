import "server-only";

import { verifySession } from "@/lib/dal/dal-core";
import { getAccountsDTO } from "@/lib/dal/accounts";
import { getGoalsDTO } from "@/lib/dal/goals";
import { getDashboardSummaryDTO } from "@/lib/dal/dashboard";
import type { CfoSnapshot } from "@/lib/cfo/snapshot";

/**
 * Assemble the household financial snapshot the CFO assistant reasons over.
 * Composed from the existing read-only DALs; every figure is the user's own
 * ledger data, scoped to the authenticated user.
 */
export const getCfoSnapshotDTO = async (): Promise<CfoSnapshot> => {
  await verifySession();

  const [summary, accounts, goals] = await Promise.all([
    getDashboardSummaryDTO(),
    getAccountsDTO(),
    getGoalsDTO(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    timezone: "America/New_York",
    daysUntilPaycheck: summary.daysUntilPaycheck,
    nextPaycheckDate: summary.nextPaycheckDate,
    monthIncomeCents: summary.monthIncomeCents,
    monthSpendCents: summary.monthSpendCents,
    monthRemainingCents: summary.monthRemainingCents,
    savingsTotalCents: summary.savingsTotalCents,
    retirementTotalCents: summary.retirementTotalCents,
    accounts: accounts.map((a) => ({
      name: a.name,
      type: a.type,
      balanceCents: a.balanceCents,
    })),
    debts: summary.debts.map((d) => ({
      name: d.name,
      principalCents: d.principalCents,
      aprPercent: d.aprPercent,
      minimumPaymentCents: d.minimumPaymentCents,
      extraPaymentCents: d.extraPaymentCents,
      negativeAmortization: d.negativeAmortization,
      payoffMonths: d.payoffMonths,
    })),
    goals: goals.map((g) => ({
      name: g.name,
      targetCents: g.targetCents,
      currentCents: g.currentCents,
      isRetirement: g.isRetirement,
      progressPercent: g.progressPercent,
    })),
    recurring: summary.recurring.map((r) => ({
      name: r.name,
      amountCents: r.amountCents,
      frequency: r.frequency,
      daysUntilDue: r.daysUntilDue,
    })),
  };
};
