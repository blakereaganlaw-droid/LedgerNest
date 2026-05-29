import { describe, it, expect } from "vitest";
import {
  formatSnapshotForModel,
  type CfoSnapshot,
} from "@/lib/cfo/snapshot";
import {
  CFO_STANDARD_WORK_HEADINGS,
  CFO_SYSTEM_PROMPT,
} from "@/lib/cfo/instructions";

function baseSnapshot(overrides: Partial<CfoSnapshot> = {}): CfoSnapshot {
  return {
    generatedAt: "2026-05-29T12:00:00.000Z",
    timezone: "America/New_York",
    daysUntilPaycheck: 5,
    nextPaycheckDate: "2026-06-03T00:00:00.000Z",
    monthIncomeCents: 500000,
    monthSpendCents: 320000,
    monthRemainingCents: 80000,
    savingsTotalCents: 150000,
    retirementTotalCents: 2500000,
    accounts: [
      { name: "Checking", type: "CHECKING", balanceCents: 120000 },
      { name: "Emergency", type: "SAVINGS", balanceCents: 300000 },
    ],
    debts: [
      {
        name: "Visa",
        principalCents: 450000,
        aprPercent: 22.99,
        minimumPaymentCents: 9000,
        extraPaymentCents: 5000,
        negativeAmortization: false,
        payoffMonths: 41,
      },
    ],
    goals: [
      {
        name: "Car repair fund",
        targetCents: 200000,
        currentCents: 150000,
        isRetirement: false,
        progressPercent: 75,
      },
    ],
    recurring: [
      { name: "Rent", amountCents: 180000, frequency: "MONTHLY", daysUntilDue: 3 },
    ],
    ...overrides,
  };
}

describe("formatSnapshotForModel", () => {
  it("renders money as USD and surfaces ledger sections", () => {
    const out = formatSnapshotForModel(baseSnapshot());
    expect(out).toContain("LedgerNest household snapshot");
    expect(out).toContain("Income recorded so far: $5000.00");
    expect(out).toContain("Spending recorded so far: $3200.00");
    expect(out).toContain("Next paycheck: 5 days away (around 2026-06-03)");
    expect(out).toContain("Sum of tracked account balances: $4200.00");
  });

  it("summarizes debts including totals and APR", () => {
    const out = formatSnapshotForModel(baseSnapshot());
    expect(out).toContain("APR 22.99%");
    expect(out).toContain("est. payoff in 41 months");
    expect(out).toContain("Total debt balance: $4500.00");
    expect(out).toContain("Total minimum payments: $90.00/mo");
  });

  it("flags negative amortization instead of a payoff horizon", () => {
    const out = formatSnapshotForModel(
      baseSnapshot({
        debts: [
          {
            name: "Payday loan",
            principalCents: 100000,
            aprPercent: 390,
            minimumPaymentCents: 2000,
            extraPaymentCents: 0,
            negativeAmortization: true,
            payoffMonths: null,
          },
        ],
      }),
    );
    expect(out).toContain("negative amortization");
    expect(out).not.toContain("est. payoff");
  });

  it("handles an empty household gracefully", () => {
    const out = formatSnapshotForModel(
      baseSnapshot({
        daysUntilPaycheck: null,
        nextPaycheckDate: null,
        accounts: [],
        debts: [],
        goals: [],
        recurring: [],
      }),
    );
    expect(out).toContain("No accounts recorded yet.");
    expect(out).toContain("No debt plans recorded yet.");
    expect(out).toContain("no active schedule configured.");
    expect(out).toContain("None recorded in the next 30 days.");
  });
});

describe("CFO system prompt", () => {
  it("encodes the core constraints", () => {
    expect(CFO_SYSTEM_PROMPT).toContain("No religion, no moralizing, no shame");
    expect(CFO_SYSTEM_PROMPT).toContain("not a financial advisor");
  });

  it("references every standard-work heading", () => {
    for (const heading of CFO_STANDARD_WORK_HEADINGS) {
      expect(CFO_SYSTEM_PROMPT).toContain(heading);
    }
  });
});
