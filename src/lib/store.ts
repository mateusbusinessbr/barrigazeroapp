import { useSyncExternalStore } from "react";
import type { MealKey, Profile } from "./diet";

export type Measurement = { month: string; weight: number; photos: string[] };
export type State = {
  user: { name: string; email: string } | null;
  plan: "mensal" | "anual" | null;
  profile: Profile | null;
  prefs: string[];
  seed: number;
  water: Record<string, number>;
  meals: Record<string, Partial<Record<MealKey, number>>>;
  workouts: { date: string; activity: string; minutes: number; kcal: number }[];
  timeline: Measurement[];
};

const KEY = "barriga-zero";
const initial: State = {
  user: null,
  plan: null,
  profile: null,
  prefs: [],
  seed: 1,
  water: {},
  meals: {},
  workouts: [],
  timeline: [],
};

let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

export function setState(fn: (s: State) => Partial<State>) {
  load();
  state = { ...state, ...fn(state) };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full (photos) */
  }
  listeners.forEach((l) => l());
}

export function getState() {
  load();
  return state;
}

export function useStore() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getState,
    () => initial,
  );
}

export const today = () => new Date().toISOString().slice(0, 10);
