import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth";

export const Route = createFileRoute("/esqueci-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Recuperar senha — Barriga Zero" },
      { name: "description", content: "Receba um link para criar uma nova senha." },
      { property: "og:title", content: "Recuperar senha — Barriga Zero" },
      { property: "og:description", content: "Receba um link para criar uma nova senha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Esqueci,
});

function Esqueci() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout>
      <div className="space-y-4 rounded-3xl bg-card p-6 shadow-soft">
        <h1 className="text-2xl">Recuperar senha</h1>
        {sent ? (
          <p className="text-muted-foreground">
            Se existir uma conta com <b>{email}</b>, você vai receber um link para criar uma nova
            senha.
          </p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              setBusy(true);
              setErr("");
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                  redirectTo: `${window.location.origin}/redefinir-senha`,
                });
                if (error) setErr(authErrorMessage(error));
                else setSent(true);
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
        )}
        <Link to="/" className="block text-center text-sm font-semibold text-primary">
          Voltar para o login
        </Link>
      </div>
    </AuthLayout>
  );
}
