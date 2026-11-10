import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, useGuard } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GOALS, MENU, type Goal, type Profile } from "@/lib/diet";
import { getState, setState } from "@/lib/store";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Monte sua dieta — Barriga Zero" },
      { name: "description", content: "Informe objetivo, medidas e os alimentos que você gosta." },
      { property: "og:title", content: "Monte sua dieta — Barriga Zero" },
      { property: "og:description", content: "Escolha o que gosta de comer, sem limites." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Perfil,
});

const MEAL_TITLES = { cafe: "Café da Manhã", almoco: "Almoço", jantar: "Jantar" } as const;

function Perfil() {
  const ok = useGuard("plan");
  if (!ok) return null;
  return <PerfilForm />;
}

function PerfilForm() {
  const navigate = useNavigate();
  const s = getState();
  const [p, setP] = useState<Profile>(
    s.profile ?? { goal: "emagrecimento", height: 170, weight: 75, age: 30, sex: "feminino" },
  );
  const [prefs, setPrefs] = useState<string[]>(s.prefs);
  const toggle = (id: string) =>
    setPrefs((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));
  const num = (k: "height" | "weight" | "age", label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type="number" required min={1} value={p[k] || ""}
        onChange={(e) => setP({ ...p, [k]: Number(e.target.value) })} />
    </div>
  );
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <Logo />
        {s.profile && <Link to="/painel" className="text-sm font-semibold text-primary">Voltar</Link>}
      </header>
      <form
        className="mx-auto max-w-3xl space-y-8 px-4 py-8"
        onSubmit={(e) => {
          e.preventDefault();
          setState((st) => ({ profile: p, prefs, seed: st.seed + 1 }));
          navigate({ to: "/dieta" });
        }}
      >
        <section>
          <h2 className="mb-3 text-2xl">1. Seu objetivo</h2>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button type="button" key={g.id} className={chip(p.goal === g.id)}
                onClick={() => setP({ ...p, goal: g.id as Goal })}>{g.label}</button>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-2xl">2. Seus dados</h2>
          <div className="grid grid-cols-3 gap-3">
            {num("height", "Altura (cm)")}
            {num("weight", "Peso (kg)")}
            {num("age", "Idade")}
          </div>
          <div className="mt-3 flex gap-2">
            {(["masculino", "feminino"] as const).map((sx) => (
              <button type="button" key={sx} className={chip(p.sex === sx)}
                onClick={() => setP({ ...p, sex: sx })}>{sx === "masculino" ? "Masculino" : "Feminino"}</button>
            ))}
          </div>
        </section>
        {(Object.keys(MENU) as (keyof typeof MENU)[]).map((meal) => (
          <section key={meal}>
            <h2 className="text-2xl">{MEAL_TITLES[meal]}</h2>
            <p className="mb-3 text-sm text-muted-foreground">Selecione o que você mais gosta, sem limites.</p>
            {MENU[meal].map((cat) => (
              <div key={cat.name} className="mb-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{cat.name}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.foods.map((f) => (
                    <button type="button" key={f.id} className={chip(prefs.includes(f.id))}
                      onClick={() => toggle(f.id)}>{f.name}</button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
        <Button type="submit" size="lg" className="w-full">Gerar minha dieta</Button>
      </form>
    </div>
  );
}
