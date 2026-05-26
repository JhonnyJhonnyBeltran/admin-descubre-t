import { Ticket } from "lucide-react";
import type { RaffleEntry } from "@/types/dashboard";
import { SectionCard } from "./SectionCard";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  entries: RaffleEntry[];
}

export function RaffleStatsCard({ entries }: Props) {
  const recent = entries.slice(0, 6);

  return (
    <SectionCard
      title="Sorteo · Inscripciones recientes"
      description={`${entries.length} participantes en total`}
      action={
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ background: "linear-gradient(135deg,#3b82f6,#60a5fa)" }}
        >
          <Ticket className="h-5 w-5" />
        </div>
      }
    >
      {recent.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          Aún no hay inscripciones al sorteo
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {recent.map((e) => (
            <li key={e.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {e.nombre_completo ?? "Sin nombre"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{e.email ?? "—"}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {format(new Date(e.created_at), "d MMM · HH:mm", { locale: es })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
