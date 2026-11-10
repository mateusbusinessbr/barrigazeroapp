import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getState, setState } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Barriga Zero — Dieta personalizada" },
      { name: "description", content: "Monte sua dieta com os alimentos que você ama e acompanhe sua evolução." },
      { property: "og:title", content: "Barriga Zero — Dieta personalizada" },
      { property: "og:description", content: "Dieta personalizada, hidratação, treinos e evolução em um só app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <AuthLayout>
      <h1 className="mb-1 whitespace-nowrap text-center text-xl text-primary-foreground sm:text-2xl">Sua Dieta, Do Seu Jeito.</h1>
      <p className="mb-3 text-center text-sm text-primary-foreground/80">@barrigazeroapp</p>
      <p className="mb-8 text-center text-primary-foreground/85">
        Escolha o que gosta de comer. A gente monta o resto.
      </p>
      <form
        className="space-y-4 rounded-3xl bg-card p-6 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          setState(() => ({ user: { name, email } }));
          const s = getState();
          navigate({ to: !s.plan ? "/planos" : !s.profile ? "/perfil" : "/painel" });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="n">Nome</Label>
          <Input id="n" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e">E-mail</Label>
          <Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="w-full">Entrar</Button>
        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-primary">Criar conta</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
