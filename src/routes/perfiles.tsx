import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ProfileCharts } from "@/components/dashboard/ProfileCharts";
import PageHeader from "@/components/dashboard/DashboardHeader";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { useQuizSubmissions } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { EMPTY_FILTERS, type DashboardFilters } from "@/types/dashboard";
import { DashboardSkeleton, ErrorState } from "@/components/dashboard/States";
import { useFilterContext } from "@/contexts/FilterContext";

export const Route = createFileRoute("/perfiles")({
  head: () => ({ meta: [{ title: "Perfiles · CPIFP El Arenal" }] }),
  component: PerfilesPage,
});

function PerfilesPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const { filters, setFilters } = useFilterContext();

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
        <PageHeader title="Perfiles" subtitle="Distribución por género, edad y centro" />
        <div className="mt-0">
          <FiltersBar filters={filters} onChange={setFilters} submissions={submissions} allSubmissions={[]} />
        </div>

        {error ? (
          <ErrorState message={(error as Error).message} onRetry={() => quiz.refetch()} />
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            <ProfileCharts
              generos={submissions.map((s) => s.genero)}
              edades={submissions.map((s) => s.edad)}
              centros={submissions.map((s) => s.centro)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Route;
