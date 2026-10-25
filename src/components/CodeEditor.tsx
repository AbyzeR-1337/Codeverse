// Редактор кода на CodeMirror 6: подсветка, автодополнение, подсказки, поиск ошибок,
// форматирование, точки останова и подсветка текущей строки отладчика.
import { useEffect, useRef } from 'react';
import { EditorState, StateEffect, StateField, RangeSet, Compartment, Extension } from '@codemirror/state';
import { EditorView, keymap, Decoration, DecorationSet, gutter, GutterMarker, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, rectangularSelection, highlightSpecialChars } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab, selectAll } from '@codemirror/commands';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap, CompletionContext, CompletionResult, snippetCompletion } from '@codemirror/autocomplete';
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, indentRange, foldKeymap } from '@codemirror/language';
import { linter, lintGutter, Diagnostic, lintKeymap } from '@codemirror/lint';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { python, pythonLanguage } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { checkJsSyntax } from '../runtime/tracer';
import { analyzeCode } from '../ai/explain';
import { useStore } from '../store/progress';

export type EditorLang = 'js' | 'python' | 'html' | 'css' | 'markdown' | 'text';

export function langFromPath(path: string): EditorLang {
  if (/\.(js|mjs|ts)$/.test(path)) return 'js';
  if (/\.py$/.test(path)) return 'python';
  if (/\.html?$/.test(path)) return 'html';
  if (/\.css$/.test(path)) return 'css';
  if (/\.md$/.test(path)) return 'markdown';
  return 'text';
}

// ─── Точки останова ───
const toggleBreakpoint = StateEffect.define<{ pos: number; on: boolean }>();
const setBreakpointsEffect = StateEffect.define<number[]>();
const breakpointMarker = new (class extends GutterMarker {
  toDOM() {
    const el = document.createElement('div');
    el.className = 'cm-bp';
    el.textContent = '●';
    return el;
  }
})();

const breakpointState = StateField.define<RangeSet<GutterMarker>>({
  create: () => RangeSet.empty,
  update(set, tr) {
    set = set.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(toggleBreakpoint)) {
        set = e.value.on ? set.update({ add: [breakpointMarker.range(e.value.pos)] }) : set.update({ filter: (from) => from !== e.value.pos });
      }
      if (e.is(setBreakpointsEffect)) {
        const doc = tr.state.doc;
        set = RangeSet.of(e.value.filter((l) => l >= 1 && l <= doc.lines).map((l) => breakpointMarker.range(doc.line(l).from)), true);
      }
    }
    return set;
  },
});

function breakpointGutter(onChange: (lines: number[]) => void): Extension {
  return [
    breakpointState,
    gutter({
      class: 'cm-breakpoint-gutter',
      markers: (v) => v.state.field(breakpointState),
      initialSpacer: () => breakpointMarker,
      domEventHandlers: {
        mousedown(view, line) {
          const bps = view.state.field(breakpointState);
          let has = false;
          bps.between(line.from, line.from, () => {
            has = true;
          });
          view.dispatch({ effects: toggleBreakpoint.of({ pos: line.from, on: !has }) });
          const lines: number[] = [];
          view.state.field(breakpointState).between(0, view.state.doc.length, (from) => {
            lines.push(view.state.doc.lineAt(from).number);
          });
          onChange(lines);
          return true;
        },
      },
    }),
  ];
}

