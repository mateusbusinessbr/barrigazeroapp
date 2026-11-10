import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setState, useStore } from "@/lib/store";

export const Route = createFileRoute("/evolucao")({
  head: () => ({
    meta: [
      { title: "Timeline de Evolução — Barriga Zero" },
      { name: "description", content: "Acompanhe sua transformação mês a mês com fotos e medidas." },
      { property: "og:title", content: "Timeline de Evolução — Barriga Zero" },
      { property: "og:description", content: "Compare seu antes e depois." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AppShell><Evolucao /></AppShell>,
});

const monthKey = () => new Date().toISOString().slice(0, 7);
const monthLabel = (k: string) =>
  new Date(k + "-15").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

function resize(file: File): Promise<string> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const r = 480 / Math.max(img.width, img.height);
      c.width = img.width * r; c.height = img.height * r;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.7));
    };
    img.src = URL.createObjectURL(file);
  });
}

function Evolucao() {
  const s = useStore();
  const mk = monthKey();
  const current = s.timeline.find((m) => m.month === mk);
  const [w, setW] = useState(current?.weight ?? s.profile?.weight ?? 0);
  const upsert = (patch: { weight?: number; photos?: string[] }) =>
    setState((st) => {
      const ex = st.timeline.find((m) => m.month === mk) ?? { month: mk, weight: w, photos: [] };
      const next = { ...ex, ...patch };
      return { timeline: [...st.timeline.filter((m) => m.month !== mk), next].sort((a, b) => a.month.localeCompare(b.month)) };
    });
  const sorted = [...s.timeline].reverse();
  const first = s.timeline[0];
  const last = s.timeline[s.timeline.length - 1];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl">Timeline de Evolução</h1>
        <p className="text-muted-foreground">Acompanhe sua transformação mês a mês através de fotos e medidas.</p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-xl capitalize">{monthLabel(mk)}</h2>
        <p className="mb-3 text-sm text-muted-foreground">Medidas do mês</p>
        <div className="flex gap-2">
          <Input type="number" step="0.1" value={w || ""} onChange={(e) => setW(Number(e.target.value))} className="w-32" />
          <span className="self-center text-sm">kg</span>
          <Button className="ml-auto" onClick={() => upsert({ weight: w })}>Salvar peso</Button>
        </div>
        <label className="mt-4 block cursor-pointer rounded-2xl border-2 border-dashed border-border p-5 text-center">
          <p className="font-semibold text-primary">Enviar fotos</p>
          <p className="text-xs text-muted-foreground">Capture sua evolução visual para acompanhar o progresso</p>
          <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            const imgs = await Promise.all(files.map(resize));
            upsert({ photos: [...(current?.photos ?? []), ...imgs] });
          }} />
        </label>
      </section>

      {first && last && first !== last && (
        <section className="rounded-3xl bg-hero p-5 text-primary-foreground">
          <h2 className="mb-3 text-xl">Antes e Depois</h2>
          <div className="grid grid-cols-2 gap-3 text-center">
            {[first, last].map((m) => (
              <div key={m.month}>
                {m.photos[0] && <img src={m.photos[0]} alt="" className="mb-2 aspect-[3/4] w-full rounded-2xl object-cover" />}
                <p className="text-sm capitalize">{monthLabel(m.month)}</p>
                <p className="font-display text-2xl">{m.weight} kg</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center font-semibold">
            {(last.weight - first.weight > 0 ? "+" : "") + (last.weight - first.weight).toFixed(1)} kg
          </p>
        </section>
      )}

      <div className="space-y-3">
        {sorted.length === 0 && <p className="text-center text-muted-foreground">Salve seu peso para criar o primeiro registro da sua jornada.</p>}
        {sorted.map((m, i) => {
          const prev = sorted[i + 1];
          return (
            <div key={m.month} className="rounded-3xl border border-border bg-card p-4">
              <div className="flex justify-between">
                <p className="font-semibold capitalize">{monthLabel(m.month)}</p>
                <p className="font-display">{m.weight} kg</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {prev ? `${(m.weight - prev.weight).toFixed(1)} kg vs mês anterior` : "Primeira medição — sem dados anteriores para comparação"}
              </p>
              {m.photos.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {m.photos.map((p, j) => <img key={j} src={p} alt="" className="h-28 rounded-xl object-cover" />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
