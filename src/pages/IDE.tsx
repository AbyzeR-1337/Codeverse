// Встроенная IDE: проводник виртуальной ФС, вкладки, редактор, запуск JS/Python, предпросмотр сайтов,
// пошаговая отладка с точками останова, панель проблем, история изменений, логи и ИИ-помощник.
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { EditorView } from '@codemirror/view';
import * as fs from '../runtime/vfs';
import { CodeEditor, formatView, langFromPath } from '../components/CodeEditor';
import { Output, OutLine } from '../components/Output';
import { Debugger, DebugSession } from '../components/Debugger';
import { AiAssistant } from '../components/AiAssistant';
import { runCode, traceCode } from '../runtime/runner';
import { buildPreview } from '../runtime/preview';
import { analyzeCode, explainError } from '../ai/explain';
import { bump } from '../store/actions';
import { toast } from '../store/progress';
import { useRoute } from '../router';

const HISTORY_KEY = 'codeverse.history.v1';
type Snapshot = { at: number; content: string; reason: string };

function loadHistory(): Record<string, Snapshot[]> {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '{}');
  } catch {
    return {};
  }
}
function pushHistory(path: string, content: string, reason: string) {
  const h = loadHistory();
  const list = h[path] ?? [];
  if (list[0]?.content === content) return;
  h[path] = [{ at: Date.now(), content, reason }, ...list].slice(0, 30);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {
    /* ignore */
  }
}

function useVfsVersion() {
  const ver = useRef(0);
  return useSyncExternalStore(
    (cb) =>
      fs.subscribeVfs(() => {
        ver.current++;
        cb();
      }),
    () => ver.current,
  );
}

function FileTree({ dir, depth, openPath, onOpen, expanded, toggle }: { dir: string; depth: number; openPath: string | null; onOpen: (p: string) => void; expanded: Set<string>; toggle: (p: string) => void }) {
  const items = fs.isDir(dir) ? fs.readdir(dir).filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules') : [];
  return (
    <>
      {items.map((it) => {
        const full = `${dir === '/' ? '' : dir}/${it.name}`;
        const open = expanded.has(full);
        return (
          <div key={full}>
            <button className={`tree-item ${openPath === full ? 'active' : ''}`} style={{ paddingLeft: 8 + depth * 14 }} onClick={() => (it.dir ? toggle(full) : onOpen(full))} title={full}>
              <span className="tree-icon">{it.dir ? (open ? '📂' : '📁') : fileIcon(it.name)}</span>
              {it.name}
            </button>
            {it.dir && open && <FileTree dir={full} depth={depth + 1} openPath={openPath} onOpen={onOpen} expanded={expanded} toggle={toggle} />}
          </div>
        );
      })}
    </>
  );
}

function fileIcon(name: string) {
  if (name.endsWith('.py')) return '🐍';
  if (name.endsWith('.js')) return '🟨';
  if (name.endsWith('.html')) return '🌐';
  if (name.endsWith('.css')) return '🎨';
  if (name.endsWith('.json')) return '🧾';
  if (name.endsWith('.md')) return '📝';
  return '📄';
}

