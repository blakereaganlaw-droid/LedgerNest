"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DebtChartPoint = {
  month: number;
  balanceDollars: number;
};

export function DebtChart({
  title,
  data,
}: {
  title: string;
  data: DebtChartPoint[];
}) {
  if (data.length === 0) return null;

  return (
    <div className="h-48 w-full">
      <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) =>
              `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            }
          />
          <Line
            type="monotone"
            dataKey="balanceDollars"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
