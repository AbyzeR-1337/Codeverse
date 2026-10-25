// Интервальное повторение (SM-2): карточки возвращаются тогда, когда ты начинаешь их забывать.
import { useMemo, useState } from 'react';
import { ALL_CARDS, Flashcard } from '../content/flashcards';
import { useStore } from '../store/progress';
import { reviewCard } from '../store/actions';
import { Markdown, CodeBlock } from '../components/Markdown';

export function Review() {
  const srs = useStore((s) => s.srs);
  const completed = useStore((s) => s.completedLessons);
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState(0);
  const [mode, setMode] = useState<'due' | 'new'>('due');

  const { due, fresh } = useMemo(() => {
    const now = Date.now();
    const available = ALL_CARDS.filter((c) => !c.lessonId || completed[c.lessonId]);
    return {
      due: available.filter((c) => srs[c.id] && srs[c.id].due <= now),
      fresh: available.filter((c) => !srs[c.id]),
    };
    // session нужен, чтобы пересчитывать очередь после каждого ответа
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srs, completed, session]);

  const queue = mode === 'due' && due.length ? due : fresh;
  const card: Flashcard | undefined = queue[0];
  const learned = Object.values(srs).filter((c) => c.interval >= 21).length;

  const answer = (q: 0 | 3 | 4 | 5) => {
    if (!card) return;
    reviewCard(card.id, q);
    setFlipped(false);
    setSession((x) => x + 1);
  };

  return (
    <div className="page review">
      <h1>🔁 Повторение</h1>
      <p className="muted">Карточки по алгоритму интервального повторения: чем лучше помнишь — тем реже они появляются. Вопросы из уроков открываются после их прохождения.</p>
      <div className="review-stats">
        <div className="stat"><b>{due.length}</b><span>к повторению</span></div>
        <div className="stat"><b>{fresh.length}</b><span>новых</span></div>
        <div className="stat"><b>{Object.keys(srs).length}</b><span>изучается</span></div>
        <div className="stat"><b>{learned}</b><span>выучено надолго</span></div>
      </div>
      <div className="track-tabs">
        <button className={`track-tab ${mode === 'due' ? 'active' : ''}`} onClick={() => setMode('due')}>⏰ Повторить ({due.length})</button>
        <button className={`track-tab ${mode === 'new' ? 'active' : ''}`} onClick={() => setMode('new')}>✨ Новые ({fresh.length})</button>
      </div>
      {!card ? (
        <div className="card center">
          <div className="celebrate-icon">🌟</div>
          <h2>На сегодня всё!</h2>
          <p className="muted">Проходи новые уроки — из них появятся новые карточки.</p>
        </div>
      ) : (
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
          <div className="muted small">{card.source}</div>
          <Markdown md={card.front} className="fc-front" />
          {card.code && <CodeBlock code={card.code} lang={card.lang ?? 'js'} />}
          {!flipped ? (
            <button className="btn btn-primary btn-lg" onClick={() => setFlipped(true)}>Показать ответ</button>
          ) : (
            <>
              <div className="fc-back">
                <Markdown md={card.back} />
              </div>
              <div className="muted small">Насколько хорошо ты помнил?</div>
              <div className="srs-buttons">
                <button className="btn srs-0" onClick={() => answer(0)}>😵 Не помню</button>
                <button className="btn srs-3" onClick={() => answer(3)}>😐 С трудом</button>
                <button className="btn srs-4" onClick={() => answer(4)}>🙂 Хорошо</button>
                <button className="btn srs-5" onClick={() => answer(5)}>😎 Легко</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
