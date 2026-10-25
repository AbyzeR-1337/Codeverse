// Синхронизация прогресса между устройствами.
// Сервер (server/sync-server.mjs) хранит JSON по токену. Клиент сливает локальную и удалённую копии,
// поэтому можно заниматься офлайн на телефоне и на компьютере одновременно — ничего не потеряется.
import { getState, replaceState, State, toast } from './progress';
import { loadVfsSnapshot, restoreVfsSnapshot } from '../runtime/vfs';

function mergeRecord<T>(a: Record<string, T>, b: Record<string, T>, prefer: (x: T, y: T) => T): Record<string, T> {
  const out: Record<string, T> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in out ? prefer(out[k], v) : v;
  return out;
}

const newer = <T extends { at: number }>(x: T, y: T) => (y.at > x.at ? y : x);

export function mergeStates(local: State, remote: State): State {
  const latest = remote.updatedAt > local.updatedAt ? remote : local;
  return {
    ...latest,
    xp: Math.max(local.xp, remote.xp),
    completedLessons: mergeRecord(local.completedLessons, remote.completedLessons, newer),
    solvedProblems: mergeRecord(local.solvedProblems, remote.solvedProblems, newer),
    lessonStep: mergeRecord(local.lessonStep, remote.lessonStep, Math.max),
    projectStep: mergeRecord(local.projectStep, remote.projectStep, Math.max),
    completedProjects: mergeRecord(local.completedProjects, remote.completedProjects, Math.min),
    achievements: mergeRecord(local.achievements, remote.achievements, Math.min),
    activity: mergeRecord(local.activity, remote.activity, Math.max),
    games: mergeRecord(local.games, remote.games, Math.max),
    exams: mergeRecord(local.exams, remote.exams, (x, y) => ({ best: Math.max(x.best, y.best), passed: x.passed || y.passed })),
    srs: mergeRecord(local.srs, remote.srs, (x, y) => (y.reps > x.reps ? y : x)),
    topicStats: mergeRecord(local.topicStats, remote.topicStats, (x, y) => ({ ok: Math.max(x.ok, y.ok), fail: Math.max(x.fail, y.fail) })),
    streak: {
      current: latest.streak.current,
      best: Math.max(local.streak.best, remote.streak.best),
      lastDay: local.streak.lastDay > remote.streak.lastDay ? local.streak.lastDay : remote.streak.lastDay,
    },
    interviews: [...new Map([...local.interviews, ...remote.interviews].map((i) => [i.at, i])).values()].sort((a, b) => b.at - a.at),
    // Настройки (в т.ч. API-ключ) не перезаписываем удалённой копией.
    settings: local.settings,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
  };
}

let syncing = false;

export async function syncNow(opts: { quiet?: boolean } = {}): Promise<boolean> {
  const { syncUrl, syncToken } = getState().settings;
  if (!syncUrl || !syncToken || syncing) return false;
  syncing = true;
  const url = `${syncUrl.replace(/\/$/, '')}/sync/${encodeURIComponent(syncToken)}`;
  try {
    const res = await fetch(url);
    let merged = getState();
    let files = loadVfsSnapshot();
    if (res.ok) {
      const remote = (await res.json()) as { state?: State; files?: string };
      if (remote.state) merged = mergeStates(getState(), remote.state);
      if (remote.files && remote.state && remote.state.updatedAt > getState().updatedAt) {
        files = remote.files;
        restoreVfsSnapshot(files);
      }
    }
    replaceState(merged);
    const { aiKey: _omit, ...safeSettings } = merged.settings;
    const put = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: { ...merged, settings: { ...safeSettings, aiKey: '' } }, files }),
    });
    if (!put.ok) throw new Error(`HTTP ${put.status}`);
    if (!opts.quiet) toast('Прогресс синхронизирован ☁️', 'good');
    return true;
  } catch (e) {
    if (!opts.quiet) toast(`Синхронизация не удалась: ${(e as Error).message}`, 'bad');
    return false;
  } finally {
    syncing = false;
  }
}

/** Экспорт/импорт файла — синхронизация без сервера. */
export function exportProgress() {
  const { aiKey: _omit, ...settings } = getState().settings;
  const blob = new Blob([JSON.stringify({ state: { ...getState(), settings: { ...settings, aiKey: '' } }, files: loadVfsSnapshot() }, null, 2)], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `codeverse-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importProgress(file: File) {
  const data = JSON.parse(await file.text()) as { state: State; files?: string };
  replaceState(mergeStates(getState(), data.state));
  if (data.files) restoreVfsSnapshot(data.files);
  toast('Прогресс импортирован', 'good');
}

/** Автосинхронизация: при запуске, раз в 2 минуты и при возвращении на вкладку. */
export function startAutoSync() {
  const run = () => void syncNow({ quiet: true });
  run();
  setInterval(run, 120_000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') run();
  });
  window.addEventListener('online', run);
}
