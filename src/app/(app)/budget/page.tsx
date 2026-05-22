import { getCurrentBudgetMonthDTO } from "@/lib/dal/budget";
import { publishBudgetMonthAction } from "@/app/actions/budget";
import { formatUsdFromCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function BudgetPage() {
  const now = new Date();
  const budget = await getCurrentBudgetMonthDTO(
    now.getFullYear(),
    now.getMonth() + 1,
  );

  async function publish() {
    "use server";
    await publishBudgetMonthAction({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budget</h1>
        <form action={publish}>
          <Button type="submit">Publish month</Button>
        </form>
      </div>
      <p className="text-sm text-muted-foreground">
        {now.toLocaleString("en-US", { month: "long", year: "numeric" })} —{" "}
        {budget?.status ?? "No budget yet"}
      </p>
      {budget && budget.lines.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Allocated</th>
                <th className="p-3 text-right">Rollover</th>
                <th className="p-3 text-right">Spent</th>
                <th className="p-3 text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {budget.lines.map((line) => (
                <tr key={line.id} className="border-t border-border">
                  <td className="p-3">{line.categoryName}</td>
                  <td className="p-3 text-right">
                    {formatUsdFromCents(line.allocatedCents)}
                  </td>
                  <td className="p-3 text-right">
                    {formatUsdFromCents(line.rolloverCents)}
                  </td>
                  <td className="p-3 text-right">
                    {formatUsdFromCents(line.spentCents)}
                  </td>
                  <td className="p-3 text-right">
                    {formatUsdFromCents(line.remainingCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted-foreground">
          Add budget lines via category assignments (publish creates the month record).
        </p>
      )}
    </div>
  );
}
