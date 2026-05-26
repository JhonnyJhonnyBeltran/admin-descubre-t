import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Ticket,
  Timer,
  Trophy,
  Building2,
  Layers,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { StatsCards, KpiCard } from "@/components/dashboard/StatsCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ResultsChart } from "@/components/dashboard/ResultsChart";
import { ProfileCharts } from "@/components/dashboard/ProfileCharts";
import { RecentSubmissionsTable } from "@/components/dashboard/RecentSubmissionsTable";
import { RaffleStatsCard } from "@/components/dashboard/RaffleStatsCard";
import { DashboardSkeleton, ErrorState } from "@/components/dashboard/States";
import { useQuizSubmissions, useRaffleEntries } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { EMPTY_FILTERS, type DashboardFilters } from "@/types/dashboard";
import { formatDuration, formatNumber, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Panel de estadísticas · CPIFP El Arenal" },
      {
        name: "description",
        content:
          "Dashboard interno con estadísticas del cuestionario de orientación vocacional de CPIFP El Arenal.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, signOut, user } = useAuth();
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);

  const demoMode = !isSupabaseConfigured;
  const authed = Boolean(session) || demoMode;

  useEffect(() => {
    if (!authLoading && !authed) navigate({ to: "/login", replace: true });
  }, [authLoading, authed, navigate]);

  const quiz = useQuizSubmissions(filters, authed);
  const raffle = useRaffleEntries(
    { from: filters.from, to: filters.to },
    authed,
  );

  const submissions = quiz.data ?? [];
  const entries = raffle.data ?? [];

  const kpis = useMemo(() => {
    const total = submissions.length;
    const totalRaffle = entries.length;
    const durations = submissions
      .map((s) => s.duration_seconds)
      .filter((d): d is number => typeof d === "number" && d > 0);
    const avg = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : null;
    const min = durations.length ? Math.min(...durations) : null;
    const max = durations.length ? Math.max(...durations) : null;

    const counts = (key: "main_result" | "centro") => {
      const map = new Map<string, number>();
      for (const s of submissions) {
        const v = s[key];
        if (!v) continue;
        map.set(v, (map.get(v) ?? 0) + 1);
      }
      return Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    };

    const withSecond = submissions.filter((s) => s.result_2).length;
    const withThird = submissions.filter((s) => s.result_3).length;

    return {
      total,
      totalRaffle,
      avg,
      min,
      max,
      topResult: counts("main_result"),
      topCentro: counts("centro"),
      pctSecond: total ? withSecond / total : 0,
      pctThird: total ? withThird / total : 0,
    };
  }, [submissions, entries]);

  if (authLoading || (!authed && !demoMode)) {
    return (
      <div
        className="min-h-screen p-4 md:p-8"
        style={{ background: "var(--gradient-soft)" }}
      >
        <DashboardSkeleton />
      </div>
    );
  }

  const isLoading = quiz.isLoading || raffle.isLoading;
  const error = quiz.error || raffle.error;

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader
          email={user?.email}
          onSignOut={
            session
              ? async () => {
                  await signOut();
                  navigate({ to: "/login" });
                }
              : undefined
          }
          demoMode={demoMode}
        />

        <FiltersBar
          filters={filters}
          onChange={setFilters}
          submissions={submissions}
        />

        {error ? (
          <ErrorState
            message={(error as Error).message}
            onRetry={() => {
              quiz.refetch();
              raffle.refetch();
            }}
          />
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <StatsCards>
              <KpiCard
                label="Cuestionarios"
                value={formatNumber(kpis.total)}
                hint="Total en el rango"
                icon={<Users className="h-5 w-5" />}
                accent="orange"
              />
              <KpiCard
                label="Sorteo"
                value={formatNumber(kpis.totalRaffle)}
                hint="Inscripciones"
                icon={<Ticket className="h-5 w-5" />}
                accent="blue"
              />
              <KpiCard
                label="Duración media"
                value={formatDuration(kpis.avg)}
                hint={
                  kpis.min != null && kpis.max != null
                    ? `min ${formatDuration(kpis.min)} · máx ${formatDuration(kpis.max)}`
                    : undefined
                }
                icon={<Timer className="h-5 w-5" />}
              />
              <KpiCard
                label="Resultado más frecuente"
                value={kpis.topResult ?? "—"}
                icon={<Trophy className="h-5 w-5" />}
                accent="orange"
              />
              <KpiCard
                label="Centro más frecuente"
                value={kpis.topCentro ?? "—"}
                icon={<Building2 className="h-5 w-5" />}
                accent="blue"
              />
              <KpiCard
                label="Con 2º / 3º resultado"
                value={`${formatPercent(kpis.pctSecond)} · ${formatPercent(kpis.pctThird)}`}
                hint="% del total"
                icon={<Layers className="h-5 w-5" />}
              />
            </StatsCards>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ActivityChart
                title="Cuestionarios completados"
                description="Evolución de envíos en el tiempo"
                dates={submissions.map((s) => s.created_at)}
                color="orange"
              />
              <ActivityChart
                title="Inscripciones al sorteo"
                description="Evolución de participantes"
                dates={entries.map((e) => e.created_at)}
                color="blue"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ResultsChart
                title="Ranking · resultado principal"
                description="Top 8 vocaciones"
                values={submissions.map((s) => s.main_result)}
                color="orange"
              />
              <ResultsChart
                title="Ranking · 2º resultado"
                values={submissions.map((s) => s.result_2)}
                color="blue"
              />
              <ResultsChart
                title="Ranking · 3º resultado"
                values={submissions.map((s) => s.result_3)}
                color="mix"
              />
            </div>

            <ProfileCharts
              generos={submissions.map((s) => s.genero)}
              edades={submissions.map((s) => s.edad)}
              centros={submissions.map((s) => s.centro)}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentSubmissionsTable submissions={submissions} />
              </div>
              <RaffleStatsCard entries={entries} />
            </div>
          </>
        )}

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          CPIFP El Arenal · Panel interno de orientación vocacional
        </footer>
      </div>
    </div>
  );
}
