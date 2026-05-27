import { supabase } from "@/lib/supabase";
import type { DashboardFilters, QuizSubmission, RaffleEntry } from "@/types/dashboard";

function applyFilters<T>(query: T, filters: DashboardFilters): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = query;
  if (filters.from) q = q.gte("created_at", `${filters.from}T00:00:00Z`);
  if (filters.to) q = q.lte("created_at", `${filters.to}T23:59:59Z`);
  if (filters.centro) q = q.eq("centro", filters.centro);
  if (filters.genero) q = q.eq("genero", filters.genero);
  if (filters.edad) {
    // soportar rangos como '16-18', '+35' o 'Sin indicar'
    const age = filters.edad;
    if (age === "Sin indicar") {
      q = q.is("edad", null);
    } else if (age.startsWith("+")) {
      const min = Number(age.slice(1));
      if (!Number.isNaN(min)) q = q.gte("edad", min);
      else q = q.eq("edad", filters.edad);
    } else if (/^\d+-\d+$/.test(age)) {
      const [lowStr, highStr] = age.split("-");
      const low = Number(lowStr);
      const high = Number(highStr);
      if (!Number.isNaN(low) && !Number.isNaN(high)) {
        q = q.gte("edad", low).lte("edad", high);
      } else {
        q = q.eq("edad", filters.edad);
      }
    } else {
      q = q.eq("edad", filters.edad);
    }
  }
  if (filters.main_result) q = q.eq("main_result", filters.main_result);
  return q as T;
}

export async function fetchQuizSubmissions(filters: DashboardFilters): Promise<QuizSubmission[]> {
  const base = supabase
    .from("quiz_submissions")
    .select(
      "id, quiz_id, main_result, result_2, result_3, centro, genero, edad, duration_seconds, report_url, metadata, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  const { data, error } = await applyFilters(base, filters);
  if (error) throw error;
  return (data as QuizSubmission[]) ?? [];
}

export async function fetchRaffleEntries(
  filters: Pick<DashboardFilters, "from" | "to">,
): Promise<RaffleEntry[]> {
  let q = supabase
    .from("raffle_entries")
    .select("id, nombre_completo, email, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (filters.from) q = q.gte("created_at", `${filters.from}T00:00:00Z`);
  if (filters.to) q = q.lte("created_at", `${filters.to}T23:59:59Z`);

  const { data, error } = await q;
  if (error) throw error;
  return (data as RaffleEntry[]) ?? [];
}
