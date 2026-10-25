// Профиль: уровень, статистика, карта навыков с процентом освоения технологий, достижения, активность.
import { useMemo } from 'react';
import { levelFromXp, levelTitle, setState, useStore, xpForLevel } from '../store/progress';
import { ACHIEVEMENTS } from '../store/achievements';
import { TRACKS } from '../content/course';
import { PROBLEMS } from '../content/problems';
import { TOPICS, topicTitle } from '../content/topics';
import { Heatmap } from '../components/Heatmap';

const AVATARS = ['🧑‍💻', '👩‍💻', '👨‍💻', '🦊', '🐱', '🐼', '🦉', '🤖', '👾', '🚀', '🧙', '🦄'];

/** Технологии, которые входят в «карту навыков». Процент освоения считается по урокам и задачам. */
const SKILLS: { id: string; title: string; icon: string; lessons?: (id: string) => boolean; topics?: string[] }[] = [
  { id: 'cs', title: 'Основы информатики', icon: '🖥️', lessons: (id) => id.startsWith('b-') && !id.includes('git') && !id.includes('internet') && !id.includes('json') },
  { id: 'terminal', title: 'Терминал', icon: '⌨️', lessons: (id) => id === 'b-terminal' || id === 'b-files-folders', topics: ['terminal'] },
  { id: 'git', title: 'Git и GitHub', icon: '🌿', lessons: (id) => id === 'b-git-basics', topics: ['git'] },
  { id: 'web', title: 'Интернет, HTTP, API', icon: '🌐', lessons: (id) => id === 'b-internet-http' || id === 'b-json-api' },
  { id: 'python', title: 'Python', icon: '🐍', lessons: (id) => id.startsWith('py-') },
  { id: 'js', title: 'JavaScript', icon: '🟨', lessons: (id) => id.startsWith('js-') },
  { id: 'dom', title: 'HTML, CSS, DOM', icon: '🕸️', lessons: (id) => id === 'js-dom' },
  { id: 'sql', title: 'Базы данных и SQL', icon: '🗄️', lessons: (id) => id === 'py-sqlite' },
  { id: 'data', title: 'Анализ данных', icon: '📊', lessons: (id) => id === 'py-numpy-pandas' },
  { id: 'oop', title: 'ООП', icon: '🏛️', lessons: (id) => ['py-classes', 'py-inheritance', 'js-classes'].includes(id) },
  { id: 'async', title: 'Асинхронность', icon: '⏳', lessons: (id) => id === 'js-async' },
  { id: 'algo', title: 'Алгоритмы', icon: '🧮', lessons: (id) => id.startsWith('algo-') },
];

