// Инструментирование JavaScript для пошагового отладчика.
// Перед каждой инструкцией вставляется вызов __t(строка, {геттеры переменных}),
// а тело каждой функции оборачивается в __enter/__exit для дерева вызовов.
// Выполнение записывает «трассу», которую отладчик потом проигрывает вперёд и назад.
import { parse } from 'acorn';

type Node = { type: string; start: number; end: number; loc?: { start: { line: number; column: number } }; [k: string]: unknown };

interface Insert {
  pos: number;
  text: string;
  seq: number;
}

const SKIP_NAMES = new Set(['arguments', 'eval', 'undefined']);

function patternNames(p: Node | null | undefined, out: string[]) {
  if (!p) return;
  switch (p.type) {
    case 'Identifier':
      out.push(p.name as string);
      break;
    case 'ObjectPattern':
      for (const prop of p.properties as Node[]) patternNames((prop.type === 'RestElement' ? prop.argument : prop.value) as Node, out);
      break;
    case 'ArrayPattern':
      for (const el of p.elements as (Node | null)[]) patternNames(el, out);
      break;
    case 'RestElement':
      patternNames(p.argument as Node, out);
      break;
    case 'AssignmentPattern':
      patternNames(p.left as Node, out);
      break;
  }
}

const isFunction = (n: Node) => n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression';

/** var-объявления внутри функции (не заходя во вложенные функции). */
function collectVars(n: Node, out: string[]) {
  if (n.type === 'VariableDeclaration' && n.kind === 'var') for (const d of n.declarations as Node[]) patternNames(d.id as Node, out);
  for (const key of Object.keys(n)) {
    if (key === 'loc') continue;
    const v = n[key];
    if (Array.isArray(v)) {
      for (const c of v) if (c && typeof c === 'object' && 'type' in c && !isFunction(c as Node)) collectVars(c as Node, out);
    } else if (v && typeof v === 'object' && 'type' in (v as object) && !isFunction(v as Node)) {
      collectVars(v as Node, out);
    }
  }
}

