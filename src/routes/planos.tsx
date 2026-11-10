import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthLayout, useGuard } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/diet";
import { setState } from "@/lib/store";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — Barriga Zero" },
      { name: "description", content: "Assine o Barriga Zero por R$19,90/mês ou R$97/ano." },
      { property: "og:title", content: "Planos — Barriga Zero" },
      { property: "og:description", content: "R$19,90/mês ou R$97/ano." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planos,
});

const PERKS = [
  "Dieta personalizada semanal com horários",
  "Baixe suas refeições em PDF",
  "Controle de água, refeições e treinos",
  "Timeline de evolução com fotos",
  "+30 receitas fit por mês e desafios com prêmios",
];

function Planos() {
  const ok = useGuard("user");
  const navigate = useNavigate();
  if (!ok) return null;
  return (
    <AuthLayout>
      <h1 className="mb-2 text-center text-3xl text-primary-foreground">Escolha seu plano</h1>
      <ul className="mb-6 space-y-1 text-center text-sm text-primary-foreground/90">
        {PERKS.map((p) => <li key={p}>✓ {p}</li>)}
      </ul>
      <div className="space-y-4">
        {PLANS.map((p) => (
          <div key={p.id} className="relative rounded-3xl bg-card p-6 shadow-soft">
            {"badge" in p && (
              <span className="absolute -top-3 right-5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                {p.badge}
              </span>
            )}
            <p className="text-sm font-semibold uppercase text-muted-foreground">{p.label}</p>
            <p className="mb-4 font-display text-4xl text-foreground">
              {p.price}<span className="font-sans text-base text-muted-foreground">{p.period}</span>
            </p>
            <Button
              size="lg"
              className="w-full"
              variant={p.id === "anual" ? "default" : "outline"}
              onClick={() => {
                setState(() => ({ plan: p.id }));
                navigate({ to: "/perfil" });
              }}
            >
              Assinar {p.label.toLowerCase()}
            </Button>
          </div>
        ))}
      </div>
    </AuthLayout>
  );
}
