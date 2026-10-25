// Текущий курс ученика.
import { COURSES, CourseId, courseLessons, getCourse } from '../content/courses';
import { setState, useStore } from './progress';

export function useCourse() {
  const id = useStore((s) => s.settings.course);
  return getCourse(id);
}

export function chooseCourse(id: CourseId) {
  const c = getCourse(id)!;
  setState((s) => {
    s.settings.course = id;
    s.settings.preferredLang = c.lang;
  });
}

/** Прогресс курса: пройдено / всего уроков основной программы. */
export function useCourseProgress(id: CourseId) {
  const completed = useStore((s) => s.completedLessons);
  const c = getCourse(id)!;
  const lessons = courseLessons(c, { intro: false });
  const done = lessons.filter((r) => completed[r.lesson.id]).length;
  return { done, total: lessons.length, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
}

export { COURSES };
