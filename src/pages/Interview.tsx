// Режим собеседования: теоретические вопросы на время, live-coding с таймером,
// поведенческий вопрос и итоговый отчёт с оценкой скорости, правильности и качества кода.
import { useEffect, useMemo, useState } from 'react';
import { BEHAVIORAL, INTERVIEW_QUESTIONS, Role, ROLES } from '../content/interview';
import { PROBLEMS, problemStarter } from '../content/problems';
import { setState, useStore } from '../store/progress';
import { awardXp, checkAchievements } from '../store/actions';
import { CodeTask } from '../components/CodeTask';
import { Markdown } from '../components/Markdown';
import { problemTests } from '../runtime/runner';
import { codeQuality } from '../ai/explain';
import { ALL_LESSONS } from '../content/course';

type Phase = 'intro' | 'theory' | 'coding' | 'behavioral' | 'report';
const THEORY_SECONDS = 45;
const CODING_MINUTES = 15;

function shuffle<T>(a: T[]) {
  return [...a].sort(() => Math.random() - 0.5);
}

export function Interview() {
  const history = useStore((s) => s.interviews);
  const lessonsDone = useStore((s) => Object.keys(s.completedLessons).length);
  const [role, setRole] = useState<Role>('python');
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<{ q: string; options: string[]; correct: number; explain: string }[]>([]);
  const [qi, setQi] = useState(0);
  const [qLeft, setQLeft] = useState(THEORY_SECONDS);
  const [theory, setTheory] = useState<{ ok: boolean; ms: number }[]>([]);
  const [qStart, setQStart] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [problemIds, setProblemIds] = useState<string[]>([]);
  const [pi, setPi] = useState(0);
  const [codeStart, setCodeStart] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [coding, setCoding] = useState<{ id: string; ok: boolean; ms: number; attempts: number; quality: number; complexity: string; code: string }[]>([]);
  const [behavioralQ, setBehavioralQ] = useState('');
  const [answerText, setAnswerText] = useState('');

  const cfg = ROLES[role];

  const begin = () => {
    const pool = INTERVIEW_QUESTIONS.filter((q) => q.roles.includes(role));
    const qs = shuffle(pool).slice(0, 8).map((q) => {
      const opts = shuffle(q.options.map((o, i) => ({ o, i })));
      return { q: q.q, options: opts.map((x) => x.o), correct: opts.findIndex((x) => x.i === q.answer), explain: q.explain };
    });
    setQuestions(qs);
    setQi(0);
    setTheory([]);
    setQLeft(THEORY_SECONDS);
    setQStart(Date.now());
    setPicked(null);
    setProblemIds(shuffle(cfg.problems).slice(0, 2));
    setPi(0);
    setCoding([]);
    setBehavioralQ(BEHAVIORAL[Math.floor(Math.random() * BEHAVIORAL.length)]);
    setAnswerText('');
    setPhase('theory');
  };

  // Таймер вопроса теории.
  useEffect(() => {
    if (phase !== 'theory' || picked !== null) return;
    if (qLeft <= 0) {
      choose(-1);
      return;
    }
    const t = setTimeout(() => setQLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    if (phase !== 'coding') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setTheory((t) => [...t, { ok: i === questions[qi].correct, ms: Date.now() - qStart }]);
  };
  const nextQuestion = () => {
    if (qi + 1 < questions.length) {
      setQi(qi + 1);
      setPicked(null);
      setQLeft(THEORY_SECONDS);
      setQStart(Date.now());
    } else {
      setPhase('coding');
      setCodeStart(Date.now());
    }
  };
  const finishProblem = (ok: boolean, attempts: number, code: string) => {
    const id = problemIds[pi];
    const q = codeQuality(code, cfg.lang);
    setCoding((c) => [...c, { id, ok, ms: Date.now() - codeStart, attempts, quality: q.score, complexity: q.complexity, code }]);
    if (pi + 1 < problemIds.length) {
      setPi(pi + 1);
      setCodeStart(Date.now());
    } else setPhase('behavioral');
  };

  const report = useMemo(() => {
    if (phase !== 'report') return null;
    const theoryScore = (theory.filter((t) => t.ok).length / Math.max(1, theory.length)) * 100;
    const avgTime = theory.reduce((s, t) => s + t.ms, 0) / Math.max(1, theory.length) / 1000;
    const solved = coding.filter((c) => c.ok);
    const codingScore = (solved.length / Math.max(1, problemIds.length)) * 100;
    const speedScore = solved.length ? Math.max(0, 100 - (solved.reduce((s, c) => s + c.ms, 0) / solved.length / 60000 - 3) * 8) : 0;
    const qualityScore = solved.length ? solved.reduce((s, c) => s + c.quality, 0) / solved.length : 0;
    const attemptsPenalty = solved.reduce((s, c) => s + Math.max(0, c.attempts - 1) * 5, 0);
    const words = answerText.trim().split(/\s+/).filter(Boolean).length;
    const softScore = Math.min(100, words * 2.5);
    const total = Math.round(theoryScore * 0.3 + codingScore * 0.35 + Math.min(100, speedScore) * 0.1 + Math.max(0, qualityScore - attemptsPenalty) * 0.15 + softScore * 0.1);
    const verdict = total >= 85 ? 'Strong hire — готов к работе! 🚀' : total >= 70 ? 'Hire — уверенный уровень junior-разработчика 👍' : total >= 50 ? 'Почти! Подтяни слабые места и попробуй снова 💪' : 'Пока рано — продолжай учиться, всё получится 📚';
    return { theoryScore, avgTime, codingScore, speedScore: Math.min(100, speedScore), qualityScore, softScore, total, verdict, words };
  }, [phase, theory, coding, problemIds.length, answerText]);

  useEffect(() => {
    if (!report) return;
    setState((s) => {
      s.interviews.unshift({ at: Date.now(), score: report.total, role });
      s.interviews = s.interviews.slice(0, 50);
    });
    awardXp(Math.round(report.total), 'Пробное собеседование');
    checkAchievements();
    // Сохраняем результат один раз при переходе к отчёту.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.total]);

  if (phase === 'intro')
    return (
      <div className="page interview">
        <h1>🤝 Режим собеседования</h1>
        <p className="muted">Имитация технического интервью: 8 вопросов по теории (45 секунд на каждый), 2 задачи live-coding ({CODING_MINUTES} минут на задачу) и вопрос о твоём опыте. В конце — подробный отчёт.</p>
        {lessonsDone < 15 && <div className="callout callout-warn">Совет: собеседование рассчитано на тех, кто прошёл основную часть курса (у тебя пройдено {lessonsDone} из {ALL_LESSONS.length} уроков). Но попробовать можно в любой момент!</div>}
        <div className="role-grid">
          {(Object.keys(ROLES) as Role[]).map((r) => (
            <button key={r} className={`role-card ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
              <span className="role-icon">{ROLES[r].icon}</span>
              <b>{ROLES[r].title}</b>
              <small className="muted">Задачи на {ROLES[r].lang === 'js' ? 'JavaScript' : 'Python'}</small>
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" onClick={begin}>Начать собеседование</button>
        {history.length > 0 && (
          <section className="card">
            <div className="card-label">История собеседований</div>
            {history.slice(0, 8).map((h) => (
              <div key={h.at} className="history-row">
                <span>{new Date(h.at).toLocaleDateString('ru-RU')}</span>
                <span>{ROLES[h.role as Role]?.title ?? h.role}</span>
                <b>{h.score}%</b>
              </div>
            ))}
          </section>
        )}
      </div>
    );

  if (phase === 'theory') {
    const q = questions[qi];
    return (
      <div className="page interview">
        <div className="interview-top">
          <span>🧠 Теория · вопрос {qi + 1}/{questions.length}</span>
          <span className={qLeft <= 10 ? 'bad-text' : ''}>⏱ {qLeft} с</span>
        </div>
        <div className="qte-bar"><div style={{ width: `${(qLeft / THEORY_SECONDS) * 100}%` }} /></div>
        <div className="interviewer">
          <span className="ai-avatar">👩‍💼</span>
          <div className="bubble"><Markdown md={q.q} /></div>
        </div>
        <div className="options">
          {q.options.map((o, i) => (
            <button key={i} className={`option ${picked !== null && i === q.correct ? 'right' : ''} ${picked === i && i !== q.correct ? 'wrong' : ''}`} onClick={() => choose(i)} disabled={picked !== null}>
              <span className="option-mark">{String.fromCharCode(65 + i)}</span> <Markdown md={o} />
            </button>
          ))}
        </div>
        {picked !== null && (
          <div className={`feedback ${picked === q.correct ? 'good' : 'bad'}`}>
            <b>{picked === -1 ? '⌛ Время вышло' : picked === q.correct ? '✅ Верно' : '❌ Неверно'}</b>
            <p>{q.explain}</p>
            <button className="btn btn-primary" onClick={nextQuestion} autoFocus>{qi + 1 < questions.length ? 'Следующий вопрос' : 'Перейти к задачам'} →</button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'coding') {
    const p = PROBLEMS.find((x) => x.id === problemIds[pi])!;
    const left = CODING_MINUTES * 60000 - (now - codeStart);
    const fmt = (ms: number) => `${Math.floor(Math.max(0, ms) / 60000)}:${String(Math.floor(Math.max(0, ms) / 1000) % 60).padStart(2, '0')}`;
    return (
      <div className="page interview">
        <div className="interview-top">
          <span>💻 Live-coding · задача {pi + 1}/{problemIds.length}</span>
          <span className={left < 120000 ? 'bad-text' : ''}>⏱ {fmt(left)}</span>
        </div>
        <div className="interviewer">
          <span className="ai-avatar">👨‍💻</span>
          <div className="bubble">
            <b>{p.title}</b>
            <Markdown md={p.statement} />
            <div className="muted small">Проговори решение вслух (или в комментарии), оцени сложность. Ожидается: {p.complexity}.</div>
          </div>
        </div>
        <CodeTask
          key={p.id}
          lang={cfg.lang}
          initial={problemStarter(p, cfg.lang)}
          tests={problemTests(cfg.lang, cfg.lang === 'js' ? p.fnName : (p.fnPy ?? p.fnName), p.cases)}
          hints={[]}
          task={p.statement}
          minHeight={240}
          onPass={(attempts, _h, code) => finishProblem(true, attempts, code)}
        />
        <div className="toolbar">
          <button className="btn btn-ghost" onClick={() => finishProblem(false, 0, '')}>{left <= 0 ? 'Время вышло — дальше' : 'Сдаться и перейти дальше'}</button>
        </div>
      </div>
    );
  }

  if (phase === 'behavioral')
    return (
      <div className="page interview">
        <div className="interview-top"><span>🗣 Финальный вопрос</span></div>
        <div className="interviewer">
          <span className="ai-avatar">👩‍💼</span>
          <div className="bubble">{behavioralQ}</div>
        </div>
        <textarea className="answer-input" rows={8} value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Ответь развёрнуто: ситуация → что ты сделал → результат (метод STAR)." />
        <button className="btn btn-primary btn-lg" onClick={() => setPhase('report')}>Завершить собеседование</button>
      </div>
    );

  return (
    <div className="page interview">
      <h1>📋 Отчёт о собеседовании</h1>
      {report && (
        <>
          <div className="report-total">
            <div className="ring" style={{ ['--p' as string]: report.total }}>
              <span>{report.total}%</span>
            </div>
            <div>
              <h2>{report.verdict}</h2>
              <p className="muted">{cfg.title}</p>
            </div>
          </div>
          <div className="report-grid">
            <div className="card"><b>🧠 Теория</b><div className="big">{Math.round(report.theoryScore)}%</div><small className="muted">среднее время ответа {report.avgTime.toFixed(1)} с</small></div>
            <div className="card"><b>💻 Решение задач</b><div className="big">{Math.round(report.codingScore)}%</div><small className="muted">{coding.filter((c) => c.ok).length} из {problemIds.length}</small></div>
            <div className="card"><b>⚡ Скорость</b><div className="big">{Math.round(report.speedScore)}%</div><small className="muted">по времени решения</small></div>
            <div className="card"><b>✨ Качество кода</b><div className="big">{Math.round(report.qualityScore)}%</div><small className="muted">имена, вложенность, длина</small></div>
            <div className="card"><b>🗣 Коммуникация</b><div className="big">{Math.round(report.softScore)}%</div><small className="muted">{report.words} слов в ответе</small></div>
          </div>
          <section className="card">
            <div className="card-label">Разбор задач</div>
            {coding.map((c) => {
              const p = PROBLEMS.find((x) => x.id === c.id)!;
              return (
                <div key={c.id} className="history-row">
                  <span>{c.ok ? '✅' : '❌'} {p.title}</span>
                  <span className="muted small">{c.ok ? `${Math.round(c.ms / 1000)} с · попыток: ${c.attempts} · ${c.complexity} (оптимум ${p.complexity})` : 'не решена'}</span>
                </div>
              );
            })}
          </section>
          <section className="card">
            <div className="card-label">Рекомендации</div>
            <ul>
              {report.theoryScore < 70 && <li>Повтори теорию: раздел «Справочник» и карточки в «Повторении».</li>}
              {report.codingScore < 100 && <li>Решай больше задач в «Задачнике», особенно на хеш-таблицы и два указателя.</li>}
              {report.speedScore < 60 && report.codingScore > 0 && <li>Тренируй скорость: мини-игры и задачи на время.</li>}
              {report.qualityScore < 70 && report.codingScore > 0 && <li>Пиши понятные имена переменных и избегай глубокой вложенности.</li>}
              {report.softScore < 60 && <li>Отвечай на поведенческие вопросы развёрнуто по схеме STAR: Ситуация, Задача, Действие, Результат.</li>}
              {report.total >= 85 && <li>Отличный результат! Попробуй другую роль или собери портфолио из проектов.</li>}
            </ul>
          </section>
          <div className="toolbar">
            <button className="btn btn-primary" onClick={() => setPhase('intro')}>Пройти ещё раз</button>
          </div>
        </>
      )}
    </div>
  );
}
