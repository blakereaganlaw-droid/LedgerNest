import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardSummaryDTO } from "@/lib/dal/dashboard";
import { formatUsdFromCents } from "@/lib/utils";

export default async function DashboardPage() {
  const summary = await getDashboardSummaryDTO();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Household financial snapshot (America/New_York)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Next paycheck</CardTitle>
            <CardDescription>Nearest active schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {summary.daysUntilPaycheck ?? "—"}
              {summary.daysUntilPaycheck !== null && (
                <span className="text-lg font-normal text-muted-foreground">
                  {" "}
                  days
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This month income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {formatUsdFromCents(summary.monthIncomeCents)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This month spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {formatUsdFromCents(summary.monthSpendCents)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Left in plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {formatUsdFromCents(summary.monthRemainingCents)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings</CardTitle>
            <CardDescription>Goals excluding retirement</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {formatUsdFromCents(summary.savingsTotalCents)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retirement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {formatUsdFromCents(summary.retirementTotalCents)}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Debts</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {summary.debts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No debt plans yet.</p>
          ) : (
            summary.debts.map((debt) => (
              <Card key={debt.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{debt.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Principal: {formatUsdFromCents(debt.principalCents)}</p>
                  <p>APR: {debt.aprPercent.toFixed(2)}%</p>
                  {debt.negativeAmortization ? (
                    <p className="font-medium text-destructive">
                      Warning: payment does not cover interest (negative
                      amortization).
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Est. payoff:{" "}
                      {debt.payoffMonths
                        ? `${debt.payoffMonths} months`
                        : "—"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Upcoming recurring bills</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {summary.recurring.length === 0 ? (
            <p className="text-sm text-muted-foreground">None in the next 30 days.</p>
          ) : (
            summary.recurring.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between pt-5">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Due in {item.daysUntilDue} days
                    </p>
                  </div>
                  <p>{formatUsdFromCents(item.amountCents)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {summary.customWidgets.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Custom widgets</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {summary.customWidgets.map((w) => (
              <Card key={w.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{w.title}</CardTitle>
                  {w.subtitle && (
                    <CardDescription>{w.subtitle}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{w.displayValue}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
