// update-edad.mjs — rellena la columna edad en raffle_entries existentes
// Ejecutar: node update-edad.mjs

const SUPABASE_URL = "https://sfiqxtnrqstnpxjotgfk.supabase.co";
const SUPABASE_KEY = "sb_publishable_6zyTXgUdmTq6QFEc24xxSw_OcUrAI6Q";

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

const EDADES = ["14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  // 1. Traer todos los IDs que tienen edad null
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/raffle_entries?edad=is.null&select=id`,
    { headers: HEADERS },
  );
  if (!res.ok) throw new Error(`GET falló: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  console.log(`\n📋 ${rows.length} registros sin edad`);

  if (rows.length === 0) {
    console.log("✅ Nada que actualizar.");
    return;
  }

  // 2. Actualizar cada uno con una edad aleatoria
  let ok = 0;
  for (const row of rows) {
    const edad = pick(EDADES);
    const upd = await fetch(
      `${SUPABASE_URL}/rest/v1/raffle_entries?id=eq.${row.id}`,
      {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ edad }),
      },
    );
    if (!upd.ok) {
      console.warn(`  ⚠ ${row.id}: ${await upd.text()}`);
    } else {
      ok++;
    }
  }

  console.log(`✅ ${ok}/${rows.length} registros actualizados.`);
}

run().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});
