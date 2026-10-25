// Отрисовка всех типов шагов урока: теория, анимация, пример, викторина, предсказание вывода,
// порядок строк, сопоставление, пропуски, поиск строки с ошибкой, исправление бага, написание кода.
import { useMemo, useState, DragEvent } from 'react';
import type { Step } from '../content/types';
import { Markdown, CodeBlock } from './Markdown';
import { Animation } from './Animation';
import { CodeEditor } from './CodeEditor';
import { Output, OutLine } from './Output';
import { CodeTask } from './CodeTask';
import { runCode } from '../runtime/runner';
import { normalizeOut } from '../runtime/compare';

export interface StepProps<K extends Step['kind'] = Step['kind']> {
  step: Extract<Step, { kind: K }>;
  /** Вызывается, когда шаг выполнен. */
  onSolved: () => void;
  /** Вызывается при каждой ошибке. */
  onMistake: (detail: string) => void;
  solved: boolean;
  stepKey: string;
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const a = [...arr];
  let h = 0;
  for (const c of seed) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  for (let i = a.length - 1; i > 0; i--) {
    h = (Math.imul(h ^ (h >>> 13), 0x5bd1e995) + i) | 0;
    const j = Math.abs(h) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Feedback({ ok, text }: { ok: boolean; text?: string }) {
  return (
    <div className={`feedback ${ok ? 'good' : 'bad'}`} role="status">
      <b>{ok ? '✅ Верно!' : '❌ Пока нет'}</b>
      {text && <Markdown md={text} />}
    </div>
  );
}

function RunnableExample({ step }: { step: Extract<Step, { kind: 'example' }> }) {
  const [code, setCode] = useState(step.code);
  const [out, setOut] = useState<OutLine[]>([]);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const lines: OutLine[] = [];
    const res = await runCode(step.lang, code, ['Алиса', '25', '7'], {
      onOut: (text, stream) => {
        lines.push({ text, stream });
        setOut([...lines]);
      },
      onStatus: (t) => setOut([{ text: t, stream: 'info' }]),
    });
    if (!res.ok) lines.push({ text: `${res.errorName}: ${res.error}`, stream: 'err' });
    setOut([...lines]);
    setBusy(false);
  };
  return (
    <div className="example">
      {step.title && <h3>{step.title}</h3>}
      <CodeEditor value={code} onChange={setCode} lang={step.lang} minHeight={60} onRun={run} lint={false} />
      <div className="toolbar">
        <button className="btn btn-primary" onClick={run} disabled={busy}>▶ Запустить пример</button>
        <button className="btn btn-ghost" onClick={() => setCode(step.code)}>↺ Сбросить</button>
        <span className="muted small">Меняй код и запускай снова — экспериментируй!</span>
      </div>
      {out.length > 0 && <Output lines={out} />}
      {step.note && <Markdown md={step.note} className="note" />}
    </div>
  );
}

function Quiz({ step, onSolved, onMistake, solved }: StepProps<'quiz'>) {
  const multi = Array.isArray(step.answer);
  const [sel, setSel] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(solved ? true : null);
  const correct = multi ? (step.answer as number[]) : [step.answer as number];
  const check = () => {
    const ok = sel.length === correct.length && sel.every((s) => correct.includes(s));
    setResult(ok);
    if (ok) onSolved();
    else onMistake(`Выбрано: ${sel.map((s) => step.options[s]).join(', ')}`);
  };
  return (
    <div className="quiz">
      <Markdown md={step.question} className="question" />
      {step.code && <CodeBlock code={step.code} lang={step.lang ?? 'js'} />}
      {multi && <div className="muted small">Выбери все правильные варианты</div>}
      <div className="options">
        {step.options.map((o, i) => {
          const chosen = sel.includes(i);
          const show = result !== null && (result || chosen);
          return (
            <button
              key={i}
              className={`option ${chosen ? 'chosen' : ''} ${show && correct.includes(i) && result ? 'right' : ''} ${show && chosen && !correct.includes(i) ? 'wrong' : ''}`}
              onClick={() => {
                if (result) return;
                setResult(null);
                setSel(multi ? (chosen ? sel.filter((s) => s !== i) : [...sel, i]) : [i]);
              }}
            >
              <span className="option-mark">{multi ? (chosen ? '☑' : '☐') : String.fromCharCode(65 + i)}</span>
              <Markdown md={o} />
            </button>
          );
        })}
      </div>
      {!result && (
        <button className="btn btn-primary" disabled={!sel.length} onClick={check}>
          Проверить
        </button>
      )}
      {result !== null && <Feedback ok={result} text={result ? step.explain : 'Подумай ещё раз. Подсказка: перечитай теорию выше.'} />}
    </div>
  );
}

function Predict({ step, onSolved, onMistake, solved }: StepProps<'predict'>) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<boolean | null>(solved ? true : null);
  const [tries, setTries] = useState(0);
  const check = () => {
    const ok = normalizeOut(answer).replace(/\s+/g, ' ') === normalizeOut(step.answer).replace(/\s+/g, ' ');
    setResult(ok);
    setTries((t) => t + 1);
    if (ok) onSolved();
    else onMistake(`Ответ: ${answer}`);
  };
  return (
    <div className="predict">
      <p className="question">{step.prompt ?? '🔮 Что выведет эта программа?'}</p>
      <CodeBlock code={step.code} lang={step.lang} />
      <textarea className="answer-input" rows={Math.max(2, step.answer.split('\n').length)} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Напиши вывод программы (каждая строка — с новой строки)" disabled={!!result} />
      {!result && (
        <div className="toolbar">
          <button className="btn btn-primary" onClick={check} disabled={!answer.trim()}>Проверить</button>
          {tries >= 2 && (
            <button className="btn btn-ghost" onClick={() => { setAnswer(step.answer); }}>👀 Показать ответ</button>
          )}
        </div>
      )}
      {result !== null && <Feedback ok={result} text={result ? step.explain : `Мысленно выполни код строка за строкой.${tries >= 2 ? ' Можно посмотреть ответ.' : ''}`} />}
    </div>
  );
}

