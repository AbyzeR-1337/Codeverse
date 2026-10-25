/// <reference lib="webworker" />
// Песочница Python на базе Pyodide (CPython, скомпилированный в WebAssembly).
// Поддерживает запуск, пошаговую трассировку (sys.settrace), тесты, REPL и установку пакетов.
import type { TestCase } from '../content/types';
import { sameResult } from './compare';
import type { TestResult, TraceStep } from './jsWorker';

export const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/';

export type PyRequest =
  | { type: 'init' }
  | { type: 'run'; code: string; stdin: string[] }
  | { type: 'trace'; code: string; stdin: string[]; maxSteps: number }
  | { type: 'test'; code: string; tests: TestCase[] }
  | { type: 'repl'; code: string }
  | { type: 'install'; pkg: string };

export type PyResponse =
  | { type: 'ready'; version: string }
  | { type: 'status'; text: string }
  | { type: 'out'; text: string; stream: 'out' | 'err' | 'warn' | 'info' }
  | { type: 'clear' }
  | { type: 'done'; ok: boolean; error?: string; errorName?: string; errorLine?: number; trace?: TraceStep[]; output?: string; results?: TestResult[]; ms: number };

const post = (m: PyResponse) => (self as unknown as Worker).postMessage(m);

// Минимальный интерфейс Pyodide, который нам нужен.
interface Pyodide {
  version: string;
  runPythonAsync(code: string, opts?: { globals?: unknown }): Promise<unknown>;
  runPython(code: string, opts?: { globals?: unknown }): unknown;
  setStdout(o: { write: (buf: Uint8Array) => number }): void;
  setStderr(o: { write: (buf: Uint8Array) => number }): void;
  loadPackage(names: string | string[], opts?: { messageCallback?: (m: string) => void }): Promise<void>;
  loadPackagesFromImports(code: string, opts?: { messageCallback?: (m: string) => void }): Promise<void>;
  globals: { get(name: string): unknown; set(name: string, v: unknown): void };
  toPy(v: unknown): unknown;
}

let py: Pyodide | null = null;
let loading: Promise<Pyodide> | null = null;
let sink: (text: string, stream: 'out' | 'err') => void = () => {};
const decoder = new TextDecoder();

