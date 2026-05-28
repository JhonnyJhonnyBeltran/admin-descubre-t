import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  // Prefer router's location (works both SSR and client) to avoid hydration mismatches
  const pathnameFromRouter = (router && (router.state as any)?.location?.pathname) ?? null;
  const pathname = pathnameFromRouter ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");
  const { session, user, signOut } = useAuth();
  const navigate = useNavigate();
  const username = (user as any)?.username;

  return (
    <nav className="w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto relative flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Descubre-T CPIFP El Arenal"
            className="h-14 w-14 rounded-md object-cover"
          />
          <span className="text-sm font-semibold md:text-base">Monitorización Descubre-T</span>
        </div>

        <ul className="flex flex-wrap items-center gap-2 lg:justify-center lg:transform lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
          <li>
            <Link
              to="/dashboard"
              className={`inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                isActive("/dashboard") ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              Panel de control
            </Link>
          </li>
          <li>
            <Link
              to="/ciclos"
              className={`inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                isActive("/ciclos") ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              Ciclos formativos
            </Link>
          </li>
          <li>
            <Link
              to="/perfiles"
              className={`inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                isActive("/perfiles") ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              Perfiles
            </Link>
          </li>
          <li>
            <Link
              to="/datos"
              className={`inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                isActive("/datos") ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              Datos
            </Link>
          </li>
          <li>
            <Link
              to="/sorteo"
              className={`inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                isActive("/sorteo") ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              Sorteo
            </Link>
          </li>
        </ul>
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          {username && (
            <div className="min-w-0 text-right">
              <p className="text-xs text-muted-foreground">Sesión</p>
              <p className="max-w-[12rem] truncate text-sm font-medium text-foreground md:max-w-[16rem]">{username}</p>
            </div>
          )}
          {session && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signOut();
                navigate({ to: "/login" });
              }}
              className="rounded-full"
            >
              Salir
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
