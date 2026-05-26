import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, description, action, children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground md:text-lg">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}
