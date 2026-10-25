// Лёгкий рендер Markdown для теории уроков и справочника + статическая подсветка кода.
import { memo } from 'react';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const KW: Record<string, string[]> = {
  js: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'class', 'new', 'this', 'extends', 'super', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'switch', 'case', 'true', 'false', 'null', 'undefined', 'yield', 'static', 'get', 'set'],
  python: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'class', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'lambda', 'yield', 'pass', 'in', 'not', 'and', 'or', 'is', 'True', 'False', 'None', 'global', 'nonlocal', 'async', 'await', 'self'],
};

/** Подсветка синтаксиса регулярными выражениями — для статических примеров без тяжёлого редактора. */
export function highlight(code: string, lang = 'js'): string {
  const l = lang === 'py' ? 'python' : lang;
  if (l !== 'js' && l !== 'python' && l !== 'ts') return esc(code);
  const kw = KW[l === 'ts' ? 'js' : l];
  const comment = l === 'python' ? '#[^\\n]*' : '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/';
  const re = new RegExp(`(${comment})|("""[\\s\\S]*?"""|f?"(?:\\\\.|[^"\\\\\\n])*"|f?'(?:\\\\.|[^'\\\\\\n])*'|\`(?:\\\\.|[^\`\\\\])*\`)|(\\b\\d+(?:\\.\\d+)?\\b)|\\b(${kw.join('|')})\\b|([A-Za-z_$][\\w$]*)(?=\\s*\\()`, 'g');
  let out = '';
  let last = 0;
  for (const m of code.matchAll(re)) {
    out += esc(code.slice(last, m.index));
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'n' : m[4] ? 'k' : 'f';
    out += `<span class="tk-${cls}">${esc(m[0])}</span>`;
    last = m.index! + m[0].length;
  }
  return out + esc(code.slice(last));
}

function inline(s: string): string {
  const codes: string[] = [];
  let t = s.replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  t = esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w])_(.+?)_(?=[^\w]|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((#[^)]+|https?:\/\/[^)]+)\)/g, (_, text: string, href: string) => `<a href="${href}"${href.startsWith('http') ? ' target="_blank" rel="noreferrer"' : ''}>${text}</a>`)
    .replace(/==(.+?)==/g, '<mark>$1</mark>');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i: string) => `<code>${esc(codes[Number(i)])}</code>`);
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r/g, '').split('\n');
  const html: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim() || 'text';
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      html.push(`<pre class="code-block" data-lang="${esc(lang)}"><code>${highlight(buf.join('\n'), lang)}</code></pre>`);
      continue;
    }
    if (/^#{1,4}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      html.push(`<h${level + 1}>${inline(line.replace(/^#+\s/, ''))}</h${level + 1}>`);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      const text = buf.join(' ');
      const kind = /^(💡|✅)/.test(text) ? 'tip' : /^(⚠️|❗)/.test(text) ? 'warn' : /^(🧠|📌)/.test(text) ? 'note' : 'note';
      html.push(`<div class="callout callout-${kind}">${inline(text)}</div>`);
      continue;
    }
    if (/^\|/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        if (!/^\|[\s:-]+\|/.test(lines[i]) || /[a-zа-я0-9]/i.test(lines[i])) rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()));
        i++;
      }
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^\s*[-*]\s/.test(line) || /^\s*\d+\.\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const buf: string[] = [];
      while (i < lines.length && (/^\s*[-*]\s/.test(lines[i]) || /^\s*\d+\.\s/.test(lines[i]))) buf.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s/, ''));
      html.push(`<${ordered ? 'ol' : 'ul'}>${buf.map((b) => `<li>${inline(b)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|>|\||\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) buf.push(lines[i++]);
    html.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return html.join('\n');
}

export const Markdown = memo(function Markdown({ md, className = '' }: { md: string; className?: string }) {
  return <div className={`md ${className}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />;
});

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <pre className="code-block" data-lang={lang}>
      <code dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} />
    </pre>
  );
}
