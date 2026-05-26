import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SectionCard } from "./SectionCard";

interface Props {
  title: string;
  description?: string;
  values: (string | null)[];
  topN?: number;
  color?: "orange" | "blue" | "mix";
  horizontal?: boolean;
}

const PALETTE = ["#ff6b35", "#ff8f5c", "#3b82f6", "#60a5fa", "#ffb088", "#93c5fd", "#fcd34d", "#34d399"];

export function ResultsChart({
  title,
  description,
  values,
  topN = 8,
  color = "mix",
  horizontal = true,
}: Props) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of values) {
      if (!v) continue;
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, topN);
  }, [values, topN]);

  return (
    <SectionCard title={title} description={description}>
      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          Sin datos disponibles
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout={horizontal ? "vertical" : "horizontal"}
              margin={{ top: 4, right: 16, left: horizontal ? 0 : -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" horizontal={!horizontal} vertical={horizontal} />
              {horizontal ? (
                <>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#374151" }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                </>
              )}
              <Tooltip
                cursor={{ fill: "rgba(255,107,53,0.06)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      color === "orange"
                        ? "#ff6b35"
                        : color === "blue"
                          ? "#3b82f6"
                          : PALETTE[i % PALETTE.length]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
