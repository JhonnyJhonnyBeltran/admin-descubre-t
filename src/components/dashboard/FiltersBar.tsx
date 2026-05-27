import { useMemo, useState } from "react";
import type { DashboardFilters } from "@/types/dashboard";
import type { QuizSubmission } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Filter, X, CalendarIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  filters: DashboardFilters;
  onChange: (next: DashboardFilters) => void;
  submissions: QuizSubmission[];
  allSubmissions?: QuizSubmission[];
}

function uniq(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort();
}

export function FiltersBar({ filters, onChange, submissions, allSubmissions }: Props) {
  const source = allSubmissions && allSubmissions.length ? allSubmissions : submissions;

  const mapAgeToRange = (ageRaw: string | null) => {
    if (!ageRaw) return "Sin indicar";
    const n = Number(ageRaw);
    if (n >= 16 && n <= 18) return "16-18";
    if (n > 18 && n <= 21) return "18-21";
    if (n > 21 && n <= 25) return "21-25";
    if (n > 25 && n <= 35) return "25-35";
    if (n > 35) return "+35";
    return "Sin indicar";
  };

  const options = useMemo(
    () => {
      const order = ["16-18", "18-21", "21-25", "25-35", "+35"];
      const edadesRaw = uniq(source.map((s) => mapAgeToRange(s.edad)));
      edadesRaw.sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        const na = ia === -1 ? order.length : ia;
        const nb = ib === -1 ? order.length : ib;
        return na - nb || a.localeCompare(b);
      });

      return {
        centros: uniq(source.map((s) => s.centro)),
        generos: uniq(source.map((s) => s.genero)),
        edades: edadesRaw,
        results: uniq(source.map((s) => s.main_result)),
      };
    },
    [source],
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
              onChange({ from: null, to: null, centro: null, genero: null, edad: null, main_result: null })
            }
          >
            <X className="mr-1 h-4 w-4" />
            Limpiar todo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Desde</Label>
          <DatePicker
            value={filters.from}
            onChange={(v) => set("from", v)}
          />
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Hasta</Label>
          <DatePicker
            value={filters.to}
            onChange={(v) => set("to", v)}
          />
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Centro</Label>
          <Select value={filters.centro ?? "__all__"} onValueChange={(v) => set("centro", v === "__all__" ? null : v)}>
            <SelectTrigger className={selectCls}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {options.centros.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Género</Label>
          <Select value={filters.genero ?? "__all__"} onValueChange={(v) => set("genero", v === "__all__" ? null : v)}>
            <SelectTrigger className={selectCls}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {options.generos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Edad</Label>
          <Select value={filters.edad ?? "__all__"} onValueChange={(v) => set("edad", v === "__all__" ? null : v)}>
            <SelectTrigger className={selectCls}>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {options.edades.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 text-xs text-muted-foreground">Resultado</Label>
          <Select value={filters.main_result ?? "__all__"} onValueChange={(v) => set("main_result", v === "__all__" ? null : v)}>
            <SelectTrigger className={selectCls}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {options.results.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function DatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  const parsed = value ? new Date(value + "T12:00:00") : null;
  const todayFormatted = format(new Date(), "dd/MM/yyyy", { locale: es });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={[
            "flex h-10 w-full items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm shadow-sm transition-colors",
            "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring",
            parsed ? "text-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <span className="flex-1 text-left">
            {parsed ? format(parsed, "dd/MM/yyyy", { locale: es }) : todayFormatted}
          </span>
          {parsed && (
            <X
              className="h-3.5 w-3.5 shrink-0 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parsed ?? undefined}
          onSelect={(d) => {
            if (!d) return;
            onChange(format(d, "yyyy-MM-dd"));
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