export function Profile() {
  const s = useStore((st) => st);
  const lvl = levelFromXp(s.xp);
  const from = xpForLevel(lvl);
  const to = xpForLevel(lvl + 1);

  const allLessonIds = useMemo(() => TRACKS.flatMap((t) => t.modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons.map((l) => l.id)))), []);
  const skills = SKILLS.map((sk) => {
    const ids = allLessonIds.filter((id) => sk.lessons?.(id));
    const done = ids.filter((id) => s.completedLessons[id]).length;
    let pct = ids.length ? (done / ids.length) * 100 : 0;
    if (sk.id === 'algo') {
      const solved = Object.keys(s.solvedProblems).length;
      pct = pct * 0.5 + (solved / PROBLEMS.length) * 50;
    }
    return { ...sk, pct: Math.round(pct), done, total: ids.length };
  });
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]);
  const totalMinutes = Object.keys(s.completedLessons).length * 9;

  return (
    <div className="page profile">
      <section className="profile-head card">
        <div className="avatar-big">{s.profile.avatar}</div>
        <div className="profile-info">
          <input className="name-input" value={s.profile.name} onChange={(e) => setState((st) => void (st.profile.name = e.target.value.slice(0, 30)))} aria-label="Имя" />
          <div className="muted">Уровень {lvl} · {levelTitle(lvl)} · с нами с {new Date(s.profile.createdAt).toLocaleDateString('ru-RU')}</div>
          <div className="level-bar"><div className="level-fill" style={{ width: `${((s.xp - from) / (to - from)) * 100}%` }} /></div>
          <div className="muted small">{s.xp} XP всего · {to - s.xp} XP до уровня {lvl + 1}</div>
          <div className="avatar-row">
            {AVATARS.map((a) => (
              <button key={a} className={`avatar-pick ${a === s.profile.avatar ? 'active' : ''}`} onClick={() => setState((st) => void (st.profile.avatar = a))}>{a}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat"><b>🔥 {s.streak.current}</b><span>серия (рекорд {s.streak.best})</span></div>
        <div className="stat"><b>📘 {Object.keys(s.completedLessons).length}</b><span>уроков пройдено</span></div>
        <div className="stat"><b>🧩 {Object.keys(s.solvedProblems).length}</b><span>задач решено</span></div>
        <div className="stat"><b>🛠️ {Object.keys(s.completedProjects).length}</b><span>проектов</span></div>
        <div className="stat"><b>▶️ {s.counters.code_runs}</b><span>запусков кода</span></div>
        <div className="stat"><b>⚡ {s.counters.qte}</b><span>QTE отбито</span></div>
        <div className="stat"><b>🐞 {s.counters.bugs}</b><span>багов исправлено</span></div>
        <div className="stat"><b>⏱️ ~{Math.round(totalMinutes / 60)} ч</b><span>обучения</span></div>
      </div>

      <section className="card">
        <div className="card-label">🧭 Карта навыков — процент освоения технологий</div>
        <div className="skill-map">
          {skills.map((sk) => (
            <div key={sk.id} className="skill">
              <div className="skill-ring" style={{ ['--p' as string]: sk.pct }}>
                <span>{sk.icon}</span>
              </div>
              <b>{sk.title}</b>
              <span className="muted small">{sk.pct}% · {sk.done}/{sk.total} ур.</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-label">📊 Статистика по темам</div>
        <div className="topic-bars">
          {Object.keys(TOPICS)
            .filter((t) => s.topicStats[t])
            .map((t) => {
              const st = s.topicStats[t];
              const pct = Math.round((st.ok / Math.max(1, st.ok + st.fail)) * 100);
              return (
                <div key={t} className="topic-bar">
                  <span>{topicTitle(t)}</span>
                  <div className="mini-progress"><div style={{ width: `${pct}%`, background: pct < 60 ? 'var(--bad)' : pct < 80 ? 'var(--warn)' : 'var(--good)' }} /></div>
                  <span className="muted small">{st.ok}✓ {st.fail}✗</span>
                </div>
              );
            })}
          {Object.keys(s.topicStats).length === 0 && <div className="muted small">Пока нет данных — пройди первый урок!</div>}
        </div>
      </section>

      <section className="card">
        <div className="card-label">🏆 Достижения и медали · {unlocked.length}/{ACHIEVEMENTS.length}</div>
        <div className="achievements">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} className={`achievement tier-${a.tier} ${s.achievements[a.id] ? 'unlocked' : 'locked'}`} title={a.description}>
              <span className="ach-icon">{s.achievements[a.id] ? a.icon : '🔒'}</span>
              <b>{a.title}</b>
              <small>{a.description}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-label">📈 Активность за полгода</div>
        <Heatmap activity={s.activity} weeks={26} />
      </section>

      {s.mistakes.length > 0 && (
        <section className="card">
          <div className="card-label">🧾 Последние ошибки (ИИ использует их, чтобы подбирать задания)</div>
          {s.mistakes.slice(0, 8).map((m, k) => (
            <div key={k} className="history-row">
              <span>{topicTitle(m.topic)}</span>
              <span className="muted small">{m.kind} · {new Date(m.at).toLocaleString('ru-RU')}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