function Order({ step, onSolved, onMistake, solved, stepKey }: StepProps<'order'>) {
  const initial = useMemo(() => {
    let s = seededShuffle(step.lines.map((l, i) => ({ l, i })), stepKey);
    if (s.every((x, k) => x.i === k)) s = [...s.slice(1), s[0]];
    return s;
  }, [step.lines, stepKey]);
  const [items, setItems] = useState(solved ? step.lines.map((l, i) => ({ l, i })) : initial);
  const [result, setResult] = useState<boolean | null>(solved ? true : null);
  const [drag, setDrag] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || result) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setItems(next);
    setResult(null);
  };
  const check = () => {
    // Строки с одинаковым текстом взаимозаменяемы.
    const ok = items.every((x, k) => x.l === step.lines[k]);
    setResult(ok);
    if (ok) onSolved();
    else onMistake('Неверный порядок строк');
  };
  return (
    <div className="order">
      <Markdown md={step.prompt} className="question" />
      <div className="muted small">Перетащи строки мышкой или используй стрелки ↑↓</div>
      <ol className="order-list">
        {items.map((it, k) => (
          <li
            key={`${it.i}`}
            className={`order-item ${drag === k ? 'dragging' : ''}`}
            draggable={!result}
            onDragStart={() => setDrag(k)}
            onDragOver={(e: DragEvent) => e.preventDefault()}
            onDrop={() => {
              if (drag !== null) move(drag, k);
              setDrag(null);
            }}
            onDragEnd={() => setDrag(null)}
          >
            <span className="grip">⋮⋮</span>
            <code className="order-code">{it.l}</code>
            <span className="order-btns">
              <button className="btn btn-xs" onClick={() => move(k, k - 1)} aria-label="Выше">↑</button>
              <button className="btn btn-xs" onClick={() => move(k, k + 1)} aria-label="Ниже">↓</button>
            </span>
          </li>
        ))}
      </ol>
      {!result && <button className="btn btn-primary" onClick={check}>Проверить порядок</button>}
      {result !== null && <Feedback ok={result} text={result ? step.explain : 'Подумай, что должно произойти сначала, а что — потом.'} />}
    </div>
  );
}

