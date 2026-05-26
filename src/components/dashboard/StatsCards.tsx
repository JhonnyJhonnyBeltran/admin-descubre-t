import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: "orange" | "blue" | "soft";
  loading?: boolean;
}

export function KpiCard({ label, value, hint, icon, accent = "soft", loading }: KpiCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
        style={{
          background:
            accent === "orange"
              ? "linear-gradient(135deg,#ff6b35,#ff8f5c)"
              : accent === "blue"
                ? "linear-gradient(135deg,#3b82f6,#60a5fa)"
                : "var(--gradient-soft)",
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-2 truncate text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          )}
          {hint && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              accent === "orange" && "bg-orange-50 text-orange-600",
              accent === "blue" && "bg-blue-50 text-blue-600",
              accent === "soft" && "bg-muted text-foreground",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatsCardsProps {
  children: ReactNode;
}

export function StatsCards({ children }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {children}
    </div>
  );
}
