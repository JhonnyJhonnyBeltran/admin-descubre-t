import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SectionCard } from "./SectionCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

// ── CentroCard: top 5 + modal con todos ─────────────────────────

const TOP_N = 5;
const OTROS_COLOR = "#e2e8f0";

function CentroCard({ centros }: { centros: (string | null)[] }) {
  const [open, setOpen] = useState(false);

  const allData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of centros) {
      const key = v?.trim() || "Sin indicar";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [centros]);

  const total = allData.reduce((s, d) => s + d.value, 0);
  const top = allData.slice(0, TOP_N);
  const restSum = allData.slice(TOP_N).reduce((s, d) => s + d.value, 0);
  const chartData = restSum > 0 ? [...top, { name: "Otros", value: restSum }] : top;
  const chartColors = [...COLORS.slice(0, TOP_N), OTROS_COLOR];
  const hasMore = allData.length > TOP_N;

  return (
    <>
      <SectionCard
        title="Distribución por centro"
        action={
          hasMore ? (
            <button
              onClick={() => setOpen(true)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Ver todos ({allData.length}) →
            </button>
          ) : undefined
        }
      >
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
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={chartColors[i] ?? COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const v = Number(payload[0]?.value ?? 0);
                      const pct = total ? ((v / total) * 100).toFixed(1) : "0.0";
                      const name = String(payload[0]?.payload?.name ?? "");
                      const color = String(payload[0]?.payload?.fill ?? payload[0]?.color ?? "#ff6b35");
                      return (
                        <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-lg">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <p className="font-medium text-foreground">{name}</p>
                          </div>
                          <p className="mt-1 text-muted-foreground">{v} · {pct}%</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* leyenda top 5 + Otros */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
              {chartData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: chartColors[i] ?? OTROS_COLOR }}
                  />
                  <span>{item.name}</span>
                  <span className="font-medium text-foreground">
                    ({((item.value / total) * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Modal con todos los centros */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Todos los centros</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto space-y-1 pr-2">
            {allData.map((item, i) => {
              const pct = total ? ((item.value / total) * 100).toFixed(1) : "0";
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-4 rounded-2xl px-4 py-3 hover:bg-muted/50"
                >
                  <span className="w-6 text-right text-sm text-muted-foreground font-mono">{i + 1}</span>
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="flex-1 text-base text-foreground">{item.name}</span>
                  <span className="text-base font-bold text-foreground">{item.value}</span>
                  <span className="w-14 text-right text-sm text-muted-foreground">{pct}%</span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────

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
    if (n > 18 && n <= 21) return "19-21";
    if (n > 21 && n <= 25) return "22-25";
    if (n > 25 && n <= 35) return "26-35";
    if (n > 35) return "+35";
    return "Sin indicar";
  };

  const edadesRanges = edades.map(mapAgeToRange);
  const ageOrder = ["Sin indicar", "16-18", "19-21", "22-25", "26-35", "+35"];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <DonutCard title="Distribución por género" values={generos} />
      <DonutCard
        title="Distribución por edad"
        values={edadesRanges}
        orderedKeys={ageOrder}
        orderedColors={["#e5e7eb", "#ff6b35", "#ff8f5c", "#f472b6", "#60a5fa", "#3b82f6"]}
      />
      <CentroCard centros={centros} />
    </div>
  );
}