function lexicalNames(stmts: Node[], out: string[]) {
  for (const s of stmts) {
    if (s.type === 'VariableDeclaration' && s.kind !== 'var') for (const d of s.declarations as Node[]) patternNames(d.id as Node, out);
    if ((s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') && s.id) out.push((s.id as Node).name as string);
  }
}

export interface InstrumentResult {
  code: string;
}

export function instrument(source: string): InstrumentResult {
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'script', locations: true, allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true }) as unknown as Node;
  const inserts: Insert[] = [];
  let seq = 0;
  const add = (pos: number, text: string) => inserts.push({ pos, text, seq: seq++ });
  const scopes: string[][] = [];

  const visible = () => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (let i = scopes.length - 1; i >= 0; i--) {
      for (const n of scopes[i]) {
        if (!seen.has(n) && !SKIP_NAMES.has(n) && !n.startsWith('__')) {
          seen.add(n);
          names.push(n);
        }
      }
    }
    return names;
  };
  const traceCall = (line: number) => `__t(${line},{${visible().map((n) => `get ${n}(){return ${n}}`).join(',')}});`;

  const lineOf = (n: Node) => n.loc!.start.line;

  function instrumentList(stmts: Node[]) {
    for (const s of stmts) {
      if (s.type !== 'EmptyStatement' && s.type !== 'FunctionDeclaration') add(s.start, traceCall(lineOf(s)));
      walk(s);
    }
  }

  /** Тело цикла/if без фигурных скобок: оборачиваем в блок, чтобы вставить трассировку. */
  function wrapSingle(s: Node | null | undefined) {
    if (!s) return;
    if (s.type === 'BlockStatement') {
      walk(s);
      return;
    }
    add(s.start, '{' + traceCall(lineOf(s)));
    walk(s);
    add(s.end, '}');
  }

  function fnName(n: Node, parent?: Node): string {
    if (n.id) return (n.id as Node).name as string;
    if (parent?.type === 'VariableDeclarator' && (parent.id as Node).type === 'Identifier') return (parent.id as Node).name as string;
    if ((parent?.type === 'MethodDefinition' || parent?.type === 'Property') && (parent.key as Node).type === 'Identifier') return (parent.key as Node).name as string;
    return '(анонимная)';
  }

  function walkFunction(n: Node, parent?: Node) {
    const names: string[] = [];
    for (const p of n.params as Node[]) patternNames(p, names);
    const body = n.body as Node;
    const label = JSON.stringify(fnName(n, parent));
    if (body.type === 'BlockStatement') {
      collectVars(body, names);
      lexicalNames(body.body as Node[], names);
      scopes.push(names);
      add(body.start + 1, `__enter(${label},${lineOf(n)});try{`);
      instrumentList(body.body as Node[]);
      add(body.end - 1, `}finally{__exit()}`);
      scopes.pop();
    } else {
      scopes.push(names);
      add(body.start, `{__enter(${label},${lineOf(n)});try{${traceCall(lineOf(body))}return (`);
      walk(body);
      add(body.end, `)}finally{__exit()}}`);
      scopes.pop();
    }
  }

  function walk(n: Node | null | undefined, parent?: Node) {
    if (!n || typeof n !== 'object') return;
    switch (n.type) {
      case 'Program': {
        const names: string[] = [];
        collectVars(n, names);
        lexicalNames(n.body as Node[], names);
        scopes.push(names);
        instrumentList(n.body as Node[]);
        scopes.pop();
        return;
      }
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        walkFunction(n, parent);
        return;
      case 'BlockStatement': {
        const names: string[] = [];
        lexicalNames(n.body as Node[], names);
        scopes.push(names);
        instrumentList(n.body as Node[]);
        scopes.pop();
        return;
      }
      case 'SwitchCase':
        if (n.test) walk(n.test as Node, n);
        instrumentList(n.consequent as Node[]);
        return;
      case 'IfStatement':
        walk(n.test as Node, n);
        wrapSingle(n.consequent as Node);
        wrapSingle(n.alternate as Node | null);
        return;
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement': {
        const names: string[] = [];
        const init = (n.init ?? n.left) as Node | null;
        if (init?.type === 'VariableDeclaration' && init.kind !== 'var') for (const d of init.declarations as Node[]) patternNames(d.id as Node, names);
        scopes.push(names);
        for (const k of ['init', 'test', 'update', 'left', 'right']) if (n[k]) walk(n[k] as Node, n);
        wrapSingle(n.body as Node);
        scopes.pop();
        return;
      }
      case 'WhileStatement':
      case 'DoWhileStatement':
        walk(n.test as Node, n);
        wrapSingle(n.body as Node);
        return;
      case 'CatchClause': {
        const names: string[] = [];
        patternNames(n.param as Node | null, names);
        scopes.push(names);
        walk(n.body as Node, n);
        scopes.pop();
        return;
      }
    }
    for (const key of Object.keys(n)) {
      if (key === 'loc') continue;
      const v = n[key];
      if (Array.isArray(v)) v.forEach((c) => c && typeof c === 'object' && 'type' in c && walk(c as Node, n));
      else if (v && typeof v === 'object' && 'type' in (v as object)) walk(v as Node, n);
    }
  }

  walk(ast);
  // Применяем вставки с конца, чтобы позиции не сдвигались. При равной позиции раньше вставленное должно оказаться левее.
  inserts.sort((a, b) => b.pos - a.pos || b.seq - a.seq);
  let code = source;
  for (const ins of inserts) code = code.slice(0, ins.pos) + ins.text + code.slice(ins.pos);
  return { code };
}

/** Проверка синтаксиса JS для подсветки ошибок в редакторе. */
export function checkJsSyntax(source: string): { line: number; col: number; message: string } | null {
  try {
    parse(source, { ecmaVersion: 'latest', sourceType: 'script', allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true });
    return null;
  } catch (e) {
    const err = e as { loc?: { line: number; column: number }; message: string };
    return { line: err.loc?.line ?? 1, col: err.loc?.column ?? 0, message: err.message.replace(/\s*\(\d+:\d+\)$/, '') };
  }
}
