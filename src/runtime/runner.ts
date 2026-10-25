// Единый интерфейс запуска кода для всего приложения: run / trace / test / repl на JS и Python.
// Следит за таймаутами: зависший воркер уничтожается и создаётся заново.
import type { Lang, TestCase } from '../content/types';
import type { JsRequest, JsResponse, TestResult, TraceStep } from './jsWorker';
import type { PyRequest, PyResponse } from './pyWorker';
import { track } from '../store/actions';

export type { TestResult, TraceStep };
export type OutStream = 'out' | 'err' | 'warn' | 'info';

export interface RunResult {
  ok: boolean;
  error?: string;
  errorName?: string;
  errorLine?: number;
  trace?: TraceStep[];
  output?: string;
  results?: TestResult[];
  ms: number;
  timedOut?: boolean;
}

export interface RunHandlers {
  onOut?: (text: string, stream: OutStream) => void;
  onClear?: () => void;
  onStatus?: (text: string) => void;
}

type AnyResponse = JsResponse | PyResponse;

class Sandbox<Req> {
  private worker: Worker | null = null;
  private busy: Promise<unknown> = Promise.resolve();
  constructor(private factory: () => Worker, private persistent: boolean) {}

  private get(): Worker {
    if (!this.worker) this.worker = this.factory();
    return this.worker;
  }

  kill() {
    this.worker?.terminate();
    this.worker = null;
  }

  /** Запросы выполняются по очереди. timeout = 0 — без ограничения. */
  request(req: Req, handlers: RunHandlers, timeout: number): Promise<RunResult> {
    const job = this.busy.then(
      () =>
        new Promise<RunResult>((resolve) => {
          const w = this.get();
          let timer: ReturnType<typeof setTimeout> | undefined;
          let started = false;
          const armTimer = () => {
            if (timeout > 0 && !started) {
              started = true;
              timer = setTimeout(() => {
                cleanup();
                this.kill();
                resolve({
                  ok: false,
                  timedOut: true,
                  errorName: 'TimeoutError',
                  error: `Программа работает дольше ${timeout / 1000} с и была остановлена. Похоже на бесконечный цикл — проверь условие выхода.`,
                  ms: timeout,
                });
              }, timeout);
            }
          };
          const onMsg = (ev: MessageEvent<AnyResponse>) => {
            const m = ev.data;
            if (m.type === 'out') handlers.onOut?.(m.text, m.stream);
            else if (m.type === 'clear') handlers.onClear?.();
            else if (m.type === 'status') handlers.onStatus?.(m.text);
            else if (m.type === 'ready') armTimer();
            else if (m.type === 'done') {
              cleanup();
              if (!this.persistent) this.kill();
              resolve(m);
            }
          };
          const onErr = (ev: ErrorEvent) => {
            cleanup();
            this.kill();
            resolve({ ok: false, error: ev.message || 'Сбой песочницы', errorName: 'WorkerError', ms: 0 });
          };
          const cleanup = () => {
            clearTimeout(timer);
            w.removeEventListener('message', onMsg as EventListener);
            w.removeEventListener('error', onErr);
          };
          w.addEventListener('message', onMsg as EventListener);
          w.addEventListener('error', onErr);
          w.postMessage(req);
          // Для JS таймер стартует сразу; для Python — после загрузки интерпретатора (сообщение ready) или сразу, если он уже готов.
          if (!this.persistent || pyReady) armTimer();
        }),
    );
    this.busy = job.catch(() => {});
    return job;
  }
}

let pyReady = false;
let pyVersion = '';

const jsSandbox = new Sandbox<JsRequest>(() => new Worker(new URL('./jsWorker.ts', import.meta.url), { type: 'module' }), false);
const jsRepl = new Sandbox<JsRequest>(() => new Worker(new URL('./jsWorker.ts', import.meta.url), { type: 'module' }), true);
const pySandbox = new Sandbox<PyRequest>(() => {
  pyReady = false;
  const w = new Worker(new URL('./pyWorker.ts', import.meta.url), { type: 'module' });
  w.addEventListener('message', (ev: MessageEvent<PyResponse>) => {
    if (ev.data.type === 'ready') {
      pyReady = true;
      pyVersion = ev.data.version;
    }
  });
  return w;
}, true);

export const isPythonReady = () => pyReady;
export const pythonVersion = () => pyVersion;

/** Заранее прогреть Python, чтобы первый запуск был быстрым. */
export function warmupPython(handlers: RunHandlers = {}) {
  return pySandbox.request({ type: 'init' }, handlers, 0);
}

const TIMEOUT = 6000;

export function runCode(lang: Lang, code: string, stdin: string[] = [], handlers: RunHandlers = {}): Promise<RunResult> {
  track('code_runs');
  return lang === 'js'
    ? jsSandbox.request({ type: 'run', code, stdin }, handlers, TIMEOUT)
    : pySandbox.request({ type: 'run', code, stdin }, handlers, TIMEOUT);
}

export function traceCode(lang: Lang, code: string, stdin: string[] = [], maxSteps = 3000, handlers: RunHandlers = {}): Promise<RunResult> {
  return lang === 'js'
    ? jsSandbox.request({ type: 'trace', code, stdin, maxSteps }, handlers, TIMEOUT * 2)
    : pySandbox.request({ type: 'trace', code, stdin, maxSteps }, handlers, TIMEOUT * 2);
}

export function testCode(lang: Lang, code: string, tests: TestCase[], handlers: RunHandlers = {}): Promise<RunResult> {
  track('code_runs');
  return lang === 'js'
    ? jsSandbox.request({ type: 'test', code, tests }, handlers, TIMEOUT)
    : pySandbox.request({ type: 'test', code, tests }, handlers, TIMEOUT);
}

export function replEval(lang: Lang, code: string, handlers: RunHandlers = {}): Promise<RunResult> {
  return lang === 'js' ? jsRepl.request({ type: 'repl', code }, handlers, TIMEOUT) : pySandbox.request({ type: 'repl', code }, handlers, TIMEOUT);
}

export function resetRepl(lang: Lang) {
  if (lang === 'js') jsRepl.kill();
  else pySandbox.kill();
}

export function installPythonPackage(pkg: string, handlers: RunHandlers = {}) {
  return pySandbox.request({ type: 'install', pkg }, handlers, 0);
}

/** Тесты для задачи из задачника: строим вызовы функции на нужном языке. */
export function problemTests(lang: Lang, fnName: string, cases: { args: unknown[]; expected: unknown; hidden?: boolean }[]): TestCase[] {
  return cases.map((c, i) => {
    const args = c.args.map((a) => (lang === 'js' ? JSON.stringify(a) : pyLiteral(a))).join(', ');
    return { expr: `${fnName}(${args})`, expected: JSON.stringify(c.expected), hidden: c.hidden, name: `Тест ${i + 1}` };
  });
}

export function pyLiteral(v: unknown): string {
  if (v === null) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (Array.isArray(v)) return `[${v.map(pyLiteral).join(', ')}]`;
  if (typeof v === 'object') return `{${Object.entries(v as object).map(([k, x]) => `${JSON.stringify(k)}: ${pyLiteral(x)}`).join(', ')}}`;
  return JSON.stringify(v);
}
