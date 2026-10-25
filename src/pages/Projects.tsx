// Проекты: пошаговые проекты для портфолио и каталог идей с техническими заданиями.
import { useState } from 'react';
import { PROJECTS, PROJECT_IDEAS } from '../content/projects';
import { setState, useStore } from '../store/progress';
import { awardXp, checkAchievements, track } from '../store/actions';
import { navigate } from '../router';
import { Markdown } from '../components/Markdown';
import { CodeTask } from '../components/CodeTask';
import { WebPlayground } from '../components/WebPlayground';

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);
const TRACK_LABEL = { python: '🐍 Python', js: '🟨 JavaScript', web: '🌐 Веб' } as const;

export function Projects() {
  const progress = useStore((s) => s.projectStep);
  const completed = useStore((s) => s.completedProjects);
  const [filter, setFilter] = useState<'all' | 'python' | 'js' | 'web'>('all');
  const list = PROJECTS.filter((p) => filter === 'all' || p.track === filter);
  return (
    <div className="page projects">
      <h1>🛠️ Проекты</h1>
      <p className="muted">Реальные проекты для портфолио. Каждый шаг проверяется тестами или живым предпросмотром. Готовый код можно перенести в IDE и развивать дальше.</p>
      <div className="track-tabs">
        {(['all', 'python', 'js', 'web'] as const).map((f) => (
          <button key={f} className={`track-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Все' : TRACK_LABEL[f]}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {list.map((p) => {
          const step = progress[p.id] ?? 0;
          return (
            <button key={p.id} className={`project-card ${completed[p.id] ? 'done' : ''}`} onClick={() => navigate(`/project/${p.id}`)}>
              <div className="project-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p className="muted small">{p.summary}</p>
              <div className="project-meta">
                <span className="stars" title={`Сложность ${p.difficulty}/5`}>{stars(p.difficulty)}</span>
                <span className="muted small">{TRACK_LABEL[p.track]}</span>
              </div>
              <div className="tags">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
              <div className="mini-progress"><div style={{ width: `${completed[p.id] ? 100 : (step / p.steps.length) * 100}%` }} /></div>
              <small className="muted">{completed[p.id] ? '✅ Завершён' : `${step}/${p.steps.length} шагов`}</small>
            </button>
          );
        })}
      </div>
      <h2>💡 Каталог идей ({PROJECT_IDEAS.length})</h2>
      <p className="muted">Самостоятельные проекты с техническим заданием — создай файлы в IDE и вперёд. Отличный материал для GitHub-портфолио.</p>
      <div className="ideas">
        {PROJECT_IDEAS.map((i) => (
          <div key={i.title} className="idea">
            <div className="idea-head">
              <b>{i.title}</b>
              <span className="stars small">{stars(i.level)}</span>
            </div>
            <div className="muted small">{i.stack}</div>
            <div className="small">{i.spec}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectPage({ id }: { id: string }) {
  const p = PROJECTS.find((x) => x.id === id);
  const saved = useStore((s) => s.projectStep[id] ?? 0);
  const done = useStore((s) => !!s.completedProjects[id]);
  const [idx, setIdx] = useState(Math.min(saved, (p?.steps.length ?? 1) - 1));
  const [passed, setPassed] = useState<Record<number, boolean>>({});
  if (!p) return <div className="page">Проект не найден</div>;
  const step = p.steps[idx];
  const hasTests = !!step.tests?.length;
  const stepDone = passed[idx] || idx < saved || done;

  const complete = () => {
    const isLast = idx === p.steps.length - 1;
    if (idx >= saved) {
      setState((s) => {
        s.projectStep[id] = Math.max(s.projectStep[id] ?? 0, idx + 1);
        if (isLast) s.completedProjects[id] = Date.now();
      });
      awardXp(25, `Шаг проекта: ${step.title}`, { metric: 'steps' });
      track('steps');
      if (isLast) {
        awardXp(100 * p.difficulty, `Проект завершён: ${p.title}`);
        checkAchievements();
      }
    }
    if (!isLast) setIdx(idx + 1);
  };

  return (
    <div className="page project-page">
      <button className="btn btn-ghost" onClick={() => navigate('/projects')}>← Все проекты</button>
      <h1>{p.icon} {p.title}</h1>
      <p className="muted">{p.summary}</p>
      <div className="project-steps">
        {p.steps.map((s, i) => (
          <button key={i} className={`pstep ${i === idx ? 'cur' : ''} ${i < saved || done ? 'done' : ''}`} onClick={() => i <= Math.max(saved, idx) && setIdx(i)} disabled={i > Math.max(saved, idx)}>
            <span>{i < saved || done ? '✓' : i + 1}</span> {s.title}
          </button>
        ))}
      </div>
      <div className="card">
        <h2>Шаг {idx + 1}. {step.title}</h2>
        <Markdown md={step.md} />
      </div>
      {step.lang === 'web' && step.files && <WebPlayground key={`${id}-${idx}`} initial={step.files} storageKey={`${id}-${idx}`} />}
      {step.lang !== 'web' && hasTests && (
        <CodeTask key={`${id}-${idx}`} lang={step.lang} initial={step.starter ?? ''} tests={step.tests!} task={step.md} draftKey={`project-${id}-${idx}`} minHeight={220} onPass={() => setPassed((x) => ({ ...x, [idx]: true }))} />
      )}
      <div className="toolbar project-nav">
        <button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Назад</button>
        {hasTests ? (
          <button className="btn btn-primary btn-lg" disabled={!stepDone} onClick={complete}>
            {idx === p.steps.length - 1 ? '🏁 Завершить проект' : 'Следующий шаг →'}
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={complete}>
            {idx === p.steps.length - 1 ? '🏁 Готово, завершить проект' : '✓ Готово, дальше →'}
          </button>
        )}
      </div>
      {done && idx === p.steps.length - 1 && <div className="feedback good"><b>🏆 Проект завершён!</b> Добавь его в портфолио: перенеси код в IDE, закоммить в Git и опубликуй на GitHub.</div>}
    </div>
  );
}
