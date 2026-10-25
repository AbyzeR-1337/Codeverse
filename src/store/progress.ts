// Глобальное состояние прогресса ученика.
// Хранится в localStorage, синхронизируется с сервером (см. sync.ts), подписка через useSyncExternalStore.
import { useSyncExternalStore } from 'react';

export interface SrsCard {
  ease: number;
  interval: number; // дни
  due: number; // timestamp
  reps: number;
}

export interface Quest {
  id: string;
  title: string;
  metric: Metric;
  goal: number;
  progress: number;
  xp: number;
  done: boolean;
}

export type Metric = 'lessons' | 'steps' | 'problems' | 'qte' | 'reviews' | 'xp' | 'games' | 'bugs' | 'code_runs';

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  qte: boolean;
  sound: boolean;
  aiKey: string;
  aiModel: string;
  syncUrl: string;
  syncToken: string;
  preferredLang: 'js' | 'python';
  /** Выбранный курс ('' — ещё не выбран). */
  course: '' | 'python' | 'js' | 'algo';
  /** Режим «только программирование»: скрывает мини-игры, собеседование и сезонные события. */
  focusMode: boolean;
  reducedMotion: boolean;
}

export interface State {
  version: 1;
  updatedAt: number;
  profile: { name: string; createdAt: number; avatar: string; goalMinutes: number };
  xp: number;
  completedLessons: Record<string, { at: number; score: number; mistakes: number }>;
  lessonStep: Record<string, number>;
  solvedProblems: Record<string, { at: number; lang: string; ms: number }>;
  projectStep: Record<string, number>;
  completedProjects: Record<string, number>;
  topicStats: Record<string, { ok: number; fail: number }>;
  mistakes: { topic: string; kind: string; at: number; detail: string }[];
  streak: { current: number; best: number; lastDay: string };
  activity: Record<string, number>;
  achievements: Record<string, number>;
  srs: Record<string, SrsCard>;
  daily: { day: string; quests: Quest[] };
  weekly: { week: string; quests: Quest[] };
  games: Record<string, number>;
  interviews: { at: number; score: number; role: string }[];
  exams: Record<string, { best: number; passed: boolean }>;
  counters: Record<Metric | 'qte_total' | 'hints' | 'ai_questions' | 'debug_sessions' | 'terminal_cmds', number>;
  settings: Settings;
}

const KEY = 'codeverse.state.v1';

