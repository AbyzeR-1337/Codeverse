// Виртуальный терминал: строка ввода, история (↑/↓), автодополнение (Tab), ANSI-цвета.
import { useEffect, useMemo, useRef, useState, KeyboardEvent } from 'react';
import { Shell } from '../runtime/shell';
import { ansiToHtml, OutLine } from './Output';
import { navigate } from '../router';

const BANNER = `\x1b[36m\x1b[1m
  ╔═╗┌─┐┌┬┐┌─┐╦  ╦┌─┐┬─┐┌─┐┌─┐
  ║  │ │ ││├┤ ╚╗╔╝├┤ ├┬┘└─┐├┤
  ╚═╝└─┘─┴┘└─┘ ╚╝ └─┘┴└─└─┘└─┘\x1b[0m
  Виртуальная консоль. Безопасная песочница — экспериментируй смело!
  Введи \x1b[1mhelp\x1b[0m, чтобы увидеть команды. Начни с: \x1b[33mls\x1b[0m, \x1b[33mcat README.md\x1b[0m, \x1b[33mpython hello.py\x1b[0m
`;

export function Terminal({ height = 480, initialCommands = [] }: { height?: number; initialCommands?: string[] }) {
  const [lines, setLines] = useState<OutLine[]>([{ text: BANNER, stream: 'info' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);
  const histIdx = useRef<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shell = useMemo(
    () =>
      new Shell({
        write: (text, stream = 'out') => setLines((ls) => [...ls, { text, stream }]),
        clear: () => setLines([]),
        openInIde: (path) => navigate(`/ide?file=${encodeURIComponent(path)}`),
      }),
    [],
  );

  useEffect(() => {
    (async () => {
      for (const c of initialCommands) {
        setLines((ls) => [...ls, { text: shell.prompt + c, stream: 'cmd' }]);
        await shell.exec(c);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const submit = async () => {
    const cmd = input;
    setInput('');
    histIdx.current = null;
    setLines((ls) => [...ls, { text: shell.prompt + cmd, stream: 'cmd' }]);
    setBusy(true);
    try {
      await shell.exec(cmd);
    } finally {
      setBusy(false);
      force((x) => x + 1);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!busy) void submit();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const h = shell.history;
      if (!h.length) return;
      let idx = histIdx.current ?? h.length;
      idx = e.key === 'ArrowUp' ? Math.max(0, idx - 1) : Math.min(h.length, idx + 1);
      histIdx.current = idx;
      setInput(h[idx] ?? '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const opts = shell.completions(input);
      if (opts.length === 1) {
        const head = input.endsWith(' ') ? input : input.slice(0, input.length - (input.split(/\s+/).at(-1)?.length ?? 0));
        setInput(head + opts[0] + (opts[0].endsWith('/') ? '' : ' '));
      } else if (opts.length > 1) {
        setLines((ls) => [...ls, { text: shell.prompt + input, stream: 'cmd' }, { text: opts.join('   '), stream: 'info' }]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'c' && e.ctrlKey && !window.getSelection()?.toString()) {
      setLines((ls) => [...ls, { text: shell.prompt + input + '^C', stream: 'cmd' }]);
      setInput('');
    }
  };

  return (
    <div className="terminal" style={{ height }} onClick={() => !window.getSelection()?.toString() && inputRef.current?.focus()}>
      <div className="terminal-scroll" ref={scroller}>
        {lines.map((l, i) => (
          <div key={i} className={`term-line out-${l.stream}`} dangerouslySetInnerHTML={{ __html: ansiToHtml(l.text) }} />
        ))}
        <div className="term-input-row">
          <span dangerouslySetInnerHTML={{ __html: ansiToHtml(busy ? '' : shell.prompt) }} />
          <input
            ref={inputRef}
            className="term-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Командная строка"
            disabled={busy}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
