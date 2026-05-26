import { useQuery } from "@tanstack/react-query";
import {
  fetchQuizSubmissions,
  fetchRaffleEntries,
} from "@/services/dashboardService";
import type { DashboardFilters } from "@/types/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase";
import { mockQuizSubmissions, mockRaffleEntries } from "@/lib/mockData";

export function useQuizSubmissions(filters: DashboardFilters, enabled = true) {
  return useQuery({
    queryKey: ["quiz_submissions", filters],
    queryFn: async () => {
      if (!isSupabaseConfigured) return mockQuizSubmissions();
      return fetchQuizSubmissions(filters);
    },
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
    queryFn: async () => {
      if (!isSupabaseConfigured) return mockRaffleEntries();
      return fetchRaffleEntries(filters);
    },
    enabled,
    staleTime: 30_000,
  });
}
