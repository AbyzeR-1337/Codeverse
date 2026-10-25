// Quick Time Event: неожиданное задание на время. Правильный ответ даёт бонусный опыт.
import { useEffect, useState } from 'react';
import type { GenQuestion } from '../content/generators';
import { CodeBlock } from './Markdown';
import { awardXp, bump, recordAnswer, track } from '../store/actions';

export function QTE({ q, onDone }: { q: GenQuestion; onDone: (ok: boolean) => void }) {
  const [left, setLeft] = useState(q.seconds * 10);
  const [chosen, setChosen] = useState<number | null>(null);
  const finished = chosen !== null || left <= 0;

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setLeft((l) => l - 1), 100);
    return () => clearInterval(t);
  }, [finished]);

  useEffect(() => {
    if (left <= 0 && chosen === null) {
      bump('qte_total');
      recordAnswer(q.topic, false, 'qte', 'время вышло');
    }
  }, [left, chosen, q.topic]);

  const choose = (i: number) => {
    if (finished) return;
    setChosen(i);
    bump('qte_total');
    const ok = i === q.answer;
    recordAnswer(q.topic, ok, 'qte');
    if (ok) {
      const bonus = Math.max(5, Math.round(left / 10) + 5);
      awardXp(bonus, '⚡ Quick Time Event');
      track('qte');
    }
  };

  const ok = chosen === q.answer;

  return (
    <div className="qte-backdrop" role="dialog" aria-modal="true" aria-label="Quick Time Event">
      <div className={`qte ${finished ? (ok ? 'qte-ok' : 'qte-fail') : ''}`}>
        <div className="qte-top">
          <span className="qte-badge">⚡ QUICK TIME EVENT</span>
          <span className="qte-timer">{Math.max(0, left / 10).toFixed(1)} с</span>
        </div>
        <div className="qte-bar">
          <div style={{ width: `${(left / (q.seconds * 10)) * 100}%` }} />
        </div>
        <div className="qte-q">{q.question}</div>
        {q.code && <CodeBlock code={q.code} lang={q.lang ?? 'js'} />}
        <div className="qte-options">
          {q.options.map((o, i) => (
            <button key={i} className={`option ${finished && i === q.answer ? 'right' : ''} ${chosen === i && i !== q.answer ? 'wrong' : ''}`} onClick={() => choose(i)} disabled={finished}>
              <span className="option-mark">{i + 1}</span> {o}
            </button>
          ))}
        </div>
        {finished && (
          <div className="qte-result">
            <b>{ok ? '🎉 Молниеносно!' : left <= 0 && chosen === null ? '⌛ Время вышло' : '💥 Мимо'}</b>
            <p>{q.explain}</p>
            <button className="btn btn-primary" onClick={() => onDone(ok)} autoFocus>
              Продолжить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
