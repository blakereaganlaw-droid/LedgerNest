import Link from "next/link";
import { getProfileSettingsDTO } from "@/lib/dal/settings";
import { createPaycheckScheduleAction } from "@/app/actions/paycheck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ProfileSettingsPage() {
  const profile = await getProfileSettingsDTO();

  async function addPaycheck(formData: FormData) {
    "use server";
    const anchor = String(formData.get("anchorDate"));
    await createPaycheckScheduleAction({
      name: String(formData.get("name")),
      frequency: String(formData.get("frequency")) as
        | "WEEKLY"
        | "BIWEEKLY"
        | "SEMIMONTHLY"
        | "MONTHLY",
      anchorDate: new Date(anchor).toISOString(),
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Display name</dt>
          <dd>{profile.displayName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Timezone</dt>
          <dd>{profile.timezone}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Locale</dt>
          <dd>{profile.locale}</dd>
        </div>
      </dl>
      <div className="space-y-3">
        <h2 className="font-semibold">Paycheck schedule</h2>
        <p className="text-sm text-muted-foreground">
          Add active paychecks to power the dashboard countdown.
        </p>
        <form
          action={addPaycheck}
          className="max-w-md space-y-3 rounded-xl border border-border p-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input name="name" defaultValue="Primary paycheck" required />
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <select
              name="frequency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="BIWEEKLY"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Biweekly</option>
              <option value="SEMIMONTHLY">Semi-monthly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Anchor date</Label>
            <Input name="anchorDate" type="date" required />
          </div>
          <Button type="submit">Add paycheck</Button>
        </form>
      </div>
      <div className="space-y-3">
        <h2 className="font-semibold">Export</h2>
        <Button asChild variant="outline">
          <Link href="/api/export/json">Download JSON backup</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/api/export/csv">Download transactions CSV</Link>
        </Button>
      </div>
    </div>
  );
}
