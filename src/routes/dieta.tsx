import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  bmi, bmiLabel, dailyCalories, generateWeek, GOALS, MEAL_INFO, MEAL_KEYS, WEEKDAYS,
} from "@/lib/diet";
import { setState, useStore } from "@/lib/store";

export const Route = createFileRoute("/dieta")({
  head: () => ({
    meta: [
      { title: "Minha dieta da semana — Barriga Zero" },
      { name: "description", content: "Seu cardápio semanal com horários e opções para cada refeição." },
      { property: "og:title", content: "Minha dieta da semana — Barriga Zero" },
      { property: "og:description", content: "Cardápio semanal personalizado com download em PDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AppShell><Dieta /></AppShell>,
});

function Dieta() {
  const s = useStore();
  const p = s.profile!;
  const week = useMemo(() => generateWeek(p, s.prefs, s.seed), [p, s.prefs, s.seed]);
  const [day, setDay] = useState(0);
  const kcal = dailyCalories(p);
  const b = bmi(p);

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 15;
    const line = (t: string, size = 10, bold = false) => {
      if (y > 280) { doc.addPage(); y = 15; }
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.splitTextToSize(t, 180).forEach((l: string) => { doc.text(l, 15, y); y += size * 0.5; });
      y += 1;
    };
    line("BARRIGA ZERO - Minha Dieta", 18, true);
    line(`${s.user?.name ?? ""} | ${GOALS.find((g) => g.id === p.goal)?.label} | ${kcal} kcal/dia | IMC ${b.toFixed(1)}`);
    week.forEach((d, i) => {
      y += 3;
      line(WEEKDAYS[i], 14, true);
      MEAL_KEYS.forEach((k) => {
        line(`${MEAL_INFO[k].time} - ${MEAL_INFO[k].label}`, 11, true);
        d[k].forEach((o, n) =>
          line(`  Opção ${n + 1} (${o.kcal} kcal): ${o.items.map((it) => `${it.name} - ${it.portion}`).join("; ")}`, 9),
        );
      });
    });
    doc.save("barriga-zero-dieta.pdf");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-hero p-6 text-primary-foreground shadow-soft">
        <p className="text-sm opacity-85">{GOALS.find((g) => g.id === p.goal)?.label}</p>
        <p className="font-display text-4xl">{kcal} kcal/dia</p>
        <p className="mt-1 text-sm opacity-85">IMC {b.toFixed(1)} · {bmiLabel(b)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={downloadPdf}>Baixar PDF</Button>
          <Button variant="secondary" onClick={() => setState((st) => ({ seed: st.seed + 1 }))}>
            Gerar novas opções
          </Button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {WEEKDAYS.map((d, i) => (
          <button key={d} onClick={() => setDay(i)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              day === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {d}
          </button>
        ))}
      </div>
      {MEAL_KEYS.map((k) => (
        <section key={k} className="rounded-3xl border border-border bg-card p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl">{MEAL_INFO[k].label}</h2>
            <span className="text-sm font-semibold text-primary">{MEAL_INFO[k].time}</span>
          </div>
          <div className="space-y-2">
            {week[day][k].map((o, n) => (
              <div key={n} className="rounded-2xl bg-muted p-3">
                <div className="mb-1 flex justify-between text-xs font-bold uppercase text-muted-foreground">
                  <span>Opção {n + 1}</span><span>{o.kcal} kcal</span>
                </div>
                <ul className="text-sm">
                  {o.items.map((it, j) => (
                    <li key={j}><b>{it.name}</b> <span className="text-muted-foreground">— {it.portion}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
