// Сборка всего курса и вспомогательные функции поиска по нему.
import type { Chapter, Lesson, Module, Track } from '../types';
import { basicsTrack } from './basics';
import { pythonModules1 } from './python1';
import { pythonModules2 } from './python2';
import { jsTrack } from './javascript';
import { algoTrack } from './algorithms';

export const pythonTrack: Track = {
  id: 'python',
  title: 'Python',
  icon: '🐍',
  color: '#4ade80',
  description: 'Самый дружелюбный язык для старта: автоматизация, боты, анализ данных, веб-серверы и нейросети. От print() до машинного обучения.',
  modules: [...pythonModules1, ...pythonModules2],
};

export const TRACKS: Track[] = [basicsTrack, pythonTrack, jsTrack, algoTrack];

export interface LessonRef {
  lesson: Lesson;
  chapter: Chapter;
  module: Module;
  track: Track;
  index: number;
}

/** Плоский список всех готовых уроков в порядке прохождения. */
export const ALL_LESSONS: LessonRef[] = [];
for (const track of TRACKS)
  for (const module of track.modules)
    for (const chapter of module.chapters)
      for (const lesson of chapter.lessons) ALL_LESSONS.push({ lesson, chapter, module, track, index: ALL_LESSONS.length });

const byId = new Map(ALL_LESSONS.map((r) => [r.lesson.id, r]));
export const findLesson = (id: string) => byId.get(id);

export function nextLesson(id: string): LessonRef | undefined {
  const ref = byId.get(id);
  if (!ref) return undefined;
  const next = ALL_LESSONS[ref.index + 1];
  return next && next.track.id === ref.track.id ? next : undefined;
}

export function trackLessons(trackId: string) {
  return ALL_LESSONS.filter((r) => r.track.id === trackId);
}

export function courseStats() {
  let chapters = 0;
  let planned = 0;
  let steps = 0;
  let codeTasks = 0;
  let quizzes = 0;
  for (const t of TRACKS)
    for (const m of t.modules)
      for (const c of m.chapters) {
        chapters++;
        planned += c.planned?.length ?? 0;
        for (const l of c.lessons)
          for (const s of l.steps) {
            steps++;
            if (s.kind === 'code' || s.kind === 'fixbug') codeTasks++;
            if (s.kind === 'quiz' || s.kind === 'predict' || s.kind === 'match') quizzes++;
          }
      }
  return { tracks: TRACKS.length, chapters, lessons: ALL_LESSONS.length, planned, steps, codeTasks, quizzes };
}