const HARNESS = String.raw`
import sys, builtins, json, traceback, io

_cv_input_queue = []
_cv_echo = [True]

def _cv_input(prompt=''):
    if prompt and _cv_echo[0]:
        print(prompt, end='')
    if not _cv_input_queue:
        raise EOFError('Программа ждёт ввод (input), но данных нет. Заполни поле «Ввод (stdin)».')
    v = _cv_input_queue.pop(0)
    if _cv_echo[0]:
        print(v)
    return v

builtins.input = _cv_input

def _cv_set_input(lines):
    _cv_input_queue.clear()
    _cv_input_queue.extend(list(lines))

def _cv_error_info(e):
    tb = traceback.extract_tb(e.__traceback__)
    line = None
    for fr in tb:
        if fr.filename == '<main>':
            line = fr.lineno
    if isinstance(e, SyntaxError) and e.filename == '<main>':
        line = e.lineno
    msg = ''.join(traceback.format_exception_only(type(e), e)).strip()
    return {'name': type(e).__name__, 'message': msg, 'line': line}

def _cv_run(src):
    g = {'__name__': '__main__'}
    try:
        code = compile(src, '<main>', 'exec')
        exec(code, g)
        return json.dumps({'ok': True})
    except BaseException as e:
        if isinstance(e, SystemExit):
            return json.dumps({'ok': True})
        info = _cv_error_info(e)
        return json.dumps({'ok': False, **info})

class _CvHeap:
    def __init__(self):
        self.ids = {}
        self.keep = []
    def ref(self, o):
        k = id(o)
        if k not in self.ids:
            self.ids[k] = len(self.ids) + 1
            self.keep.append(o)
        return self.ids[k]

_CV_CONTAINERS = (list, dict, set, tuple)

def _cv_short(v):
    try:
        r = repr(v)
    except Exception:
        r = '<?>'
    return r if len(r) <= 120 else r[:117] + '...'

def _cv_describe(v, heap):
    t = type(v).__name__
    if isinstance(v, _CV_CONTAINERS) or (hasattr(v, '__dict__') and not callable(v) and not isinstance(v, type) and type(v).__module__ != 'builtins' and not t == 'module'):
        return {'type': t, 'text': _cv_short(v), 'ref': heap.ref(v)}
    if callable(v):
        return {'type': 'function', 'text': '<' + t + ' ' + getattr(v, '__name__', '?') + '>'}
    return {'type': t, 'text': _cv_short(v)}

def _cv_heap_snapshot(roots, heap):
    out = {}
    queue = [r for r in roots if isinstance(r, _CV_CONTAINERS) or hasattr(r, '__dict__')]
    guard = 0
    while queue and guard < 40:
        guard += 1
        o = queue.pop(0)
        if callable(o) or type(o).__name__ == 'module':
            continue
        rid = heap.ref(o)
        if rid in out:
            continue
        if isinstance(o, dict):
            items = [(repr(k), v) for k, v in list(o.items())[:30]]
        elif isinstance(o, (list, tuple)):
            items = [(str(i), v) for i, v in enumerate(o[:30])]
        elif isinstance(o, set):
            items = [(str(i), v) for i, v in enumerate(list(o)[:30])]
        else:
            items = [(k, v) for k, v in list(vars(o).items())[:30]]
        out[rid] = {'type': type(o).__name__, 'fields': [[k, _cv_describe(v, heap)] for k, v in items]}
        for _, v in items:
            if isinstance(v, _CV_CONTAINERS) or (hasattr(v, '__dict__') and not callable(v)):
                queue.append(v)
    return out

def _cv_trace(src, max_steps):
    steps = []
    heap = _CvHeap()
    buf = io.StringIO()
    real_stdout = sys.stdout
    g = {'__name__': '__main__'}

    def visible(frame):
        names = {}
        if frame.f_code.co_name != '<module>':
            for k, v in frame.f_locals.items():
                names[k] = v
        for k, v in frame.f_globals.items():
            if k.startswith('__') or type(v).__name__ == 'module':
                continue
            names.setdefault(k, v)
        return names

    def stack_of(frame):
        st = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == '<main>':
                st.append({'name': '<программа>' if f.f_code.co_name == '<module>' else f.f_code.co_name, 'line': f.f_lineno})
            f = f.f_back
        st.reverse()
        return st[1:]

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != '<main>':
            return None
        if event == 'line':
            if len(steps) >= max_steps:
                raise RuntimeError('Превышен лимит шагов (%d). Возможно, бесконечный цикл?' % max_steps)
            names = visible(frame)
            vs = [[k, _cv_describe(v, heap)] for k, v in names.items()]
            steps.append({'line': frame.f_lineno, 'vars': vs, 'stack': stack_of(frame), 'out': len(buf.getvalue().rstrip('\n')), 'heap': _cv_heap_snapshot(list(names.values()), heap)})
        return tracer

    result = {'ok': True}
    sys.stdout = buf
    try:
        code = compile(src, '<main>', 'exec')
        sys.settrace(tracer)
        try:
            exec(code, g)
        finally:
            sys.settrace(None)
    except BaseException as e:
        if not isinstance(e, SystemExit):
            info = _cv_error_info(e)
            if info['line'] is None and steps:
                info['line'] = steps[-1]['line']
            result = {'ok': False, **info}
    finally:
        sys.stdout = real_stdout
    result['trace'] = steps
    result['output'] = buf.getvalue().rstrip('\n')
    return json.dumps(result, ensure_ascii=False)

def _cv_test(src, tests_json):
    tests = json.loads(tests_json)
    results = []
    _cv_echo[0] = False
    for t in tests:
        _cv_set_input(t.get('stdin') or [])
        buf = io.StringIO()
        real = sys.stdout
        sys.stdout = buf
        g = {'__name__': '__main__'}
        res = {'expected': t['expected'], 'name': t.get('name'), 'hidden': t.get('hidden', False)}
        try:
            exec(compile(src, '<main>', 'exec'), g)
            if t.get('expr'):
                val = eval(t['expr'], g)
                try:
                    res['got'] = json.dumps(val, ensure_ascii=False)
                except TypeError:
                    res['got'] = json.dumps(repr(val), ensure_ascii=False)
                res['json'] = True
            else:
                res['got'] = buf.getvalue()
                res['json'] = False
        except BaseException as e:
            info = _cv_error_info(e)
            res['got'] = buf.getvalue()
            res['error'] = info['message']
            res['json'] = bool(t.get('expr'))
        finally:
            sys.stdout = real
        results.append(res)
    _cv_echo[0] = True
    return json.dumps(results, ensure_ascii=False)

_cv_repl_globals = {'__name__': '__main__'}

def _cv_repl(src):
    try:
        try:
            code = compile(src, '<repl>', 'eval')
            val = eval(code, _cv_repl_globals)
            if val is not None:
                print(repr(val))
        except SyntaxError:
            exec(compile(src, '<repl>', 'exec'), _cv_repl_globals)
        return json.dumps({'ok': True})
    except BaseException as e:
        return json.dumps({'ok': False, 'name': type(e).__name__, 'message': ''.join(traceback.format_exception_only(type(e), e)).strip(), 'line': None})
`;

