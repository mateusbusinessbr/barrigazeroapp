import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setState } from "@/lib/store";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Barriga Zero" },
      { name: "description", content: "Crie sua conta no Barriga Zero e comece sua dieta personalizada." },
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
  const field = (k: keyof typeof f, label: string, type = "text") => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} required value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );
  return (
    <AuthLayout>
      <h1 className="mb-6 text-center text-3xl text-primary-foreground">Criar conta</h1>
      <form
        className="space-y-4 rounded-3xl bg-card p-6 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          if (f.pass.length < 6) return setErr("A senha precisa ter pelo menos 6 caracteres.");
          if (f.pass !== f.confirm) return setErr("As senhas não conferem.");
          setState(() => ({ user: { name: f.name, email: f.email } }));
          navigate({ to: "/planos" });
        }}
      >
        {field("name", "Nome")}
        {field("email", "E-mail", "email")}
        {field("pass", "Senha", "password")}
        {field("confirm", "Confirmar senha", "password")}
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" size="lg" className="w-full">Criar conta</Button>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta? <Link to="/" className="font-semibold text-primary">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
