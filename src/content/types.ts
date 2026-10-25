// Модель учебного контента CodeVerse.
// Весь курс описывается данными: треки → модули → главы → уроки → шаги.

export type Lang = 'js' | 'python';

/** Проверка решения. Если задан `expr`, вычисляется выражение после кода ученика
 *  и сравнивается его JSON-представление с `expected`. Иначе сравнивается stdout. */
export interface TestCase {
  /** Строки, которые программа получит через input()/prompt(). */
  stdin?: string[];
  /** Выражение на языке задачи, например `sum(2, 3)`. */
  expr?: string;
  /** Ожидаемый stdout (без завершающих пробелов) или JSON результата `expr`. */
  expected: string;
  /** Скрытые тесты не показывают ожидаемое значение. */
  hidden?: boolean;
  /** Подпись для ученика. */
  name?: string;
}

/** Кадр анимации: набор «коробок» и стрелок. Коробки с одинаковым id плавно перемещаются между кадрами. */
export interface AnimBox {
  id: string;
  label?: string;
  value?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: 'accent' | 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple';
  highlight?: boolean;
  shape?: 'rect' | 'round' | 'circle';
}
export interface AnimFrame {
  caption: string;
  boxes: AnimBox[];
  arrows?: { from: string; to: string; label?: string }[];
  /** Подсвеченная строка кода (если в анимации есть код). */
  line?: number;
}
export interface AnimationSpec {
  code?: string;
  lang?: Lang;
  width?: number;
  height?: number;
  frames: AnimFrame[];
}

interface StepBase {
  /** Тема для статистики и адаптивных заданий (например, `loops`, `strings`). */
  topic?: string;
}

export type Step = StepBase &
  (
    | { kind: 'theory'; title?: string; md: string }
    | { kind: 'animation'; title: string; anim: AnimationSpec }
    | { kind: 'example'; title?: string; lang: Lang; code: string; note?: string }
    | { kind: 'quiz'; question: string; code?: string; lang?: Lang; options: string[]; answer: number | number[]; explain: string }
    | { kind: 'predict'; prompt?: string; lang: Lang; code: string; answer: string; explain: string }
    | { kind: 'order'; prompt: string; lang?: Lang; lines: string[]; explain?: string }
    | { kind: 'match'; prompt: string; pairs: [string, string][] }
    | { kind: 'fill'; prompt: string; lang: Lang; template: string; answers: string[][]; explain?: string }
    | { kind: 'findline'; prompt: string; lang: Lang; code: string; answer: number; explain: string }
    | { kind: 'fixbug'; prompt: string; lang: Lang; code: string; tests: TestCase[]; hints: string[]; solution?: string }
    | { kind: 'code'; prompt: string; lang: Lang; starter: string; tests: TestCase[]; hints: string[]; solution?: string }
  );

export type StepKind = Step['kind'];

export interface Lesson {
  id: string;
  title: string;
  /** Примерное время в минутах. */
  minutes: number;
  steps: Step[];
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  /** Готовые уроки. Если пусто — глава в дорожной карте, но ещё в разработке. */
  lessons: Lesson[];
  /** Темы, которые будут в главе (для дорожной карты). */
  planned?: string[];
}

export interface Module {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface Track {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  modules: Module[];
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  statement: string;
  fnName: string;
  /** Имя функции в Python (snake_case), если отличается от JS. */
  fnPy?: string;
  /** Подписи параметров для стартового кода. */
  params: string[];
  /** Аргументы и ожидаемый результат в JSON. */
  cases: { args: unknown[]; expected: unknown; hidden?: boolean }[];
  hints: string[];
  solutionJs?: string;
  solutionPy?: string;
  /** Ожидаемая сложность — для режима собеседования. */
  complexity?: string;
}

export interface ProjectStep {
  title: string;
  md: string;
  lang: Lang | 'web';
  /** Для web-шагов: файлы проекта (index.html, style.css, script.js). */
  files?: Record<string, string>;
  starter?: string;
  tests?: TestCase[];
}

export interface Project {
  id: string;
  title: string;
  icon: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  track: 'js' | 'python' | 'web';
  tags: string[];
  summary: string;
  steps: ProjectStep[];
}
