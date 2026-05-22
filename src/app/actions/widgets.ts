"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { WidgetMetricType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import { WidgetConfigSchema } from "@/lib/widgets/config-schema";
import { logAuditEvent, headersToAuditMeta } from "@/lib/audit";

const CreateWidgetSchema = z.object({
  title: z.string().min(1).max(80),
  metricType: z.nativeEnum(WidgetMetricType),
  config: WidgetConfigSchema,
});

export async function createWidgetAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const parsed = CreateWidgetSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid widget configuration." };
  }

  const count = await prisma.dashboardWidget.count({ where: { userId } });
  const hdrs = await headers();
  const meta = headersToAuditMeta(hdrs);

  await prisma.dashboardWidget.create({
    data: {
      userId,
      title: parsed.data.title,
      metricType: parsed.data.metricType,
      configJson: JSON.stringify(parsed.data.config),
      layoutOrder: count,
    },
  });

  await logAuditEvent({
    type: "WIDGET_CREATE",
    userId,
    context: { title: parsed.data.title },
    ...meta,
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings/widgets");
  return { success: true as const };
}

export async function deleteWidgetAction(widgetId: string) {
  const { userId } = await verifySession();
  await prisma.dashboardWidget.deleteMany({
    where: { id: widgetId, userId },
  });
  revalidatePath("/dashboard");
  revalidatePath("/settings/widgets");
  return { success: true as const };
}
