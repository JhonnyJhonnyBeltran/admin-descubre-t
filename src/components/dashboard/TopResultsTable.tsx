import { useMemo } from "react";
import { Download, Table2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { SectionCard } from "./SectionCard";
import type { QuizSubmission } from "@/types/dashboard";
import { formatDuration } from "@/lib/format";

type ResultKey = "main_result" | "result_2" | "result_3";

interface Props {
    submissions: QuizSubmission[];
    selectedKey: ResultKey;
    onSelectedKeyChange: (key: ResultKey) => void;
}

function fmtDate(iso: string) {
    try {
        return format(new Date(iso), "dd/MM/yyyy HH:mm:ss", { locale: es });
    } catch {
        return iso;
    }
}

function csvRow(cells: (string | null | undefined)[]): string {
    return cells
        .map((c) => {
            const v = c ?? "";
            const escaped = v.replace(/"/g, '""');
            return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(",");
}

function downloadCsv(filename: string, rows: (string | null | undefined)[][]): void {
    const csv = rows.map(csvRow).join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function TopResultsTable({ submissions, selectedKey, onSelectedKeyChange }: Props) {
    const filtered = useMemo(
        () => submissions.filter((s) => Boolean(s[selectedKey])),
        [submissions, selectedKey],
    );

    const titleMap: Record<ResultKey, string> = {
        main_result: "Primeros resultados",
        result_2: "Segundos resultados",
        result_3: "Terceros resultados",
    };

    const headers = [
        "Resultado",
        "Centro",
        "Género",
        "Edad",
        "Fecha",
        "Duración (s)"

    ];

    const exportRows = [
        headers,
        ...filtered.map((s) => [
            s[selectedKey],
            s.centro,
            s.genero,
            s.edad,
            fmtDate(s.created_at),
            s.duration_seconds != null ? String(s.duration_seconds) : null,
        ]),
    ];

    return (
        <SectionCard
            title={titleMap[selectedKey]}
            description="Tabla detallada del top seleccionado"
            action={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCsv(`top_${selectedKey}.csv`, exportRows)}
                    className="rounded-full gap-2"
                >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                </Button>
            }
        >
            <div className="mb-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                {([
                    ["main_result", "Primeros"],
                    ["result_2", "Segundos"],
                    ["result_3", "Terceros"],
                ] as const).map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onSelectedKeyChange(key)}
                        className={[
                            "rounded-full px-3 py-2 text-sm font-medium transition-colors sm:py-1.5",
                            selectedKey === key
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-background text-foreground hover:bg-accent",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{filtered.length}</span> registros
                </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border" style={{ maxHeight: "68vh" }}>
                <table className="min-w-[780px] w-full text-xs">
                    <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm text-muted-foreground">
                        <tr>
                            {headers.map((h) => (
                                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left font-semibold tracking-wide uppercase text-[10px]">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="px-4 py-10 text-center text-muted-foreground">
                                    Sin datos
                                </td>
                            </tr>
                        ) : (
                            filtered.map((s) => (
                                <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">{s[selectedKey] ?? "—"}</td>
                                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">{s.centro ?? "—"}</td>
                                    <td className="whitespace-nowrap px-3 py-2">{s.genero ?? "—"}</td>
                                    <td className="whitespace-nowrap px-3 py-2">{s.edad ?? "—"}</td>
                                    <td className="whitespace-nowrap px-3 py-2">{fmtDate(s.created_at)}</td>
                                    <td className="whitespace-nowrap px-3 py-2 font-mono">{s.duration_seconds != null ? formatDuration(s.duration_seconds) : "—"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </SectionCard>
    );
}

export default TopResultsTable;
