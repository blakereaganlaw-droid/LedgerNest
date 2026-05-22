import { getDashboardWidgetsDTO } from "@/lib/dal/widgets";
import { WidgetForm } from "@/components/widget-form";
import { deleteWidgetAction } from "@/app/actions/widgets";
import { Button } from "@/components/ui/button";

export default async function WidgetsSettingsPage() {
  const widgets = await getDashboardWidgetsDTO();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard widgets</h1>
      <p className="text-sm text-muted-foreground">
        Add widgets from predefined templates with Zod-validated configuration.
      </p>
      <WidgetForm />
      <ul className="space-y-2">
        {widgets.map((w) => (
          <li
            key={w.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium">{w.title}</p>
              <p className="text-sm text-muted-foreground">{w.metricType}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await deleteWidgetAction(w.id);
              }}
            >
              <Button type="submit" variant="destructive" size="sm">
                Remove
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
