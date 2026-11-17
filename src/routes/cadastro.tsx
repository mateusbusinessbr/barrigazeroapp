import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, redirectIfSignedIn } from "@/lib/auth";
import { validateSignup } from "@/lib/validation";
import { setState } from "@/lib/store";

export const Route = createFileRoute("/cadastro")({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  head: () => ({
    meta: [
      { title: "Criar conta — Barriga Zero" },
      {
        name: "description",
        content: "Crie sua conta no Barriga Zero e comece sua dieta personalizada.",
      },
      { property: "og:title", content: "Criar conta — Barriga Zero" },
      { property: "og:description", content: "Comece hoje sua dieta personalizada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cadastro,
});

function Cadastro() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", pass: "", confirm: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const field = (k: keyof typeof f, label: string, type = "text", ac?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input
        id={k}
        type={type}
        autoComplete={ac}
        required
        value={f[k]}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
      />
    </div>
  );

  if (sentTo) {
    return (
      <AuthLayout>
        <div className="space-y-4 rounded-3xl bg-card p-6 text-center shadow-soft">
          <h1 className="text-2xl">Confirme seu e-mail</h1>
          <p className="text-muted-foreground">
            Enviamos um link de confirmação para <b>{sentTo}</b>. Abra o e-mail e clique no link
            para ativar sua conta. Depois é só entrar.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link to="/">Ir para o login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="mb-6 text-center text-3xl text-primary-foreground">Criar conta</h1>
      <form
        noValidate
        className="space-y-4 rounded-3xl bg-card p-6 shadow-soft"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          const v = validateSignup(f);
          if (v) return setErr(v);
          setErr("");
          setBusy(true);
          try {
            const email = f.email.trim();
            const { data, error } = await supabase.auth.signUp({
              email,
              password: f.pass,
              options: {
                emailRedirectTo: window.location.origin,
                data: { display_name: f.name.trim() },
              },
            });
            if (error) return setErr(authErrorMessage(error));
            // Supabase hides existing accounts: identities is empty when the e-mail is taken.
            if (data.user && data.user.identities?.length === 0)
              return setErr("Já existe uma conta com este e-mail.");
            if (data.session) {
              setState(() => ({ user: { name: f.name.trim(), email } }));
              navigate({ to: "/planos" });
            } else {
              setSentTo(email);
            }
          } catch (x) {
            setErr(authErrorMessage(x as Error));
          } finally {
            setBusy(false);
          }
        }}
      >
        {field("name", "Nome")}
        {field("email", "E-mail", "email", "email")}
        {field("pass", "Senha", "password", "new-password")}
        {field("confirm", "Confirmar senha", "password", "new-password")}
        {err && (
          <p role="alert" className="text-sm text-destructive">
            {err}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Criando conta..." : "Criar conta"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/" className="font-semibold text-primary">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
