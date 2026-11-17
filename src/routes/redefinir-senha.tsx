import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth";
import { validatePassword } from "@/lib/validation";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha — Barriga Zero" },
      { name: "description", content: "Crie uma nova senha para sua conta." },
      { property: "og:title", content: "Nova senha — Barriga Zero" },
      { property: "og:description", content: "Crie uma nova senha para sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Redefinir,
});

function Redefinir() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: d }) => {
      if (d.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <AuthLayout>
      <div className="space-y-4 rounded-3xl bg-card p-6 shadow-soft">
        <h1 className="text-2xl">Criar nova senha</h1>
        {!ready ? (
          <p className="text-muted-foreground">
            Abra esta página pelo link enviado ao seu e-mail. Se o link expirou, peça um novo em
            “Esqueci minha senha”.
          </p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              const v = validatePassword(pass, confirm);
              if (v) return setErr(v);
              setBusy(true);
              setErr("");
              try {
                const { error } = await supabase.auth.updateUser({ password: pass });
                if (error) return setErr(authErrorMessage(error));
                navigate({ to: "/painel" });
              } catch (x) {
                setErr(authErrorMessage(x as Error));
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="p">Nova senha</Label>
              <Input
                id="p"
                type="password"
                autoComplete="new-password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c">Confirmar senha</Label>
              <Input
                id="c"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
