// Задачник: фильтры, выбор языка, таймер, проверка тестами, решение после успешной сдачи.
import { useEffect, useMemo, useState } from 'react';
import { PROBLEMS, problemStarter } from '../content/problems';
import { useStore } from '../store/progress';
import { recordAnswer, solveProblem, unlock } from '../store/actions';
import { navigate } from '../router';
import { CodeTask } from '../components/CodeTask';
import { Markdown } from '../components/Markdown';
import { problemTests } from '../runtime/runner';
import type { Lang } from '../content/types';
import { codeQuality } from '../ai/explain';

const DIFF = { easy: { label: 'Лёгкая', cls: 'easy' }, medium: { label: 'Средняя', cls: 'medium' }, hard: { label: 'Сложная', cls: 'hard' } };

export function Problems() {
  const solved = useStore((s) => s.solvedProblems);
  const [diff, setDiff] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [tag, setTag] = useState('');
  const [hideSolved, setHideSolved] = useState(false);
  const [q, setQ] = useState('');
  const tags = useMemo(() => [...new Set(PROBLEMS.flatMap((p) => p.tags))].sort(), []);
  const list = PROBLEMS.filter((p) => (diff === 'all' || p.difficulty === diff) && (!tag || p.tags.includes(tag)) && (!hideSolved || !solved[p.id]) && p.title.toLowerCase().includes(q.toLowerCase()));
  const count = (d: string) => PROBLEMS.filter((p) => p.difficulty === d).length;
  const solvedCount = (d: string) => PROBLEMS.filter((p) => p.difficulty === d && solved[p.id]).length;

  return (
    <div className="page problems">
      <h1>🧩 Задачник</h1>
      <p className="muted">Алгоритмические задачи с автоматической проверкой. Решай на Python или JavaScript — тесты те же.</p>
      <div className="diff-summary">
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <div key={d} className={`diff-card ${DIFF[d].cls}`}>
            <b>{solvedCount(d)}/{count(d)}</b>
            <span>{DIFF[d].label}</span>
          </div>
        ))}
      </div>
      <div className="filters-row">
        <input className="input" placeholder="🔎 Поиск задачи" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={diff} onChange={(e) => setDiff(e.target.value as typeof diff)}>
          <option value="all">Любая сложность</option>
          <option value="easy">Лёгкие</option>
          <option value="medium">Средние</option>
          <option value="hard">Сложные</option>
        </select>
        <select className="input" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">Все темы</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label className="toggle small">
          <input type="checkbox" checked={hideSolved} onChange={(e) => setHideSolved(e.target.checked)} /> скрыть решённые
        </label>
      </div>
      <div className="problem-list">
        {list.map((p, i) => (
          <button key={p.id} className={`problem-row ${solved[p.id] ? 'solved' : ''}`} onClick={() => navigate(`/problem/${p.id}`)}>
            <span className="muted">{i + 1}.</span>
            <span className="problem-title">{solved[p.id] ? '✅ ' : ''}{p.title}</span>
            <span className="tags">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</span>
            <span className={`diff ${DIFF[p.difficulty].cls}`}>{DIFF[p.difficulty].label}</span>
          </button>
        ))}
        {list.length === 0 && <div className="muted">Ничего не найдено.</div>}
      </div>
    </div>
  );
}

export function ProblemPage({ id }: { id: string }) {
  const p = PROBLEMS.find((x) => x.id === id);
  const preferred = useStore((s) => s.settings.preferredLang);
  const solvedInfo = useStore((s) => s.solvedProblems[id]);
  const [lang, setLang] = useState<Lang>(preferred);
  const [start] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState<{ ms: number; code?: string } | null>(null);
  const [showSol, setShowSol] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(t);
  }, [start, done]);

  if (!p) return <div className="page">Задача не найдена</div>;
  const idx = PROBLEMS.indexOf(p);
  const tests = problemTests(lang, lang === 'js' ? p.fnName : (p.fnPy ?? p.fnName), p.cases);
  const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  const quality = done?.code ? codeQuality(done.code, lang) : null;

  return (
    <div className="page problem-page">
      <div className="problem-head">
        <button className="btn btn-ghost" onClick={() => navigate('/problems')}>← Все задачи</button>
        <span className={`diff ${DIFF[p.difficulty].cls}`}>{DIFF[p.difficulty].label}</span>
        <span className="muted small">⏱ {fmt(done?.ms ?? elapsed)}</span>
        <div className="lang-switch">
          <button className={lang === 'python' ? 'active' : ''} onClick={() => setLang('python')}>🐍 Python</button>
          <button className={lang === 'js' ? 'active' : ''} onClick={() => setLang('js')}>🟨 JavaScript</button>
        </div>
      </div>
      <h1>{p.title}</h1>
      <div className="tags">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      <div className="card statement">
        <Markdown md={p.statement} />
        <div className="examples">
          {p.cases.filter((c) => !c.hidden).slice(0, 3).map((c, i) => (
            <div key={i} className="example-io">
              <code>{lang === 'js' ? p.fnName : (p.fnPy ?? p.fnName)}({c.args.map((a) => JSON.stringify(a)).join(', ')})</code> → <code>{JSON.stringify(c.expected)}</code>
            </div>
          ))}
        </div>
        {solvedInfo && <div className="muted small">✅ Решена {new Date(solvedInfo.at).toLocaleDateString('ru-RU')} на {solvedInfo.lang === 'js' ? 'JavaScript' : 'Python'}</div>}
      </div>
      <CodeTask
        key={`${id}-${lang}`}
        lang={lang}
        initial={problemStarter(p, lang)}
        tests={tests}
        hints={p.hints}
        task={p.statement}
        draftKey={`problem-${id}-${lang}`}
        minHeight={220}
        onPass={(_, hints, code) => {
          const ms = Date.now() - start;
          setDone({ ms, code });
          solveProblem(id, lang, ms, p.difficulty);
          recordAnswer('algorithms', true, 'problem');
          if (p.difficulty === 'hard' && hints === 0) unlock('no-hints');
        }}
        onFail={(d) => recordAnswer('algorithms', false, 'problem', d)}
      />
      {done && (
        <div className="card solved-card">
          <h2>🎉 Задача решена за {fmt(done.ms)}!</h2>
          {quality && (
            <div className="quality">
              <div><b>Оценка читаемости:</b> {quality.score}/100</div>
              <div><b>Твоя сложность (оценка):</b> {quality.complexity}{p.complexity ? ` · оптимум: ${p.complexity}` : ''}</div>
              <ul>{quality.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          )}
          <button className="btn" onClick={() => setShowSol((s) => !s)}>{showSol ? 'Скрыть' : 'Показать'} эталонное решение</button>
          {showSol && <Markdown md={'```' + (lang === 'js' ? 'js' : 'python') + '\n' + (lang === 'js' ? p.solutionJs : p.solutionPy) + '\n```'} />}
          <div className="toolbar">
            {PROBLEMS[idx + 1] && <button className="btn btn-primary" onClick={() => navigate(`/problem/${PROBLEMS[idx + 1].id}`)}>Следующая задача →</button>}
          </div>
        </div>
      )}
    </div>
  );
}
