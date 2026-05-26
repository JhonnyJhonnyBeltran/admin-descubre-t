import { GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  username?: string | null;
  onSignOut?: () => void;
}

export function DashboardHeader({ username, onSignOut }: Props) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-soft)" }}
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-elevated)]"
            style={{ background: "var(--gradient-brand)" }}
          >
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              CPIFP El Arenal · Orientación vocacional
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Panel de estadísticas
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Resultados, perfiles y participación del cuestionario vocacional
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {username && (
            <div className="hidden text-right md:block">
              <p className="text-xs text-muted-foreground">Sesión</p>
              <p className="text-sm font-medium text-foreground">{username}</p>
            </div>
          )}
          {onSignOut && (
            <Button variant="outline" size="sm" onClick={onSignOut} className="rounded-full">
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
