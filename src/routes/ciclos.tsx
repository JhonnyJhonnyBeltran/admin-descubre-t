import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ResultsChart } from "@/components/dashboard/ResultsChart";
import PageHeader from "@/components/dashboard/DashboardHeader";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { useQuizSubmissions } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { EMPTY_FILTERS, type DashboardFilters } from "@/types/dashboard";
import { useFilterContext } from "@/contexts/FilterContext";
import { DashboardSkeleton, ErrorState } from "@/components/dashboard/States";
import TopResultsTable from "@/components/dashboard/TopResultsTable";

export const Route = createFileRoute("/ciclos")({
  head: () => ({
    meta: [{ title: "Ciclos formativos · CPIFP El Arenal" }],
  }),
  component: CiclosPage,
});

function CiclosPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const { filters, setFilters } = useFilterContext();
  const [selectedTop, setSelectedTop] = useState<"main_result" | "result_2" | "result_3">(
    "main_result",
  );

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/login", replace: true });
  }, [authLoading, session, navigate]);

  const quiz = useQuizSubmissions(filters, session);
  const submissions = quiz.data ?? [];

  const isLoading = quiz.isLoading;
  const error = quiz.error;

  if (authLoading || !session) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--gradient-soft)" }}>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader title="Ciclos formativos" subtitle="Estadísticas por ciclos" />
        <div className="mt-0">
          <FiltersBar filters={filters} onChange={setFilters} submissions={submissions} allSubmissions={[]} />
        </div>

        {error ? (
          <ErrorState message={(error as Error).message} onRetry={() => quiz.refetch()} />
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ResultsChart
                title="Top 5 Mejores Resultados"
                description="Ciclos formativos más frecuentes como primera opción"
                values={submissions.map((s) => s.main_result)}
                color="orange"
                showAction={false}
              />
              <ResultsChart
                title="Top 5 Segundos Resultados"
                description="Ciclos formativos más frecuentes como segunda opción"
                values={submissions.map((s) => s.result_2)}
                color="blue"
                showAction={false}
              />
              <ResultsChart
                title="Top 5 Terceros Resultados"
                description="Ciclos formativos más frecuentes como tercera opción"
                values={submissions.map((s) => s.result_3)}
                color="mix"
                showAction={false}
              />
            </div>

            <TopResultsTable
              submissions={submissions}
              selectedKey={selectedTop}
              onSelectedKeyChange={setSelectedTop}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Route;
