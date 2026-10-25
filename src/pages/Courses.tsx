// Выбор курса: при первом запуске и в любой момент позже. Прогресс по всем курсам сохраняется.
import { COURSES, Course, courseLessons } from '../content/courses';
import { chooseCourse, useCourse, useCourseProgress } from '../store/course';
import { navigate } from '../router';

function courseNumbers(c: Course) {
  const lessons = courseLessons(c, { intro: false });
  let steps = 0;
  let code = 0;
  let minutes = 0;
  for (const { lesson } of lessons) {
    minutes += lesson.minutes;
    for (const s of lesson.steps) {
      steps++;
      if (s.kind === 'code' || s.kind === 'fixbug') code++;
    }
  }
  return { lessons: lessons.length, steps, code, hours: Math.max(1, Math.round((minutes * 1.6) / 60)) };
}

function CourseCard({ c, active }: { c: Course; active: boolean }) {
  const n = courseNumbers(c);
  const p = useCourseProgress(c.id);
  const start = () => {
    chooseCourse(c.id);
    navigate('/learn');
  };
  return (
    <div className={`course-card ${active ? 'active' : ''}`} style={{ ['--c' as string]: c.color }}>
      <div className="course-card-head">
        <span className="course-icon">{c.icon}</span>
        <div>
          <h2>{c.title}</h2>
          <div className="muted small">{c.level}</div>
        </div>
      </div>
      <p className="course-tagline">{c.tagline}</p>
      <p className="muted small">{c.description}</p>
      <div className="course-numbers">
        <span><b>{n.lessons}</b> уроков</span>
        <span><b>{n.steps}</b> шагов</span>
        <span><b>{n.code}</b> заданий с кодом</span>
        <span><b>~{n.hours} ч</b> практики</span>
      </div>
      <div className="card-label small">После курса ты сможешь:</div>
      <ul className="course-outcomes">
        {c.outcomes.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
      {p.done > 0 && (
        <>
          <div className="mini-progress"><div style={{ width: `${p.pct}%` }} /></div>
          <div className="muted small">Пройдено {p.done} из {p.total} уроков ({p.pct}%)</div>
        </>
      )}
      <button className="btn btn-primary btn-lg" onClick={start}>
        {active ? 'Продолжить курс →' : p.done > 0 ? 'Вернуться к курсу →' : 'Выбрать этот курс →'}
      </button>
    </div>
  );
}

export function CourseCards() {
  const current = useCourse();
  return (
    <div className="course-grid">
      {COURSES.map((c) => (
        <CourseCard key={c.id} c={c} active={current?.id === c.id} />
      ))}
    </div>
  );
}

export function Courses() {
  const current = useCourse();
  return (
    <div className="page courses">
      <h1>📚 Курсы программирования</h1>
      <p className="muted">
        Выбери курс — уроки, практика, задачи и редактор кода подстроятся под его язык. Курс можно сменить в любой момент: прогресс по каждому курсу сохраняется.
        {current && <> Сейчас ты проходишь: <b>{current.icon} {current.short}</b>.</>}
      </p>
      <CourseCards />
    </div>
  );
}
