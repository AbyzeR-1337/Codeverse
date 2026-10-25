/// <reference lib="webworker" />
// Песочница для JavaScript: код ученика выполняется в отдельном воркере без доступа к странице.
// Главный поток убивает воркер по таймауту — так бесконечный цикл не повесит приложение.
import { HeapTracker, inspect, DbgValue } from './inspect';
import { instrument } from './tracer';
import type { TestCase } from '../content/types';
import { sameResult } from './compare';

export type JsRequest =
  | { type: 'run'; code: string; stdin: string[] }
  | { type: 'trace'; code: string; stdin: string[]; maxSteps: number }
  | { type: 'test'; code: string; tests: TestCase[] }
  | { type: 'repl'; code: string };

export interface TraceStep {
  line: number;
  vars: [string, DbgValue][];
  stack: { name: string; line: number }[];
  out: number;
  heap: Record<number, { type: string; fields: [string, DbgValue][] }>;
}

export type JsResponse =
  | { type: 'out'; text: string; stream: 'out' | 'err' | 'warn' | 'info' }
  | { type: 'clear' }
  | { type: 'done'; ok: boolean; error?: string; errorName?: string; errorLine?: number; trace?: TraceStep[]; output?: string; results?: TestResult[]; ms: number };

export interface TestResult {
  ok: boolean;
  got: string;
  expected: string;
  error?: string;
  name?: string;
  hidden?: boolean;
}

const post = (m: JsResponse) => (self as unknown as Worker).postMessage(m);
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (...args: string[]) => (...a: unknown[]) => Promise<unknown>;

const fmt = (args: unknown[]) => args.map((a) => inspect(a)).join(' ');

function makeConsole(sink: (text: string, stream: 'out' | 'err' | 'warn' | 'info') => void) {
  const counts: Record<string, number> = {};
  const timers: Record<string, number> = {};
  return {
    log: (...a: unknown[]) => sink(fmt(a), 'out'),
    info: (...a: unknown[]) => sink(fmt(a), 'info'),
    debug: (...a: unknown[]) => sink(fmt(a), 'info'),
    warn: (...a: unknown[]) => sink(fmt(a), 'warn'),
    error: (...a: unknown[]) => sink(fmt(a), 'err'),
    table: (data: unknown) => {
      if (data && typeof data === 'object') {
        const rows = Object.entries(data as object);
        sink(['(индекс) | значение', ...rows.map(([k, v]) => `${k} | ${inspect(v, 1)}`)].join('\n'), 'out');
      } else sink(inspect(data), 'out');
    },
    count: (label = 'default') => sink(`${label}: ${(counts[label] = (counts[label] ?? 0) + 1)}`, 'out'),
    time: (label = 'default') => void (timers[label] = performance.now()),
    timeEnd: (label = 'default') => sink(`${label}: ${(performance.now() - (timers[label] ?? 0)).toFixed(3)} мс`, 'out'),
    assert: (cond: unknown, ...a: unknown[]) => !cond && sink('Assertion failed: ' + fmt(a), 'err'),
    clear: () => post({ type: 'clear' }),
    group: (...a: unknown[]) => a.length && sink(fmt(a), 'out'),
    groupEnd: () => {},
  };
}

/** Таймеры с подсчётом, чтобы дождаться завершения асинхронного кода. */
function makeTimers() {
  let pending = 0;
  let resolveIdle: (() => void) | null = null;
  const handles = new Map<number, 'timeout' | 'interval'>();
  const check = () => {
    if (pending === 0 && resolveIdle) resolveIdle();
  };
  return {
    api: {
      setTimeout: (fn: () => void, ms = 0, ...args: unknown[]) => {
        pending++;
        const h = setTimeout(() => {
          handles.delete(h as unknown as number);
          pending--;
          try {
            (fn as (...a: unknown[]) => void)(...args);
          } finally {
            check();
          }
        }, ms) as unknown as number;
        handles.set(h, 'timeout');
        return h;
      },
      clearTimeout: (h: number) => {
        if (handles.delete(h)) {
          clearTimeout(h);
          pending--;
          check();
        }
      },
      setInterval: (fn: () => void, ms = 0, ...args: unknown[]) => {
        pending++;
        const h = setInterval(() => (fn as (...a: unknown[]) => void)(...args), Math.max(ms, 4)) as unknown as number;
        handles.set(h, 'interval');
        return h;
      },
      clearInterval: (h: number) => {
        if (handles.delete(h)) {
          clearInterval(h);
          pending--;
          check();
        }
      },
    },
    idle: () => (pending === 0 ? Promise.resolve() : new Promise<void>((r) => (resolveIdle = r))),
  };
}

function errorLine(e: unknown, offset = 2): number | undefined {
  const stack = (e as Error)?.stack ?? '';
  const m = stack.match(/<anonymous>:(\d+):(\d+)/) ?? stack.match(/Function:(\d+):(\d+)/);
  return m ? Math.max(1, Number(m[1]) - offset) : undefined;
}

