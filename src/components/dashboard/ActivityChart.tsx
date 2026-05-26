import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, startOfDay, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { SectionCard } from "./SectionCard";

interface Props {
  title: string;
  description?: string;
  dates: string[]; // ISO datetimes
  color?: "orange" | "blue";
  allowWeekly?: boolean;
}

export function ActivityChart({ title, description, dates, color = "orange", allowWeekly = true }: Props) {
  const [granularity, setGranularity] = useState<"day" | "week">("day");

  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const iso of dates) {
      const d = new Date(iso);
      const bucket =
        granularity === "day" ? startOfDay(d) : startOfWeek(d, { weekStartsOn: 1 });
      const key = bucket.toISOString();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => ({
        date: key,
        label: format(new Date(key), granularity === "day" ? "d MMM" : "'Sem.' w", { locale: es }),
        value,
      }));
  }, [dates, granularity]);

  const stroke = color === "orange" ? "#ff6b35" : "#3b82f6";
  const fillId = `gradient-${color}`;

  return (
    <SectionCard
      title={title}
      description={description}
      action={
        allowWeekly && (
          <div className="inline-flex rounded-full border border-border bg-muted/40 p-1 text-xs">
            <button
              onClick={() => setGranularity("day")}
              className={`rounded-full px-3 py-1 transition ${
                granularity === "day" ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setGranularity("week")}
              className={`rounded-full px-3 py-1 transition ${
                granularity === "week" ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"
              }`}
            >
              Semana
            </button>
          </div>
        )
      }
    >
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stroke} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} fill={`url(#${fillId})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
      Sin datos en el rango seleccionado
    </div>
  );
}
