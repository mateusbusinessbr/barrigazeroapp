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
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 16;
    const green: [number, number, number] = [28, 78, 62];
    const mint: [number, number, number] = [232, 243, 236];
    const ink: [number, number, number] = [39, 52, 46];
    const muted: [number, number, number] = [105, 119, 110];

    const footer = (page: number, total: number) => {
      doc.setDrawColor(220, 229, 222);
      doc.line(margin, pageH - 15, pageW - margin, pageH - 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text("BARRIGA ZERO  •  PLANO SEMANAL", margin, pageH - 9);
      doc.text(`${page} / ${total}`, pageW - margin, pageH - 9, { align: "right" });
    };

    // Capa
    doc.setFillColor(...green);
    doc.rect(0, 0, pageW, 92, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("BARRIGA ZERO", margin, 22);
    doc.setFontSize(27);
    doc.text("Sua semana,", margin, 48);
    doc.text("do seu jeito.", margin, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Cardápio organizado para facilitar suas escolhas.", margin, 73);

    doc.setTextColor(...ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Seu resumo", margin, 113);
    doc.setFillColor(...mint);
    doc.roundedRect(margin, 121, pageW - margin * 2, 39, 4, 4, "F");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text("OBJETIVO", margin + 7, 132);
    doc.text("META CALÓRICA ESTIMADA", margin + 72, 132);
    doc.text("IMC", pageW - margin - 30, 132);
    doc.setTextColor(...green);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(doc.splitTextToSize(GOALS.find((g) => g.id === p.goal)?.label ?? "Personalizado", 58), margin + 7, 143);
    doc.text(`${kcal} kcal/dia`, margin + 72, 143);
    doc.text(b.toFixed(1), pageW - margin - 30, 143);
    doc.setTextColor(...ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Como usar este cardápio", margin, 181);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    const intro = [
      "• Cada dia apresenta opções para café da manhã, lanches, almoço e jantar.",
      "• Escolha uma opção por refeição e ajuste os alimentos à sua rotina.",
      "• As porções e calorias são estimativas; preparo e marcas podem alterar os valores.",
      "• Beba água ao longo do dia e respeite sua fome, saciedade e necessidades individuais.",
    ];
    let introY = 193;
    intro.forEach((item) => {
      const lines = doc.splitTextToSize(item, pageW - margin * 2);
      doc.text(lines, margin, introY);
      introY += lines.length * 5 + 5;
    });
    doc.setFillColor(250, 245, 232);
    doc.roundedRect(margin, 231, pageW - margin * 2, 25, 3, 3, "F");
    doc.setTextColor(120, 91, 48);
    doc.setFontSize(8.5);
    doc.text(
      doc.splitTextToSize("Importante: este material é uma sugestão geral gerada automaticamente e não substitui avaliação de nutricionista. Pessoas com condições de saúde, gestantes, lactantes ou menores de 18 anos devem buscar orientação profissional.",
        pageW - margin * 2 - 12),
      margin + 6, 240,
    );
    footer(1, 8);

    // Uma página organizada para cada dia
    week.forEach((d, i) => {
      doc.addPage();
      doc.setFillColor(...green);
      doc.rect(0, 0, pageW, 29, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text(WEEKDAYS[i]!, margin, 19);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`${kcal} kcal/dia • ${GOALS.find((g) => g.id === p.goal)?.label ?? ""}`, pageW - margin, 18, { align: "right" });

      let y = 38;
      MEAL_KEYS.forEach((key) => {
        const options = d[key].slice(0, 3);
        const cardH = 42;
        doc.setFillColor(246, 249, 246);
        doc.roundedRect(margin, y, pageW - margin * 2, cardH, 3, 3, "F");
        doc.setFillColor(...green);
        doc.roundedRect(margin, y, 2, cardH, 1, 1, "F");
        doc.setTextColor(...green);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text(MEAL_INFO[key].label, margin + 7, y + 8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...muted);
        doc.text(MEAL_INFO[key].time, pageW - margin - 7, y + 8, { align: "right" });

        options.forEach((option, index) => {
          const itemText = option.items.map((item) => `${item.name} — ${item.portion}`).join(" • ");
          const wrapped = doc.splitTextToSize(itemText, pageW - margin * 2 - 42).slice(0, 2);
          const lineY = y + 16 + index * 8.2;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(...green);
          doc.text(`OPÇÃO ${index + 1}`, margin + 7, lineY);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...ink);
          doc.text(wrapped, margin + 30, lineY);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...muted);
          doc.text(`${option.kcal} kcal`, pageW - margin - 7, lineY, { align: "right" });
        });
        y += cardH + 4;
      });
      footer(i + 2, 8);
    });

    doc.save("barriga-zero-cardapio-semanal.pdf");
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
            {week[day]![k].map((o, n) => (
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
