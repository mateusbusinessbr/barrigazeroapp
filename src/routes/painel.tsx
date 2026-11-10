import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACTIVITIES, dailyCalories, MEAL_INFO, MEAL_KEYS } from "@/lib/diet";
import { setState, today, useStore } from "@/lib/store";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Hoje — Barriga Zero" },
      { name: "description", content: "Registre refeições, água e treinos do dia." },
      { property: "og:title", content: "Hoje — Barriga Zero" },
      { property: "og:description", content: "Acompanhe todo o seu progresso diário." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AppShell><Painel /></AppShell>,
});

function weekStart() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

function Painel() {
  const s = useStore();
  const t = today();
  const kcal = dailyCalories(s.profile!);
  const water = s.water[t] ?? 0;
  const meals = s.meals[t] ?? {};
  const trainedDays = new Set(s.workouts.filter((w) => w.date >= weekStart()).map((w) => w.date)).size;
  const [act, setAct] = useState(ACTIVITIES[0]!.id);
  const [min, setMin] = useState(30);
  const eaten = Object.values(meals).reduce((a, b) => a + (b ?? 0), 0);
  const burned = s.workouts.filter((w) => w.date === t).reduce((a, w) => a + w.kcal, 0);
  const firstMeal = Object.keys(s.meals).length === 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-muted-foreground">Olá, {s.user?.name.split(" ")[0] ?? ""} 👋</p>
        <h1 className="text-3xl">Acompanhe todo o seu progresso</h1>
      </div>

      {firstMeal && (
        <div className="rounded-3xl bg-accent p-5 text-accent-foreground">
          <p className="font-display text-lg">Desafio de 30 dias 🏆</p>
          <p className="text-sm">Registre sua 1ª refeição e comece seu desafio para concorrer a prêmios mensais!</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Consumido" value={`${eaten}`} sub={`de ${kcal} kcal`} />
        <Stat label="Gasto" value={`${burned}`} sub="kcal em treinos" />
        <Stat label="Treinos" value={`${trainedDays}/7`} sub="esta semana" />
      </div>

      <Card title="Registre suas REFEIÇÕES" sub="Toque na refeição que você acabou de fazer">
        <div className="space-y-2">
          {MEAL_KEYS.map((k) => {
            const target = Math.round(kcal * MEAL_INFO[k].share);
            const done = meals[k] ?? 0;
            return (
              <button key={k}
                onClick={() => setState((st) => ({
                  meals: { ...st.meals, [t]: { ...st.meals[t], [k]: done ? 0 : target } },
                }))}
                className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition ${
                  done ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <span className="font-semibold">{done ? "✓ " : ""}{MEAL_INFO[k].label}</span>
                <span className="text-sm">{done} / {target} kcal</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Hidratação" sub={`Hoje — ${water} ml de 2500 ml`}>
        <div className="mb-3 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-water transition-all" style={{ width: `${Math.min(100, water / 25)}%` }} />
        </div>
        <div className="flex gap-2">
          {[100, 250, 500].map((ml) => (
            <Button key={ml} variant="outline" onClick={() =>
              setState((st) => ({ water: { ...st.water, [t]: (st.water[t] ?? 0) + ml } }))}>+{ml} ml</Button>
          ))}
          <Button variant="ghost" onClick={() => setState((st) => ({ water: { ...st.water, [t]: 0 } }))}>Zerar</Button>
        </div>
      </Card>

      <Card title="Registre seus TREINOS" sub="Que atividade você fez?">
        <div className="mb-3 grid grid-cols-2 gap-2">
          {ACTIVITIES.map((a) => (
            <button key={a.id} onClick={() => setAct(a.id)}
              className={`rounded-2xl p-3 text-left ${act === a.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <p className="font-semibold">{a.label}</p>
              <p className="text-xs opacity-80">{a.kcalMin} kcal/min</p>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input type="number" min={1} value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-28" />
          <span className="self-center text-sm text-muted-foreground">minutos</span>
          <Button className="ml-auto" onClick={() => {
            const a = ACTIVITIES.find((x) => x.id === act)!;
            setState((st) => ({ workouts: [...st.workouts, { date: t, activity: a.label, minutes: min, kcal: a.kcalMin * min }] }));
          }}>Nova atividade</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/evolucao" className="rounded-3xl bg-secondary p-5">
          <p className="font-display text-secondary-foreground">Evolução</p>
          <p className="text-sm text-muted-foreground">Fotos e medidas mês a mês</p>
        </Link>
        <Link to="/perfil" className="rounded-3xl bg-secondary p-5">
          <p className="font-display text-secondary-foreground">Modificar Dieta</p>
          <p className="text-sm text-muted-foreground">Ajustar detalhes</p>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Card({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <h2 className="text-xl">{title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{sub}</p>
      {children}
    </section>
  );
}
