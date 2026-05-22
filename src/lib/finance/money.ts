/** All persisted money is integer cents (BigInt). No floats at persistence layer. */

export function centsFromNumber(value: number): bigint {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid monetary value");
  }
  return BigInt(Math.round(value));
}

export function centsToDisplay(cents: bigint): string {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const dollars = abs / 100n;
  const remainder = Number(abs % 100n)
    .toString()
    .padStart(2, "0");
  return `${negative ? "-" : ""}$${dollars.toString()}.${remainder}`;
}

export function numberFromCents(cents: bigint): number {
  return Number(cents) / 100;
}
