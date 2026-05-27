// seed.mjs — poblar quiz_submissions y raffle_entries con datos realistas
// Ejecutar: node seed.mjs

const SUPABASE_URL = "https://sfiqxtnrqstnpxjotgfk.supabase.co";
const SUPABASE_KEY = "sb_publishable_6zyTXgUdmTq6QFEc24xxSw_OcUrAI6Q";

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

// ── Datos de referencia ─────────────────────────────────────────────────────

const RESULTADOS = [
  "Sanitaria",
  "Informática",
  "Administración",
  "Educación Infantil",
  "Comercio y Marketing",
  "Imagen Personal",
  "Electricidad y Electrónica",
  "Hostelería y Turismo",
  "Automoción",
  "Construcción",
];

const CENTROS = [
  "CPIFP El Arenal",
  "IES Avempace",
  "IES Goya",
  "IES Miguel Catalán",
  "IES Pilar Lorengar",
  "IES Ramón y Cajal",
  "IES Luis Buñuel",
  "IES Pablo Serrano",
  "Colegio Salesiano",
];

const GENEROS = ["Femenino", "Masculino", "No binario", "Prefiero no decirlo"];
const EDADES  = ["<14", "14-15", "16-17", "18-20", ">20"];

const NOMBRES = [
  "Ana García","Carlos López","María Martínez","Juan Rodríguez","Laura Sánchez",
  "Pedro Jiménez","Isabel Fernández","Antonio González","Carmen Díaz","José Moreno",
  "Lucía Álvarez","Manuel Romero","Sara Alonso","David Torres","Elena Ramírez",
  "Francisco Navarro","Marta Domínguez","Rafael Ruiz","Andrea Herrera","Alejandro Molina",
  "Cristina Ortega","Miguel Delgado","Patricia Castro","Javier Vargas","Silvia Ramos",
  "Alberto Gutiérrez","Raquel Mendoza","Fernando Medina","Nuria Aguilar","Óscar Ríos",
  "Beatriz Castillo","Iván Blanco","Natalia Suárez","Rubén Ibáñez","Vanessa Garrido",
  "Hugo Muñoz","Claudia León","Adrián Guerrero","Lorena Peña","Roberto Campos",
];

// ── Utilidades ──────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybe(arr, prob = 0.8) {
  return Math.random() < prob ? pick(arr) : null;
}

function randomDate(daysBack) {
  const now = Date.now();
  const offset = Math.floor(Math.random() * daysBack * 86400000);
  return new Date(now - offset).toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

// ── Generadores ─────────────────────────────────────────────────────────────

function makeSubmission() {
  const main = pick(RESULTADOS);
  const others = RESULTADOS.filter(r => r !== main);
  const result_2 = maybe(others, 0.85);
  const result_3 = result_2 ? maybe(others.filter(r => r !== result_2), 0.55) : null;

  return {
    id: uuid(),
    quiz_id: "vocacional-2025",
    main_result: main,
    result_2,
    result_3,
    centro: pick(CENTROS),
    genero: pick(GENEROS),
    edad: pick(EDADES),
    duration_seconds: Math.floor(90 + Math.random() * 720),
    questions: [],
    answers: [],
    report_url: null,
    metadata: null,
    created_at: randomDate(90),   // últimos 90 días
  };
}

function makeRaffleEntry(i) {
  const nombre = pick(NOMBRES);
  const parts = nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(" ");
  return {
    id: uuid(),
    nombre_completo: nombre,
    email: `${parts[0]}.${parts[1]}${i}@gmail.com`,
    created_at: randomDate(90),
  };
}

// ── Inserción por lotes ─────────────────────────────────────────────────────

async function insertBatch(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Error insertando en ${table}: ${res.status} ${body}`);
  }
}

async function seed() {
  const QUIZ_COUNT   = 300;
  const RAFFLE_COUNT = 85;
  const BATCH        = 50;

  console.log(`\n🌱 Generando ${QUIZ_COUNT} cuestionarios...`);
  const submissions = Array.from({ length: QUIZ_COUNT }, makeSubmission);
  for (let i = 0; i < submissions.length; i += BATCH) {
    const chunk = submissions.slice(i, i + BATCH);
    await insertBatch("quiz_submissions", chunk);
    console.log(`   ✔ Cuestionarios ${i + 1}–${Math.min(i + BATCH, QUIZ_COUNT)}`);
  }

  console.log(`\n🎟  Generando ${RAFFLE_COUNT} inscripciones al sorteo...`);
  const entries = Array.from({ length: RAFFLE_COUNT }, (_, i) => makeRaffleEntry(i));
  for (let i = 0; i < entries.length; i += BATCH) {
    const chunk = entries.slice(i, i + BATCH);
    await insertBatch("raffle_entries", chunk);
    console.log(`   ✔ Sorteo ${i + 1}–${Math.min(i + BATCH, RAFFLE_COUNT)}`);
  }

  console.log("\n✅ Seed completado.");
  console.log(`   Quiz submissions : ${QUIZ_COUNT}`);
  console.log(`   Raffle entries   : ${RAFFLE_COUNT}`);
}

seed().catch(err => {
  console.error("\n❌ Falló el seed:", err.message);
  process.exit(1);
});
