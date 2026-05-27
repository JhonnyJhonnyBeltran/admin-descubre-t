import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
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

function DonutCard({ title, values }: DistProps) {
  const data = useMemo(() => buildData(values), [values]);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <SectionCard title={title}>
      {total === 0 ? (
        <div className="flex h-56 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          Sin datos
        </div>
      ) : (
        <div className="h-64 w-full">
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
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(v: number) => [`${v} (${((v / total) * 100).toFixed(1)}%)`, "Total"]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
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
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <DonutCard title="Distribución por género" values={generos} />
      <DonutCard title="Distribución por edad" values={edadesRanges} />
      <DonutCard title="Distribución por centro" values={centros} />
    </div>
  );
}
