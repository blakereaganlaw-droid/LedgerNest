import "server-only";

import type { WidgetMetricType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import {
  WidgetConfigSchema,
  type WidgetConfig,
} from "@/lib/widgets/config-schema";
import { getGoalsDTO } from "@/lib/dal/goals";
import { getAccountsDTO } from "@/lib/dal/accounts";
import { getMonthTransactionRows } from "@/lib/dal/transactions";
import { sumMonthTotals } from "@/lib/finance/aggregates";
import { TRANSFER_GROUP_NAME } from "../../../prisma/data/category-taxonomy";

export type DashboardWidgetDTO = {
  id: string;
  title: string;
  metricType: WidgetMetricType;
  layoutOrder: number;
  config: WidgetConfig;
  displayValue: string;
  subtitle?: string;
};

async function resolveMetricValue(
  metricType: WidgetMetricType,
  config: WidgetConfig,
  userId: string,
): Promise<{ displayValue: string; subtitle?: string }> {
  const now = new Date();

  switch (metricType) {
    case "MONTH_INCOME":
    case "MONTH_SPEND":
    case "MONTH_REMAINING":
    case "CUSTOM_TOTAL": {
      const rows = await getMonthTransactionRows(userId, now);
      const mapped = rows.map((r) => ({
        type: r.type,
        amountCents: r.amountCents,
        groupSlug:
          r.category?.parent?.parent?.slug?.toUpperCase() ??
          (r.type === "TRANSFER" ? TRANSFER_GROUP_NAME : null),
      }));
      const totals = sumMonthTotals(
        mapped,
        TRANSFER_GROUP_NAME.toLowerCase(),
      );
      if (metricType === "MONTH_INCOME") {
        return {
          displayValue: formatCents(totals.incomeCents),
          subtitle: "This month",
        };
      }
      if (metricType === "MONTH_SPEND") {
        return {
          displayValue: formatCents(totals.spendCents),
          subtitle: "This month",
        };
      }
      const remaining = totals.incomeCents - totals.spendCents;
      return {
        displayValue: formatCents(remaining),
        subtitle: "Left in plan",
      };
    }
    case "ACCOUNT_BALANCE": {
      const accounts = await getAccountsDTO();
      const filtered = config.includeAccountIds?.length
        ? accounts.filter((a) => config.includeAccountIds?.includes(a.id))
        : accounts;
      const sum = filtered.reduce((s, a) => s + a.balanceCents, 0);
      return { displayValue: formatCents(BigInt(sum)) };
    }
    case "GOAL_PROGRESS": {
      const goals = await getGoalsDTO();
      const avg =
        goals.length > 0
          ? Math.round(
              goals.reduce((s, g) => s + g.progressPercent, 0) / goals.length,
            )
          : 0;
      return { displayValue: `${avg}%`, subtitle: "Average goal progress" };
    }
    case "CATEGORY_SPEND":
    default:
      return { displayValue: "—", subtitle: "Configure categories" };
  }
}

function formatCents(cents: bigint): string {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  return `${negative ? "-" : ""}$${(Number(abs) / 100).toFixed(2)}`;
}

export const getDashboardWidgetsDTO = async (): Promise<DashboardWidgetDTO[]> => {
  const { userId } = await verifySession();

  const widgets = await prisma.dashboardWidget.findMany({
    where: { userId },
    orderBy: { layoutOrder: "asc" },
  });

  const result: DashboardWidgetDTO[] = [];

  for (const w of widgets) {
    const parsed = WidgetConfigSchema.safeParse(JSON.parse(w.configJson));
    if (!parsed.success) continue;
    const metric = await resolveMetricValue(
      w.metricType,
      parsed.data,
      userId,
    );
    result.push({
      id: w.id,
      title: w.title,
      metricType: w.metricType,
      layoutOrder: w.layoutOrder,
      config: parsed.data,
      displayValue: metric.displayValue,
      subtitle: metric.subtitle,
    });
  }

  return result;
};
