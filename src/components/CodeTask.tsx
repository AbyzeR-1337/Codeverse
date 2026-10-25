// Задание с написанием кода: редактор, запуск, проверка тестами, постепенные подсказки,
// пошаговая отладка, ИИ-помощник и показ решения после нескольких попыток.
import { useCallback, useEffect, useState } from 'react';
import type { Lang, TestCase } from '../content/types';
import { CodeEditor } from './CodeEditor';
import { Output, OutLine } from './Output';
import { Debugger, DebugSession } from './Debugger';
import { AiAssistant } from './AiAssistant';
import { runCode, testCode, traceCode, TestResult } from '../runtime/runner';
import { explainError } from '../ai/explain';
import { bump } from '../store/actions';
import { Markdown } from './Markdown';

export interface CodeTaskProps {
  lang: Lang;
  initial: string;
  tests: TestCase[];
  hints?: string[];
  solution?: string;
  task?: string;
  onPass?: (attempts: number, usedHints: number, code: string) => void;
  onFail?: (detail: string) => void;
  minHeight?: number;
  /** Ключ для сохранения черновика. */
  draftKey?: string;
}

function loadDraft(key?: string) {
  if (!key) return null;
  try {
    return localStorage.getItem(`codeverse.draft.${key}`);
  } catch {
    return null;
  }
}

