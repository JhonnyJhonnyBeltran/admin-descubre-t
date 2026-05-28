import { GraduationCap } from "lucide-react";

interface Props {
  title?: string;
  subtitle?: string;
}

export function PageHeader({ title = "Panel de estadísticas", subtitle = "" }: Props) {
  return (
    <header className="rounded-2xl bg-card p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
