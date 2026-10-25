// Курсы программирования. Ученик выбирает один курс — и всё приложение подстраивается под него:
// уроки, практика, задачи и редактор работают на языке курса.
import type { Chapter, Lang, Module } from './types';
import { ALL_LESSONS, LessonRef, TRACKS } from './course';

export type CourseId = 'python' | 'js' | 'algo';

export interface Course {
  id: CourseId;
  title: string;
  short: string;
  icon: string;
  color: string;
  lang: Lang;
  level: string;
  tagline: string;
  description: string;
  outcomes: string[];
  /** Трек с основной программой курса. */
  trackId: string;
  /** Необязательное введение — главы трека «Основы». */
  introChapters: string[];
}

export const COURSES: Course[] = [
  {
    id: 'python',
    title: 'Python: программирование с нуля',
    short: 'Python',
    icon: '🐍',
    color: '#4ade80',
    lang: 'python',
    level: 'с нуля до уверенного уровня',
    tagline: 'Самый понятный язык для первого знакомства с программированием.',
    description:
      'Пишем код с первого урока: переменные, условия, циклы, списки, словари, функции, ООП, исключения, генераторы, декораторы, тестирование, регулярные выражения, работа с файлами и базами данных.',
    outcomes: [
      'Писать программы любой сложности на Python',
      'Решать задачи с циклами, списками и словарями',
      'Проектировать программы с функциями и классами',
      'Работать с файлами, JSON, CSV и SQLite',
      'Писать тесты и находить ошибки отладчиком',
      'Пользоваться генераторами, декораторами и регулярками',
    ],
    trackId: 'python',
    introChapters: ['b-computer-1', 'b-computer-2'],
  },
  {
    id: 'js',
    title: 'JavaScript: программирование с нуля',
    short: 'JavaScript',
    icon: '🟨',
    color: '#facc15',
    lang: 'js',
    level: 'с нуля до уверенного уровня',
    tagline: 'Язык веба: сайты, интерактивные приложения, серверы.',
    description:
      'От console.log() до замыканий, классов, прототипов, промисов и async/await. Массивы и их методы, объекты, Map и Set, рекурсия, функции высшего порядка, итераторы, регулярные выражения, модули, тесты и DOM.',
    outcomes: [
      'Уверенно писать на современном JavaScript',
      'Работать с массивами, объектами, Map и Set',
      'Понимать замыкания, this и прототипы',
      'Писать асинхронный код с промисами и async/await',
      'Оживлять веб-страницы через DOM',
      'Покрывать код тестами',
    ],
    trackId: 'js',
    introChapters: ['b-computer-1', 'b-computer-2', 'b-net'],
  },
  {
    id: 'algo',
    title: 'Алгоритмы и структуры данных',
    short: 'Алгоритмы',
    icon: '🧮',
    color: '#a78bfa',
    lang: 'python',
    level: 'после основ любого языка',
    tagline: 'Как думает программист: эффективные решения задач.',
    description:
      'Сложность алгоритмов, поиск и сортировки, стек, очередь, хеш-таблицы, два указателя, скользящее окно, рекурсия и перебор с возвратом, деревья, кучи, графы (BFS и DFS), жадные алгоритмы и динамическое программирование. Задачи — на Python.',
    outcomes: [
      'Оценивать сложность решения в O-нотации',
      'Выбирать подходящую структуру данных',
      'Применять два указателя, окно, бинарный поиск',
      'Решать задачи на деревья и графы',
      'Решать задачи динамическим программированием',
      'Проходить алгоритмические секции собеседований',
    ],
    trackId: 'algo',
    introChapters: [],
  },
];

export const getCourse = (id: string | null | undefined) => COURSES.find((c) => c.id === id);

export function courseTrack(c: Course) {
  return TRACKS.find((t) => t.id === c.trackId)!;
}

/** Главы необязательного введения курса. */
export function introChapters(c: Course): Chapter[] {
  const basics = TRACKS.find((t) => t.id === 'basics')!;
  const all = basics.modules.flatMap((m) => m.chapters);
  return c.introChapters.map((id) => all.find((ch) => ch.id === id)!).filter(Boolean);
}

/** Модули основной программы курса. */
export function courseModules(c: Course): Module[] {
  return courseTrack(c).modules;
}

/** Уроки курса в порядке прохождения: сначала введение, затем основная программа. */
export function courseLessons(c: Course, opts: { intro?: boolean } = {}): LessonRef[] {
  const intro = opts.intro === false ? [] : introChapters(c).flatMap((ch) => ALL_LESSONS.filter((r) => r.chapter.id === ch.id));
  return [...intro, ...ALL_LESSONS.filter((r) => r.track.id === c.trackId)];
}

/** Следующий урок внутри курса (введение плавно переходит в основную программу). */
export function nextInCourse(c: Course, lessonId: string): LessonRef | undefined {
  const list = courseLessons(c);
  const i = list.findIndex((r) => r.lesson.id === lessonId);
  return i >= 0 ? list[i + 1] : undefined;
}

/** Курс, к которому относится урок (для уроков введения — текущий курс). */
export function courseOfLesson(lessonId: string, current?: Course): Course | undefined {
  const ref = ALL_LESSONS.find((r) => r.lesson.id === lessonId);
  if (!ref) return undefined;
  if (ref.track.id === 'basics') return current;
  return COURSES.find((c) => c.trackId === ref.track.id);
}
