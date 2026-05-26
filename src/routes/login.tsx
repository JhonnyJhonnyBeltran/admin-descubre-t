import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "linear-gradient(135deg,#3b82f6,#60a5fa)" }}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-elevated)]">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              CPIFP El Arenal
            </p>
            <h1 className="text-xl font-bold text-foreground">Acceso administrador</h1>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-2xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
            Supabase no está configurado. Define <code>VITE_SUPABASE_URL</code> y{" "}
            <code>VITE_SUPABASE_ANON_KEY</code>. Puedes ver el dashboard en modo demo desde{" "}
            <Link to="/dashboard" className="font-semibold underline">
              aquí
            </Link>
            .
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-1 text-xs text-muted-foreground">
              Correo
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password" className="mb-1 text-xs text-muted-foreground">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-full text-sm font-semibold shadow-[var(--shadow-elevated)]"
            style={{ background: "var(--gradient-brand)" }}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "Entrando…" : "Acceder al panel"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Acceso restringido al equipo de orientación.
        </p>
      </div>
    </div>
  );
}
