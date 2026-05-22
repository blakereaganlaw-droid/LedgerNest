import type { TransactionType } from "@prisma/client";

export type TransactionAggregateRow = {
  type: TransactionType;
  amountCents: bigint;
  groupSlug: string | null;
};

export function sumMonthTotals(
  rows: TransactionAggregateRow[],
  transferGroupSlug: string,
): {
  incomeCents: bigint;
  spendCents: bigint;
  transferCents: bigint;
} {
  let incomeCents = 0n;
  let spendCents = 0n;
  let transferCents = 0n;

  for (const row of rows) {
    if (row.groupSlug === transferGroupSlug || row.type === "TRANSFER") {
      transferCents += row.amountCents;
      continue;
    }
    if (row.type === "INCOME") {
      incomeCents += row.amountCents;
    } else if (row.type === "EXPENSE") {
      spendCents += row.amountCents;
    }
  }

  return { incomeCents, spendCents, transferCents };
}

export function monthRemaining(params: {
  allocatedCents: bigint;
  incomeCents: bigint;
  spendCents: bigint;
}): bigint {
  return params.allocatedCents + params.incomeCents - params.spendCents;
}
