import { describe, it, expect } from "vitest";
import {
  isNegativeAmortization,
  projectDebtPayoff,
} from "@/lib/finance/debt";

describe("Debt payoff projections", () => {
  it("detects negative amortization when payment is below interest", () => {
    expect(
      isNegativeAmortization({
        principalCents: 500000n,
        apr: 0.24,
        paymentCents: 8000n,
      }),
    ).toBe(true);
  });

  it("returns null payoff months under negative amortization", () => {
    const result = projectDebtPayoff({
      principalCents: 500000n,
      apr: 0.24,
      minimumPaymentCents: 8000n,
    });
    expect(result.negativeAmortization).toBe(true);
    expect(result.payoffMonths).toBeNull();
  });

  it("projects decreasing balance with sufficient payment", () => {
    const result = projectDebtPayoff({
      principalCents: 1200000n,
      apr: 0.06,
      minimumPaymentCents: 25000n,
      extraPaymentCents: 5000n,
    });
    expect(result.negativeAmortization).toBe(false);
    expect(result.payoffMonths).toBeGreaterThan(0);
    expect(result.months.length).toBeGreaterThan(0);
  });
});