async function execute(code: string, stdin: string[], extra: Record<string, unknown>, sink: (t: string, s: 'out' | 'err' | 'warn' | 'info') => void) {
  const input = [...stdin];
  const timers = makeTimers();
  const consoleObj = makeConsole(sink);
  const prompt = (msg?: string) => {
    if (msg) sink(String(msg), 'info');
    const v = input.shift();
    return v === undefined ? null : v;
  };
  const scope: Record<string, unknown> = {
    console: consoleObj,
    prompt,
    alert: (m: unknown) => sink(String(m), 'info'),
    ...timers.api,
    ...extra,
  };
  const names = Object.keys(scope);
  const fn = new AsyncFunction(...names, code);
  const result = await fn(...names.map((n) => scope[n]));
  await timers.idle();
  return result;
}

self.onmessage = async (ev: MessageEvent<JsRequest>) => {
  const req = ev.data;
  const t0 = performance.now();

  if (req.type === 'run' || req.type === 'repl') {
    try {
      const result = await execute(req.code, req.type === 'run' ? req.stdin : [], {}, (text, stream) => post({ type: 'out', text, stream }));
      if (req.type === 'repl' && result !== undefined) post({ type: 'out', text: inspect(result, 1), stream: 'info' });
      post({ type: 'done', ok: true, ms: performance.now() - t0 });
    } catch (e) {
      const err = e as Error;
      post({ type: 'done', ok: false, error: err?.message ?? String(e), errorName: err?.name, errorLine: errorLine(e), ms: performance.now() - t0 });
    }
    return;
  }

  if (req.type === 'trace') {
    const trace: TraceStep[] = [];
    const out: string[] = [];
    const stack: { name: string; line: number }[] = [];
    const heap = new HeapTracker();
    let instrumented: string;
    try {
      instrumented = instrument(req.code).code;
    } catch (e) {
      const err = e as { loc?: { line: number }; message: string };
      post({ type: 'done', ok: false, error: err.message, errorName: 'SyntaxError', errorLine: err.loc?.line, ms: 0, trace: [] });
      return;
    }
    const snapshotHeap = (vars: [string, DbgValue][], raw: unknown[]) => {
      const h: TraceStep['heap'] = {};
      const queue = raw.filter((v) => v !== null && typeof v === 'object');
      let guard = 0;
      while (queue.length && guard++ < 40) {
        const o = queue.shift() as object;
        const id = heap.idOf(o);
        if (h[id]) continue;
        const entries: [string, unknown][] = o instanceof Map ? [...o].map(([k, v]) => [inspect(k), v]) : o instanceof Set ? [...o].map((v, i) => [String(i), v]) : Object.entries(o).slice(0, 30);
        h[id] = { type: Array.isArray(o) ? 'Array' : (o.constructor?.name ?? 'Object'), fields: entries.map(([k, v]) => [k, heap.describe(v)]) };
        for (const [, v] of entries) if (v !== null && typeof v === 'object') queue.push(v);
      }
      void vars;
      return h;
    };
    const api = {
      __t: (line: number, getters: Record<string, unknown>) => {
        if (trace.length >= req.maxSteps) throw new RangeError(`Превышен лимит шагов (${req.maxSteps}). Возможно, бесконечный цикл?`);
        const vars: [string, DbgValue][] = [];
        const raw: unknown[] = [];
        for (const key of Object.keys(getters)) {
          try {
            const v = getters[key];
            vars.push([key, heap.describe(v)]);
            raw.push(v);
          } catch {
            /* переменная в «мёртвой зоне» (ещё не объявлена через let/const) */
          }
        }
        trace.push({ line, vars, stack: stack.map((s) => ({ ...s })), out: out.join('\n').length, heap: snapshotHeap(vars, raw) });
      },
      __enter: (name: string, line: number) => {
        stack.push({ name, line });
        if (stack.length > 200) throw new RangeError('Слишком глубокая рекурсия (более 200 вызовов)');
      },
      __exit: () => void stack.pop(),
    };
    try {
      await execute(instrumented, req.stdin, api, (text) => out.push(text));
      post({ type: 'done', ok: true, trace, output: out.join('\n'), ms: performance.now() - t0 });
    } catch (e) {
      const err = e as Error;
      post({ type: 'done', ok: false, error: err?.message ?? String(e), errorName: err?.name, errorLine: trace.at(-1)?.line, trace, output: out.join('\n'), ms: performance.now() - t0 });
    }
    return;
  }

  if (req.type === 'test') {
    const results: TestResult[] = [];
    for (const t of req.tests) {
      const out: string[] = [];
      try {
        const body = t.expr ? `${req.code}\n;return (${t.expr});` : req.code;
        const value = await execute(body, t.stdin ?? [], {}, (text, stream) => stream !== 'info' && out.push(text));
        const got = t.expr ? (value === undefined ? 'undefined' : JSON.stringify(value)) : out.join('\n').trimEnd();
        results.push({ ok: sameResult(got, t.expected, !!t.expr), got, expected: t.expected, name: t.name, hidden: t.hidden });
      } catch (e) {
        results.push({ ok: false, got: out.join('\n'), expected: t.expected, error: `${(e as Error)?.name ?? 'Error'}: ${(e as Error)?.message ?? e}`, name: t.name, hidden: t.hidden });
      }
    }
    post({ type: 'done', ok: results.every((r) => r.ok), results, ms: performance.now() - t0 });
  }
};
