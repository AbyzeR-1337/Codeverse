import { levelFromXp, State } from './progress';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  tier: 'bronze' | 'silver' | 'gold' | 'legend';
  /** Если задано — проверяется автоматически. Иначе выдаётся явно через unlock(). */
  check?: (s: State) => boolean;
}

const lessons = (s: State) => Object.keys(s.completedLessons).length;
const problems = (s: State) => Object.keys(s.solvedProblems).length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', title: 'Первый шаг', description: 'Пройди первый урок', icon: '👣', xp: 10, tier: 'bronze', check: (s) => lessons(s) >= 1 },
  { id: 'lessons-10', title: 'Ученик', description: 'Пройди 10 уроков', icon: '📘', xp: 50, tier: 'bronze', check: (s) => lessons(s) >= 10 },
  { id: 'lessons-25', title: 'Книжный червь', description: 'Пройди 25 уроков', icon: '📚', xp: 100, tier: 'silver', check: (s) => lessons(s) >= 25 },
  { id: 'lessons-50', title: 'Профессор', description: 'Пройди 50 уроков', icon: '🎓', xp: 250, tier: 'gold', check: (s) => lessons(s) >= 50 },
  { id: 'hello-world', title: 'Hello, World!', description: 'Впервые запусти код', icon: '👋', xp: 10, tier: 'bronze', check: (s) => s.counters.code_runs >= 1 },
  { id: 'runs-100', title: 'Нажимаю Run', description: 'Запусти код 100 раз', icon: '▶️', xp: 50, tier: 'silver', check: (s) => s.counters.code_runs >= 100 },
  { id: 'problem-1', title: 'Решатель', description: 'Реши первую задачу', icon: '🧩', xp: 20, tier: 'bronze', check: (s) => problems(s) >= 1 },
  { id: 'problem-10', title: 'Алгоритмист', description: 'Реши 10 задач', icon: '🧠', xp: 100, tier: 'silver', check: (s) => problems(s) >= 10 },
  { id: 'problem-30', title: 'Олимпиадник', description: 'Реши 30 задач', icon: '🏅', xp: 300, tier: 'gold', check: (s) => problems(s) >= 30 },
  { id: 'streak-3', title: 'Разогрев', description: 'Занимайся 3 дня подряд', icon: '🔥', xp: 30, tier: 'bronze', check: (s) => s.streak.best >= 3 },
  { id: 'streak-7', title: 'Неделя кода', description: 'Занимайся 7 дней подряд', icon: '🔥', xp: 100, tier: 'silver', check: (s) => s.streak.best >= 7 },
  { id: 'streak-30', title: 'Железная дисциплина', description: 'Занимайся 30 дней подряд', icon: '💎', xp: 500, tier: 'legend', check: (s) => s.streak.best >= 30 },
  { id: 'level-5', title: 'Уровень 5', description: 'Достигни 5 уровня', icon: '⭐', xp: 0, tier: 'bronze', check: (s) => levelFromXp(s.xp) >= 5 },
  { id: 'level-10', title: 'Уровень 10', description: 'Достигни 10 уровня', icon: '🌟', xp: 0, tier: 'silver', check: (s) => levelFromXp(s.xp) >= 10 },
  { id: 'level-20', title: 'Уровень 20', description: 'Достигни 20 уровня', icon: '✨', xp: 0, tier: 'gold', check: (s) => levelFromXp(s.xp) >= 20 },
  { id: 'qte-10', title: 'Быстрая реакция', description: 'Ответь правильно на 10 QTE', icon: '⚡', xp: 50, tier: 'silver', check: (s) => s.counters.qte >= 10 },
  { id: 'qte-50', title: 'Молния', description: 'Ответь правильно на 50 QTE', icon: '🌩️', xp: 150, tier: 'gold', check: (s) => s.counters.qte >= 50 },
  { id: 'bugs-10', title: 'Дезинсектор', description: 'Исправь 10 багов', icon: '🐞', xp: 60, tier: 'silver', check: (s) => s.counters.bugs >= 10 },
  { id: 'reviews-100', title: 'Слон помнит всё', description: 'Сделай 100 повторений карточек', icon: '🐘', xp: 100, tier: 'silver', check: (s) => s.counters.reviews >= 100 },
  { id: 'debugger', title: 'Под микроскопом', description: 'Пройди программу пошаговым отладчиком', icon: '🔬', xp: 20, tier: 'bronze', check: (s) => s.counters.debug_sessions >= 1 },
  { id: 'terminal-50', title: 'Человек-терминал', description: 'Выполни 50 команд в консоли', icon: '⌨️', xp: 40, tier: 'bronze', check: (s) => s.counters.terminal_cmds >= 50 },
  { id: 'ai-friend', title: 'Напарник', description: 'Задай вопрос ИИ-помощнику', icon: '🤖', xp: 10, tier: 'bronze', check: (s) => s.counters.ai_questions >= 1 },
  { id: 'project-1', title: 'Первый проект', description: 'Заверши проект', icon: '🛠️', xp: 100, tier: 'silver', check: (s) => Object.keys(s.completedProjects).length >= 1 },
  { id: 'project-5', title: 'Портфолио', description: 'Заверши 5 проектов', icon: '💼', xp: 300, tier: 'gold', check: (s) => Object.keys(s.completedProjects).length >= 5 },
  { id: 'games-10', title: 'Геймер', description: 'Сыграй 10 мини-игр', icon: '🎮', xp: 40, tier: 'bronze', check: (s) => s.counters.games >= 10 },
  { id: 'interview-1', title: 'Первое собеседование', description: 'Пройди пробное собеседование', icon: '🤝', xp: 50, tier: 'silver', check: (s) => s.interviews.length >= 1 },
  { id: 'interview-80', title: 'Оффер в кармане', description: 'Набери 80%+ на собеседовании', icon: '📝', xp: 200, tier: 'gold', check: (s) => s.interviews.some((i) => i.score >= 80) },
  { id: 'exam-1', title: 'Сдал!', description: 'Сдай первый экзамен', icon: '📜', xp: 50, tier: 'silver', check: (s) => Object.values(s.exams).some((e) => e.passed) },
  { id: 'perfect', title: 'Перфекционист', description: 'Пройди урок без единой ошибки', icon: '💯', xp: 30, tier: 'bronze', check: (s) => Object.values(s.completedLessons).some((l) => l.mistakes === 0) },
  { id: 'night-owl', title: 'Сова', description: 'Занимайся после полуночи', icon: '🦉', xp: 15, tier: 'bronze' },
  { id: 'early-bird', title: 'Жаворонок', description: 'Занимайся до 7 утра', icon: '🐦', xp: 15, tier: 'bronze' },
  { id: 'no-hints', title: 'Сам с усам', description: 'Реши задачу «hard» без подсказок', icon: '🦾', xp: 80, tier: 'gold' },
];
