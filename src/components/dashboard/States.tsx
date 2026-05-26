export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse rounded-3xl bg-muted" />
      <div className="h-24 animate-pulse rounded-3xl bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      </div>
      <div className="h-80 animate-pulse rounded-3xl bg-muted" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <h3 className="text-lg font-semibold text-destructive">No se pudieron cargar los datos</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{message}</p>
      <p className="mx-auto mt-2 max-w-lg text-xs text-muted-foreground">
        Comprueba que <code className="rounded bg-muted px-1 py-0.5">VITE_SUPABASE_URL</code> y{" "}
        <code className="rounded bg-muted px-1 py-0.5">VITE_SUPABASE_ANON_KEY</code> están definidas y que tu usuario tiene permisos de lectura sobre <code>quiz_submissions</code>.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
