import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { RawDataTable } from "@/components/dashboard/RawDataTable";
import PageHeader from "@/components/dashboard/DashboardHeader";
import { useQuizSubmissions, useRaffleEntries } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSkeleton, ErrorState } from "@/components/dashboard/States";

export const Route = createFileRoute("/datos")({
  head: () => ({ meta: [{ title: "Datos crudos · CPIFP El Arenal" }] }),
  component: DatosPage,
});

function DatosPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/login", replace: true });
  }, [authLoading, session, navigate]);

  const quiz = useQuizSubmissions(undefined, session);
  const raffle = useRaffleEntries(undefined, session);

  const submissions = quiz.data ?? [];
  const entries = raffle.data ?? [];

  const isLoading = quiz.isLoading || raffle.isLoading;
  const error = quiz.error || raffle.error;

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
        <PageHeader title="Datos crudos" subtitle="Exportación y análisis en crudo" />
        {!isSupabaseConfigured && (
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <strong className="font-semibold">Supabase no configurado.</strong> Comprueba que las variables
            de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén definidas y que el anon key tenga
            permiso de lectura sobre la tabla <em>quiz_submissions</em>.
          </div>
        )}
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
          <RawDataTable submissions={submissions} entries={entries} />
        )}
      </div>
    </div>
  );
}

export default Route;
