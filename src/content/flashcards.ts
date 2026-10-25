// Карточки для интервального повторения: термины глоссария + вопросы из пройденных уроков.
import { GLOSSARY } from './handbook';
import { ALL_LESSONS } from './course';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  code?: string;
  lang?: string;
  source: string;
  lessonId?: string;
}

const glossaryCards: Flashcard[] = GLOSSARY.map(([term, def]) => ({ id: `g:${term}`, front: `Что такое **${term}**?`, back: def, source: 'Глоссарий' }));

const lessonCards: Flashcard[] = ALL_LESSONS.flatMap(({ lesson }) =>
  lesson.steps.flatMap((s, i): Flashcard[] => {
    if (s.kind === 'quiz') {
      const correct = Array.isArray(s.answer) ? s.answer.map((a) => s.options[a]).join('; ') : s.options[s.answer];
      return [{ id: `q:${lesson.id}:${i}`, front: s.question, back: `**${correct}**\n\n${s.explain}`, code: s.code, lang: s.lang, source: lesson.title, lessonId: lesson.id }];
    }
    if (s.kind === 'predict') {
      return [{ id: `p:${lesson.id}:${i}`, front: 'Что выведет программа?', code: s.code, lang: s.lang, back: `\`\`\`text\n${s.answer}\n\`\`\`\n${s.explain}`, source: lesson.title, lessonId: lesson.id }];
    }
    if (s.kind === 'match') {
      return s.pairs.map(([a, b], k) => ({ id: `m:${lesson.id}:${i}:${k}`, front: a, back: b, source: lesson.title, lessonId: lesson.id }));
    }
    return [];
  }),
);

export const ALL_CARDS: Flashcard[] = [...glossaryCards, ...lessonCards];
