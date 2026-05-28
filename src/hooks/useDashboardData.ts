import { useQuery } from "@tanstack/react-query";
import {
  fetchQuizSubmissions,
  fetchRaffleEntries,
} from "@/services/dashboardService";
import type { DashboardFilters } from "@/types/dashboard";
import { EMPTY_FILTERS } from "@/types/dashboard";

export function useQuizSubmissions(filters?: DashboardFilters, enabled = true) {
  const f = filters ?? EMPTY_FILTERS;
  return useQuery({
    queryKey: ["quiz_submissions", f],
    queryFn: () => fetchQuizSubmissions(f),
    enabled,
    staleTime: 30_000,
  });
}

export function useRaffleEntries(
  filters?: Pick<DashboardFilters, "from" | "to">,
  enabled = true,
) {
  const f = filters ?? { from: (EMPTY_FILTERS as any).from, to: (EMPTY_FILTERS as any).to };
  return useQuery({
    queryKey: ["raffle_entries", f],
    queryFn: () => fetchRaffleEntries(f),
    enabled,
    staleTime: 30_000,
  });
}
