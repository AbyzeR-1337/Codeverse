// Пошаговый отладчик с «машиной времени»: шаги вперёд/назад, точки останова,
// просмотр переменных, памяти (кучи объектов), дерева вызовов и вывода на каждом шаге.
import { useEffect, useMemo, useState } from 'react';
import type { RunResult, TraceStep } from '../runtime/runner';
import type { DbgValue } from '../runtime/inspect';

export interface DebugSession {
  result: RunResult;
  step: number;
}

function Val({ v }: { v: DbgValue }) {
  return (
    <span className={`dbg-val dbg-${v.type}`} title={v.type}>
      {v.ref ? <span className="dbg-ref">@{v.ref}</span> : null} {v.text}
    </span>
  );
}

export function Debugger({ session, breakpoints, onStep, onClose }: { session: DebugSession; breakpoints: number[]; onStep: (i: number) => void; onClose: () => void }) {
  const trace = session.result.trace ?? [];
  const i = session.step;
  const cur: TraceStep | undefined = trace[i];
  const prev: TraceStep | undefined = trace[i - 1];
  const [tab, setTab] = useState<'vars' | 'memory' | 'stack' | 'out'>('vars');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (i >= trace.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => onStep(i + 1), 450);
    return () => clearTimeout(t);
  }, [playing, i, trace.length, onStep]);

  const changed = useMemo(() => {
    const set = new Set<string>();
    if (!cur) return set;
    const before = new Map(prev?.vars.map(([k, v]) => [k, v.text]) ?? []);
    for (const [k, v] of cur.vars) if (before.get(k) !== v.text) set.add(k);
    return set;
  }, [cur, prev]);

  const output = (session.result.output ?? '').slice(0, cur ? cur.out : undefined);

  const goBreakpoint = (dir: 1 | -1) => {
    for (let j = i + dir; j >= 0 && j < trace.length; j += dir) {
      if (breakpoints.includes(trace[j].line)) return onStep(j);
    }
    onStep(dir === 1 ? trace.length - 1 : 0);
  };

  if (!trace.length) {
    return (
      <div className="debugger">
        <div className="dbg-head">
          <b>🐞 Отладчик</b>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="dbg-empty">{session.result.error ? `Ошибка до первого шага: ${session.result.error}` : 'Нет шагов для отображения.'}</div>
      </div>
    );
  }

  const isLast = i === trace.length - 1;

  return (
    <div className="debugger">
      <div className="dbg-head">
        <b>🐞 Отладчик</b>
        <span className="muted">
          шаг {i + 1} / {trace.length} · строка {cur?.line}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Закрыть отладчик">✕</button>
      </div>
      <div className="dbg-controls">
        <button className="btn btn-sm" onClick={() => onStep(0)} title="В начало">⏮</button>
        <button className="btn btn-sm" onClick={() => goBreakpoint(-1)} title="Предыдущая точка останова">⏪</button>
        <button className="btn btn-sm" onClick={() => onStep(Math.max(0, i - 1))} title="Шаг назад">◀</button>
        <button className="btn btn-sm btn-primary" onClick={() => setPlaying((p) => !p)} title="Авто">{playing ? '⏸' : '▶'}</button>
        <button className="btn btn-sm" onClick={() => onStep(Math.min(trace.length - 1, i + 1))} title="Шаг вперёд">▶|</button>
        <button className="btn btn-sm" onClick={() => goBreakpoint(1)} title="До следующей точки останова">⏩</button>
        <button className="btn btn-sm" onClick={() => onStep(trace.length - 1)} title="В конец">⏭</button>
      </div>
      <input className="dbg-slider" type="range" min={0} max={trace.length - 1} value={i} onChange={(e) => onStep(Number(e.target.value))} aria-label="Шаг выполнения" />
      {isLast && session.result.error && (
        <div className="dbg-error">
          ⛔ {session.result.errorName}: {session.result.error}
        </div>
      )}
      <div className="tabs tabs-sm">
        {(
          [
            ['vars', 'Переменные'],
            ['memory', 'Память'],
            ['stack', 'Вызовы'],
            ['out', 'Вывод'],
          ] as const
        ).map(([k, label]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="dbg-body">
        {tab === 'vars' && (
          <table className="dbg-table">
            <tbody>
              {cur!.vars.length === 0 && (
                <tr>
                  <td className="muted">Переменных пока нет</td>
                </tr>
              )}
              {cur!.vars.map(([k, v]) => (
                <tr key={k} className={changed.has(k) ? 'dbg-changed' : ''}>
                  <td className="dbg-name">{k}</td>
                  <td>
                    <Val v={v} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'memory' && (
          <div className="dbg-memory">
            <p className="muted small">Стек хранит имена переменных. Объекты и списки живут в «куче» — переменная хранит лишь ссылку (@номер). Две переменные с одной ссылкой указывают на один и тот же объект.</p>
            <div className="mem-cols">
              <div>
                <div className="mem-title">Стек (переменные)</div>
                {cur!.vars.map(([k, v]) => (
                  <div key={k} className="mem-cell">
                    <span>{k}</span>
                    <span className={v.ref ? 'dbg-ref' : ''}>{v.ref ? `→ @${v.ref}` : v.text}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="mem-title">Куча (объекты)</div>
                {Object.entries(cur!.heap).length === 0 && <div className="muted small">пусто</div>}
                {Object.entries(cur!.heap).map(([id, obj]) => (
                  <div key={id} className="mem-obj">
                    <div className="mem-obj-head">
                      <span className="dbg-ref">@{id}</span> {obj.type}
                    </div>
                    {obj.fields.map(([k, v]) => (
                      <div key={k} className="mem-cell">
                        <span>{k}</span>
                        <span className={v.ref ? 'dbg-ref' : ''}>{v.ref ? `→ @${v.ref}` : v.text}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'stack' && (
          <div className="dbg-stack">
            <div className="stack-frame stack-root">📄 Программа (глобальный код)</div>
            {cur!.stack.map((f, k) => (
              <div key={k} className="stack-frame" style={{ marginLeft: (k + 1) * 14 }}>
                ↳ <b>{f.name}()</b> <span className="muted">вызвана, строка {f.line}</span>
              </div>
            ))}
            <p className="muted small">Каждый вызов функции кладёт новый «кадр» на стек. Когда функция возвращает результат, кадр снимается.</p>
          </div>
        )}
        {tab === 'out' && <pre className="dbg-out">{output || <span className="muted">Пока ничего не выведено</span>}</pre>}
      </div>
    </div>
  );
}
