/**
 * Plain, decoupled shapes for the household financial snapshot the CFO assistant
 * reasons over, plus a pure formatter that renders them into a text "case file".
 *
 * This module is intentionally free of `server-only` and Prisma imports so the
 * formatter can be unit-tested without a database. The DAL maps its DTOs into
 * these shapes (see `src/lib/dal/cfo.ts`).
 */

import { formatUsdFromCents } from "@/lib/utils";

export interface CfoAccount {
  name: string;
  type: string;
  balanceCents: number;
}

export interface CfoDebt {
  name: string;
  principalCents: number;
  aprPercent: number;
  minimumPaymentCents: number;
  extraPaymentCents: number;
  negativeAmortization: boolean;
  payoffMonths: number | null;
}

export interface CfoGoal {
  name: string;
  targetCents: number;
  currentCents: number;
  isRetirement: boolean;
  progressPercent: number;
}

export interface CfoRecurring {
  name: string;
  amountCents: number;
  frequency: string;
  daysUntilDue: number;
}

export interface CfoSnapshot {
  generatedAt: string;
  timezone: string;
  daysUntilPaycheck: number | null;
  nextPaycheckDate: string | null;
  monthIncomeCents: number;
  monthSpendCents: number;
  monthRemainingCents: number;
  savingsTotalCents: number;
  retirementTotalCents: number;
  accounts: CfoAccount[];
  debts: CfoDebt[];
  goals: CfoGoal[];
  recurring: CfoRecurring[];
}

function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Render the snapshot as a deterministic, human-readable case file. Every figure
 * is drawn from the user's own ledger, so the model should treat these as known
 * facts (see the CFO system prompt). Pure: same input always yields same output.
 */
export function formatSnapshotForModel(snapshot: CfoSnapshot): string {
  const lines: string[] = [];

  lines.push("# LedgerNest household snapshot");
  lines.push(`Generated: ${snapshot.generatedAt} (${snapshot.timezone})`);
  lines.push("");

  lines.push("## This-month cash flow (known facts from the ledger)");
  lines.push(`- Income recorded so far: ${formatUsdFromCents(snapshot.monthIncomeCents)}`);
  lines.push(`- Spending recorded so far: ${formatUsdFromCents(snapshot.monthSpendCents)}`);
  lines.push(
    `- Left in the published plan: ${formatUsdFromCents(snapshot.monthRemainingCents)}`,
  );
  if (snapshot.daysUntilPaycheck === null) {
    lines.push("- Next paycheck: no active schedule configured.");
  } else {
    const when = snapshot.nextPaycheckDate
      ? ` (around ${snapshot.nextPaycheckDate.slice(0, 10)})`
      : "";
    lines.push(`- Next paycheck: ${snapshot.daysUntilPaycheck} days away${when}.`);
  }
  lines.push("");

  lines.push("## Accounts");
  if (snapshot.accounts.length === 0) {
    lines.push("- No accounts recorded yet.");
  } else {
    for (const account of snapshot.accounts) {
      lines.push(
        `- ${account.name} [${account.type}]: ${formatUsdFromCents(account.balanceCents)}`,
      );
    }
    const total = sumCents(snapshot.accounts.map((a) => a.balanceCents));
    lines.push(`- Sum of tracked account balances: ${formatUsdFromCents(total)}`);
  }
  lines.push("");

  lines.push("## Debts");
  if (snapshot.debts.length === 0) {
    lines.push("- No debt plans recorded yet.");
  } else {
    for (const debt of snapshot.debts) {
      const payoff = debt.negativeAmortization
        ? "payment does not cover interest (negative amortization)"
        : debt.payoffMonths === null
          ? "payoff horizon unknown"
          : `est. payoff in ${debt.payoffMonths} months`;
      lines.push(
        `- ${debt.name}: balance ${formatUsdFromCents(debt.principalCents)}, ` +
          `APR ${debt.aprPercent.toFixed(2)}%, ` +
          `minimum ${formatUsdFromCents(debt.minimumPaymentCents)}/mo, ` +
          `extra ${formatUsdFromCents(debt.extraPaymentCents)}/mo — ${payoff}.`,
      );
    }
    const totalDebt = sumCents(snapshot.debts.map((d) => d.principalCents));
    const totalMin = sumCents(snapshot.debts.map((d) => d.minimumPaymentCents));
    lines.push(`- Total debt balance: ${formatUsdFromCents(totalDebt)}`);
    lines.push(
      `- Total minimum payments: ${formatUsdFromCents(totalMin)}/mo`,
    );
  }
  lines.push("");

  lines.push("## Goals and buffers");
  lines.push(`- Savings total (non-retirement): ${formatUsdFromCents(snapshot.savingsTotalCents)}`);
  lines.push(`- Retirement total: ${formatUsdFromCents(snapshot.retirementTotalCents)}`);
  if (snapshot.goals.length === 0) {
    lines.push("- No individual goals recorded yet.");
  } else {
    for (const goal of snapshot.goals) {
      const kind = goal.isRetirement ? "retirement" : "savings";
      lines.push(
        `- ${goal.name} [${kind}]: ${formatUsdFromCents(goal.currentCents)} of ` +
          `${formatUsdFromCents(goal.targetCents)} (${goal.progressPercent}%).`,
      );
    }
  }
  lines.push("");

  lines.push("## Upcoming recurring bills (next 30 days)");
  if (snapshot.recurring.length === 0) {
    lines.push("- None recorded in the next 30 days.");
  } else {
    for (const item of snapshot.recurring) {
      lines.push(
        `- ${item.name}: ${formatUsdFromCents(item.amountCents)} ` +
          `(${item.frequency.toLowerCase()}), due in ${item.daysUntilDue} days.`,
      );
    }
    const totalRecurring = sumCents(snapshot.recurring.map((r) => r.amountCents));
    lines.push(`- Sum due in the next 30 days: ${formatUsdFromCents(totalRecurring)}`);
  }

  return lines.join("\n");
}
