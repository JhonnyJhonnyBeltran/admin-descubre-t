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
import { format, startOfDay, startOfWeek, addDays, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { SectionCard } from "./SectionCard";

interface Props {
  title: string;
  description?: string;
  dates: string[]; // ISO datetimes
  color?: "orange" | "blue";
  allowWeekly?: boolean;
  from?: string | null; // ISO date yyyy-mm-dd
  to?: string | null;
}

export function ActivityChart({ title, description, dates, color = "orange", allowWeekly = true, from, to }: Props) {
  const [granularity, setGranularity] = useState<"day" | "week">("day");

  const data = useMemo(() => {
    // parse and count
    const counts = new Map<string, number>();
    const parsed: Date[] = [];
    for (const iso of dates) {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) continue;
      const bucket = granularity === "day" ? startOfDay(d) : startOfWeek(d, { weekStartsOn: 1 });
      const key = bucket.toISOString();
      counts.set(key, (counts.get(key) ?? 0) + 1);
      parsed.push(d);
    }

    // determine range using provided from/to or parsed dates
    let start: Date | null = null;
    let end: Date | null = null;

    if (from) {
      const f = new Date(from);
      if (!Number.isNaN(f.getTime())) start = granularity === "day" ? startOfDay(f) : startOfWeek(f, { weekStartsOn: 1 });
    }
    if (to) {
      const t = new Date(to);
      if (!Number.isNaN(t.getTime())) end = granularity === "day" ? startOfDay(t) : startOfWeek(t, { weekStartsOn: 1 });
    }

    if (parsed.length && start === null) start = granularity === "day" ? startOfDay(new Date(Math.min(...parsed.map((d) => d.getTime())))) : startOfWeek(new Date(Math.min(...parsed.map((d) => d.getTime()))), { weekStartsOn: 1 });
    if (parsed.length && end === null) end = granularity === "day" ? startOfDay(new Date(Math.max(...parsed.map((d) => d.getTime())))) : startOfWeek(new Date(Math.max(...parsed.map((d) => d.getTime()))), { weekStartsOn: 1 });

    if (start === null || end === null) return [];

    // build full series between start and end
    const series: { date: string; label: string; value: number }[] = [];
    let cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
      const key = cursor.toISOString();
      const value = counts.get(key) ?? 0;
      series.push({
        date: key,
        label: format(new Date(key), granularity === "day" ? "d MMM" : "'Sem.' w", { locale: es }),
        value,
      });
      cursor = granularity === "day" ? addDays(cursor, 1) : addWeeks(cursor, 1);
    }

    return series;
  }, [dates, granularity, from, to]);

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
