// Экзамен по модулю: случайные вопросы из уроков модуля + сгенерированные задания + одна задача с кодом.
// Проходной балл — 70%. Экзамены собираются автоматически для каждого модуля курса.
import { useEffect, useMemo, useState } from 'react';
import { TRACKS } from '../content/course';
import type { Step } from '../content/types';
import { randomQuestion } from '../content/generators';
import { setState, useStore } from '../store/progress';
import { awardXp, checkAchievements, recordAnswer } from '../store/actions';
import { CodeBlock, Markdown } from '../components/Markdown';
import { CodeTask } from '../components/CodeTask';
import { normalizeOut } from '../runtime/compare';
import { navigate } from '../router';

type ExamItem =
  | { kind: 'mcq'; question: string; code?: string; lang?: string; options: string[]; correct: number; explain: string; topic?: string }
  | { kind: 'predict'; code: string; lang: string; answer: string; explain: string; topic?: string }
  | { kind: 'code'; step: Extract<Step, { kind: 'code' }> };

const PASS = 70;
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export function Exam({ id }: { id: string }) {
  const found = useMemo(() => {
    for (const t of TRACKS) for (const m of t.modules) if (m.id === id) return { track: t, module: m };
    return null;
  }, [id]);
  const best = useStore((s) => s.exams[id]);
  const [items, setItems] = useState<ExamItem[]>([]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [pick, setPick] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro');
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (phase !== 'run') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (phase === 'run' && now > deadline) finish(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  if (!found) return <div className="page">Модуль не найден</div>;
  const { module, track } = found;
  const lang = track.id === 'js' ? 'js' : 'python';

  const start = () => {
    const steps = module.chapters.flatMap((c) => c.lessons.flatMap((l) => l.steps));
    const mcq: ExamItem[] = shuffle(steps.filter((s): s is Extract<Step, { kind: 'quiz' }> => s.kind === 'quiz' && !Array.isArray(s.answer))).slice(0, 6).map((s) => {
      const opts = shuffle(s.options.map((o, k) => ({ o, k })));
      return { kind: 'mcq', question: s.question, code: s.code, lang: s.lang, options: opts.map((x) => x.o), correct: opts.findIndex((x) => x.k === s.answer), explain: s.explain, topic: s.topic };
    });
    const predicts: ExamItem[] = shuffle(steps.filter((s): s is Extract<Step, { kind: 'predict' }> => s.kind === 'predict')).slice(0, 2).map((s) => ({ kind: 'predict', code: s.code, lang: s.lang, answer: s.answer, explain: s.explain, topic: s.topic }));
    const gens: ExamItem[] = Array.from({ length: 2 }, () => {
      const q = randomQuestion(lang);
      return { kind: 'mcq', question: q.question, code: q.code, lang: q.lang, options: q.options, correct: q.answer, explain: q.explain, topic: q.topic } as ExamItem;
    });
    const code = shuffle(steps.filter((s): s is Extract<Step, { kind: 'code' }> => s.kind === 'code'))[0];
    const all = [...shuffle([...mcq, ...predicts, ...gens]), ...(code ? [{ kind: 'code', step: code } as ExamItem] : [])];
    setItems(all);
    setAnswers(all.map(() => null));
    setI(0);
    setPick(null);
    setText('');
    setDeadline(Date.now() + (12 + (code ? 8 : 0)) * 60000);
    setPhase('run');
  };

  const finish = (ans: (boolean | null)[]) => {
    const weights = items.map((it) => (it.kind === 'code' ? 2 : 1));
    const total = weights.reduce((a, b) => a + b, 0);
    const got = ans.reduce((s, a, k) => s + (a ? weights[k] : 0), 0);
    const score = Math.round((got / Math.max(1, total)) * 100);
    const passed = score >= PASS;
    setState((s) => {
      const prev = s.exams[id];
      s.exams[id] = { best: Math.max(prev?.best ?? 0, score), passed: (prev?.passed ?? false) || passed };
    });
    if (passed && !best?.passed) awardXp(150, `Экзамен сдан: ${module.title}`);
    checkAchievements();
    setPhase('done');
  };

  const record = (ok: boolean) => {
    const next = [...answers];
    next[i] = ok;
    setAnswers(next);
    const it = items[i];
    recordAnswer(it.kind === 'code' ? it.step.topic : it.topic, ok, 'exam');
    return next;
  };
  const advance = (ans = answers) => {
    if (i + 1 < items.length) {
      setI(i + 1);
      setPick(null);
      setText('');
    } else finish(ans);
  };

  if (phase === 'intro')
    return (
      <div className="page exam">
        <button className="btn btn-ghost" onClick={() => navigate(`/learn?track=${track.id}`)}>← К модулю</button>
        <h1>📜 Экзамен: {module.title}</h1>
        <p className="muted">Вопросы из уроков модуля, сгенерированные задания и задача на написание кода. Ограничение по времени. Проходной балл — {PASS}%.</p>
        {best && <p>Лучший результат: <b>{best.best}%</b> {best.passed ? '— сдан ✅' : ''}</p>}
        <button className="btn btn-primary btn-lg" onClick={start}>Начать экзамен</button>
      </div>
    );

  if (phase === 'done') {
    const weights = items.map((it) => (it.kind === 'code' ? 2 : 1));
    const total = weights.reduce((a, b) => a + b, 0);
    const got = answers.reduce((s, a, k) => s + (a ? weights[k] : 0), 0);
    const score = Math.round((got / Math.max(1, total)) * 100);
    return (
      <div className="page exam center">
        <div className="celebrate-icon">{score >= PASS ? '🏆' : '📚'}</div>
        <h1>{score >= PASS ? 'Экзамен сдан!' : 'Пока не сдан'}</h1>
        <div className="ring" style={{ ['--p' as string]: score }}><span>{score}%</span></div>
        <p className="muted">{score >= PASS ? 'Отличная работа — модуль освоен.' : `Нужно ${PASS}%. Повтори уроки модуля и попробуй снова — ошибки уже попали в адаптивную тренировку.`}</p>
        <div className="toolbar center">
          <button className="btn btn-primary" onClick={start}>Пересдать</button>
          <button className="btn" onClick={() => navigate(`/learn?track=${track.id}`)}>К дорожной карте</button>
        </div>
      </div>
    );
  }

  const it = items[i];
  const left = Math.max(0, deadline - now);
  return (
    <div className="page exam">
      <div className="interview-top">
        <span>Вопрос {i + 1}/{items.length}</span>
        <span className={left < 60000 ? 'bad-text' : ''}>⏱ {Math.floor(left / 60000)}:{String(Math.floor(left / 1000) % 60).padStart(2, '0')}</span>
      </div>
      <div className="lesson-progress">
        {items.map((_, k) => <span key={k} className={`seg ${answers[k] === true ? 'done' : answers[k] === false ? 'fail' : ''} ${k === i ? 'cur' : ''}`} />)}
      </div>
      <div className="card">
        {it.kind === 'mcq' && (
          <>
            <Markdown md={it.question} className="question" />
            {it.code && <CodeBlock code={it.code} lang={it.lang ?? 'js'} />}
            <div className="options">
              {it.options.map((o, k) => (
                <button key={k} className={`option ${pick !== null && k === it.correct ? 'right' : ''} ${pick === k && k !== it.correct ? 'wrong' : ''}`} disabled={pick !== null} onClick={() => { setPick(k); record(k === it.correct); }}>
                  <span className="option-mark">{String.fromCharCode(65 + k)}</span> <Markdown md={o} />
                </button>
              ))}
            </div>
            {pick !== null && (
              <div className="feedback"><Markdown md={it.explain} /><button className="btn btn-primary" onClick={() => advance()}>Дальше →</button></div>
            )}
          </>
        )}
        {it.kind === 'predict' && (
          <>
            <p className="question">🔮 Что выведет программа?</p>
            <CodeBlock code={it.code} lang={it.lang} />
            <textarea className="answer-input" rows={3} value={text} onChange={(e) => setText(e.target.value)} disabled={answers[i] !== null} />
            {answers[i] === null ? (
              <button className="btn btn-primary" disabled={!text.trim()} onClick={() => record(normalizeOut(text).replace(/\s+/g, ' ') === normalizeOut(it.answer).replace(/\s+/g, ' '))}>Ответить</button>
            ) : (
              <div className={`feedback ${answers[i] ? 'good' : 'bad'}`}>
                <b>{answers[i] ? '✅ Верно' : `❌ Правильный ответ: ${it.answer}`}</b>
                <Markdown md={it.explain} />
                <button className="btn btn-primary" onClick={() => advance()}>Дальше →</button>
              </div>
            )}
          </>
        )}
        {it.kind === 'code' && (
          <>
            <div className="task-head">💻 Задача (2 балла)</div>
            <Markdown md={it.step.prompt} className="question" />
            <CodeTask lang={it.step.lang} initial={it.step.starter} tests={it.step.tests} hints={[]} task={it.step.prompt} onPass={() => { const a = record(true); setTimeout(() => advance(a), 800); }} />
            <button className="btn btn-ghost" onClick={() => { const a = record(false); advance(a); }}>Пропустить и завершить</button>
          </>
        )}
      </div>
    </div>
  );
}