export function CodeTask(props: CodeTaskProps) {
  const [code, setCode] = useState(() => loadDraft(props.draftKey) ?? props.initial);
  const [out, setOut] = useState<OutLine[]>([]);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [errorLine, setErrorLine] = useState<number>();
  const [lastError, setLastError] = useState<string>();
  const [passed, setPassed] = useState(false);
  const [debug, setDebug] = useState<DebugSession | null>(null);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [showAi, setShowAi] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [status, setStatus] = useState('');
  const stdin = props.tests.find((t) => t.stdin)?.stdin ?? [];

  useEffect(() => {
    if (!props.draftKey) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(`codeverse.draft.${props.draftKey}`, code);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [code, props.draftKey]);

  const run = useCallback(async () => {
    setRunning(true);
    setOut([]);
    setErrorLine(undefined);
    setDebug(null);
    const lines: OutLine[] = [];
    const res = await runCode(props.lang, code, stdin, {
      onOut: (text, stream) => {
        lines.push({ text, stream: stream === 'info' ? 'info' : stream });
        setOut([...lines]);
      },
      onStatus: setStatus,
      onClear: () => {
        lines.length = 0;
        setOut([]);
      },
    });
    setStatus('');
    if (!res.ok) {
      lines.push({ text: `${res.errorName ?? 'Ошибка'}${res.errorLine ? ` (строка ${res.errorLine})` : ''}: ${res.error}`, stream: 'err' });
      setOut([...lines]);
      setErrorLine(res.errorLine);
      setLastError(`${res.errorName}: ${res.error}`);
    } else {
      setLastError(undefined);
      lines.push({ text: `✓ Готово за ${Math.round(res.ms)} мс`, stream: 'info' });
      setOut([...lines]);
    }
    setRunning(false);
  }, [code, props.lang, stdin]);

  const check = async () => {
    setRunning(true);
    setResults(null);
    setDebug(null);
    const res = await testCode(props.lang, code, props.tests, { onStatus: setStatus });
    setStatus('');
    setRunning(false);
    const n = attempts + 1;
    setAttempts(n);
    if (res.timedOut) {
      setResults([{ ok: false, got: '', expected: '', error: res.error }]);
      setLastError(res.error);
      props.onFail?.('timeout');
      return;
    }
    setResults(res.results ?? []);
    if (res.ok) {
      setPassed(true);
      props.onPass?.(n, hintsShown, code);
    } else {
      const firstErr = res.results?.find((r) => r.error)?.error;
      if (firstErr) setLastError(firstErr);
      props.onFail?.(firstErr ?? 'wrong answer');
    }
  };

  const startDebug = async () => {
    setRunning(true);
    const res = await traceCode(props.lang, code, stdin, 3000, { onStatus: setStatus });
    setStatus('');
    setRunning(false);
    bump('debug_sessions');
    const firstBp = res.trace?.findIndex((t) => breakpoints.includes(t.line)) ?? -1;
    setDebug({ result: res, step: firstBp >= 0 ? firstBp : 0 });
  };

  const explanation = lastError ? explainError(lastError, props.lang) : null;
  const hints = props.hints ?? [];

  return (
    <div className="code-task">
      <div className="code-task-main">
        <div className="editor-wrap">
          <CodeEditor
            value={code}
            onChange={setCode}
            lang={props.lang}
            minHeight={props.minHeight ?? 160}
            onRun={run}
            errorLine={errorLine}
            debugLine={debug ? debug.result.trace?.[debug.step]?.line : undefined}
            breakpoints={breakpoints}
            onBreakpoints={setBreakpoints}
          />
        </div>
        <div className="toolbar">
          <button className="btn" onClick={run} disabled={running} title="Ctrl+Enter">▶ Запустить</button>
          <button className="btn btn-primary" onClick={check} disabled={running || passed}>{passed ? '✓ Решено' : '✔ Проверить'}</button>
          <button className="btn btn-ghost" onClick={startDebug} disabled={running} title="Пошаговая отладка">🐞 По шагам</button>
          {hints.length > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                setHintsShown((h) => Math.min(hints.length, h + 1));
                bump('hints');
              }}
              disabled={hintsShown >= hints.length}
            >
              💡 Подсказка {hintsShown}/{hints.length}
            </button>
          )}
          <button className={`btn btn-ghost ${showAi ? 'active' : ''}`} onClick={() => setShowAi((s) => !s)}>🤖 Помощник</button>
          <button className="btn btn-ghost" onClick={() => { setCode(props.initial); setResults(null); setOut([]); }} title="Вернуть исходный код">↺</button>
          {status && <span className="muted small status-text">{status}</span>}
        </div>
        {stdin.length > 0 && <div className="muted small">Ввод для программы (stdin): {stdin.map((s) => <code key={s}>{s}</code>)}</div>}
        {hintsShown > 0 && (
          <div className="hints">
            {hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="hint">
                💡 <Markdown md={h} />
              </div>
            ))}
          </div>
        )}
        {debug && <Debugger session={debug} breakpoints={breakpoints} onStep={(s) => setDebug((d) => (d ? { ...d, step: s } : d))} onClose={() => setDebug(null)} />}
        {!debug && out.length > 0 && <Output lines={out} />}
        {results && (
          <div className="test-results">
            {results.map((r, i) => (
              <div key={i} className={`test-row ${r.ok ? 'ok' : 'fail'}`}>
                <span>{r.ok ? '✅' : '❌'}</span>
                <span className="test-name">{r.name ?? `Тест ${i + 1}`}</span>
                {!r.ok && !r.hidden && (
                  <span className="test-detail">
                    {r.error ? (
                      <code>{r.error}</code>
                    ) : (
                      <>
                        ожидалось <code>{r.expected || '(пусто)'}</code>, получено <code>{r.got || '(пусто)'}</code>
                      </>
                    )}
                  </span>
                )}
                {!r.ok && r.hidden && <span className="test-detail muted">скрытый тест</span>}
              </div>
            ))}
          </div>
        )}
        {explanation && !passed && (
          <div className="explain-box">
            <b>🤖 {explanation.title}</b>
            <p>{explanation.simple}</p>
            <ul>
              {explanation.fix.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}
        {props.solution && attempts >= 3 && !passed && (
          <div>
            {!showSolution ? (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSolution(true)}>👀 Показать решение (после 3 попыток)</button>
            ) : (
              <div className="solution">
                <div className="muted small">Разбери решение, а затем напиши его сам, не подглядывая:</div>
                <CodeEditor value={props.solution} lang={props.lang} readOnly minHeight={60} lint={false} />
              </div>
            )}
          </div>
        )}
      </div>
      {showAi && (
        <AiAssistant ctx={{ lang: props.lang, code, task: props.task, lastError, hints, stdin }} compact />
      )}
    </div>
  );
}
