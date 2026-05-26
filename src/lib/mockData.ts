import type { QuizSubmission, RaffleEntry } from "@/types/dashboard";

const RESULTS = [
  "Sanitaria",
  "Informática",
  "Administración",
  "Educación",
  "Comercio",
  "Imagen Personal",
  "Electricidad",
  "Hostelería",
];
const CENTROS = ["CPIFP El Arenal", "IES Avempace", "IES Goya", "IES Miguel Catalán", "IES Pilar Lorengar"];
const GENEROS = ["Femenino", "Masculino", "No binario", "Prefiero no decirlo"];
const EDADES = ["<14", "14-15", "16-17", "18-20", ">20"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function mockQuizSubmissions(): QuizSubmission[] {
  const now = Date.now();
  const items: QuizSubmission[] = [];
  for (let i = 0; i < 220; i++) {
    const offsetDays = Math.floor(Math.random() * 45);
    const created = new Date(now - offsetDays * 86400000 - Math.random() * 86400000);
    const main = pick(RESULTS);
    const second = Math.random() > 0.15 ? pick(RESULTS.filter((r) => r !== main)) : null;
    const third =
      second && Math.random() > 0.3
        ? pick(RESULTS.filter((r) => r !== main && r !== second))
        : null;
    items.push({
      id: crypto.randomUUID(),
      quiz_id: "vocacional-2025",
      questions: null,
      answers: null,
      main_result: main,
      result_2: second,
      result_3: third,
      centro: pick(CENTROS),
      genero: pick(GENEROS),
      edad: pick(EDADES),
      duration_seconds: Math.floor(120 + Math.random() * 600),
      report_url: Math.random() > 0.4 ? "https://example.com/report.pdf" : null,
      metadata: null,
      created_at: created.toISOString(),
    });
  }
  return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function mockRaffleEntries(): RaffleEntry[] {
  const now = Date.now();
  const items: RaffleEntry[] = [];
  for (let i = 0; i < 64; i++) {
    const created = new Date(now - Math.floor(Math.random() * 45) * 86400000);
    items.push({
      id: crypto.randomUUID(),
      nombre_completo: `Alumno ${i + 1}`,
      email: `alumno${i + 1}@example.com`,
      created_at: created.toISOString(),
    });
  }
  return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
