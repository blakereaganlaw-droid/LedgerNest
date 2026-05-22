import { getDebtPlansDTO } from "@/lib/dal/debts";
import { createDebtAction } from "@/app/actions/debts";
import { DebtChart } from "@/components/debt-chart";
import { formatUsdFromCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DebtsPage() {
  const debts = await getDebtPlansDTO();

  async function createDebt(formData: FormData) {
    "use server";
    await createDebtAction({
      name: String(formData.get("name")),
      principalCents: Math.round(
        parseFloat(String(formData.get("principal"))) * 100,
      ),
      aprPercent: parseFloat(String(formData.get("apr"))),
      minimumPaymentCents: Math.round(
        parseFloat(String(formData.get("payment"))) * 100,
      ),
      extraPaymentCents: 0,
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Debts</h1>
      <form action={createDebt} className="max-w-md space-y-3 rounded-xl border border-border p-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input name="name" required />
        </div>
        <div className="space-y-2">
          <Label>Principal (USD)</Label>
          <Input name="principal" type="number" step="0.01" required />
        </div>
        <div className="space-y-2">
          <Label>APR %</Label>
          <Input name="apr" type="number" step="0.01" required />
        </div>
        <div className="space-y-2">
          <Label>Minimum payment (USD)</Label>
          <Input name="payment" type="number" step="0.01" required />
        </div>
        <Button type="submit">Add debt</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {debts.map((d) => (
          <Card key={d.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{d.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>{formatUsdFromCents(d.principalCents)} @ {d.aprPercent}%</p>
              {d.negativeAmortization ? (
                <p className="text-destructive font-medium">
                  Negative amortization warning
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Payoff ~{d.payoffMonths ?? "?"} months
                </p>
              )}
              {!d.negativeAmortization && d.chartPoints.length > 0 && (
                <DebtChart title="Balance trajectory" data={d.chartPoints} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