// ─── Подсветка строки отладчика и строки с ошибкой ───
const setLineMarks = StateEffect.define<{ debug?: number; error?: number }>();
const lineMarks = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setLineMarks)) {
        const doc = tr.state.doc;
        const marks = [];
        if (e.value.error && e.value.error <= doc.lines) marks.push(Decoration.line({ class: 'cm-error-line' }).range(doc.line(e.value.error).from));
        if (e.value.debug && e.value.debug <= doc.lines) marks.push(Decoration.line({ class: 'cm-debug-line' }).range(doc.line(e.value.debug).from));
        deco = Decoration.set(marks.sort((a, b) => a.from - b.from), true);
      }
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// ─── Автодополнение ───
const JS_COMPLETIONS = [
  snippetCompletion('console.log(${})', { label: 'console.log', detail: 'вывести в консоль', type: 'function' }),
  snippetCompletion('for (let ${i} = 0; ${i} < ${n}; ${i}++) {\n\t${}\n}', { label: 'for', detail: 'цикл со счётчиком', type: 'keyword' }),
  snippetCompletion('for (const ${item} of ${items}) {\n\t${}\n}', { label: 'forof', detail: 'перебор элементов', type: 'keyword' }),
  snippetCompletion('function ${name}(${params}) {\n\t${}\n}', { label: 'function', detail: 'объявить функцию', type: 'keyword' }),
  snippetCompletion('const ${name} = (${params}) => {\n\t${}\n};', { label: 'arrow', detail: 'стрелочная функция', type: 'keyword' }),
  snippetCompletion('if (${cond}) {\n\t${}\n}', { label: 'if', detail: 'условие', type: 'keyword' }),
  snippetCompletion('class ${Name} {\n\tconstructor(${}) {\n\t\t\n\t}\n}', { label: 'class', detail: 'класс', type: 'keyword' }),
  ...['Math.floor', 'Math.ceil', 'Math.round', 'Math.random', 'Math.max', 'Math.min', 'Math.abs', 'Math.sqrt', 'Math.pow', 'JSON.stringify', 'JSON.parse', 'Object.keys', 'Object.values', 'Object.entries', 'Array.from', 'Array.isArray', 'Number.parseInt', 'Number.isInteger', 'parseInt', 'parseFloat', 'String', 'Number', 'Boolean', 'setTimeout', 'setInterval', 'Promise.all', 'prompt'].map((l) => ({ label: l, type: 'function' })),
  ...['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'map', 'filter', 'reduce', 'forEach', 'find', 'findIndex', 'includes', 'indexOf', 'join', 'sort', 'reverse', 'some', 'every', 'concat', 'flat', 'split', 'trim', 'toUpperCase', 'toLowerCase', 'replace', 'replaceAll', 'startsWith', 'endsWith', 'padStart', 'repeat', 'charAt', 'at', 'length'].map((l) => ({ label: l, type: 'method', boost: -1 })),
];
const PY_COMPLETIONS = [
  snippetCompletion('print(${})', { label: 'print', detail: 'вывести на экран', type: 'function' }),
  snippetCompletion('for ${i} in range(${n}):\n\t${}', { label: 'for', detail: 'цикл по range', type: 'keyword' }),
  snippetCompletion('def ${name}(${params}):\n\t${pass}', { label: 'def', detail: 'объявить функцию', type: 'keyword' }),
  snippetCompletion('if ${cond}:\n\t${}', { label: 'if', detail: 'условие', type: 'keyword' }),
  snippetCompletion('while ${cond}:\n\t${}', { label: 'while', detail: 'цикл с условием', type: 'keyword' }),
  snippetCompletion('class ${Name}:\n\tdef __init__(self${}):\n\t\t${pass}', { label: 'class', detail: 'класс', type: 'keyword' }),
  snippetCompletion('try:\n\t${}\nexcept ${Exception} as e:\n\t${print(e)}', { label: 'try', detail: 'обработка ошибок', type: 'keyword' }),
  ...['input', 'len', 'range', 'int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple', 'sum', 'min', 'max', 'abs', 'round', 'sorted', 'reversed', 'enumerate', 'zip', 'map', 'filter', 'isinstance', 'type', 'open', 'any', 'all', 'chr', 'ord'].map((l) => ({ label: l, type: 'function' })),
  ...['append', 'extend', 'insert', 'remove', 'pop', 'index', 'count', 'sort', 'reverse', 'keys', 'values', 'items', 'get', 'update', 'split', 'join', 'strip', 'upper', 'lower', 'replace', 'startswith', 'endswith', 'find', 'format', 'isdigit', 'add'].map((l) => ({ label: l, type: 'method', boost: -1 })),
];

function customCompletions(list: typeof JS_COMPLETIONS) {
  return (ctx: CompletionContext): CompletionResult | null => {
    const word = ctx.matchBefore(/[\w.]+/);
    if (!word || (word.from === word.to && !ctx.explicit)) return null;
    const dot = word.text.lastIndexOf('.');
    const isMember = dot >= 0 && !/^(Math|JSON|Object|Array|Number|Promise|console)\./.test(word.text);
    return {
      from: isMember ? word.from + dot + 1 : word.from,
      options: isMember ? list.filter((c) => c.type === 'method') : list,
      validFor: /^[\w.]*$/,
    };
  };
}

function languageExt(lang: EditorLang): Extension {
  switch (lang) {
    case 'js':
      return [javascript(), javascriptLanguage.data.of({ autocomplete: customCompletions(JS_COMPLETIONS) })];
    case 'python':
      return [python(), pythonLanguage.data.of({ autocomplete: customCompletions(PY_COMPLETIONS) })];
    case 'html':
      return html();
    case 'css':
      return css();
    case 'markdown':
      return markdown();
    default:
      return [];
  }
}

function lintExt(lang: EditorLang): Extension {
  if (lang !== 'js' && lang !== 'python') return [];
  return [
    lintGutter(),
    linter(
      (view) => {
        const code = view.state.doc.toString();
        const out: Diagnostic[] = [];
        const lineRange = (n: number) => {
          const l = view.state.doc.line(Math.min(Math.max(1, n), view.state.doc.lines));
          return { from: l.from, to: l.to };
        };
        if (lang === 'js') {
          const err = checkJsSyntax(code);
          if (err) out.push({ ...lineRange(err.line), severity: 'error', message: `Синтаксическая ошибка: ${err.message}` });
        }
        for (const issue of analyzeCode(code, lang)) out.push({ ...lineRange(issue.line), severity: issue.severity, message: issue.message });
        return out;
      },
      { delay: 600 },
    ),
  ];
}

/** «Форматирование»: выравнивание отступов по правилам языка и удаление пробелов в концах строк. */
export function formatView(view: EditorView) {
  const trimmed = view.state.doc.toString().split('\n').map((l) => l.replace(/\s+$/, '').replace(/\t/g, '    ')).join('\n');
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: trimmed } });
  const changes = indentRange(view.state, 0, view.state.doc.length);
  if (!changes.empty) view.dispatch({ changes });
}

