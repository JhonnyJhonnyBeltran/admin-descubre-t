import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users, Ticket, Timer, Trophy, Building2, Smile } from "lucide-react";
import PageHeader from "@/components/dashboard/DashboardHeader";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { StatsCards, KpiCard } from "@/components/dashboard/StatsCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ResultsChart } from "@/components/dashboard/ResultsChart";
import { ProfileCharts } from "@/components/dashboard/ProfileCharts";
import { RecentSubmissionsTable } from "@/components/dashboard/RecentSubmissionsTable";
import { RaffleStatsCard } from "@/components/dashboard/RaffleStatsCard";
import { RawDataTable } from "@/components/dashboard/RawDataTable";
import { DashboardSkeleton, ErrorState } from "@/components/dashboard/States";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuizSubmissions, useRaffleEntries } from "@/hooks/useDashboardData";
import { useFilterContext } from "@/contexts/FilterContext";
import { useAuth } from "@/hooks/useAuth";
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
  const { filters, setFilters } = useFilterContext();
  const [activeTab, setActiveTab] = useState<"dashboard" | "raw">("dashboard");

  useEffect(() => {
    // Handle direct links with hash (e.g. /dashboard#ciclos, #perfiles, #datos)
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash) {
      const h = hash.replace("#", "");
      if (h === "datos" || h === "raw") {
        setActiveTab("raw");
      } else if (h === "dashboard") {
        setActiveTab("dashboard");
      }
      // try scroll to section
      setTimeout(() => {
        const el = document.getElementById(h);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/login", replace: true });
  }, [authLoading, session, navigate]);

  const quiz = useQuizSubmissions(filters, session);
  const allQuiz = useQuizSubmissions(EMPTY_FILTERS, session);
  const raffle = useRaffleEntries({ from: filters.from, to: filters.to }, session);

  const submissions = quiz.data ?? [];
  const allSubmissions = allQuiz.data ?? [];
  const entries = raffle.data ?? [];

  const kpis = useMemo(() => {
    const total = submissions.length;
    const totalRaffle = entries.length;
    const durations = submissions
      .map((s) => s.duration_seconds)
      .filter((d): d is number => typeof d === "number" && d > 0);
    const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
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
    const answered = submissions.filter((s) => s.satisfied !== null && s.satisfied !== undefined);
    const satisfied = answered.filter((s) => s.satisfied).length;

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
      satisfiedTotal: answered.length,
      satisfiedPct: answered.length ? satisfied / answered.length : null,
    };
  }, [submissions, entries]);

  if (authLoading || !session) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--gradient-soft)" }}>
        <DashboardSkeleton />
      </div>
    );
  }

  const isLoading = quiz.isLoading || raffle.isLoading;
  const error = quiz.error || raffle.error;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader title="Panel de estadísticas" subtitle="Resultados, perfiles y participación del cuestionario vocacional" />

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "dashboard" | "raw")}>

          {/* Filters apply to both tabs */}
          <div className="mt-4">
            <FiltersBar filters={filters} onChange={setFilters} submissions={submissions} allSubmissions={allSubmissions} />
          </div>

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
              {/* ── Dashboard tab ── */}
              <TabsContent value="dashboard" className="space-y-6 mt-4">
                <div id="inicio" />
                <StatsCards>
                  <KpiCard
                    label="Cuestionarios"
                    value={formatNumber(kpis.total)}
                    hint="Total en el rango"
                    icon={<Users className="h-5 w-5" />}
                    accent="orange"
                  />
                  <KpiCard
                    label="Satisfaccion"
                    value={kpis.satisfiedPct == null ? "—" : formatPercent(kpis.satisfiedPct)}
                    hint={
                      kpis.satisfiedTotal
                        ? `${formatNumber(kpis.satisfiedTotal)} respuestas`
                        : "Sin respuestas"
                    }
                    icon={<Smile className="h-5 w-5" />}
                    accent="orange"
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
                </StatsCards>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <ActivityChart
                    title="Cuestionarios completados"
                    description="Evolución de envíos en el tiempo"
                    dates={submissions.map((s) => s.created_at)}
                    from={filters.from}
                    to={filters.to}
                    color="orange"
                  />
                  <ActivityChart
                    title="Inscripciones al sorteo"
                    description="Evolución de participantes"
                    dates={entries.map((e) => e.created_at)}
                    from={filters.from}
                    to={filters.to}
                    color="blue"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <ResultsChart
                    title="Top 5 Mejores Resultados"
                    description="Ciclos formativos más frecuentes como primera opción"
                    values={submissions.map((s) => s.main_result)}
                    color="orange"
                  />
                  <ResultsChart
                    title="Top 5 Segundos Resultados"
                    description="Ciclos formativos más frecuentes como segunda opción"
                    values={submissions.map((s) => s.result_2)}
                    color="blue"
                  />
                  <ResultsChart
                    title="Top 5 Terceros Resultados"
                    description="Ciclos formativos más frecuentes como tercera opción"
                    values={submissions.map((s) => s.result_3)}
                    color="mix"
                  />
                </div>

                <section id="ciclos" />

                <ProfileCharts
                  generos={submissions.map((s) => s.genero)}
                  edades={submissions.map((s) => s.edad)}
                  centros={submissions.map((s) => s.centro)}
                />

                <section id="perfiles" />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
                  <div className="lg:col-span-2">
                    <RecentSubmissionsTable submissions={submissions} />
                  </div>
                  <RaffleStatsCard entries={entries} />
                </div>
              </TabsContent>

              {/* ── Datos crudos tab ── */}
              <TabsContent value="raw" className="mt-4">
                <div id="datos" />
                <RawDataTable submissions={submissions} entries={entries} />
              </TabsContent>
            </>
          )}
        </Tabs>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          CPIFP El Arenal · Panel interno de orientación vocacional
        </footer>
      </div>
    </div>
  );
}
