// Панель вывода программы с поддержкой ANSI-цветов и типов потоков (stdout/stderr/info).
import { useEffect, useRef } from 'react';

export interface OutLine {
  text: string;
  stream: 'out' | 'err' | 'warn' | 'info' | 'cmd';
}

const COLORS: Record<string, string> = { '31': 'ansi-red', '32': 'ansi-green', '33': 'ansi-yellow', '34': 'ansi-blue', '35': 'ansi-magenta', '36': 'ansi-cyan', '1': 'ansi-bold', '2': 'ansi-dim' };

export function ansiToHtml(text: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let out = '';
  let open = 0;
  const parts = text.split(/\x1b\[(\d+(?:;\d+)*)m/);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) out += esc(parts[i]);
    else {
      for (const code of parts[i].split(';')) {
        if (code === '0') {
          out += '</span>'.repeat(open);
          open = 0;
        } else if (COLORS[code]) {
          out += `<span class="${COLORS[code]}">`;
          open++;
        }
      }
    }
  }
  return out + '</span>'.repeat(open);
}

export function Output({ lines, placeholder = 'Здесь появится вывод программы', className = '', html = false }: { lines: OutLine[]; placeholder?: string; className?: string; html?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);
  return (
    <div className={`output ${className}`} ref={ref} role="log" aria-live="polite">
      {lines.length === 0 && <div className="output-placeholder">{placeholder}</div>}
      {lines.map((l, i) =>
        html || l.text.includes('\x1b[') ? (
          <div key={i} className={`out-line out-${l.stream}`} dangerouslySetInnerHTML={{ __html: ansiToHtml(l.text) }} />
        ) : (
          <div key={i} className={`out-line out-${l.stream}`}>
            {l.text}
          </div>
        ),
      )}
    </div>
  );
}
