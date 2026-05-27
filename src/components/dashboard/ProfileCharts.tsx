import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SectionCard } from "./SectionCard";

interface DistProps {
  title: string;
  values: (string | null)[];
}

const COLORS = ["#ff6b35", "#3b82f6", "#ff8f5c", "#60a5fa", "#fcd34d", "#34d399", "#a78bfa", "#f472b6"];

function buildData(values: (string | null)[]) {
  const counts = new Map<string, number>();
  for (const v of values) {
    const key = v ?? "Sin indicar";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function DonutCard({ title, values, orderedKeys, orderedColors }: DistProps & { orderedKeys?: string[]; orderedColors?: string[] }) {
  const data = useMemo(() => {
    if (orderedKeys && orderedKeys.length) {
      const counts = new Map<string, number>();
      for (const v of values) {
        const key = v ?? "Sin indicar";
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return orderedKeys.map((k) => ({ name: k, value: counts.get(k) ?? 0 }));
    }
    return buildData(values);
  }, [values, orderedKeys]);

  const total = data.reduce((s, d) => s + d.value, 0);
  const legendItems = data.map((item, i) => ({
    name: item.name,
    color: orderedColors?.[i] ?? COLORS[i % COLORS.length],
  }));

  return (
    <SectionCard title={title}>
      {total === 0 ? (
        <div className="flex h-56 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          Sin datos
        </div>
      ) : (
        <div className="space-y-3">
          <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      orderedColors && orderedColors[i]
                        ? orderedColors[i]
                        : COLORS[i % COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.08)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const value = Number(payload[0]?.value ?? 0);
                  const pct = total ? ((value / total) * 100).toFixed(1) : "0.0";
                  const category =
                    String(payload[0]?.name ?? payload[0]?.payload?.name ?? label ?? "Sin indicar");
                  const color = String(payload[0]?.color ?? payload[0]?.payload?.fill ?? "#ff6b35");

                  return (
                    <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-lg">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <p className="font-medium text-foreground">{category}</p>
                      </div>
                      <p className="mt-1 text-muted-foreground">{`${value} · ${pct}%`}</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>

          <div className="max-h-28 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] leading-4 text-muted-foreground">
              {legendItems.map((item) => (
                <div key={item.name} className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

interface Props {
  generos: (string | null)[];
  edades: (string | null)[];
  centros: (string | null)[];
}

export function ProfileCharts({ generos, edades, centros }: Props) {
  const mapAgeToRange = (ageRaw: string | null) => {
    if (!ageRaw) return "Sin indicar";
    const n = Number(ageRaw);
    if (Number.isNaN(n)) return "Sin indicar";
    if (n >= 16 && n <= 18) return "16-18";
    if (n > 18 && n <= 21) return "18-21";
    if (n > 21 && n <= 25) return "21-25";
    if (n > 25 && n <= 35) return "25-35";
    if (n > 35) return "+35";
    return "Sin indicar";
  };

  const edadesRanges = edades.map(mapAgeToRange);
  const ageOrder = ["Sin indicar", "16-18", "18-21", "21-25", "25-35", "+35"];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <DonutCard title="Distribución por género" values={generos} />
      <DonutCard
        title="Distribución por edad"
        values={edadesRanges}
        orderedKeys={ageOrder}
        orderedColors={["#e5e7eb", "#ff6b35", "#ff8f5c", "#f472b6", "#60a5fa", "#3b82f6"]}
      />
      <DonutCard title="Distribución por centro" values={centros} />
    </div>
  );
}
