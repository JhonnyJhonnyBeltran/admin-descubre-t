import { useMemo } from "react";
import type { DashboardFilters } from "@/types/dashboard";
import type { QuizSubmission } from "@/types/dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";

interface Props {
  filters: DashboardFilters;
  onChange: (next: DashboardFilters) => void;
  submissions: QuizSubmission[];
}

function uniq(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort();
}

export function FiltersBar({ filters, onChange, submissions }: Props) {
  const options = useMemo(
    () => ({
      centros: uniq(submissions.map((s) => s.centro)),
      generos: uniq(submissions.map((s) => s.genero)),
      edades: uniq(submissions.map((s) => s.edad)),
      results: uniq(submissions.map((s) => s.main_result)),
    }),
    [submissions],
  );

  const set = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const hasAny = Object.values(filters).some((v) => v !== null && v !== "");

  const selectCls =
    "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Filtros globales</h2>
        </div>
        {hasAny && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                from: null,
                to: null,
                centro: null,
                genero: null,
                edad: null,
                main_result: null,
              })
            }
          >
            <X className="mr-1 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Desde</Label>
          <Input
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => set("from", e.target.value || null)}
            className="rounded-xl"
          />
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Hasta</Label>
          <Input
            type="date"
            value={filters.to ?? ""}
            onChange={(e) => set("to", e.target.value || null)}
            className="rounded-xl"
          />
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Centro</Label>
          <select
            className={selectCls}
            value={filters.centro ?? ""}
            onChange={(e) => set("centro", e.target.value || null)}
          >
            <option value="">Todos</option>
            {options.centros.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Género</Label>
          <select
            className={selectCls}
            value={filters.genero ?? ""}
            onChange={(e) => set("genero", e.target.value || null)}
          >
            <option value="">Todos</option>
            {options.generos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Edad</Label>
          <select
            className={selectCls}
            value={filters.edad ?? ""}
            onChange={(e) => set("edad", e.target.value || null)}
          >
            <option value="">Todas</option>
            {options.edades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Resultado</Label>
          <select
            className={selectCls}
            value={filters.main_result ?? ""}
            onChange={(e) => set("main_result", e.target.value || null)}
          >
            <option value="">Todos</option>
            {options.results.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
