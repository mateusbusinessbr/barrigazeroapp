import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { getState } from "@/lib/store";

export function Logo({ light }: { light?: boolean }) {
  return (
    <span className={`font-display text-xl tracking-tight ${light ? "text-primary-foreground" : "text-primary"}`}>
      BARRIGA<span className="text-accent">ZERO</span>
    </span>
  );
}

/** Redirects to the right step if the user hasn't finished signup. */
export function useGuard(need: "user" | "plan" | "profile") {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const s = getState();
    if (!s.user) navigate({ to: "/" });
    else if (need !== "user" && !s.plan) navigate({ to: "/planos" });
    else if (need === "profile" && !s.profile) navigate({ to: "/perfil" });
    else setOk(true);
  }, [need, navigate]);
  return ok;
}

const NAV = [
  { to: "/painel", label: "Hoje" },
  { to: "/dieta", label: "Dieta" },
  { to: "/evolucao", label: "Evolução" },
  { to: "/perfil", label: "Ajustar" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const ok = useGuard("profile");
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{ok ? children : null}</main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card">
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="py-4 text-center text-sm font-semibold text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-hero">
      <div className="mx-auto w-full max-w-md flex-1 px-5 py-10">
        <div className="mb-8 text-center">
          <Logo light />
        </div>
        {children}
      </div>
    </div>
  );
}
