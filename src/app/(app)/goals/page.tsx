import { getGoalsDTO } from "@/lib/dal/goals";
import { createGoalAction } from "@/app/actions/goals";
import { formatUsdFromCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GoalsPage() {
  const goals = await getGoalsDTO();

  async function createGoal(formData: FormData) {
    "use server";
    await createGoalAction({
      name: String(formData.get("name")),
      targetCents: Math.round(parseFloat(String(formData.get("target"))) * 100),
      isRetirement: formData.get("retirement") === "on",
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Goals</h1>
      <form action={createGoal} className="max-w-md space-y-3 rounded-xl border border-border p-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target">Target (USD)</Label>
          <Input id="target" name="target" type="number" step="0.01" required />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="retirement" />
          Retirement goal
        </label>
        <Button type="submit">Add goal</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => (
          <Card key={g.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {g.name}
                {g.isRetirement && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (retirement)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {formatUsdFromCents(g.currentCents)} /{" "}
                {formatUsdFromCents(g.targetCents)}
              </p>
              <p className="text-sm text-muted-foreground">
                {g.progressPercent}% complete
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
