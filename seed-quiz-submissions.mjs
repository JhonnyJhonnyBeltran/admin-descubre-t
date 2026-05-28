// seed-quiz-submissions.mjs — poblar quiz_submissions con 100 datos aleatorios
// Ejecutar: node seed-quiz-submissions.mjs

import crypto from "node:crypto";

const SUPABASE_URL = "https://sfiqxtnrqstnpxjotgfk.supabase.co";
const SUPABASE_KEY = "sb_publishable_6zyTXgUdmTq6QFEc24xxSw_OcUrAI6Q";

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

const RESULTADOS = [
  "Sanitaria",
  "Informatica",
  "Administracion",
  "Educacion Infantil",
  "Comercio y Marketing",
  "Imagen Personal",
  "Electricidad y Electronica",
  "Hosteleria y Turismo",
  "Automocion",
  "Construccion",
];

const CENTROS = [
  "CPIFP El Arenal",
  "IES Avempace",
  "IES Goya",
  "IES Miguel Catalan",
  "IES Pilar Lorengar",
  "IES Ramon y Cajal",
  "IES Luis Bunuel",
  "IES Pablo Serrano",
  "Colegio Salesiano",
];

const GENEROS = ["Femenino", "Masculino", "Otro", "Prefiero no responder"];

const QUESTION_BANK = [
  "Prefieres trabajar en equipo?",
  "Te interesa la tecnologia?",
  "Te gusta ayudar a otras personas?",
  "Disfrutas tareas creativas?",
  "Prefieres actividades practicas?",
  "Te gusta organizar y planificar?",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function randomDate(daysBack) {
  const now = Date.now();
  const offset = Math.floor(Math.random() * daysBack * 86400000);
  return new Date(now - offset).toISOString();
}

function makeQuestions() {
  const count = randomInt(4, 6);
  const selected = [...QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, count);
  return selected.map((text, index) => ({
    id: `q${index + 1}`,
    text,
    type: "scale",
  }));
}

function makeAnswers(questions) {
  return questions.map((q) => ({
    question_id: q.id,
    value: randomInt(1, 5),
  }));
}

function makeSubmission() {
  const main = pick(RESULTADOS);
  const others = RESULTADOS.filter((r) => r !== main);
  const result_2 = Math.random() < 0.7 ? pick(others) : null;
  const result_3 = result_2 && Math.random() < 0.45 ? pick(others.filter((r) => r !== result_2)) : null;
  const questions = makeQuestions();
  const answers = makeAnswers(questions);

  return {
    id: crypto.randomUUID(),
    quiz_id: "vocacional-2025",
    questions,
    answers,
    main_result: main,
    metadata: {
      device: Math.random() < 0.6 ? "mobile" : "desktop",
      source: Math.random() < 0.5 ? "landing" : "qr",
    },
    created_at: randomDate(90),
    result_2,
    result_3,
    centro: pick(CENTROS),
    genero: pick(GENEROS),
    edad: randomInt(14, 23),
    duration_seconds: randomInt(90, 720),
  };
}

async function insertBatch(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/quiz_submissions`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Error insertando quiz_submissions: ${res.status} ${body}`);
  }
}

async function seed() {
  const TOTAL = 100;
  const BATCH = 50;

  console.log(`\nGenerando ${TOTAL} quiz_submissions...`);
  const submissions = Array.from({ length: TOTAL }, makeSubmission);

  for (let i = 0; i < submissions.length; i += BATCH) {
    const chunk = submissions.slice(i, i + BATCH);
    await insertBatch(chunk);
    console.log(`  OK ${i + 1}-${Math.min(i + BATCH, TOTAL)}`);
  }

  console.log("\nSeed completado.");
}

seed().catch((err) => {
  console.error("\nFallo el seed:", err.message);
  process.exit(1);
});