export interface CodeEditorProps {
  value: string;
  onChange?: (v: string) => void;
  lang: EditorLang;
  readOnly?: boolean;
  minHeight?: number;
  maxHeight?: number;
  debugLine?: number;
  errorLine?: number;
  breakpoints?: number[];
  onBreakpoints?: (lines: number[]) => void;
  onRun?: () => void;
  onReady?: (view: EditorView) => void;
  lint?: boolean;
}

export function CodeEditor(props: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const cbs = useRef(props);
  cbs.current = props;
  const theme = useStore((s) => s.settings.theme);
  const fontSize = useStore((s) => s.settings.fontSize);
  const themeComp = useRef(new Compartment());
  const langComp = useRef(new Compartment());
  const roComp = useRef(new Compartment());

  useEffect(() => {
    const state = EditorState.create({
      doc: props.value,
      extensions: [
        lineNumbers(),
        props.onBreakpoints ? breakpointGutter((l) => cbs.current.onBreakpoints?.(l)) : [],
        foldGutter(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion({ icons: true }),
        rectangularSelection(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        lineMarks,
        EditorState.tabSize.of(4),
        keymap.of([
          { key: 'Mod-Enter', run: () => (cbs.current.onRun?.(), true) },
          { key: 'Shift-Alt-f', run: (v) => (formatView(v), true) },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap,
          indentWithTab,
          { key: 'Mod-a', run: selectAll },
        ]),
        langComp.current.of([languageExt(props.lang), props.lint === false ? [] : lintExt(props.lang)]),
        themeComp.current.of(theme === 'dark' ? oneDark : syntaxHighlighting(defaultHighlightStyle)),
        roComp.current.of(EditorState.readOnly.of(!!props.readOnly)),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) cbs.current.onChange?.(u.state.doc.toString());
        }),
        EditorView.theme({
          '&': { fontSize: `${fontSize}px`, minHeight: `${props.minHeight ?? 120}px`, maxHeight: props.maxHeight ? `${props.maxHeight}px` : 'none' },
          '.cm-scroller': { fontFamily: 'var(--mono)', overflow: 'auto', minHeight: `${props.minHeight ?? 120}px` },
          '.cm-content': { minHeight: `${props.minHeight ?? 120}px` },
        }),
      ],
    });
    view.current = new EditorView({ state, parent: host.current! });
    cbs.current.onReady?.(view.current);
    return () => view.current?.destroy();
    // Редактор создаётся один раз; дальнейшие изменения применяются через эффекты ниже.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSize]);

  // Внешнее изменение текста (например, «Сбросить код»).
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== props.value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: props.value } });
  }, [props.value]);

  useEffect(() => {
    view.current?.dispatch({ effects: themeComp.current.reconfigure(theme === 'dark' ? oneDark : syntaxHighlighting(defaultHighlightStyle)) });
  }, [theme]);

  useEffect(() => {
    view.current?.dispatch({ effects: langComp.current.reconfigure([languageExt(props.lang), props.lint === false ? [] : lintExt(props.lang)]) });
  }, [props.lang, props.lint]);

  useEffect(() => {
    view.current?.dispatch({ effects: roComp.current.reconfigure(EditorState.readOnly.of(!!props.readOnly)) });
  }, [props.readOnly]);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    v.dispatch({ effects: setLineMarks.of({ debug: props.debugLine, error: props.errorLine }) });
    if (props.debugLine && props.debugLine <= v.state.doc.lines) {
      const pos = v.state.doc.line(props.debugLine).from;
      v.dispatch({ effects: EditorView.scrollIntoView(pos, { y: 'nearest' }) });
    }
  }, [props.debugLine, props.errorLine]);

  useEffect(() => {
    if (props.breakpoints && view.current) view.current.dispatch({ effects: setBreakpointsEffect.of(props.breakpoints) });
    // Применяем только при первом монтировании и смене файла.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.breakpoints?.join(',')]);

  return <div className="code-editor" ref={host} />;
}
