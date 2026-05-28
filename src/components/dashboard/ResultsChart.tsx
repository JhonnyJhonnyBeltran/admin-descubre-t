import { useMemo } from "react";
import { SectionCard } from "./SectionCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

interface Props {
  title: string;
  description?: string;
  values: (string | null)[];
  color?: "orange" | "blue" | "mix";
  showAction?: boolean;
}

const ORANGE = "#ff6b35";
const BLUE = "#3b82f6";
const MIX_COLORS = ["#ff6b35", "#3b82f6", "#ff8f5c", "#60a5fa", "#f472b6"];

function buildCounts(values: (string | null)[]) {
  const map = new Map<string, number>();
  for (const v of values) {
    const key = v ?? "Sin indicar";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const arr = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  arr.sort((a, b) => b.value - a.value);
  return arr;
}

export function ResultsChart({
  title,
  description,
  values,
  color = "orange",
  showAction = true,
}: Props) {
  const data = useMemo(() => buildCounts(values), [values]);
  const total = data.reduce((s, d) => s + d.value, 0);
  const top = data.slice(0, 5);

  const barColor = (idx: number) => {
    if (color === "orange") return ORANGE;
    if (color === "blue") return BLUE;
    return MIX_COLORS[idx % MIX_COLORS.length];
  };

  return (
    <Dialog>
      <SectionCard
        title={title}
        description={description}
        action={
          showAction ? (
            <DialogTrigger asChild>
              <button className="rounded-md px-3 py-1 text-sm font-medium text-primary hover:underline">
                Ver todo
              </button>
            </DialogTrigger>
          ) : undefined
        }
      >
      {total === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          Sin datos en el rango seleccionado
        </div>
      ) : (
        <div className="space-y-3">
          {top.map((row, idx) => {
            const pct = Math.round((row.value / total) * 100);
            return (
              <div key={row.name} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                    <p className="ml-3 text-xs text-muted-foreground">{row.value}</p>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, background: barColor(idx) }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-xs text-muted-foreground">{pct}%</div>
              </div>
            );
          })}
        </div>
      )}
      </SectionCard>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ranking completo - {title}</DialogTitle>
          <DialogDescription className="mb-2">Total: {total} elementos</DialogDescription>
        </DialogHeader>

        {total === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-md bg-muted/40 text-sm text-muted-foreground">
            Sin datos en el rango seleccionado
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-auto pr-2">
            {data.map((row, idx) => {
              const pct = Math.round((row.value / total) * 100);
              return (
                <div key={row.name} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                      <p className="ml-3 text-xs text-muted-foreground">{row.value}</p>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${pct}%`, background: barColor(idx) }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-xs text-muted-foreground">{pct}%</div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ResultsChart;
