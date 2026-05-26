import { useState } from "react";
import { Download, Table2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { QuizSubmission, RaffleEntry } from "@/types/dashboard";
import { formatDuration } from "@/lib/format";

interface Props {
  submissions: QuizSubmission[];
  entries: RaffleEntry[];
}

/* ─── helpers ──────────────────────────────────────────────────── */

function csvRow(cells: (string | null | undefined)[]): string {
  return cells
    .map((c) => {
      const v = c ?? "";
      const escaped = v.replace(/"/g, '""');
      return /[,"\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
    })
    .join(",");
}

function downloadCsv(filename: string, rows: string[][]): void {
  const csv = rows.map(csvRow).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function fmtDate(iso: string) {
  try {
    return format(new Date(iso), "dd/MM/yyyy HH:mm:ss", { locale: es });
  } catch {
    return iso;
  }
}

/* ─── Quiz table ────────────────────────────────────────────────── */

function QuizTable({ submissions }: { submissions: QuizSubmission[] }) {
  const QUIZ_HEADERS = [
    "Fecha",
    "Centro",
    "Género",
    "Edad",
    "Resultado 1",
    "Resultado 2",
    "Resultado 3",
    "Duración (s)",
    "Informe",
    "quiz_id",
    "id",
  ];

  function exportQuiz() {
    const rows: string[][] = [
      QUIZ_HEADERS,
      ...submissions.map((s) => [
        fmtDate(s.created_at),
        s.centro,
        s.genero,
        s.edad,
        s.main_result,
        s.result_2,
        s.result_3,
        s.duration_seconds != null ? String(s.duration_seconds) : null,
        s.report_url,
        s.quiz_id,
        s.id,
      ]),
    ];
    downloadCsv(`cuestionarios_${Date.now()}.csv`, rows);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{submissions.length}</span> registros
        </p>
        <Button variant="outline" size="sm" onClick={exportQuiz} className="rounded-full gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-auto rounded-2xl border border-border" style={{ maxHeight: "68vh" }}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm text-muted-foreground">
            <tr>
              {QUIZ_HEADERS.map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {submissions.length === 0 ? (
              <tr>
                <td
                  colSpan={QUIZ_HEADERS.length}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Sin datos
                </td>
              </tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                  <Td>{fmtDate(s.created_at)}</Td>
                  <Td>{s.centro ?? "—"}</Td>
                  <Td>{s.genero ?? "—"}</Td>
                  <Td>{s.edad ?? "—"}</Td>
                  <Td bold>{s.main_result ?? "—"}</Td>
                  <Td>{s.result_2 ?? "—"}</Td>
                  <Td>{s.result_3 ?? "—"}</Td>
                  <Td mono>{s.duration_seconds != null ? formatDuration(s.duration_seconds) : "—"}</Td>
                  <Td>
                    {s.report_url ? (
                      <a
                        href={s.report_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline underline-offset-2"
                      >
                        Ver
                      </a>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td mono>{s.quiz_id ?? "—"}</Td>
                  <Td mono muted>{s.id}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Raffle table ──────────────────────────────────────────────── */

function RaffleTable({ entries }: { entries: RaffleEntry[] }) {
  const RAFFLE_HEADERS = ["Fecha", "Nombre", "Email", "id"];

  function exportRaffle() {
    const rows: string[][] = [
      RAFFLE_HEADERS,
      ...entries.map((e) => [fmtDate(e.created_at), e.nombre_completo, e.email, e.id]),
    ];
    downloadCsv(`sorteo_${Date.now()}.csv`, rows);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{entries.length}</span> registros
        </p>
        <Button variant="outline" size="sm" onClick={exportRaffle} className="rounded-full gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-auto rounded-2xl border border-border" style={{ maxHeight: "68vh" }}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm text-muted-foreground">
            <tr>
              {RAFFLE_HEADERS.map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={RAFFLE_HEADERS.length}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Sin datos
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                  <Td>{fmtDate(e.created_at)}</Td>
                  <Td bold>{e.nombre_completo ?? "—"}</Td>
                  <Td>{e.email ?? "—"}</Td>
                  <Td mono muted>{e.id}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────────── */

export function RawDataTable({ submissions, entries }: Props) {
  const [tab, setTab] = useState<"quiz" | "raffle">("quiz");

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Table2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Datos crudos</h2>
          <p className="text-xs text-muted-foreground">Todos los registros tal cual están en la base de datos</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "quiz" | "raffle")}>
        <TabsList className="mb-4">
          <TabsTrigger value="quiz">
            Cuestionarios ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="raffle">
            Sorteo ({entries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz">
          <QuizTable submissions={submissions} />
        </TabsContent>
        <TabsContent value="raffle">
          <RaffleTable entries={entries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Table primitives ──────────────────────────────────────────── */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-3 py-2.5 text-left font-semibold tracking-wide uppercase text-[10px]">
      {children}
    </th>
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
        "whitespace-nowrap px-3 py-2",
        bold ? "font-semibold text-foreground" : "",
        mono ? "font-mono" : "",
        muted ? "text-muted-foreground" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </td>
  );
}
