import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-6"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "linear-gradient(135deg,#3b82f6,#60a5fa)" }}
      />

      <div className="relative mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 text-center shadow-[var(--shadow-elevated)]">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          <GraduationCap className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          CPIFP El Arenal
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Panel interno de orientación vocacional
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Accede al dashboard para consultar las estadísticas del cuestionario y del sorteo.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold text-white shadow-[var(--shadow-elevated)] transition-transform hover:scale-[1.02]"
            style={{ background: "var(--gradient-brand)" }}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Ir al dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex h-11 items-center rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Acceso administrador
          </Link>
        </div>
      </div>
    </div>
  );
}
