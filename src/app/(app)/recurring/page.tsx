import { getUpcomingRecurringDTO } from "@/lib/dal/recurring";
import { createRecurringAction } from "@/app/actions/recurring";
import { formatUsdFromCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function RecurringPage() {
  const items = await getUpcomingRecurringDTO(60);

  async function createRecurring(formData: FormData) {
    "use server";
    const due = String(formData.get("nextDueDate"));
    await createRecurringAction({
      name: String(formData.get("name")),
      amountCents: Math.round(parseFloat(String(formData.get("amount"))) * 100),
      frequency: String(formData.get("frequency")) as
        | "WEEKLY"
        | "BIWEEKLY"
        | "MONTHLY"
        | "QUARTERLY"
        | "YEARLY",
      nextDueDate: new Date(due).toISOString(),
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Recurring</h1>
      <p className="text-sm text-muted-foreground">Bills due in the next 60 days.</p>
      <form
        action={createRecurring}
        className="max-w-md space-y-3 rounded-xl border border-border p-4"
      >
        <div className="space-y-2">
          <Label>Name</Label>
          <Input name="name" required />
        </div>
        <div className="space-y-2">
          <Label>Amount (USD)</Label>
          <Input name="amount" type="number" step="0.01" required />
        </div>
        <div className="space-y-2">
          <Label>Frequency</Label>
          <select
            name="frequency"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="MONTHLY"
          >
            <option value="WEEKLY">Weekly</option>
            <option value="BIWEEKLY">Biweekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Next due date</Label>
          <Input name="nextDueDate" type="date" required />
        </div>
        <Button type="submit">Add recurring bill</Button>
      </form>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-muted-foreground">No recurring items.</li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.frequency} · due in {item.daysUntilDue} days
                </p>
              </div>
              <p>{formatUsdFromCents(item.amountCents)}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
