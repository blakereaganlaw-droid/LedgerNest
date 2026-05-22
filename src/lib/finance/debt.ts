export type DebtProjectionMonth = {
  month: number;
  principalCents: bigint;
  interestCents: bigint;
  paymentCents: bigint;
};

export function monthlyRateFromApr(apr: number): number {
  return apr / 12;
}

export function isNegativeAmortization(params: {
  principalCents: bigint;
  apr: number;
  paymentCents: bigint;
}): boolean {
  const monthlyRate = monthlyRateFromApr(params.apr);
  const accruedInterest = Number(params.principalCents) * monthlyRate;
  return Number(params.paymentCents) <= accruedInterest;
}

export function projectDebtPayoff(params: {
  principalCents: bigint;
  apr: number;
  minimumPaymentCents: bigint;
  extraPaymentCents?: bigint;
  maxMonths?: number;
}): {
  months: DebtProjectionMonth[];
  payoffMonths: number | null;
  negativeAmortization: boolean;
} {
  const maxMonths = params.maxMonths ?? 600;
  const extra = params.extraPaymentCents ?? 0n;
  const totalPayment = params.minimumPaymentCents + extra;
  const monthlyRate = monthlyRateFromApr(params.apr);

  if (
    isNegativeAmortization({
      principalCents: params.principalCents,
      apr: params.apr,
      paymentCents: totalPayment,
    })
  ) {
    return {
      months: [],
      payoffMonths: null,
      negativeAmortization: true,
    };
  }

  let principal = params.principalCents;
  const months: DebtProjectionMonth[] = [];

  for (let m = 1; m <= maxMonths; m++) {
    const interestCents = BigInt(
      Math.round(Number(principal) * monthlyRate),
    );
    const paymentCents = totalPayment;
    const principalPayment = paymentCents - interestCents;
    principal = principal - principalPayment;

    months.push({
      month: m,
      principalCents: principal > 0n ? principal : 0n,
      interestCents,
      paymentCents,
    });

    if (principal <= 0n) {
      return { months, payoffMonths: m, negativeAmortization: false };
    }
  }

  return { months, payoffMonths: null, negativeAmortization: false };
}

export function estimatePayoffMonthsLog(params: {
  principalCents: bigint;
  apr: number;
  paymentCents: bigint;
}): number | null {
  const P = Number(params.principalCents) / 100;
  const r = monthlyRateFromApr(params.apr);
  const M = Number(params.paymentCents) / 100;
  if (M <= P * r) return null;
  const numerator = Math.log(M) - Math.log(M - P * r);
  const denominator = Math.log(1 + r);
  if (denominator === 0) return null;
  return Math.ceil(numerator / denominator);
}