async function ensure(): Promise<Pyodide> {
  if (py) return py;
  if (!loading) {
    loading = (async () => {
      post({ type: 'status', text: 'Загружаю Python (Pyodide, ~10 МБ, только в первый раз)…' });
      const mod = (await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`)) as { loadPyodide: (o: { indexURL: string }) => Promise<Pyodide> };
      const p = await mod.loadPyodide({ indexURL: PYODIDE_URL });
      const write = (stream: 'out' | 'err') => (buf: Uint8Array) => {
        sink(decoder.decode(buf), stream);
        return buf.length;
      };
      p.setStdout({ write: write('out') });
      p.setStderr({ write: write('err') });
      await p.runPythonAsync(HARNESS);
      py = p;
      post({ type: 'ready', version: p.version });
      return p;
    })();
  }
  return loading;
}

/** Автоматически подгружаем пакеты Pyodide (numpy, pandas, bs4...), если код их импортирует. */
async function autoload(p: Pyodide, code: string) {
  try {
    await p.loadPackagesFromImports(code, { messageCallback: (m) => post({ type: 'status', text: m }) });
  } catch {
    /* нет сети или пакета — пусть Python сам выдаст ImportError */
  }
}

function call(p: Pyodide, fn: string, ...args: unknown[]): string {
  const f = p.globals.get(fn) as (...a: unknown[]) => string;
  return f(...args);
}

interface PyResult { ok: boolean; name?: string; message?: string; line?: number | null; trace?: TraceStep[]; output?: string }

self.onmessage = async (ev: MessageEvent<PyRequest>) => {
  const req = ev.data;
  const t0 = performance.now();
  let p: Pyodide;
  try {
    p = await ensure();
  } catch (e) {
    post({ type: 'done', ok: false, error: `Не удалось загрузить Python: ${(e as Error).message}. Проверь подключение к интернету.`, errorName: 'LoadError', ms: 0 });
    return;
  }
  if (req.type === 'init') return;

  // Потоковый вывод: склеиваем куски и отправляем.
  sink = (text, stream) => post({ type: 'out', text: text.replace(/\n$/, ''), stream });

  if (req.type === 'install') {
    try {
      post({ type: 'status', text: `Устанавливаю ${req.pkg}…` });
      try {
        await p.loadPackage(req.pkg, { messageCallback: (m) => post({ type: 'status', text: m }) });
      } catch {
        await p.loadPackage('micropip');
        await p.runPythonAsync(`import micropip\nawait micropip.install(${JSON.stringify(req.pkg)})`);
      }
      post({ type: 'done', ok: true, ms: performance.now() - t0 });
    } catch (e) {
      post({ type: 'done', ok: false, error: (e as Error).message.split('\n').slice(-2).join(' '), ms: performance.now() - t0 });
    }
    return;
  }

  if (req.type === 'run' || req.type === 'repl') {
    await autoload(p, req.code);
    if (req.type === 'run') call(p, '_cv_set_input', p.toPy(req.stdin));
    const r = JSON.parse(call(p, req.type === 'run' ? '_cv_run' : '_cv_repl', req.code)) as PyResult;
    post({ type: 'done', ok: r.ok, error: r.message, errorName: r.name, errorLine: r.line ?? undefined, ms: performance.now() - t0 });
    return;
  }

  if (req.type === 'trace') {
    await autoload(p, req.code);
    call(p, '_cv_set_input', p.toPy(req.stdin));
    sink = () => {};
    const r = JSON.parse(call(p, '_cv_trace', req.code, req.maxSteps)) as PyResult;
    post({ type: 'done', ok: r.ok, error: r.message, errorName: r.name, errorLine: r.line ?? undefined, trace: r.trace, output: r.output, ms: performance.now() - t0 });
    return;
  }

  if (req.type === 'test') {
    await autoload(p, req.code);
    sink = () => {};
    const raw = JSON.parse(call(p, '_cv_test', req.code, JSON.stringify(req.tests))) as (TestResult & { json: boolean })[];
    const results: TestResult[] = raw.map((r) => ({
      ok: !r.error && sameResult(r.got, r.expected, r.json),
      got: r.json ? r.got : r.got.trimEnd(),
      expected: r.expected,
      error: r.error,
      name: r.name ?? undefined,
      hidden: r.hidden,
    }));
    post({ type: 'done', ok: results.every((r) => r.ok), results, ms: performance.now() - t0 });
  }
};