export const today = (d = new Date()) => d.toISOString().slice(0, 10);
export function weekId(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const w = Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(w).padStart(2, '0')}`;
}

function defaultState(): State {
  return {
    version: 1,
    updatedAt: Date.now(),
    profile: { name: 'Ученик', createdAt: Date.now(), avatar: '🧑‍💻', goalMinutes: 20 },
    xp: 0,
    completedLessons: {},
    lessonStep: {},
    solvedProblems: {},
    projectStep: {},
    completedProjects: {},
    topicStats: {},
    mistakes: [],
    streak: { current: 0, best: 0, lastDay: '' },
    activity: {},
    achievements: {},
    srs: {},
    daily: { day: '', quests: [] },
    weekly: { week: '', quests: [] },
    games: {},
    interviews: [],
    exams: {},
    counters: {
      lessons: 0, steps: 0, problems: 0, qte: 0, reviews: 0, xp: 0, games: 0, bugs: 0, code_runs: 0,
      qte_total: 0, hints: 0, ai_questions: 0, debug_sessions: 0, terminal_cmds: 0,
    },
    settings: {
      theme: 'dark',
      fontSize: 14,
      qte: true,
      sound: true,
      aiKey: '',
      aiModel: 'claude-opus-5-5',
      syncUrl: '',
      syncToken: '',
      preferredLang: 'python',
      course: '',
      focusMode: true,
      reducedMotion: false,
    },
  };
}

function load(): State {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...parsed.profile },
      settings: { ...base.settings, ...parsed.settings },
      counters: { ...base.counters, ...parsed.counters },
    };
  } catch {
    return base;
  }
}

let state: State = typeof localStorage === 'undefined' ? defaultState() : load();
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* квота или приватный режим — прогресс останется в памяти */
    }
  }, 150);
}

export function getState() {
  return state;
}

export function setState(fn: (s: State) => State | void, opts: { silentSync?: boolean } = {}) {
  const draft = structuredClone(state);
  const res = fn(draft);
  state = res ?? draft;
  if (!opts.silentSync) state.updatedAt = Date.now();
  persist();
  listeners.forEach((l) => l());
}

export function replaceState(next: State) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export function resetProgress() {
  const settings = state.settings;
  state = { ...defaultState(), settings };
  persist();
  listeners.forEach((l) => l());
}

// ───────────────────────── События для UI (тосты, всплывающие достижения) ─────────────────────────

export type UiEvent =
  | { type: 'xp'; amount: number; reason: string }
  | { type: 'level'; level: number }
  | { type: 'achievement'; id: string }
  | { type: 'quest'; title: string; xp: number }
  | { type: 'toast'; text: string; tone?: 'info' | 'good' | 'bad' };

const uiListeners = new Set<(e: UiEvent) => void>();
export function onUi(l: (e: UiEvent) => void) {
  uiListeners.add(l);
  return () => {
    uiListeners.delete(l);
  };
}
export function emitUi(e: UiEvent) {
  uiListeners.forEach((l) => l(e));
}
export const toast = (text: string, tone: 'info' | 'good' | 'bad' = 'info') => emitUi({ type: 'toast', text, tone });

// ───────────────────────── Уровни ─────────────────────────

/** Суммарный опыт, нужный для достижения уровня `lvl` (уровень 1 — с нуля). */
export function xpForLevel(lvl: number) {
  return Math.round(60 * Math.pow(lvl - 1, 1.6));
}
export function levelFromXp(xp: number) {
  let lvl = 1;
  while (xpForLevel(lvl + 1) <= xp) lvl++;
  return lvl;
}
export function levelTitle(lvl: number) {
  const titles = [
    [1, 'Новичок'],
    [3, 'Стажёр'],
    [6, 'Кодер'],
    [10, 'Junior-разработчик'],
    [15, 'Разработчик'],
    [20, 'Middle-разработчик'],
    [28, 'Senior-разработчик'],
    [36, 'Архитектор'],
    [45, 'Гуру кода'],
    [60, 'Легенда CodeVerse'],
  ] as const;
  let t: string = titles[0][1];
  for (const [l, name] of titles) if (lvl >= l) t = name;
  return t;
}

// ───────────────────────── Сезонные события ─────────────────────────

export interface Season {
  id: string;
  title: string;
  description: string;
  multiplier: number;
  /** Метрика, по которой действует множитель (или все). */
  boosts: Metric | 'all';
}
export function currentSeason(d = new Date()): Season | null {
  const m = d.getMonth();
  if (m === 9) return { id: 'halloween', title: '🎃 Хэллоуинская охота на баги', description: 'Весь октябрь: x2 опыта за исправление багов и игру «Охота на баги».', multiplier: 2, boosts: 'bugs' };
  if (m === 11 || m === 0) return { id: 'newyear', title: '🎄 Новогодний марафон', description: 'x1.5 опыта за все уроки до конца января.', multiplier: 1.5, boosts: 'all' };
  if (m === 2) return { id: 'spring', title: '🌱 Весенний спринт алгоритмов', description: 'x2 опыта за решённые задачи в задачнике.', multiplier: 2, boosts: 'problems' };
  if (m >= 5 && m <= 7) return { id: 'summer', title: '☀️ Летний проектный лагерь', description: 'x1.5 опыта за шаги проектов и уроки.', multiplier: 1.5, boosts: 'steps' };
  return null;
}
