"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWidgetAction } from "@/app/actions/widgets";
import { WIDGET_TEMPLATES } from "@/lib/widgets/config-schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function WidgetForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const templateId = String(fd.get("template"));
    const template = WIDGET_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      setError("Invalid template");
      return;
    }
    const res = await createWidgetAction({
      title: template.title,
      metricType: template.metricType,
      config: template.defaultConfig,
    });
    if (!res.success) setError(res.error ?? "Failed");
    else router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border p-4">
      <div className="space-y-2">
        <Label>Template</Label>
        <select
          name="template"
          className="flex h-10 w-full rounded-md border border-border bg-muted px-3 text-sm"
        >
          {WIDGET_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit">Add widget</Button>
    </form>
  );
}
