import { useQuery } from "@tanstack/react-query";
import {
  fetchQuizSubmissions,
  fetchRaffleEntries,
} from "@/services/dashboardService";
import type { DashboardFilters } from "@/types/dashboard";

export function useQuizSubmissions(filters: DashboardFilters, enabled = true) {
  return useQuery({
    queryKey: ["quiz_submissions", filters],
    queryFn: () => fetchQuizSubmissions(filters),
    enabled,
    staleTime: 30_000,
  });
}

export function useRaffleEntries(
  filters: Pick<DashboardFilters, "from" | "to">,
  enabled = true,
) {
  return useQuery({
    queryKey: ["raffle_entries", filters],
    queryFn: () => fetchRaffleEntries(filters),
    enabled,
    staleTime: 30_000,
  });
}
