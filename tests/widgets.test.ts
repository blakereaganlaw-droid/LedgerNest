import { describe, it, expect } from "vitest";
import { WidgetConfigSchema } from "@/lib/widgets/config-schema";

describe("Widget config schema", () => {
  it("parses valid template config", () => {
    const result = WidgetConfigSchema.safeParse({
      datePreset: "this_month",
      excludeTransfers: true,
      displayFormat: "currency",
      showComparisonDelta: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects arbitrary keys via strict shape", () => {
    const result = WidgetConfigSchema.safeParse({
      datePreset: "this_month",
      excludeTransfers: true,
      displayFormat: "currency",
      showComparisonDelta: false,
      evilScript: "<script>",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("evilScript" in result.data).toBe(false);
    }
  });
});
