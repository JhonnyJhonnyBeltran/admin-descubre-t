import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExternalLink } from "lucide-react";
import type { QuizSubmission } from "@/types/dashboard";
import { formatDuration } from "@/lib/format";
import { SectionCard } from "./SectionCard";

interface Props {
  submissions: QuizSubmission[];
  limit?: number;
}

export function RecentSubmissionsTable({ submissions, limit = 20 }: Props) {
  const rows = submissions.slice(0, limit);

  return (
    <SectionCard
      title="Últimos envíos"
      description={`Mostrando los ${rows.length} más recientes`}
    >
      {rows.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          Aún no hay envíos
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>Fecha</Th>
                <Th>Centro</Th>
                <Th>Género</Th>
                <Th>Edad</Th>
                <Th>Resultado</Th>
                <Th>2º</Th>
                <Th>3º</Th>
                <Th>Duración</Th>
                <Th>Informe</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-muted/40">
                  <Td>
                    {format(new Date(s.created_at), "d MMM yyyy · HH:mm", { locale: es })}
                  </Td>
                  <Td className="text-muted-foreground">{s.centro ?? "—"}</Td>
                  <Td className="text-muted-foreground">{s.genero ?? "—"}</Td>
                  <Td className="text-muted-foreground">{s.edad ?? "—"}</Td>
                  <Td>
                    {s.main_result ? (
                      <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                        {s.main_result}
                      </span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td className="text-muted-foreground">{s.result_2 ?? "—"}</Td>
                  <Td className="text-muted-foreground">{s.result_3 ?? "—"}</Td>
                  <Td>{formatDuration(s.duration_seconds)}</Td>
                  <Td>
                    {s.report_url ? (
                      <a
                        href={s.report_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Ver <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 ${className}`}>{children}</td>;
}