function Match({ step, onSolved, onMistake, solved, stepKey }: StepProps<'match'>) {
  const right = useMemo(() => seededShuffle(step.pairs.map((p, i) => ({ t: p[1], i })), stepKey + 'r'), [step.pairs, stepKey]);
  const [pairs, setPairs] = useState<Record<number, number>>(solved ? Object.fromEntries(step.pairs.map((_, i) => [i, i])) : {});
  const [left, setLeft] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(solved ? true : null);
  const [wrong, setWrong] = useState<number | null>(null);
  const pick = (r: number) => {
    if (left === null || result) return;
    if (left === r) {
      const next = { ...pairs, [left]: r };
      setPairs(next);
      setLeft(null);
      if (Object.keys(next).length === step.pairs.length) {
        setResult(true);
        onSolved();
      }
    } else {
      setWrong(r);
      onMistake(`${step.pairs[left][0]} ≠ ${step.pairs[r][1]}`);
      setTimeout(() => setWrong(null), 600);
      setLeft(null);
    }
  };
  const matchedRight = new Set(Object.values(pairs));
  return (
    <div className="match">
      <Markdown md={step.prompt} className="question" />
      <div className="muted small">Нажми элемент слева, затем подходящий справа</div>
      <div className="match-cols">
        <div>
          {step.pairs.map(([l], i) => (
            <button key={i} className={`match-item ${left === i ? 'chosen' : ''} ${i in pairs ? 'matched' : ''}`} onClick={() => !(i in pairs) && setLeft(i)}>
              <Markdown md={l} />
            </button>
          ))}
        </div>
        <div>
          {right.map(({ t, i }) => (
            <button key={i} className={`match-item ${matchedRight.has(i) ? 'matched' : ''} ${wrong === i ? 'shake wrong' : ''}`} onClick={() => !matchedRight.has(i) && pick(i)}>
              <Markdown md={t} />
            </button>
          ))}
        </div>
      </div>
      {result && <Feedback ok text="Все пары найдены!" />}
    </div>
  );
}

function Fill({ step, onSolved, onMistake, solved }: StepProps<'fill'>) {
  const parts = step.template.split('___');
  const [vals, setVals] = useState<string[]>(solved ? step.answers.map((a) => a[0]) : parts.slice(1).map(() => ''));
  const [result, setResult] = useState<boolean | null>(solved ? true : null);
  const [bad, setBad] = useState<number[]>([]);
  const norm = (s: string) => s.replace(/\s+/g, '').replace(/"/g, "'");
  const check = () => {
    const wrong = vals.map((v, i) => (step.answers[i].some((a) => norm(a) === norm(v)) ? -1 : i)).filter((i) => i >= 0);
    setBad(wrong);
    const ok = wrong.length === 0;
    setResult(ok);
    if (ok) onSolved();
    else onMistake(`Пропуски: ${vals.join(' | ')}`);
  };
  return (
    <div className="fill">
      <Markdown md={step.prompt} className="question" />
      <pre className="code-block fill-code">
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < parts.length - 1 && (
              <input
                className={`fill-input ${bad.includes(i) ? 'bad' : ''}`}
                value={vals[i]}
                size={Math.max(3, (vals[i] || '').length + 1, step.answers[i][0].length)}
                onChange={(e) => {
                  const n = [...vals];
                  n[i] = e.target.value;
                  setVals(n);
                  setResult(null);
                }}
                disabled={!!result}
                spellCheck={false}
                autoCapitalize="off"
                aria-label={`Пропуск ${i + 1}`}
              />
            )}
          </span>
        ))}
      </pre>
      {!result && (
        <button className="btn btn-primary" onClick={check} disabled={vals.some((v) => !v.trim())}>
          Проверить
        </button>
      )}
      {result !== null && <Feedback ok={result} text={result ? step.explain : 'Красным отмечены неверные пропуски.'} />}
    </div>
  );
}

