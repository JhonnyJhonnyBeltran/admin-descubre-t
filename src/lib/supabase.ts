import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function normalizeSupabaseUrl(rawUrl: string): string {
  return rawUrl.replace(/\/?rest\/v1\/?$/i, "").replace(/\/+$/g, "");
}

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[supabase] Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. El dashboard funcionará en modo demo.",
  );
}

export const supabase = createClient(
  normalizeSupabaseUrl(url ?? "https://placeholder.supabase.co"),
  anonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
