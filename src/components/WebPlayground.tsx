// Мини-IDE для веб-проектов: вкладки HTML/CSS/JS, живой предпросмотр и консоль страницы.
import { useEffect, useRef, useState } from 'react';
import { CodeEditor, langFromPath } from './CodeEditor';
import { buildPreview } from '../runtime/preview';
import { Output, OutLine } from './Output';
import * as fs from '../runtime/vfs';
import { toast } from '../store/progress';
import { bump } from '../store/actions';

export function WebPlayground({ initial, storageKey }: { initial: Record<string, string>; storageKey: string }) {
  const [files, setFiles] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`codeverse.web.${storageKey}`);
      if (saved) return { ...initial, ...JSON.parse(saved) };
    } catch {
      /* ignore */
    }
    return initial;
  });
  const names = Object.keys(files);
  const [active, setActive] = useState(names.find((n) => n.endsWith('.js')) ?? names[0]);
  const [doc, setDoc] = useState('');
  const [logs, setLogs] = useState<OutLine[]>([]);
  const frameKey = useRef(0);

  const run = () => {
    setLogs([]);
    frameKey.current++;
    setDoc(buildPreview(files['index.html'] ?? '', files));
    bump('code_runs');
  };

  useEffect(() => {
    run();
    const onMsg = (e: MessageEvent) => {
      if (e.data?.__cv) setLogs((l) => [...l.slice(-100), { text: String(e.data.text), stream: e.data.stream === 'error' ? 'err' : e.data.stream === 'warn' ? 'warn' : 'out' }]);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
    // Первый запуск при монтировании.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(`codeverse.web.${storageKey}`, JSON.stringify(files));
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [files, storageKey]);

  const exportToIde = () => {
    const dir = `${fs.HOME}/projects/${storageKey.replace(/[^\w-]/g, '-')}`;
    fs.mkdir(dir, true);
    for (const [n, c] of Object.entries(files)) fs.writeFile(`${dir}/${n}`, c);
    toast(`Проект сохранён в ${dir.replace(fs.HOME, '~')} — открой его в IDE`, 'good');
  };

  return (
    <div className="web-playground">
      <div className="wp-editor">
        <div className="ide-tabs">
          {names.map((n) => (
            <div key={n} className={`ide-tab ${n === active ? 'active' : ''}`}>
              <button onClick={() => setActive(n)}>{n}</button>
            </div>
          ))}
          <span className="spacer" />
          <button className="btn btn-xs" onClick={() => { setFiles(initial); toast('Код сброшен к исходному'); }}>↺</button>
          <button className="btn btn-xs" onClick={exportToIde} title="Сохранить в файлы IDE">📁 В IDE</button>
          <button className="btn btn-xs btn-primary" onClick={run}>▶ Обновить</button>
        </div>
        <CodeEditor key={active} value={files[active]} lang={langFromPath(active)} onChange={(v) => setFiles((f) => ({ ...f, [active]: v }))} onRun={run} minHeight={320} maxHeight={520} lint={false} />
      </div>
      <div className="wp-preview">
        <iframe key={frameKey.current} title="Предпросмотр проекта" sandbox="allow-scripts allow-modals allow-forms" srcDoc={doc} />
        <Output lines={logs} placeholder="console.log страницы появится здесь" className="wp-console" />
      </div>
    </div>
  );
}
