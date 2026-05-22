import { describe, it, expect } from "vitest";
import { computeNextRollover } from "@/lib/finance/rollover";
import {
  isNegativeAmortization,
  projectDebtPayoff,
} from "@/lib/finance/debt";
import { daysUntilPayday } from "@/lib/finance/paycheck";

describe("Financial Precision Assertions", () => {
  it("should accurately process integer cent rollover math", () => {
    const priorRollover = 10050n;
    const allocated = 5000n;
    const expenses = 12050n;

    const nextRollover = computeNextRollover({
      priorRolloverCents: priorRollover,
      allocatedCents: allocated,
      expensesCents: expenses,
      allowNegative: true,
    });
    expect(nextRollover).toBe(3000n);
  });

  it("should floor negative rollover when disabled", () => {
    const nextRollover = computeNextRollover({
      priorRolloverCents: 0n,
      allocatedCents: 1000n,
      expensesCents: 5000n,
      allowNegative: false,
    });
    expect(nextRollover).toBe(0n);
  });

  it("should catch negative amortization and raise warnings", () => {
    const principal = 500000n;
    const apr = 0.24;
    const payment = 8000n;

    expect(
      isNegativeAmortization({ principalCents: principal, apr, paymentCents: payment }),
    ).toBe(true);
  });

  it("should project payoff when payment exceeds interest", () => {
    const result = projectDebtPayoff({
      principalCents: 100000n,
      apr: 0.12,
      minimumPaymentCents: 10000n,
    });
    expect(result.negativeAmortization).toBe(false);
    expect(result.payoffMonths).toBeGreaterThan(0);
  });
});

describe("Paycheck countdown", () => {
  it("returns null with no active schedules", () => {
    expect(daysUntilPayday([])).toBeNull();
  });

  it("returns non-negative days for biweekly schedule", () => {
    const anchor = new Date("2025-01-03T12:00:00Z");
    const days = daysUntilPayday(
      [
        {
          id: "1",
          frequency: "BIWEEKLY",
          anchorDate: anchor,
          isActive: true,
        },
      ],
      new Date("2025-01-10T12:00:00Z"),
    );
    expect(days).not.toBeNull();
    expect(days!).toBeGreaterThanOrEqual(0);
  });
});
