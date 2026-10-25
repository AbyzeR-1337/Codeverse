// Тренировка: бесконечный поток сгенерированных заданий. Адаптивный режим подбирает слабые темы.
import { useState } from 'react';
import { GENERATORS, GenQuestion, randomQuestion } from '../content/generators';
import { useStore } from '../store/progress';
import { awardXp, recordAnswer, track, weakTopics } from '../store/actions';
import { CodeBlock } from '../components/Markdown';
import { useRoute } from '../router';
import { topicTitle } from '../content/topics';
import type { Lang } from '../content/types';

export function Practice() {
  const { query } = useRoute();
  const preferred = useStore((s) => s.settings.preferredLang);
  const topicStats = useStore((s) => s.topicStats);
  const [lang, setLang] = useState<Lang>(preferred);
  const [gen, setGen] = useState('adaptive');
  const [q, setQ] = useState<GenQuestion | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [count, setCount] = useState({ ok: 0, all: 0 });
  const weak = weakTopics(5);
  const forcedTopic = query.get('topic');

  const next = (g = gen, l = lang) => {
    setChosen(null);
    if (g === 'adaptive') {
      const topics = forcedTopic ? [forcedTopic] : weak.length ? weak.map((w) => w.topic) : undefined;
      setQ(randomQuestion(l, topics));
    } else setQ(GENERATORS[g].gen(l));
  };

  const answer = (i: number) => {
    if (!q || chosen !== null) return;
    setChosen(i);
    const ok = i === q.answer;
    recordAnswer(q.topic, ok, 'practice');
    setCount((c) => ({ ok: c.ok + (ok ? 1 : 0), all: c.all + 1 }));
    if (ok) {
      setStreak((s) => s + 1);
      awardXp(3 + Math.min(7, streak), 'Тренировка');
      track('steps');
    } else setStreak(0);
  };

  return (
    <div className="page practice">
      <h1>🎯 Тренировка</h1>
      <p className="muted">Каждое задание генерируется заново со случайными значениями. В адаптивном режиме ИИ-наставник подбирает темы, где ты чаще ошибаешься.</p>
      <div className="filters-row">
        <select className="input" value={gen} onChange={(e) => { setGen(e.target.value); next(e.target.value); }}>
          <option value="adaptive">🤖 Адаптивно (слабые темы)</option>
          {Object.entries(GENERATORS).map(([k, g]) => (
            <option key={k} value={k}>{g.title}</option>
          ))}
        </select>
        <div className="lang-switch">
          <button className={lang === 'python' ? 'active' : ''} onClick={() => { setLang('python'); next(gen, 'python'); }}>🐍 Python</button>
          <button className={lang === 'js' ? 'active' : ''} onClick={() => { setLang('js'); next(gen, 'js'); }}>🟨 JavaScript</button>
        </div>
        <span className="muted small">✅ {count.ok}/{count.all} · 🔥 серия {streak}</span>
      </div>
      {gen === 'adaptive' && (
        <div className="muted small">
          {forcedTopic ? `Тема: ${topicTitle(forcedTopic)}` : weak.length ? `Фокус на: ${weak.map((w) => topicTitle(w.topic)).join(', ')}` : 'Слабых тем пока нет — задания из всех тем.'}
        </div>
      )}
      {!q ? (
        <div className="card center">
          <p>Готов? Задания бесконечны — тренируйся сколько хочешь.</p>
          <button className="btn btn-primary btn-lg" onClick={() => next()}>▶ Начать тренировку</button>
        </div>
      ) : (
        <div className="card practice-card">
          <div className="qte-q">{q.question}</div>
          {q.code && <CodeBlock code={q.code} lang={q.lang ?? 'js'} />}
          <div className="options">
            {q.options.map((o, i) => (
              <button key={i} className={`option ${chosen !== null && i === q.answer ? 'right' : ''} ${chosen === i && i !== q.answer ? 'wrong' : ''}`} onClick={() => answer(i)} disabled={chosen !== null}>
                <span className="option-mark">{String.fromCharCode(65 + i)}</span> {o}
              </button>
            ))}
          </div>
          {chosen !== null && (
            <div className={`feedback ${chosen === q.answer ? 'good' : 'bad'}`}>
              <b>{chosen === q.answer ? '✅ Верно!' : '❌ Неверно'}</b>
              <p>{q.explain}</p>
              <button className="btn btn-primary" onClick={() => next()} autoFocus>Следующее →</button>
            </div>
          )}
        </div>
      )}
      <section className="card">
        <div className="card-label">📊 Точность по темам</div>
        <div className="topic-bars">
          {Object.entries(topicStats)
            .sort((a, b) => b[1].ok + b[1].fail - (a[1].ok + a[1].fail))
            .slice(0, 12)
            .map(([t, s]) => {
              const pct = Math.round((s.ok / Math.max(1, s.ok + s.fail)) * 100);
              return (
                <div key={t} className="topic-bar">
                  <span>{topicTitle(t)}</span>
                  <div className="mini-progress"><div style={{ width: `${pct}%`, background: pct < 60 ? 'var(--bad)' : pct < 80 ? 'var(--warn)' : 'var(--good)' }} /></div>
                  <span className="muted small">{pct}%</span>
                </div>
              );
            })}
          {Object.keys(topicStats).length === 0 && <div className="muted small">Статистика появится после первых ответов.</div>}
        </div>
      </section>
    </div>
  );
}
