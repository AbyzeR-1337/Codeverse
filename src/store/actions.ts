// Игровая механика: опыт, серии, задания дня/недели, достижения, интервальное повторение.
import {
  currentSeason, emitUi, getState, levelFromXp, Metric, Quest, setState, State, today, weekId,
} from './progress';
import { ACHIEVEMENTS } from './achievements';

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

const DAILY_POOL: Omit<Quest, 'progress' | 'done'>[] = [
  { id: 'd-lessons-2', title: 'Пройди 2 урока', metric: 'lessons', goal: 2, xp: 40 },
  { id: 'd-lessons-1', title: 'Пройди урок', metric: 'lessons', goal: 1, xp: 25 },
  { id: 'd-steps-15', title: 'Выполни 15 шагов уроков', metric: 'steps', goal: 15, xp: 30 },
  { id: 'd-problem-1', title: 'Реши задачу из задачника', metric: 'problems', goal: 1, xp: 40 },
  { id: 'd-qte-3', title: 'Ответь правильно на 3 Quick Time Event', metric: 'qte', goal: 3, xp: 30 },
  { id: 'd-review-10', title: 'Повтори 10 карточек', metric: 'reviews', goal: 10, xp: 25 },
  { id: 'd-xp-150', title: 'Набери 150 XP', metric: 'xp', goal: 150, xp: 30 },
  { id: 'd-games-2', title: 'Сыграй 2 мини-игры', metric: 'games', goal: 2, xp: 20 },
  { id: 'd-bugs-3', title: 'Исправь 3 бага', metric: 'bugs', goal: 3, xp: 35 },
  { id: 'd-runs-10', title: 'Запусти код 10 раз', metric: 'code_runs', goal: 10, xp: 15 },
];

const WEEKLY_POOL: Omit<Quest, 'progress' | 'done'>[] = [
  { id: 'w-lessons-10', title: 'Недельный марафон: 10 уроков', metric: 'lessons', goal: 10, xp: 200 },
  { id: 'w-problems-5', title: 'Алгоритмическая неделя: 5 задач', metric: 'problems', goal: 5, xp: 250 },
  { id: 'w-xp-1000', title: 'Набери 1000 XP за неделю', metric: 'xp', goal: 1000, xp: 200 },
  { id: 'w-bugs-15', title: 'Охотник за багами: 15 исправлений', metric: 'bugs', goal: 15, xp: 180 },
  { id: 'w-review-50', title: 'Память как сталь: 50 повторений', metric: 'reviews', goal: 50, xp: 150 },
  { id: 'w-games-10', title: 'Игрок недели: 10 мини-игр', metric: 'games', goal: 10, xp: 150 },
];

