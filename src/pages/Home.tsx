// Главная: всё вокруг выбранного курса — продолжить урок, программа текущего модуля,
// задания дня, практика на языке курса, слабые темы и активность.
import { currentSeason, levelFromXp, levelTitle, useStore, xpForLevel } from '../store/progress';
import { courseLessons, courseModules } from '../content/courses';
import { weakTopics } from '../store/actions';
import { useCourse, useCourseProgress } from '../store/course';
import { topicIcon, topicTitle } from '../content/topics';
import { navigate } from '../router';
import { Heatmap } from '../components/Heatmap';
import { ALL_CARDS } from '../content/flashcards';
import { PROBLEMS } from '../content/problems';
import { CourseCards } from './Courses';

export function Home() {
  const s = useStore((st) => st);
  const course = useCourse();
  const progress = useCourseProgress(course?.id ?? 'python');
  const lvl = levelFromXp(s.xp);
  const from = xpForLevel(lvl);
  const to = xpForLevel(lvl + 1);
  const season = s.settings.focusMode ? null : currentSeason();
  const weak = weakTopics(3);
  const dueCards = ALL_CARDS.filter((c) => s.srs[c.id] && s.srs[c.id].due <= Date.now()).length;
  const hour = new Date().getHours();
  const greet = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  if (!course) {
    return (
      <div className="page home">
        <section className="hero welcome">
          <div>
            <h1>Добро пожаловать в CodeVerse! {s.profile.avatar}</h1>
            <p className="muted">
              Здесь учатся программировать с полного нуля — через практику. В каждом уроке ты сам пишешь и запускаешь код, а встроенный помощник объясняет ошибки простыми словами.
            </p>
            <p><b>Выбери курс, с которого начнёшь:</b></p>
          </div>
        </section>
        <CourseCards />
      </div>
    );
  }

  // Урок, на котором остановились (в этом курсе), иначе — первый непройденный.
  const lessons = courseLessons(course);
  const resumeId = Object.keys(s.lessonStep).find((id) => lessons.some((r) => r.lesson.id === id));
  const main = courseLessons(course, { intro: false });
  const nextRef = lessons.find((r) => r.lesson.id === resumeId) ?? main.find((r) => !s.completedLessons[r.lesson.id]);
  // Текущий модуль: где находится следующий урок.
  const modules = courseModules(course).filter((m) => m.chapters.some((c) => c.lessons.length));
  const curModule = modules.find((m) => m.chapters.some((c) => c.lessons.some((l) => l.id === nextRef?.lesson.id))) ?? modules[0];
  const modIdx = modules.indexOf(curModule);
  const solved = PROBLEMS.filter((p) => s.solvedProblems[p.id]).length;

  return (
    <div className="page home">
      <section className="hero course-home" style={{ ['--c' as string]: course.color }}>
        <div>
          <div className="muted small">{greet}, {s.profile.name}! {s.profile.avatar}</div>
          <h1>{course.icon} {course.title}</h1>
          <div className="level-bar"><div className="level-fill" style={{ width: `${progress.pct}%` }} /></div>
          <div className="muted small">
            Курс пройден на {progress.pct}% · {progress.done} из {progress.total} уроков · уровень {lvl} ({levelTitle(lvl)}), {s.xp - from}/{to - from} XP до следующего
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat"><b>🔥 {s.streak.current}</b><span>дней подряд</span></div>
          <div className="stat"><b>🧩 {solved}</b><span>задач решено</span></div>
        </div>
      </section>

      {season && (
        <section className="season-banner">
          <b>{season.title}</b>
          <span>{season.description}</span>
        </section>
      )}

      <div className="grid-2">
        <section className="card continue-card">
          <div className="card-label">{resumeId ? '▶ Продолжить с того же места' : progress.done ? '▶ Следующий урок' : '🚀 Первый урок'}</div>
          {nextRef ? (
            <>
              <h2>{nextRef.lesson.title}</h2>
              <p className="muted">
                {nextRef.chapter.title} · {nextRef.lesson.steps.length} шагов · ~{nextRef.lesson.minutes} мин
              </p>
              {resumeId === nextRef.lesson.id && (
                <div className="mini-progress">
                  <div style={{ width: `${(s.lessonStep[resumeId] / nextRef.lesson.steps.length) * 100}%` }} />
                </div>
              )}
              <button className="btn btn-primary btn-lg" onClick={() => navigate(`/lesson/${nextRef.lesson.id}`)}>
                {resumeId ? 'Продолжить' : 'Начать урок'} →
              </button>
            </>
          ) : (
            <p>🎓 Все уроки курса пройдены! Закрепи знания в задачнике или начни следующий курс.</p>
          )}
        </section>

        <section className="card">
          <div className="card-label">
            🗺️ Модуль {modIdx + 1}: {curModule.title}
          </div>
          <div className="module-mini">
            {curModule.chapters
              .flatMap((c) => c.lessons)
              .map((l) => (
                <button key={l.id} className={`lesson-row ${s.completedLessons[l.id] ? 'done' : l.id === nextRef?.lesson.id ? 'next' : ''}`} onClick={() => navigate(`/lesson/${l.id}`)}>
                  <span className="lesson-status">{s.completedLessons[l.id] ? '✅' : l.id === nextRef?.lesson.id ? '▶️' : '○'}</span>
                  <span className="lesson-name">{l.title}</span>
                </button>
              ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/learn')}>Вся программа курса →</button>
        </section>
      </div>

      <section className="quick-grid quick-4">
        <button className="quick" onClick={() => navigate('/practice')}><span>🎯</span><b>Тренировка</b><small>Упражнения на {course.lang === 'js' ? 'JavaScript' : 'Python'}{weak.length ? ' и слабые темы' : ''}</small></button>
        <button className="quick" onClick={() => navigate('/problems')}><span>🧩</span><b>Задачи</b><small>Пиши код и проходи тесты</small></button>
        <button className="quick" onClick={() => navigate(`/ide?file=/home/student/hello.${course.lang === 'js' ? 'js' : 'py'}`)}><span>💻</span><b>Редактор кода</b><small>Пиши свои программы</small></button>
        <button className="quick" onClick={() => navigate('/review')}><span>🔁</span><b>Повторение</b><small>{dueCards ? `${dueCards} карточек ждут` : 'Закрепи пройденное'}</small></button>
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-label">📅 Задания дня</div>
          {s.daily.quests.map((q) => (
            <div key={q.id} className={`quest ${q.done ? 'done' : ''}`}>
              <div className="quest-top">
                <span>{q.done ? '✅' : '⬜'} {q.title}</span>
                <span className="muted small">+{q.xp} XP</span>
              </div>
              <div className="mini-progress">
                <div style={{ width: `${(q.progress / q.goal) * 100}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="card">
          <div className="card-label">🤖 Что подтянуть</div>
          {weak.length ? (
            <div className="weak-list">
              {weak.map((w) => (
                <button key={w.topic} className="weak-item" onClick={() => navigate(`/practice?topic=${w.topic}`)}>
                  <span>{topicIcon(w.topic)} {topicTitle(w.topic)}</span>
                  <span className="muted small">{Math.round(w.rate * 100)}% ошибок →</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted small">Пока всё хорошо! Наставник следит за твоими ошибками и, если какая-то тема будет даваться трудно, предложит упражнения именно на неё.</p>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-label">📈 Активность</div>
        <Heatmap activity={s.activity} />
      </section>
    </div>
  );
}
