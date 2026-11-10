export type Goal =
  | "emagrecimento"
  | "massa"
  | "definicao"
  | "emagrecimento_massa"
  | "definicao_massa";

export const GOALS: { id: Goal; label: string }[] = [
  { id: "emagrecimento", label: "Emagrecimento" },
  { id: "massa", label: "Ganho de massa muscular" },
  { id: "definicao", label: "Definição" },
  { id: "emagrecimento_massa", label: "Emagrecimento + ganho de massa" },
  { id: "definicao_massa", label: "Definição + ganho de massa muscular" },
];

export type Profile = {
  goal: Goal;
  height: number; // cm
  weight: number; // kg
  age: number;
  sex: "masculino" | "feminino";
};

export type MealKey = "cafe" | "lancheManha" | "almoco" | "lancheTarde" | "jantar";

export type Food = { id: string; name: string; kcal: number; portion: string };
export type Category = { name: string; foods: Food[] };

const f = (name: string, kcal: number, portion: string): Food => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/gi, "-"),
  name,
  kcal,
  portion,
});

export const MENU: Record<"cafe" | "almoco" | "jantar", Category[]> = {
  cafe: [
    {
      name: "Principal",
      foods: [
        f("Pão + Frango", 260, "1 pão francês + 60g frango"),
        f("Pão + Ovo", 230, "1 pão francês + 1 ovo"),
        f("Pão + Queijo", 240, "1 pão francês + 1 fatia queijo"),
        f("Pão + Presunto e Queijo", 280, "1 pão + 1 fatia de cada"),
        f("Tapioca de Queijo", 250, "1 tapioca média"),
        f("Tapioca de Frango", 270, "1 tapioca média"),
        f("Cuscuz + Ovo", 260, "100g cuscuz + 1 ovo"),
        f("Pão de Queijo", 200, "3 unidades pequenas"),
        f("Omelete", 190, "2 ovos + legumes"),
      ],
    },
    {
      name: "Frutas",
      foods: [f("Maçã", 70, "1 unidade"), f("Banana", 90, "1 unidade"), f("Mamão", 60, "1 fatia")],
    },
    {
      name: "Bebidas",
      foods: [
        f("Café + Leite Desnatado", 60, "1 xícara"),
        f("Café", 5, "1 xícara sem açúcar"),
        f("Iogurte", 90, "1 pote natural"),
      ],
    },
  ],
  almoco: [
    {
      name: "Proteínas",
      foods: [
        f("Frango grelhado", 190, "120g"),
        f("Carne moída magra", 230, "120g"),
        f("Peixe grelhado", 170, "120g"),
        f("Bife de patinho", 220, "120g"),
        f("Ovos cozidos", 150, "2 unidades"),
      ],
    },
    {
      name: "Carboidratos",
      foods: [
        f("Arroz branco", 130, "4 colheres"),
        f("Arroz integral", 120, "4 colheres"),
        f("Batata doce", 110, "120g"),
        f("Macarrão", 160, "1 escumadeira"),
        f("Mandioca", 150, "100g"),
      ],
    },
    {
      name: "Acompanhamentos",
      foods: [
        f("Feijão", 80, "1 concha"),
        f("Salada verde", 25, "à vontade"),
        f("Legumes cozidos", 50, "1 xícara"),
        f("Lentilha", 90, "1 concha"),
      ],
    },
  ],
  jantar: [
    {
      name: "Proteínas",
      foods: [
        f("Frango desfiado", 180, "100g"),
        f("Omelete de legumes", 190, "2 ovos"),
        f("Atum", 130, "1 lata"),
        f("Peixe assado", 160, "120g"),
        f("Carne magra", 210, "100g"),
      ],
    },
    {
      name: "Base",
      foods: [
        f("Sopa de legumes", 120, "1 prato"),
        f("Wrap integral", 140, "1 unidade"),
        f("Batata doce", 110, "120g"),
        f("Arroz integral", 120, "4 colheres"),
        f("Crepioca", 150, "1 unidade"),
      ],
    },
    {
      name: "Complementos",
      foods: [
        f("Salada verde", 25, "à vontade"),
        f("Legumes salteados", 60, "1 xícara"),
        f("Abacate", 80, "2 colheres"),
      ],
    },
  ],
};

