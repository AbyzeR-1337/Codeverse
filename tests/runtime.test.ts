// Тесты движка: инструментирование для отладчика, Git, командная оболочка, сравнение результатов.
import { describe, expect, it } from 'vitest';
import { instrument, checkJsSyntax } from '../src/runtime/tracer';
import { git, lineDiff } from '../src/runtime/git';
import * as fs from '../src/runtime/vfs';
import { Shell, tokenize } from '../src/runtime/shell';
import { sameResult } from '../src/runtime/compare';
import { analyzeCode, explainError } from '../src/ai/explain';

type Step = { line: number; vars: Record<string, unknown>; stack: string[] };

function trace(src: string) {
  const steps: Step[] = [];
  const stack: string[] = [];
  const api = {
    __t: (line: number, g: Record<string, unknown>) => {
      const vars: Record<string, unknown> = {};
      for (const k of Object.keys(g)) {
        try {
          vars[k] = structuredClone(g[k]);
        } catch {
          /* TDZ или функция */
        }
      }
      steps.push({ line, vars, stack: [...stack] });
    },
    __enter: (n: string) => stack.push(n),
    __exit: () => stack.pop(),
  };
  new Function(...Object.keys(api), instrument(src).code)(...Object.values(api));
  return steps;
}

describe('трассировщик JS', () => {
  it('записывает строки и значения переменных', () => {
    const steps = trace('let s = 0;\nfor (let i = 1; i <= 3; i++) {\n  s += i;\n}\nconst done = s;');
    expect(steps.map((s) => s.line)).toEqual([1, 2, 3, 3, 3, 5]);
    expect(steps.at(-1)!.vars.s).toBe(6);
    expect(steps[3].vars.i).toBe(2);
  });
  it('строит стек вызовов, включая рекурсию и стрелочные функции', () => {
    const steps = trace('function f(n) {\n  if (n === 0) return 0;\n  return f(n - 1);\n}\nconst g = (x) => x * 2;\nf(2);\ng(3);');
    expect(Math.max(...steps.map((s) => s.stack.length))).toBe(3);
    expect(steps.some((s) => s.stack.includes('g'))).toBe(true);
  });
  it('обрабатывает тела без фигурных скобок и else if', () => {
    const steps = trace('let r = "";\nfor (let i = 0; i < 2; i++) r += i;\nif (r === "01") r = "ok"; else if (r) r = "no"; else r = "?";');
    expect(steps.at(-1)!.vars.r).toBe('01');
  });
  it('находит синтаксические ошибки с номером строки', () => {
    expect(checkJsSyntax('let a = 1;\nlet b = ;')?.line).toBe(2);
    expect(checkJsSyntax('const ok = 1;')).toBeNull();
  });
});

describe('виртуальная ФС и Git', () => {
  const dir = `${fs.HOME}/gittest`;
  it('проходит полный цикл: init → add → commit → branch → merge → конфликт', () => {
    if (fs.exists(dir)) fs.rm(dir, true);
    fs.mkdir(dir);
    expect(git(['init'], dir)).toContain('Инициализирован');
    fs.writeFile(`${dir}/a.txt`, 'один');
    expect(git(['status'], dir)).toContain('a.txt');
    git(['add', '.'], dir);
    expect(git(['commit', '-m', 'первый'], dir)).toContain('первый');
    expect(git(['status'], dir)).toContain('чистое');
    git(['checkout', '-b', 'feature'], dir);
    fs.writeFile(`${dir}/b.txt`, 'новый файл');
    git(['add', '.'], dir);
    git(['commit', '-m', 'фича'], dir);
    git(['checkout', 'main'], dir);
    expect(fs.exists(`${dir}/b.txt`)).toBe(false);
    expect(git(['merge', 'feature'], dir)).toContain('Fast-forward');
    expect(fs.readFile(`${dir}/b.txt`)).toBe('новый файл');
    // Конфликт: обе ветки меняют один файл.
    git(['checkout', '-b', 'x'], dir);
    fs.writeFile(`${dir}/a.txt`, 'из ветки x');
    git(['commit', '-am', 'x'], dir);
    git(['checkout', 'main'], dir);
    fs.writeFile(`${dir}/a.txt`, 'из main');
    git(['commit', '-am', 'main'], dir);
    expect(git(['merge', 'x'], dir)).toContain('КОНФЛИКТ');
    expect(fs.readFile(`${dir}/a.txt`)).toContain('<<<<<<< HEAD');
    fs.writeFile(`${dir}/a.txt`, 'решено');
    git(['add', '.'], dir);
    expect(git(['commit', '-m', 'слияние'], dir)).toContain('слияние');
    expect(git(['log', '--oneline'], dir).split('\n').length).toBe(5);
  });
  it('считает построчный diff', () => {
    const d = lineDiff('a\nb\nc', 'a\nc\nd').join('\n');
    expect(d).toContain('- b');
    expect(d).toContain('+ d');
  });
});

describe('оболочка', () => {
  it('разбирает кавычки, конвейеры и перенаправления', () => {
    expect(tokenize('echo "привет мир" > a.txt')).toEqual(['echo', 'привет мир', '>', 'a.txt']);
    expect(tokenize("git commit -m 'msg'&&ls")).toEqual(['git', 'commit', '-m', 'msg', '&&', 'ls']);
  });
  it('выполняет файловые команды, конвейеры и цепочки', async () => {
    const out: string[] = [];
    const sh = new Shell({ write: (t) => out.push(t), clear: () => {} });
    await sh.exec('mkdir -p lab/deep && cd lab');
    expect(sh.cwd).toBe(`${fs.HOME}/lab`);
    await sh.exec('echo строка1 > f.txt');
    await sh.exec('echo строка2 >> f.txt');
    await sh.exec('cat f.txt | grep 2 | wc -l');
    expect(out.at(-1)).toBe('1');
    await sh.exec('cd .. && rm -r lab');
    expect(fs.exists(`${fs.HOME}/lab`)).toBe(false);
    await sh.exec('lss');
    expect(out.at(-1)).toContain('ls');
  });
});

describe('сравнение и ИИ-помощник', () => {
  it('сравнивает JSON с допуском для дробей', () => {
    expect(sameResult('0.30000000000000004', '0.3', true)).toBe(true);
    expect(sameResult('[1, 2]', '[1,2]', true)).toBe(true);
    expect(sameResult('a  \nb', 'a\nb', false)).toBe(true);
  });
  it('объясняет типичные ошибки и находит промахи новичков', () => {
    expect(explainError("NameError: name 'pirnt' is not defined", 'python').title).toContain('pirnt');
    expect(explainError('TypeError: Cannot read properties of undefined (reading \'x\')', 'js').topic).toBe('objects');
    expect(analyzeCode('if x = 5\n    print(x)', 'python').some((i) => i.message.includes('двоеточие'))).toBe(true);
    expect(analyzeCode('for (let i = 0; i <= arr.length; i++) {}', 'js').length).toBeGreaterThan(0);
  });
});
