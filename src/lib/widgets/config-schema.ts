import { z } from "zod";

export const WidgetConfigSchema = z.object({
  datePreset: z.enum(["this_month", "last_month", "ytd", "custom"]),
  customStartDate: z.string().datetime().optional(),
  customEndDate: z.string().datetime().optional(),
  includeCategoryIds: z.array(z.string()).optional(),
  includeAccountIds: z.array(z.string()).optional(),
  excludeTransfers: z.boolean().default(true),
  displayFormat: z.enum(["currency", "percent", "count"]),
  showComparisonDelta: z.boolean().default(false),
});

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

export const WIDGET_TEMPLATES = [
  {
    id: "month_spend",
    title: "Category spend",
    metricType: "CATEGORY_SPEND" as const,
    defaultConfig: {
      datePreset: "this_month" as const,
      excludeTransfers: true,
      displayFormat: "currency" as const,
      showComparisonDelta: false,
    },
  },
  {
    id: "account_balance",
    title: "Account balance",
    metricType: "ACCOUNT_BALANCE" as const,
    defaultConfig: {
      datePreset: "this_month" as const,
      excludeTransfers: true,
      displayFormat: "currency" as const,
      showComparisonDelta: false,
    },
  },
  {
    id: "goal_progress",
    title: "Goal progress",
    metricType: "GOAL_PROGRESS" as const,
    defaultConfig: {
      datePreset: "this_month" as const,
      excludeTransfers: true,
      displayFormat: "percent" as const,
      showComparisonDelta: false,
    },
  },
] as const;