export function IDE() {
  const { query } = useRoute();
  useVfsVersion();
  const [tabs, setTabs] = useState<string[]>(() => {
    const q = query.get('file');
    return q && fs.exists(q) ? [q] : [`${fs.HOME}/hello.py`].filter(fs.exists);
  });
  const [active, setActive] = useState<string | null>(tabs[0] ?? null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([`${fs.HOME}/projects`, `${fs.HOME}/projects/site`]));
  const [out, setOut] = useState<OutLine[]>([]);
  const [panel, setPanel] = useState<'output' | 'debug' | 'problems' | 'preview' | 'history' | 'logs'>('output');
  const [running, setRunning] = useState(false);
  const [stdin, setStdin] = useState('Алиса\n25');
  const [showStdin, setShowStdin] = useState(false);
  const [debug, setDebug] = useState<DebugSession | null>(null);
  const [breakpoints, setBreakpoints] = useState<Record<string, number[]>>({});
  const [errorLine, setErrorLine] = useState<number>();
  const [lastError, setLastError] = useState<string>();
  const [showAi, setShowAi] = useState(false);
  const [showTree, setShowTree] = useState(() => window.innerWidth > 800);
  const [previewDoc, setPreviewDoc] = useState('');
  const [logs, setLogs] = useState<{ at: number; file: string; ok: boolean; ms: number }[]>([]);
  const [status, setStatus] = useState('');
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    const q = query.get('file');
    if (q && fs.exists(q) && !fs.isDir(q)) {
      setTabs((t) => (t.includes(q) ? t : [...t, q]));
      setActive(q);
    }
  }, [query]);

  // Сообщения console.* из предпросмотра сайта.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.__cv) setOut((o) => [...o, { text: String(e.data.text), stream: e.data.stream === 'error' ? 'err' : e.data.stream === 'warn' ? 'warn' : 'out' }]);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const content = active && fs.exists(active) && !fs.isDir(active) ? fs.readFile(active) : '';
  const lang = active ? langFromPath(active) : 'text';
  const issues = useMemo(() => (lang === 'js' || lang === 'python' ? analyzeCode(content, lang) : []), [content, lang]);

  const open = (p: string) => {
    setTabs((t) => (t.includes(p) ? t : [...t, p]));
    setActive(p);
    setDebug(null);
    setErrorLine(undefined);
    if (window.innerWidth <= 800) setShowTree(false);
  };
  const close = (p: string) => {
    const rest = tabs.filter((t) => t !== p);
    setTabs(rest);
    if (active === p) setActive(rest.at(-1) ?? null);
  };
  const toggle = (p: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });

  const onChange = useCallback(
    (v: string) => {
      if (active) fs.writeFile(active, v);
    },
    [active],
  );

  const htmlRoot = useMemo(() => {
    if (!active) return null;
    if (lang === 'html') return active;
    const dir = fs.dirname(active);
    return (lang === 'css' || lang === 'js') && fs.exists(`${dir}/index.html`) ? `${dir}/index.html` : null;
  }, [active, lang]);

  const run = async () => {
    if (!active) return;
    pushHistory(active, content, 'запуск');
    setDebug(null);
    setErrorLine(undefined);
    if (htmlRoot) {
      const dir = fs.dirname(htmlRoot);
      setOut([{ text: `🌐 Предпросмотр ${htmlRoot.slice(fs.HOME.length + 1)}`, stream: 'info' }]);
      setPreviewDoc(buildPreview(fs.readFile(htmlRoot), fs.walk(dir)) + `<!-- ${Date.now()} -->`);
      setPanel('preview');
      bump('code_runs');
      return;
    }
    if (lang !== 'js' && lang !== 'python') {
      toast('Этот тип файла нельзя запустить. Запускаются .py, .js и .html', 'bad');
      return;
    }
    setRunning(true);
    setPanel('output');
    const lines: OutLine[] = [{ text: `▶ ${active.split('/').pop()}`, stream: 'cmd' }];
    setOut([...lines]);
    const res = await runCode(lang, content, stdin ? stdin.split('\n') : [], {
      onOut: (text, stream) => {
        lines.push({ text, stream });
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
      const ex = explainError(`${res.errorName}: ${res.error}`, lang);
      lines.push({ text: `🤖 ${ex.title}. ${ex.simple}`, stream: 'info' });
      setErrorLine(res.errorLine);
      setLastError(`${res.errorName}: ${res.error}`);
    } else {
      setLastError(undefined);
      lines.push({ text: `✓ Завершено за ${Math.round(res.ms)} мс`, stream: 'info' });
    }
    setOut([...lines]);
    setLogs((l) => [{ at: Date.now(), file: active, ok: res.ok, ms: res.ms }, ...l].slice(0, 50));
    setRunning(false);
  };

  const startDebug = async () => {
    if (!active || (lang !== 'js' && lang !== 'python')) return;
    setRunning(true);
    const res = await traceCode(lang, content, stdin ? stdin.split('\n') : [], 5000, { onStatus: setStatus });
    setStatus('');
    setRunning(false);
    bump('debug_sessions');
    const bps = breakpoints[active] ?? [];
    const first = res.trace?.findIndex((t) => bps.includes(t.line)) ?? -1;
    setDebug({ result: res, step: first >= 0 ? first : 0 });
    setPanel('debug');
  };

  const newFile = (dirMode = false) => {
    const base = active ? fs.dirname(active) : fs.HOME;
    const name = prompt(dirMode ? 'Имя новой папки:' : 'Имя нового файла (например, game.py, app.js, index.html):', dirMode ? 'new-folder' : 'main.py');
    if (!name) return;
    const path = fs.resolvePath(name, base);
    try {
      if (dirMode) {
        fs.mkdir(path, true);
        setExpanded((s) => new Set([...s, path]));
      } else {
        if (!fs.exists(fs.dirname(path))) fs.mkdir(fs.dirname(path), true);
        if (!fs.exists(path)) fs.writeFile(path, templateFor(path));
        open(path);
      }
    } catch (e) {
      toast((e as Error).message, 'bad');
    }
  };
  const renameFile = () => {
    if (!active) return;
    const name = prompt('Новое имя:', active.split('/').pop());
    if (!name) return;
    const target = fs.resolvePath(name, fs.dirname(active));
    try {
      fs.move(active, target);
      setTabs((t) => t.map((x) => (x === active ? target : x)));
      setActive(target);
    } catch (e) {
      toast((e as Error).message, 'bad');
    }
  };
  const deleteFile = () => {
    if (!active || !confirm(`Удалить ${active.split('/').pop()}?`)) return;
    fs.rm(active);
    close(active);
  };

  const history = active ? (loadHistory()[active] ?? []) : [];
  const debugLine = debug ? debug.result.trace?.[debug.step]?.line : undefined;

  return (
    <div className={`ide ${showAi ? 'with-ai' : ''} ${showTree ? 'with-tree' : ''}`}>
      {showTree && (
        <aside className="ide-tree">
          <div className="ide-tree-head">
            <b>Проводник</b>
            <span>
              <button className="btn btn-xs" onClick={() => newFile(false)} title="Новый файл">＋📄</button>
              <button className="btn btn-xs" onClick={() => newFile(true)} title="Новая папка">＋📁</button>
            </span>
          </div>
          <div className="muted small tree-root">~ (/home/student)</div>
          <FileTree dir={fs.HOME} depth={0} openPath={active} onOpen={open} expanded={expanded} toggle={toggle} />
        </aside>
      )}
      <section className="ide-main">
        <div className="ide-toolbar">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTree((s) => !s)} title="Проводник">🗂️</button>
          <button className="btn btn-primary btn-sm" onClick={run} disabled={running || !active} title="Ctrl+Enter">
            {htmlRoot ? '🌐 Предпросмотр' : '▶ Запустить'}
          </button>
          <button className="btn btn-sm" onClick={startDebug} disabled={running || !active || !!htmlRoot} title="Пошаговая отладка">🐞 Отладка</button>
          <button className="btn btn-sm btn-ghost" onClick={() => viewRef.current && formatView(viewRef.current)} title="Shift+Alt+F">✨ Формат</button>
          <button className={`btn btn-sm btn-ghost ${showStdin ? 'active' : ''}`} onClick={() => setShowStdin((s) => !s)} title="Ввод для input()/prompt()">⌨ stdin</button>
          <button className="btn btn-sm btn-ghost" onClick={() => active && (pushHistory(active, content, 'сохранение'), toast('Снимок сохранён в историю', 'good'))} title="Сохранить снимок">💾</button>
          <button className="btn btn-sm btn-ghost" onClick={renameFile} disabled={!active} title="Переименовать">✏️</button>
          <button className="btn btn-sm btn-ghost" onClick={deleteFile} disabled={!active} title="Удалить файл">🗑️</button>
          <span className="spacer" />
          {status && <span className="muted small status-text">{status}</span>}
          <button className={`btn btn-sm ${showAi ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setShowAi((s) => !s)}>🤖 ИИ</button>
        </div>
        <div className="ide-tabs">
          {tabs.map((t) => (
            <div key={t} className={`ide-tab ${t === active ? 'active' : ''}`}>
              <button onClick={() => setActive(t)}>{fileIcon(t)} {t.split('/').pop()}</button>
              <button className="x" onClick={() => close(t)} aria-label="Закрыть вкладку">×</button>
            </div>
          ))}
        </div>
        {showStdin && (
          <div className="stdin-box">
            <label className="muted small">Ввод программы (stdin) — каждая строка отвечает на один input()/prompt():</label>
            <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={3} spellCheck={false} />
          </div>
        )}
        <div className="ide-editor">
          {active ? (
            <CodeEditor
              key={active}
              value={content}
              onChange={onChange}
              lang={lang}
              minHeight={240}
              onRun={run}
              debugLine={debugLine}
              errorLine={errorLine}
              breakpoints={breakpoints[active] ?? []}
              onBreakpoints={(l) => setBreakpoints((b) => ({ ...b, [active]: l }))}
              onReady={(v) => (viewRef.current = v)}
            />
          ) : (
            <div className="ide-empty">
              <p>Открой файл в проводнике или создай новый.</p>
              <button className="btn btn-primary" onClick={() => newFile(false)}>＋ Новый файл</button>
            </div>
          )}
        </div>
        <div className="ide-panel">
          <div className="tabs tabs-sm">
            {(
              [
                ['output', 'Вывод'],
                ['debug', 'Отладчик'],
                ['problems', `Проблемы${issues.length ? ` (${issues.length})` : ''}`],
                ['preview', 'Предпросмотр'],
                ['history', 'История'],
                ['logs', 'Логи'],
              ] as const
            ).map(([k, label]) => (
              <button key={k} className={`tab ${panel === k ? 'active' : ''}`} onClick={() => setPanel(k)}>
                {label}
              </button>
            ))}
            <span className="spacer" />
            {panel === 'output' && <button className="btn btn-xs btn-ghost" onClick={() => setOut([])}>Очистить</button>}
          </div>
          <div className="ide-panel-body">
            {panel === 'output' && <Output lines={out} placeholder="Нажми ▶ Запустить (Ctrl+Enter). Кликни слева от номера строки, чтобы поставить точку останова." />}
            {panel === 'debug' &&
              (debug ? (
                <Debugger session={debug} breakpoints={breakpoints[active ?? ''] ?? []} onStep={(s) => setDebug((d) => (d ? { ...d, step: s } : d))} onClose={() => { setDebug(null); setPanel('output'); }} />
              ) : (
                <div className="muted pad">Нажми «🐞 Отладка», чтобы выполнить программу по шагам. Поставь точки останова кликом по полю слева от номеров строк.</div>
              ))}
            {panel === 'problems' && (
              <div className="pad">
                {issues.length === 0 ? (
                  <div className="muted">Проблем не найдено ✨</div>
                ) : (
                  issues.map((i, k) => (
                    <div key={k} className={`issue issue-${i.severity}`}>
                      <b>Строка {i.line}:</b> {i.message}
                    </div>
                  ))
                )}
              </div>
            )}
            {panel === 'preview' &&
              (previewDoc ? (
                <iframe className="preview-frame" title="Предпросмотр" sandbox="allow-scripts allow-modals allow-forms" srcDoc={previewDoc} />
              ) : (
                <div className="muted pad">Открой .html файл (или .js/.css рядом с index.html) и нажми «🌐 Предпросмотр».</div>
              ))}
            {panel === 'history' && (
              <div className="pad">
                {history.length === 0 && <div className="muted">Снимки появятся после запусков и сохранений (💾).</div>}
                {history.map((h, k) => (
                  <div key={k} className="history-row">
                    <span>{new Date(h.at).toLocaleString('ru-RU')}</span>
                    <span className="muted small">{h.reason} · {h.content.split('\n').length} строк</span>
                    <button className="btn btn-xs" onClick={() => active && (pushHistory(active, content, 'перед восстановлением'), fs.writeFile(active, h.content))}>Восстановить</button>
                  </div>
                ))}
              </div>
            )}
            {panel === 'logs' && (
              <div className="pad">
                {logs.length === 0 && <div className="muted">Журнал запусков пуст.</div>}
                {logs.map((l, k) => (
                  <div key={k} className="history-row">
                    <span>{l.ok ? '✅' : '❌'} {new Date(l.at).toLocaleTimeString('ru-RU')}</span>
                    <span>{l.file.split('/').pop()}</span>
                    <span className="muted small">{Math.round(l.ms)} мс</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      {showAi && active && (lang === 'js' || lang === 'python') && (
        <aside className="ide-ai">
          <AiAssistant ctx={{ lang, code: content, lastError, stdin: stdin.split('\n') }} />
        </aside>
      )}
      {showAi && active && lang !== 'js' && lang !== 'python' && (
        <aside className="ide-ai pad muted">ИИ-помощник работает с файлами .py и .js.</aside>
      )}
    </div>
  );
}

function templateFor(path: string) {
  if (path.endsWith('.py')) return '# Новая программа на Python\n\ndef main():\n    print("Привет!")\n\n\nmain()\n';
  if (path.endsWith('.js')) return '// Новая программа на JavaScript\n\nfunction main() {\n  console.log("Привет!");\n}\n\nmain();\n';
  if (path.endsWith('.html')) return '<!doctype html>\n<html lang="ru">\n<head>\n  <meta charset="utf-8">\n  <title>Страница</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Новая страница</h1>\n  <script src="script.js"></script>\n</body>\n</html>\n';
  if (path.endsWith('.css')) return 'body {\n  font-family: system-ui, sans-serif;\n}\n';
  return '';
}
