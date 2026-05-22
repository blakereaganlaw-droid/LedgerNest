export function computeNextRollover(params: {
  priorRolloverCents: bigint;
  allocatedCents: bigint;
  expensesCents: bigint;
  allowNegative: boolean;
}): bigint {
  const raw =
    params.priorRolloverCents +
    params.allocatedCents -
    params.expensesCents;
  if (!params.allowNegative && raw < 0n) {
    return 0n;
  }
  return raw;
}