function FindLine({ step, onSolved, onMistake, solved }: StepProps<'findline'>) {
  const [chosen, setChosen] = useState<number | null>(solved ? step.answer : null);
  const [result, setResult] = useState<boolean | null>(solved ? true : null);
  const lines = step.code.split('\n');
  return (
    <div className="findline">
      <Markdown md={step.prompt} className="question" />
      <pre className="code-block selectable-lines">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`sel-line ${chosen === i + 1 ? (result === false ? 'wrong' : result ? 'right' : 'chosen') : ''}`}
            onClick={() => {
              if (result) return;
              setChosen(i + 1);
              const ok = i + 1 === step.answer;
              setResult(ok);
              if (ok) onSolved();
              else onMistake(`Строка ${i + 1}`);
            }}
          >
            <span className="ln">{i + 1}</span>
            {l || ' '}
          </div>
        ))}
      </pre>
      {result !== null && <Feedback ok={result} text={result ? step.explain : 'Это не та строка. Попробуй другую.'} />}
    </div>
  );
}

export function StepView(props: StepProps) {
  const { step } = props;
  switch (step.kind) {
    case 'theory':
      return (
        <div className="theory">
          {step.title && <h2>{step.title}</h2>}
          <Markdown md={step.md} />
        </div>
      );
    case 'animation':
      return (
        <div>
          <h2>🎬 {step.title}</h2>
          <Animation spec={step.anim} />
        </div>
      );
    case 'example':
      return <RunnableExample step={step} />;
    case 'quiz':
      return <Quiz {...(props as StepProps<'quiz'>)} />;
    case 'predict':
      return <Predict {...(props as StepProps<'predict'>)} />;
    case 'order':
      return <Order {...(props as StepProps<'order'>)} />;
    case 'match':
      return <Match {...(props as StepProps<'match'>)} />;
    case 'fill':
      return <Fill {...(props as StepProps<'fill'>)} />;
    case 'findline':
      return <FindLine {...(props as StepProps<'findline'>)} />;
    case 'fixbug':
    case 'code':
      return (
        <div>
          <div className="task-head">{step.kind === 'fixbug' ? '🛠 Исправь ошибку' : '💻 Напиши программу'}</div>
          <Markdown md={step.prompt} className="question" />
          <CodeTask
            key={props.stepKey}
            lang={step.lang}
            initial={step.kind === 'fixbug' ? step.code : step.starter}
            tests={step.tests}
            hints={step.hints}
            solution={step.solution}
            task={step.prompt}
            draftKey={props.stepKey}
            onPass={() => props.onSolved()}
            onFail={(d) => props.onMistake(d)}
          />
          {props.solved && <Feedback ok text="Все тесты пройдены! 🎉" />}
        </div>
      );
  }
}

export const isInteractive = (s: Step) => !['theory', 'animation', 'example'].includes(s.kind);

export const STEP_LABELS: Record<Step['kind'], string> = {
  theory: '📖 Теория',
  animation: '🎬 Анимация',
  example: '🧩 Пример',
  quiz: '🧠 Викторина',
  predict: '🔮 Предскажи вывод',
  order: '🧱 Порядок команд',
  match: '🔗 Сопоставление',
  fill: '⌨ Допиши код',
  findline: '🔍 Найди строку',
  fixbug: '🛠 Исправь баг',
  code: '💻 Напиши код',
};
