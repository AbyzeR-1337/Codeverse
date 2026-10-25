// Страница курса: программа выбранного курса (модули → главы → уроки), необязательное введение,
// экзамены по модулям и главы из дорожной карты.
import { useState } from 'react';
import { courseLessons, courseModules, getCourse, introChapters } from '../content/courses';
import type { Chapter } from '../content/types';
import { useStore } from '../store/progress';
import { useCourse, useCourseProgress } from '../store/course';
import { navigate, useRoute } from '../router';
import { CourseCards } from './Courses';

function ChapterCard({ c, firstOpen }: { c: Chapter; firstOpen?: string }) {
  const completed = useStore((s) => s.completedLessons);
  const inProgress = useStore((s) => s.lessonStep);
  return (
    <div className={`chapter ${c.lessons.length ? '' : 'planned'}`}>
      <div className="chapter-title">
        <b>{c.title}</b>
        {!c.lessons.length && <span className="badge">скоро</span>}
      </div>
      {c.description && <div className="muted small">{c.description}</div>}
      <div className="lessons">
        {c.lessons.map((l) => {
          const status = completed[l.id] ? 'done' : inProgress[l.id] !== undefined ? 'progress' : l.id === firstOpen ? 'next' : '';
          return (
            <button key={l.id} className={`lesson-row ${status}`} onClick={() => navigate(`/lesson/${l.id}`)}>
              <span className="lesson-status">{status === 'done' ? '✅' : status === 'progress' ? '⏳' : status === 'next' ? '▶️' : '○'}</span>
              <span className="lesson-name">{l.title}</span>
              <span className="muted small">{l.steps.length} шагов · {l.minutes} мин</span>
              {completed[l.id] && <span className="score">{completed[l.id].score}%</span>}
            </button>
          );
        })}
        {c.planned?.map((p) => (
          <div key={p} className="lesson-row planned-row">
            <span className="lesson-status">🔒</span>
            <span className="lesson-name">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Learn() {
  const { query } = useRoute();
  const current = useCourse();
  // Старые ссылки вида #/learn?track=js открывают соответствующий курс.
  const course = getCourse(query.get('course') ?? query.get('track')) ?? current;
  const completed = useStore((s) => s.completedLessons);
  const exams = useStore((s) => s.exams);
  const [showPlanned, setShowPlanned] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const progress = useCourseProgress(course?.id ?? 'python');

  if (!course) {
    return (
      <div className="page learn">
        <h1>📚 Выбери курс</h1>
        <p className="muted">С чего начнём? Курс можно будет сменить в любой момент.</p>
        <CourseCards />
      </div>
    );
  }

  const intro = introChapters(course);
  const introLessons = intro.flatMap((c) => c.lessons);
  const introDone = introLessons.filter((l) => completed[l.id]).length;
  const introOpen = showIntro ?? (introDone > 0 && introDone < introLessons.length);
  const firstOpen = courseLessons(course, { intro: false }).find((r) => !completed[r.lesson.id])?.lesson.id;
  const modules = courseModules(course);
  const realModules = modules.filter((m) => m.chapters.some((c) => c.lessons.length));
  const roadmap = modules.filter((m) => !m.chapters.some((c) => c.lessons.length));

  return (
    <div className="page learn">
      <section className="course-hero card" style={{ ['--c' as string]: course.color }}>
        <span className="track-big-icon">{course.icon}</span>
        <div className="course-hero-body">
          <div className="muted small">Твой курс</div>
          <h1>{course.title}</h1>
          <p className="muted">{course.description}</p>
          <div className="level-bar"><div className="level-fill" style={{ width: `${progress.pct}%` }} /></div>
          <div className="muted small">
            Пройдено {progress.done} из {progress.total} уроков · {progress.pct}%
          </div>
        </div>
        <div className="course-hero-actions">
          {firstOpen && (
            <button className="btn btn-primary btn-lg" onClick={() => navigate(`/lesson/${firstOpen}`)}>
              {progress.done ? 'Продолжить' : 'Начать курс'} →
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => navigate('/courses')}>Сменить курс</button>
        </div>
      </section>

      {intro.length > 0 && (
        <section className="module intro-module">
          <button className="intro-toggle" onClick={() => setShowIntro(!introOpen)} aria-expanded={introOpen}>
            <span>
              <b>Модуль 0. Введение: как работает компьютер</b>
              <span className="badge badge-soft">необязательно</span>
            </span>
            <span className="muted small">
              {introDone}/{introLessons.length} уроков {introOpen ? '▲' : '▼'}
            </span>
          </button>
          {introOpen && (
            <div className="chapters">
              {intro.map((c) => (
                <ChapterCard key={c.id} c={c} />
              ))}
            </div>
          )}
          {!introOpen && <div className="muted small">Для тех, кто совсем не знаком с компьютерами: что такое программа, процессор, память и двоичная система. Можно пропустить и сразу писать код.</div>}
        </section>
      )}

      {realModules.map((m, mi) => {
        const lessons = m.chapters.flatMap((c) => c.lessons);
        const done = lessons.filter((l) => completed[l.id]).length;
        const chapters = m.chapters.filter((c) => c.lessons.length || showPlanned);
        return (
          <section key={m.id} className="module">
            <div className="module-head">
              <div>
                <div className="muted small">Модуль {mi + 1}</div>
                <h2>{m.title}</h2>
              </div>
              <div className="module-meta">
                <span className="muted small">{done}/{lessons.length} уроков</span>
                <div className="mini-progress" style={{ width: 120 }}><div style={{ width: `${(done / lessons.length) * 100}%` }} /></div>
                <button className={`btn btn-sm ${exams[m.id]?.passed ? 'btn-good' : ''}`} onClick={() => navigate(`/exam/${m.id}`)}>
                  {exams[m.id]?.passed ? `🏆 Экзамен сдан (${exams[m.id].best}%)` : '📜 Экзамен'}
                </button>
              </div>
            </div>
            <div className="chapters">
              {chapters.map((c) => (
                <ChapterCard key={c.id} c={c} firstOpen={firstOpen} />
              ))}
            </div>
          </section>
        );
      })}

      {progress.done === progress.total && progress.total > 0 && (
        <section className="card certificate">
          <div className="celebrate-icon">🎓</div>
          <h2>Курс «{course.title}» пройден!</h2>
          <p className="muted">Отличная работа. Закрепи знания в задачнике и проектах или начни следующий курс.</p>
        </section>
      )}

      {roadmap.length > 0 && (
        <section className="module roadmap">
          <label className="toggle muted small">
            <input type="checkbox" checked={showPlanned} onChange={(e) => setShowPlanned(e.target.checked)} /> Показать, что будет дальше (дорожная карта)
          </label>
          {showPlanned &&
            roadmap.map((m) => (
              <div key={m.id}>
                <h2>{m.title}</h2>
                <div className="chapters">
                  {m.chapters.map((c) => (
                    <ChapterCard key={c.id} c={c} />
                  ))}
                </div>
              </div>
            ))}
        </section>
      )}
    </div>
  );
}
