import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import {
  isNegativeAmortization,
  projectDebtPayoff,
} from "@/lib/finance/debt";

export type DebtChartPointDTO = {
  month: number;
  balanceDollars: number;
};

export type DebtPlanDTO = {
  id: string;
  name: string;
  principalCents: number;
  aprPercent: number;
  minimumPaymentCents: number;
  extraPaymentCents: number;
  negativeAmortization: boolean;
  payoffMonths: number | null;
  chartPoints: DebtChartPointDTO[];
};

export const getDebtPlansDTO = async (): Promise<DebtPlanDTO[]> => {
  const { userId } = await verifySession();

  const plans = await prisma.debtPlan.findMany({
    where: { userId, isArchived: false },
    orderBy: { name: "asc" },
  });

  return plans.map((p) => {
    const apr = p.aprBps / 10000;
    const totalPayment = p.minimumPaymentCents + p.extraPaymentCents;
    const neg = isNegativeAmortization({
      principalCents: p.principalCents,
      apr,
      paymentCents: totalPayment,
    });
    const projection = projectDebtPayoff({
      principalCents: p.principalCents,
      apr,
      minimumPaymentCents: p.minimumPaymentCents,
      extraPaymentCents: p.extraPaymentCents,
    });

    const chartPoints = projection.months.slice(0, 24).map((m) => ({
      month: m.month,
      balanceDollars: Number(m.principalCents) / 100,
    }));

    return {
      id: p.id,
      name: p.name,
      principalCents: Number(p.principalCents),
      aprPercent: apr * 100,
      minimumPaymentCents: Number(p.minimumPaymentCents),
      extraPaymentCents: Number(p.extraPaymentCents),
      negativeAmortization: neg || projection.negativeAmortization,
      payoffMonths: projection.payoffMonths,
      chartPoints,
    };
  });
};
