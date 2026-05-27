import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Trophy, Ticket, PartyPopper, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useRaffleEntries } from "@/hooks/useDashboardData";
import { EMPTY_FILTERS } from "@/types/dashboard";
import type { RaffleEntry } from "@/types/dashboard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sorteo")({
  head: () => ({
    meta: [{ title: "Sorteo · CPIFP El Arenal" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: SorteoPage,
});

// ── localStorage key para el ganador ────────────────────────────────
const WINNER_KEY = "cpifp_sorteo_winner";

function loadSavedWinner(): RaffleEntry | null {
  try {
    const raw = localStorage.getItem(WINNER_KEY);
    return raw ? (JSON.parse(raw) as RaffleEntry) : null;
  } catch {
    return null;
  }
}

// ── CSV util ─────────────────────────────────────────────────────────
function downloadCsv(entries: RaffleEntry[]) {
  const headers = ["#", "Nombre", "Email", "Edad", "Fecha inscripción"];
  const rows = entries.map((e, i) => [
    String(i + 1),
    e.nombre_completo ?? "",
    e.email ?? "",
    e.edad ?? "",
    format(new Date(e.created_at), "dd/MM/yyyy HH:mm", { locale: es }),
  ]);
  const csv = [headers, ...rows]
    .map((r) =>
      r.map((c) => (/[,"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(","),
    )
    .join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `participantes_sorteo_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Componente principal ─────────────────────────────────────────────
function SorteoPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/login", replace: true });
  }, [authLoading, session, navigate]);

  const { data: entries = [], isLoading } = useRaffleEntries(
    { from: EMPTY_FILTERS.from, to: EMPTY_FILTERS.to },
    session,
  );

  const [winner, setWinner] = useState<RaffleEntry | null>(() => loadSavedWinner());
  const [spinning, setSpinning] = useState(false);
  const [drumNames, setDrumNames] = useState<string[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startRaffle() {
    if (entries.length === 0 || spinning) return;

    const chosen = entries[Math.floor(Math.random() * entries.length)];
    const allNames = entries.map((e) => e.nombre_completo ?? e.email ?? "—");
    const winnerName = chosen.nombre_completo ?? chosen.email ?? "—";
    const SLOTS = 7; // número impar — el del medio es el destacado
    const MID = Math.floor(SLOTS / 2);

    // Velocidades: rápido → lento
    const delays = [
      ...Array(30).fill(30),
      ...Array(10).fill(60),
      ...Array(6).fill(110),
      ...Array(5).fill(200),
      ...Array(3).fill(340),
      ...Array(2).fill(520),
      ...Array(2).fill(750),
    ];

    setWinner(null);
    setShowOverlay(true);
    setSpinning(true);

    let step = 0;

    function tick() {
      const isLast = step >= delays.length;
      const names = Array.from({ length: SLOTS }, (_, idx) => {
        if (isLast && idx === MID) return winnerName;
        return allNames[Math.floor(Math.random() * allNames.length)];
      });
      setDrumNames(names);

      if (isLast) {
        // Revelar ganador tras una pausa
        timerRef.current = setTimeout(() => {
          setSpinning(false);
          const w = chosen;
          setWinner(w);
          localStorage.setItem(WINNER_KEY, JSON.stringify(w));
          // Cerrar overlay tras 1.5 s para que se vea la pantalla con el ganador
          timerRef.current = setTimeout(() => setShowOverlay(false), 1500);
        }, 1000);
        return;
      }

      step++;
      timerRef.current = setTimeout(tick, delays[step - 1]);
    }

    tick();
  }

  // Limpieza de timers al desmontar
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (authLoading || !session) return null;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sorteo de participantes</h1>
            <p className="text-sm text-muted-foreground">
              {entries.length} inscritos · selección aleatoria
            </p>
          </div>
        </div>

        {/* ── Ganador ── */}
        {winner && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-yellow-300 bg-yellow-50 p-6 shadow-lg">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-30 blur-3xl"
              style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)" }}
            />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-white shadow">
                  <Trophy className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-yellow-700">
                    🎉 Ganador del sorteo
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-yellow-900">
                    {winner.nombre_completo ?? "Sin nombre"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-yellow-800">
                    <span>{winner.email ?? "Sin email"}</span>
                    {winner.edad && (
                      <>
                        <span className="text-yellow-400">·</span>
                        <span>{winner.edad} años</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-right text-xs text-yellow-700 md:items-end">
                <span>
                  Inscrito el{" "}
                  <strong>
                    {format(new Date(winner.created_at), "d 'de' MMMM yyyy · HH:mm", { locale: es })}
                  </strong>
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-full border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                  onClick={() => {
                    localStorage.removeItem(WINNER_KEY);
                    setWinner(null);
                  }}
                >
                  Limpiar ganador
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Botón iniciar sorteo ── */}
        <div className="flex justify-center">
          <button
            onClick={startRaffle}
            disabled={spinning || entries.length === 0 || isLoading}
            className={[
              "flex items-center gap-3 rounded-full px-10 py-4 text-lg font-bold text-white shadow-xl transition-all",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:scale-[1.03] active:scale-[0.98]",
            ].join(" ")}
            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
          >
            <PartyPopper className="h-6 w-6" />
            {spinning ? "Sorteando…" : winner ? "Repetir sorteo" : "Empezar sorteo"}
          </button>
        </div>

        {/* ── Tabla de participantes ── */}
        <div className="rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg,#3b82f6,#60a5fa)" }}
              >
                <Ticket className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Lista de participantes</h2>
                <p className="text-xs text-muted-foreground">{entries.length} inscritos</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-2"
              onClick={() => downloadCsv(entries)}
              disabled={entries.length === 0}
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                Cargando…
              </div>
            ) : entries.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                Sin participantes todavía
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-10 px-4 py-3 text-left font-semibold">#</th>
                    <th className="w-40 px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="w-24 px-4 py-3 text-left font-semibold">Edad</th>
                    <th className="w-44 px-4 py-3 text-left font-semibold">Inscripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((e, i) => (
                    <tr key={e.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{i + 1}</td>
                      <td className="w-40 max-w-[10rem] px-4 py-2.5 font-semibold text-foreground truncate">{e.nombre_completo ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{e.email ?? "—"}</td>
                      <td className="w-24 whitespace-nowrap px-4 py-2.5 text-muted-foreground">{e.edad ? `${e.edad} años` : "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{format(new Date(e.created_at), "d MMM yyyy · HH:mm", { locale: es })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <footer className="pt-2 text-center text-xs text-muted-foreground">
          CPIFP El Arenal · Panel interno de orientación vocacional
        </footer>
      </div>

      {/* ── Overlay de animación ── */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ background: "rgba(15,10,30,0.82)" }}
        >
          {/* Blobs de color de fondo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full opacity-25 blur-3xl"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "linear-gradient(135deg,#3b82f6,#60a5fa)" }}
          />

          <div className="relative flex flex-col items-center gap-5">

            {/* Cabecera */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ background: "var(--gradient-brand)" }}
              >
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  CPIFP El Arenal
                </p>
                <p className="text-sm font-bold text-white">Sorteo vocacional</p>
              </div>
            </div>

            {/* Tambor */}
            <div
              className="relative overflow-hidden shadow-2xl"
              style={{
                width: 460,
                height: 360,
                borderRadius: 28,
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(255,255,255,0.10)",
              }}
            >
              {/* Highlight central con gradiente de marca */}
              <div
                className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2"
                style={{ padding: "0 20px" }}
              >
                <div
                  style={{
                    borderRadius: 18,
                    background: "var(--gradient-brand)",
                    opacity: 0.92,
                    height: 72,
                    boxShadow: "0 0 40px 8px rgba(255,107,53,0.35)",
                  }}
                />
              </div>

              {/* Máscaras de profundidad */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28"
                style={{ background: "linear-gradient(to bottom, rgba(15,10,30,0.92), transparent)" }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28"
                style={{ background: "linear-gradient(to top, rgba(15,10,30,0.92), transparent)" }}
              />

              {/* Nombres */}
              <div className="relative z-30 flex h-full flex-col">
                {drumNames.map((name, i) => {
                  const MID = Math.floor(drumNames.length / 2);
                  const dist = Math.abs(i - MID);
                  const isCenter = i === MID;
                  return (
                    <div
                      key={i}
                      className="flex flex-1 items-center justify-center px-8 text-center font-bold"
                      style={{
                        fontSize: isCenter ? 28 : dist === 1 ? 16 : 13,
                        letterSpacing: isCenter ? "-0.5px" : "0px",
                        color: isCenter ? "#fff" : `rgba(255,255,255,${dist === 1 ? 0.45 : 0.2})`,
                        textShadow: isCenter ? "0 2px 12px rgba(0,0,0,0.4)" : "none",
                        transition: "all 0.08s ease",
                      }}
                    >
                      {name}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estado */}
            {spinning ? (
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" style={{ animationDelay: "0ms" }} />
                <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" style={{ animationDelay: "150ms" }} />
                <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" style={{ animationDelay: "300ms" }} />
                <span className="ml-2 text-sm font-medium text-white/60">Sorteando</span>
              </div>
            ) : (
              <p className="text-base font-bold text-white animate-pulse" style={{ textShadow: "0 0 20px rgba(255,107,53,0.8)" }}>
                🎉 ¡Tenemos ganador!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Primitivos de tabla ───────────────────────────────────────────────
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">{children}</th>
  );
}

function Td({
  children,
  bold,
  mono,
  muted,
}: {
  children: React.ReactNode;
  bold?: boolean;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={[
        "whitespace-nowrap px-4 py-3",
        bold ? "font-semibold text-foreground" : "",
        mono ? "font-mono text-xs" : "",
        muted ? "text-muted-foreground" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </td>
  );
}
