import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, redirectIfSignedIn } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { getState, setState } from "@/lib/store";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } =>
    typeof s["redirect"] === "string" ? { redirect: s["redirect"] } : {},
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  head: () => ({
    meta: [
      { title: "Barriga Zero — Dieta personalizada" },
      {
        name: "description",
        content: "Monte sua dieta com os alimentos que você ama e acompanhe sua evolução.",
      },
      { property: "og:title", content: "Barriga Zero — Dieta personalizada" },
      {
        property: "og:description",
        content: "Dieta personalizada, hidratação, treinos e evolução em um só app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <AuthLayout>
      <h1 className="mb-2 text-center text-4xl text-primary-foreground">
        Sua dieta, do seu jeito.
      </h1>
      <p className="mb-8 text-center text-primary-foreground/85">
        Escolha o que gosta de comer. A gente monta o resto.
      </p>
      <form
        className="space-y-4 rounded-3xl bg-card p-6 shadow-soft"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setErr("");
          setBusy(true);
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: pass,
            });
            if (error || !data.user) return setErr(authErrorMessage(error));
            const { data: prof } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", data.user.id)
              .maybeSingle();
            setState(() => ({
              user: {
                name: prof?.display_name || email.split("@")[0]!,
                email: data.user.email ?? email,
              },
            }));
            const s = getState();
            const dest = !s.plan
              ? "/planos"
              : !s.profile
                ? "/perfil"
                : safeRedirect(search.redirect);
            navigate({ to: dest });
          } catch (x) {
            setErr(authErrorMessage(x as Error));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="e">E-mail</Label>
          <Input
            id="e"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="p">Senha</Label>
            <Link to="/esqueci-senha" className="text-xs font-semibold text-primary">
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="p"
            type="password"
            autoComplete="current-password"
            required
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </div>
        {err && (
          <p role="alert" className="text-sm text-destructive">
            {err}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Entrando..." : "Entrar"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-primary">
            Criar conta
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