const SNACKS: Food[] = [
  f("Fruta da estação", 70, "1 unidade"),
  f("Iogurte natural", 90, "1 pote"),
  f("Mix de castanhas", 120, "1 punhado"),
  f("Pão integral com pasta de amendoim", 200, "1 fatia + 1 colher"),
  f("Whey com leite desnatado", 180, "1 dose + 200ml"),
  f("Banana com aveia", 150, "1 banana + 1 colher"),
  f("Queijo branco", 80, "2 fatias"),
];

export const MEAL_INFO: Record<MealKey, { label: string; time: string; share: number }> = {
  cafe: { label: "Café da Manhã", time: "07:00", share: 0.25 },
  lancheManha: { label: "Lanche da Manhã", time: "10:00", share: 0.1 },
  almoco: { label: "Almoço", time: "12:30", share: 0.3 },
  lancheTarde: { label: "Lanche da Tarde", time: "16:00", share: 0.15 },
  jantar: { label: "Jantar", time: "19:30", share: 0.2 },
};

export const MEAL_KEYS = Object.keys(MEAL_INFO) as MealKey[];

export function bmi(p: Profile) {
  const h = p.height / 100;
  return p.weight / (h * h);
}

export function bmiLabel(v: number) {
  if (v < 18.5) return "Abaixo do peso";
  if (v < 25) return "Peso normal";
  if (v < 30) return "Sobrepeso";
  return "Obesidade";
}

const GOAL_FACTOR: Record<Goal, number> = {
  emagrecimento: 0.8,
  definicao: 0.85,
  emagrecimento_massa: 0.9,
  definicao_massa: 1.0,
  massa: 1.15,
};

export function dailyCalories(p: Profile) {
  const bmr =
    10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === "masculino" ? 5 : -161);
  let factor = GOAL_FACTOR[p.goal];
  // Extra deficit when BMI is high, gentler when low
  const b = bmi(p);
  if (b >= 30 && factor < 1) factor -= 0.05;
  if (b < 18.5) factor = Math.max(factor, 1.05);
  return Math.round((bmr * 1.4 * factor) / 10) * 10;
}

export type MealOption = { items: { name: string; portion: string }[]; kcal: number };
export type DayPlan = Record<MealKey, MealOption[]>;

function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function pick<T>(arr: T[], r: () => number) {
  return arr[Math.floor(r() * arr.length)];
}

function scale(items: Food[], target: number): MealOption {
  const raw = items.reduce((a, b) => a + b.kcal, 0) || 1;
  const m = Math.min(2, Math.max(0.5, target / raw));
  const label = m > 1.15 ? ` (x${m.toFixed(1)})` : m < 0.85 ? " (meia porção)" : "";
  return {
    items: items.map((i) => ({ name: i.name, portion: i.portion + label })),
    kcal: Math.round(raw * m),
  };
}

function buildMain(
  meal: "cafe" | "almoco" | "jantar",
  selected: string[],
  target: number,
  r: () => number,
) {
  const options: MealOption[] = [];
  for (let n = 0; n < 4; n++) {
    const items: Food[] = [];
    for (const cat of MENU[meal]) {
      const chosen = cat.foods.filter((x) => selected.includes(x.id));
      const pool = chosen.length ? chosen : cat.foods;
      items.push(pick(pool, r));
    }
    options.push(scale(items, target));
  }
  return options;
}

export function generateWeek(p: Profile, prefs: string[], seed = 1): DayPlan[] {
  const kcal = dailyCalories(p);
  const days: DayPlan[] = [];
  for (let d = 0; d < 7; d++) {
    const r = rng(seed * 97 + d * 131 + 7);
    const day = {} as DayPlan;
    for (const k of MEAL_KEYS) {
      const target = kcal * MEAL_INFO[k].share;
      if (k === "cafe" || k === "almoco" || k === "jantar") {
        day[k] = buildMain(k, prefs, target, r);
      } else {
        day[k] = Array.from({ length: 3 }, () => scale([pick(SNACKS, r)], target));
      }
    }
    days.push(day);
  }
  return days;
}

export const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export const ACTIVITIES = [
  { id: "musculacao", label: "Musculação", kcalMin: 6 },
  { id: "cardio", label: "Cardio Intenso", kcalMin: 12 },
  { id: "caminhada", label: "Caminhada", kcalMin: 4 },
  { id: "futebol", label: "Futebol", kcalMin: 10 },
];

export const PLANS = [
  { id: "mensal", label: "Mensal", price: "R$ 19,90", period: "/mês" },
  { id: "anual", label: "Anual", price: "R$ 97", period: "/ano", badge: "Economize 59%" },
] as const;
