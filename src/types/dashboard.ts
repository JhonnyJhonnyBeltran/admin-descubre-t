export interface QuizSubmission {
  id: string;
  quiz_id: string | null;
  questions: unknown;
  answers: unknown;
  main_result: string | null;
  result_2: string | null;
  result_3: string | null;
  centro: string | null;
  genero: string | null;
  edad: string | null;
  duration_seconds: number | null;
  report_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface RaffleEntry {
  id: string;
  nombre_completo: string | null;
  email: string | null;
  edad: string | null;
  created_at: string;
}

export interface DashboardFilters {
  from: string | null; // ISO date yyyy-mm-dd
  to: string | null;
  centro: string | null;
  genero: string | null;
  edad: string | null;
  main_result: string | null;
}

export const EMPTY_FILTERS: DashboardFilters = {
  from: null,
  to: null,
  centro: null,
  genero: null,
  edad: null,
  main_result: null,
};