function pick<T>(pool: T[], n: number, seed: string): T[] {
  const arr = [...pool];
  let h = hash(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

/** Обновить задания дня и недели, если наступил новый день/неделя. */
export function ensureQuests() {
  const s = getState();
  const d = today();
  const w = weekId();
  if (s.daily.day === d && s.weekly.week === w) return;
  setState((st) => {
    if (st.daily.day !== d) {
      st.daily = { day: d, quests: pick(DAILY_POOL, 3, d).map((q) => ({ ...q, progress: 0, done: false })) };
    }
    if (st.weekly.week !== w) {
      st.weekly = { week: w, quests: pick(WEEKLY_POOL, 2, w).map((q) => ({ ...q, progress: 0, done: false })) };
    }
  }, { silentSync: true });
}

function bumpStreak(st: State) {
  const d = today();
  if (st.streak.lastDay === d) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  st.streak.current = st.streak.lastDay === today(y) ? st.streak.current + 1 : 1;
  st.streak.best = Math.max(st.streak.best, st.streak.current);
  st.streak.lastDay = d;
}

/** Увеличить счётчик метрики и прогресс заданий. */
export function track(metric: Metric, amount = 1) {
  const finished: Quest[] = [];
  setState((st) => {
    st.counters[metric] = (st.counters[metric] ?? 0) + amount;
    for (const q of [...st.daily.quests, ...st.weekly.quests]) {
      if (q.metric !== metric || q.done) continue;
      q.progress = Math.min(q.goal, q.progress + amount);
      if (q.progress >= q.goal) {
        q.done = true;
        finished.push(q);
      }
    }
  });
  for (const q of finished) {
    emitUi({ type: 'quest', title: q.title, xp: q.xp });
    awardXp(q.xp, `Задание: ${q.title}`, { noQuest: true });
  }
  checkAchievements();
}

/** Увеличить служебный счётчик (для достижений). */
export function bump(name: keyof State['counters'], n = 1) {
  setState((st) => {
    st.counters[name] = (st.counters[name] ?? 0) + n;
  });
  checkAchievements();
}

/** Начислить опыт с учётом сезонного множителя. */
export function awardXp(amount: number, reason: string, opts: { metric?: Metric; noQuest?: boolean } = {}) {
  const season = currentSeason();
  let total = amount;
  if (season && (season.boosts === 'all' || season.boosts === opts.metric)) total = Math.round(amount * season.multiplier);
  const before = levelFromXp(getState().xp);
  setState((st) => {
    st.xp += total;
    const d = today();
    st.activity[d] = (st.activity[d] ?? 0) + total;
    bumpStreak(st);
  });
  emitUi({ type: 'xp', amount: total, reason });
  const after = levelFromXp(getState().xp);
  if (after > before) emitUi({ type: 'level', level: after });
  if (!opts.noQuest) track('xp', total);
}

/** Зафиксировать ответ на шаг: статистика по теме и журнал ошибок для адаптивного обучения. */
export function recordAnswer(topic: string | undefined, ok: boolean, kind: string, detail = '') {
  const t = topic || 'general';
  setState((st) => {
    const ts = (st.topicStats[t] ??= { ok: 0, fail: 0 });
    if (ok) ts.ok++;
    else {
      ts.fail++;
      st.mistakes.unshift({ topic: t, kind, at: Date.now(), detail: detail.slice(0, 200) });
      st.mistakes = st.mistakes.slice(0, 300);
    }
  });
}

/** Слабые темы: высокая доля ошибок при достаточном числе попыток. */
export function weakTopics(limit = 5) {
  const s = getState();
  return Object.entries(s.topicStats)
    .map(([topic, { ok, fail }]) => ({ topic, ok, fail, rate: fail / Math.max(1, ok + fail) }))
    .filter((t) => t.fail >= 2 && t.rate >= 0.3)
    .sort((a, b) => b.rate * b.fail - a.rate * a.fail)
    .slice(0, limit);
}

export function completeLesson(id: string, score: number, mistakes: number) {
  const first = !getState().completedLessons[id];
  setState((st) => {
    const prev = st.completedLessons[id];
    st.completedLessons[id] = { at: Date.now(), score: Math.max(score, prev?.score ?? 0), mistakes };
    delete st.lessonStep[id];
  });
  if (first) {
    awardXp(30 + (mistakes === 0 ? 20 : 0), mistakes === 0 ? 'Урок без ошибок!' : 'Урок пройден', { metric: 'steps' });
    track('lessons');
  }
}

export function solveProblem(id: string, lang: string, ms: number, difficulty: 'easy' | 'medium' | 'hard') {
  const first = !getState().solvedProblems[id];
  setState((st) => {
    st.solvedProblems[id] = { at: Date.now(), lang, ms };
  });
  if (first) {
    awardXp({ easy: 40, medium: 80, hard: 150 }[difficulty], 'Задача решена', { metric: 'problems' });
    track('problems');
  }
}

// ───────────────────────── Интервальное повторение (SM-2) ─────────────────────────

/** quality: 0 — не помню, 3 — с трудом, 4 — хорошо, 5 — легко */
export function reviewCard(id: string, quality: 0 | 3 | 4 | 5) {
  setState((st) => {
    const c = st.srs[id] ?? { ease: 2.5, interval: 0, due: 0, reps: 0 };
    if (quality < 3) {
      c.reps = 0;
      c.interval = 0;
    } else {
      c.reps += 1;
      c.interval = c.reps === 1 ? 1 : c.reps === 2 ? 3 : Math.round(c.interval * c.ease);
    }
    c.ease = Math.max(1.3, c.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    // Карточку «не помню» показываем снова через минуту.
    c.due = Date.now() + (c.interval === 0 ? 60_000 : c.interval * 86_400_000);
    st.srs[id] = c;
  });
  track('reviews');
  if (quality >= 3) awardXp(2, 'Повторение');
}

// ───────────────────────── Достижения ─────────────────────────

export function unlock(id: string) {
  if (getState().achievements[id]) return;
  setState((st) => {
    st.achievements[id] = Date.now();
  });
  emitUi({ type: 'achievement', id });
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (a) awardXp(a.xp, `Достижение: ${a.title}`, { noQuest: true });
}

export function checkAchievements() {
  const s = getState();
  for (const a of ACHIEVEMENTS) {
    if (!s.achievements[a.id] && a.check?.(s)) unlock(a.id);
  }
}
