// Проигрыватель урока: шаги по порядку, прогресс сохраняется (можно продолжить на другом устройстве),
// неожиданные Quick Time Events, итоговый экран с результатом.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findLesson, nextLesson } from '../content/course';
import { courseOfLesson, nextInCourse } from '../content/courses';
import { useCourse } from '../store/course';
import { getState, setState, useStore } from '../store/progress';
import { awardXp, bump, completeLesson, recordAnswer, track } from '../store/actions';
import { isInteractive, StepView, STEP_LABELS } from '../components/Steps';
import { QTE } from '../components/QTE';
import { randomQuestion, GenQuestion } from '../content/generators';
import { navigate } from '../router';

export function LessonPlayer({ id }: { id: string }) {
  const ref = findLesson(id);
  const current = useCourse();
  const course = courseOfLesson(id, current);
  const savedStep = useStore((s) => s.lessonStep[id]);
  const qteEnabled = useStore((s) => s.settings.qte);
  const preferred = useStore((s) => s.settings.preferredLang);
  const [idx, setIdx] = useState(() => (savedStep !== undefined && ref ? Math.min(savedStep, ref.lesson.steps.length - 1) : 0));
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const [qte, setQte] = useState<GenQuestion | null>(null);
  const qteCount = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);

  const lesson = ref?.lesson;
  const step = lesson?.steps[idx];
  const interactive = step ? isInteractive(step) : false;
  const canNext = !interactive || solved[idx];

  useEffect(() => {
    if (!lesson || finished) return;
    setState((s) => {
      s.lessonStep[id] = idx;
    }, { silentSync: false });
    topRef.current?.scrollIntoView({ block: 'start' });
  }, [idx, id, lesson, finished]);

  const maybeQte = useCallback(() => {
    if (!qteEnabled || qteCount.current >= 2 || !ref) return;
    if (Math.random() < 0.22) {
      qteCount.current++;
      const lang = course?.lang ?? preferred;
      const topic = step?.topic;
      setTimeout(() => setQte(randomQuestion(lang, topic ? [topic] : undefined)), 400);
    }
  }, [qteEnabled, ref, preferred, step?.topic]);

  const onSolved = useCallback(() => {
    if (solved[idx]) return;
    setSolved((s) => ({ ...s, [idx]: true }));
    if (step) {
      recordAnswer(step.topic, true, step.kind);
      track('steps');
      if (step.kind === 'fixbug') track('bugs');
      awardXp(step.kind === 'code' || step.kind === 'fixbug' ? 15 : 5, STEP_LABELS[step.kind], { metric: step.kind === 'fixbug' ? 'bugs' : 'steps' });
    }
    maybeQte();
  }, [idx, solved, step, maybeQte]);

  const onMistake = useCallback(
    (detail: string) => {
      setMistakes((m) => m + 1);
      if (step) recordAnswer(step.topic, false, step.kind, detail);
    },
    [step],
  );

  const next = () => {
    if (!lesson) return;
    if (!interactive && !solved[idx]) {
      setSolved((s) => ({ ...s, [idx]: true }));
      track('steps');
    }
    if (idx < lesson.steps.length - 1) setIdx(idx + 1);
    else {
      const interactiveCount = lesson.steps.filter(isInteractive).length || 1;
      const score = Math.max(0, Math.round(100 - (mistakes / interactiveCount) * 25));
      completeLesson(id, score, mistakes);
      setFinished(true);
    }
  };

  const stepsMeta = useMemo(() => lesson?.steps.map((s) => s.kind) ?? [], [lesson]);

  if (!ref || !lesson || !step) {
    return (
      <div className="page center">
        <h2>Урок не найден</h2>
        <button className="btn" onClick={() => navigate('/learn')}>К списку уроков</button>
      </div>
    );
  }

  if (finished) {
    const nxt = course ? nextInCourse(course, id) : nextLesson(id);
    const result = getState().completedLessons[id];
    return (
      <div className="page lesson-finish">
        <div className="finish-card">
          <div className="celebrate-icon">{mistakes === 0 ? '💯' : '🎉'}</div>
          <h1>Урок пройден!</h1>
          <h3>{lesson.title}</h3>
          <div className="finish-stats">
            <div><b>{result?.score ?? 100}%</b><span>точность</span></div>
            <div><b>{lesson.steps.length}</b><span>шагов</span></div>
            <div><b>{mistakes}</b><span>ошибок</span></div>
          </div>
          <p className="muted">{mistakes === 0 ? 'Идеально! Ни одной ошибки.' : 'Ошибки — это нормально: именно на них мы учимся. Карточки с этими вопросами появятся в повторении.'}</p>
          <div className="toolbar center">
            {nxt ? (
              <button className="btn btn-primary btn-lg" onClick={() => { navigate(`/lesson/${nxt.lesson.id}`); }}>
                Следующий: {nxt.lesson.title} →
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={() => navigate(`/exam/${ref.module.id}`)}>📜 Сдать экзамен по модулю</button>
            )}
            {nxt && nxt.module.id !== ref.module.id && ref.track.id !== 'basics' && (
              <button className="btn" onClick={() => navigate(`/exam/${ref.module.id}`)}>📜 Экзамен по модулю «{ref.module.title}»</button>
            )}
            <button className="btn" onClick={() => navigate(course ? `/learn?course=${course.id}` : '/learn')}>К программе курса</button>
            <button className="btn btn-ghost" onClick={() => navigate('/practice')}>🎯 Потренироваться</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson" ref={topRef}>
      <div className="lesson-top">
        <button className="btn btn-ghost" onClick={() => navigate(course ? `/learn?course=${course.id}` : '/learn')} aria-label="Выйти из урока">✕</button>
        <div className="lesson-progress" aria-label={`Шаг ${idx + 1} из ${lesson.steps.length}`}>
          {stepsMeta.map((k, i) => (
            <button key={i} className={`seg ${i < idx || solved[i] ? 'done' : ''} ${i === idx ? 'cur' : ''}`} title={STEP_LABELS[k]} onClick={() => i <= idx && setIdx(i)} />
          ))}
        </div>
        <span className="muted small nowrap">{idx + 1}/{lesson.steps.length}</span>
      </div>
      <div className="lesson-body">
        <div className="lesson-crumbs muted small">
          {ref.track.icon} {ref.track.title} · {ref.chapter.title} · <b>{lesson.title}</b>
        </div>
        <div className="step-kind">{STEP_LABELS[step.kind]}</div>
        <div className="step-card">
          <StepView key={`${id}-${idx}`} step={step} solved={!!solved[idx]} onSolved={onSolved} onMistake={onMistake} stepKey={`${id}-${idx}`} />
        </div>
      </div>
      <div className="lesson-bottom">
        <button className="btn" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← Назад</button>
        {interactive && !canNext && (
          <button className="btn btn-ghost btn-sm" onClick={() => { bump('hints'); onMistake('пропуск'); setSolved((s) => ({ ...s, [idx]: true })); }} title="Пропустить задание (засчитается как ошибка)">
            Пропустить
          </button>
        )}
        <button className="btn btn-primary btn-lg" onClick={next} disabled={!canNext}>
          {idx === lesson.steps.length - 1 ? 'Завершить урок ✓' : 'Далее →'}
        </button>
      </div>
      {qte && <QTE q={qte} onDone={() => setQte(null)} />}
    </div>
  );
}
