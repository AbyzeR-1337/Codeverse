// Командная оболочка виртуальной консоли: файловые команды, конвейеры, перенаправления,
// запуск node/python, REPL, git, виртуальные npm и pip.
import * as fs from './vfs';
import { git } from './git';
import { installPythonPackage, replEval, resetRepl, runCode } from './runner';
import { bump } from '../store/actions';
import { getState } from '../store/progress';

export const ANSI = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m', bold: '\x1b[1m', dim: '\x1b[2m', reset: '\x1b[0m' };
const { green, red, yellow, blue, cyan, bold, dim, reset } = ANSI;

export interface ShellOutput {
  write(text: string, stream?: 'out' | 'err' | 'info'): void;
  clear(): void;
  openInIde?(path: string): void;
}

export type ShellMode = 'sh' | 'js' | 'py';

/** Разбор строки с кавычками в аргументы. */
export function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: string | null = null;
  let has = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === '\\' && quote === '"' && i + 1 < line.length) cur += line[++i];
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (/\s/.test(ch)) {
      if (cur || has) out.push(cur);
      cur = '';
      has = false;
    } else if (ch === '|' || ch === '>' || ch === ';' || (ch === '&' && line[i + 1] === '&')) {
      if (cur || has) out.push(cur);
      cur = '';
      has = false;
      if (ch === '>' && line[i + 1] === '>') {
        out.push('>>');
        i++;
      } else if (ch === '&' && line[i + 1] === '&') {
        out.push('&&');
        i++;
      } else out.push(ch);
    } else cur += ch;
  }
  if (cur || has) out.push(cur);
  return out;
}

const COMMANDS: Record<string, string> = {
  help: 'список команд',
  ls: 'содержимое папки (-a скрытые, -l подробно)',
  cd: 'перейти в папку (cd .. — на уровень выше, cd ~ — домой)',
  pwd: 'где я сейчас',
  mkdir: 'создать папку (-p — вместе с родительскими)',
  touch: 'создать пустой файл',
  cat: 'показать содержимое файла',
  echo: 'вывести текст (echo текст > файл — записать в файл)',
  rm: 'удалить файл (-r — папку)',
  mv: 'переместить/переименовать',
  cp: 'скопировать (-r — папку)',
  tree: 'дерево папок',
  find: 'найти файлы по имени: find . -name "*.py"',
  grep: 'найти строки по шаблону: grep print hello.py',
  wc: 'посчитать строки/слова/символы',
  head: 'первые строки файла (-n 5)',
  tail: 'последние строки файла (-n 5)',
  node: 'запустить JavaScript: node file.js (без аргумента — REPL)',
  python: 'запустить Python: python file.py (без аргумента — REPL)',
  npm: 'npm init | npm install <пакет> | npm list | npm run <скрипт>',
  pip: 'pip install <пакет> (реальные пакеты Pyodide: numpy, pandas, bs4…) | pip list',
  git: 'система контроля версий (git help)',
  code: 'открыть файл во встроенной IDE',
  clear: 'очистить экран',
  history: 'история команд',
  whoami: 'кто я',
  date: 'текущая дата',
  env: 'переменные окружения',
  export: 'задать переменную: export NAME=value',
  man: 'справка по команде: man ls',
  neofetch: 'информация о системе',
};

export class Shell {
  cwd = fs.HOME;
  mode: ShellMode = 'sh';
  history: string[] = [];
  env: Record<string, string> = { HOME: fs.HOME, USER: 'student', SHELL: '/bin/cvsh', LANG: 'ru_RU.UTF-8', PATH: '/usr/bin:/bin' };
  private replBuffer = '';

  constructor(private io: ShellOutput) {}

  get prompt() {
    if (this.mode === 'js') return this.replBuffer ? '... ' : '> ';
    if (this.mode === 'py') return this.replBuffer ? '... ' : '>>> ';
    const short = this.cwd.startsWith(fs.HOME) ? '~' + this.cwd.slice(fs.HOME.length) : this.cwd;
    return `${green}${this.env.USER}@codeverse${reset}:${blue}${short}${reset}$ `;
  }

  completions(partial: string): string[] {
    const tokens = tokenize(partial);
    const last = partial.endsWith(' ') ? '' : (tokens.at(-1) ?? '');
    if (tokens.length <= 1 && !partial.endsWith(' ')) return Object.keys(COMMANDS).filter((c) => c.startsWith(last));
    const dirPart = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '';
    const base = fs.resolvePath(dirPart || '.', this.cwd);
    if (!fs.isDir(base)) return [];
    return fs
      .readdir(base)
      .filter((e) => e.name.startsWith(last.slice(dirPart.length)))
      .map((e) => dirPart + e.name + (e.dir ? '/' : ''));
  }

  async exec(line: string): Promise<void> {
    if (this.mode !== 'sh') return this.replLine(line);
    const trimmed = line.trim();
    if (!trimmed) return;
    this.history.push(trimmed);
    bump('terminal_cmds');
    const tokens = tokenize(trimmed.replace(/\$(\w+)/g, (_, v: string) => this.env[v] ?? ''));
    // Разбиваем по && и ;
    const chains: { cmd: string[]; op: string }[] = [];
    let cur: string[] = [];
    for (const t of tokens) {
      if (t === '&&' || t === ';') {
        chains.push({ cmd: cur, op: t });
        cur = [];
      } else cur.push(t);
    }
    chains.push({ cmd: cur, op: '' });
    for (const { cmd, op } of chains) {
      const ok = await this.pipeline(cmd);
      if (!ok && op === '&&') break;
    }
  }

  private async pipeline(tokens: string[]): Promise<boolean> {
    let redirect: { file: string; append: boolean } | null = null;
    const ri = tokens.findIndex((t) => t === '>' || t === '>>');
    if (ri >= 0) {
      redirect = { file: tokens[ri + 1], append: tokens[ri] === '>>' };
      tokens = tokens.slice(0, ri);
    }
    const stages: string[][] = [[]];
    for (const t of tokens) {
      if (t === '|') stages.push([]);
      else stages.at(-1)!.push(t);
    }
    let input: string | null = null;
    let ok = true;
    for (let i = 0; i < stages.length; i++) {
      const last = i === stages.length - 1;
      const capture = !last || !!redirect;
      try {
        const res = await this.run(stages[i], input, capture);
        input = res ?? '';
      } catch (e) {
        this.io.write(`${red}${stages[i][0]}: ${(e as Error).message}${reset}`, 'err');
        ok = false;
        input = '';
        break;
      }
    }
    if (redirect && ok) {
      if (!redirect.file) {
        this.io.write(`${red}не указан файл для перенаправления${reset}`, 'err');
        return false;
      }
      const path = fs.resolvePath(redirect.file, this.cwd);
      const prev = redirect.append && fs.exists(path) ? fs.readFile(path) : '';
      fs.writeFile(path, prev + (input ?? '') + ((input ?? '').endsWith('\n') || !input ? '' : '\n'));
    } else if (input && stages.length > 1) this.io.write(input.replace(/\n$/, ''));
    return ok;
  }

  /** Выполнить одну команду. Если capture — вернуть вывод строкой, иначе печатать. */
  private async run(argv: string[], stdin: string | null, capture: boolean): Promise<string | void> {
    const [cmd, ...args] = argv;
    if (!cmd) return '';
    const out = (s: string) => {
      if (capture) return s;
      if (s) this.io.write(s);
      return undefined;
    };
    const p = (x: string) => fs.resolvePath(x, this.cwd);
    const flags = new Set(args.filter((a) => a.startsWith('-') && a.length > 1).flatMap((a) => (a.startsWith('--') ? [a] : a.slice(1).split('').map((c) => '-' + c))));
    const pos = args.filter((a) => !a.startsWith('-') || a === '-');
    const textOf = (file?: string) => (file ? fs.readFile(p(file)) : (stdin ?? ''));

    switch (cmd) {
      case 'help':
        return out(`${bold}Команды виртуальной консоли CodeVerse:${reset}\n` + Object.entries(COMMANDS).map(([k, v]) => `  ${cyan}${k.padEnd(10)}${reset} ${v}`).join('\n') + `\n\n${dim}Конвейеры: cat file | grep x | wc -l   Перенаправление: echo hi > a.txt   Цепочки: mkdir a && cd a\nTab — автодополнение, ↑/↓ — история.${reset}`);
      case 'man':
        return out(pos[0] && COMMANDS[pos[0]] ? `${bold}${pos[0]}${reset} — ${COMMANDS[pos[0]]}` : 'Укажи команду: man ls');
      case 'pwd':
        return out(this.cwd);
      case 'whoami':
        return out(this.env.USER);
      case 'date':
        return out(new Date().toLocaleString('ru-RU'));
      case 'env':
        return out(Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join('\n'));
      case 'export': {
        for (const a of pos) {
          const [k, ...v] = a.split('=');
          if (k) this.env[k] = v.join('=');
        }
        return out('');
      }
      case 'clear':
        this.io.clear();
        return '';
      case 'history':
        return out(this.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n'));
      case 'echo':
        return out(pos.join(' ') + (capture ? '\n' : ''));
      case 'cd': {
        const target = p(pos[0] ?? '~');
        if (!fs.exists(target)) throw new Error(`нет такой папки: ${pos[0]}`);
        if (!fs.isDir(target)) throw new Error(`не папка: ${pos[0]}`);
        this.cwd = target;
        return '';
      }
      case 'ls': {
        const target = p(pos[0] ?? '.');
        if (!fs.exists(target)) throw new Error(`нет такого файла или папки: ${pos[0]}`);
        if (!fs.isDir(target)) return out(pos[0]);
        const items = fs.readdir(target).filter((e) => flags.has('-a') || !e.name.startsWith('.'));
        if (flags.has('-l')) {
          return out(items.map((e) => {
            const full = `${target === '/' ? '' : target}/${e.name}`;
            const size = e.dir ? 4096 : new Blob([fs.readFile(full)]).size;
            return `${e.dir ? 'drwxr-xr-x' : '-rw-r--r--'} student ${String(size).padStart(6)} ${e.dir ? blue + bold + e.name + '/' + reset : e.name}`;
          }).join('\n'));
        }
        if (capture) return items.map((e) => e.name).join('\n') + '\n';
        return out(items.map((e) => (e.dir ? `${blue}${bold}${e.name}/${reset}` : /\.(js|py|sh)$/.test(e.name) ? `${green}${e.name}${reset}` : e.name)).join('  '));
      }
      case 'mkdir':
        if (!pos.length) throw new Error('укажи имя папки');
        pos.forEach((d) => fs.mkdir(p(d), flags.has('-p')));
        return '';
      case 'touch':
        if (!pos.length) throw new Error('укажи имя файла');
        pos.forEach((f) => !fs.exists(p(f)) && fs.writeFile(p(f), ''));
        return '';
      case 'cat':
        if (!pos.length) return out(stdin ?? '');
        return out(pos.map((f) => fs.readFile(p(f))).join('\n').replace(/\n$/, capture ? '\n' : ''));
      case 'rm':
        if (!pos.length) throw new Error('укажи, что удалить');
        pos.forEach((f) => fs.rm(p(f), flags.has('-r')));
        return '';
      case 'mv':
        if (pos.length < 2) throw new Error('использование: mv откуда куда');
        fs.move(p(pos[0]), p(pos[1]));
        return '';
      case 'cp':
        if (pos.length < 2) throw new Error('использование: cp откуда куда');
        if (fs.isDir(p(pos[0])) && !flags.has('-r')) throw new Error('это папка, используй cp -r');
        fs.copy(p(pos[0]), p(pos[1]));
        return '';
      case 'tree': {
        const target = p(pos[0] ?? '.');
        return out(`${blue}${bold}${pos[0] ?? '.'}${reset}\n${fs.tree(target)}`);
      }
      case 'find': {
        const root = p(pos[0] ?? '.');
        const ni = args.indexOf('-name');
        const pattern = ni >= 0 ? args[ni + 1] : '*';
        const re = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        const files = Object.keys(fs.walk(root)).filter((f) => re.test(fs.basename(f)) && !f.startsWith('.git/'));
        return out(files.map((f) => `${pos[0] ?? '.'}/${f}`).join('\n') + (capture ? '\n' : ''));
      }
      case 'grep': {
        const [pattern, file] = pos;
        if (!pattern) throw new Error('использование: grep шаблон [файл]');
        const re = new RegExp(pattern, flags.has('-i') ? 'i' : '');
        const lines = textOf(file).split('\n').map((l, i) => [l, i + 1] as const).filter(([l]) => re.test(l) !== flags.has('-v'));
        const fmt = lines.map(([l, n]) => (flags.has('-n') ? `${green}${n}${reset}:` : '') + (capture ? l : l.replace(re, (m) => `${red}${bold}${m}${reset}`)));
        if (flags.has('-c')) return out(String(lines.length) + (capture ? '\n' : ''));
        return out(fmt.join('\n') + (capture && fmt.length ? '\n' : ''));
      }
      case 'wc': {
        const text = textOf(pos[0]);
        const lines = text ? text.replace(/\n$/, '').split('\n').length : 0;
        const words = text.split(/\s+/).filter(Boolean).length;
        if (flags.has('-l')) return out(String(lines) + (capture ? '\n' : ''));
        if (flags.has('-w')) return out(String(words) + (capture ? '\n' : ''));
        return out(`${lines} ${words} ${text.length}${pos[0] ? ' ' + pos[0] : ''}` + (capture ? '\n' : ''));
      }
      case 'head':
      case 'tail': {
        const ni = args.indexOf('-n');
        const n = ni >= 0 ? Number(args[ni + 1]) : 10;
        const file = pos.find((x) => x !== String(n));
        const lines = textOf(file).replace(/\n$/, '').split('\n');
        return out((cmd === 'head' ? lines.slice(0, n) : lines.slice(-n)).join('\n') + (capture ? '\n' : ''));
      }
      case 'neofetch':
        return out(`${cyan}${bold}   ╭──────────╮${reset}   ${bold}student@codeverse${reset}
${cyan}${bold}   │  </>  ⚡ │${reset}   ОС: CodeVerse OS (браузерная песочница)
${cyan}${bold}   ╰──────────╯${reset}   Оболочка: cvsh 1.0
                  Языки: JavaScript (ES2024), Python ${'3.12 (Pyodide)'}
                  Уровень: ${Math.floor(getState().xp)} XP`);
      case 'code':
      case 'edit':
      case 'open': {
        if (!pos[0]) throw new Error('укажи файл');
        const path = p(pos[0]);
        if (!fs.exists(path)) fs.writeFile(path, '');
        this.io.openInIde?.(path);
        return out(`Открываю ${pos[0]} в IDE…`);
      }
      case 'node':
      case 'python':
      case 'python3': {
        const lang = cmd === 'node' ? 'js' : 'python';
        if (!pos[0] || flags.has('-i')) {
          this.mode = lang === 'js' ? 'js' : 'py';
          this.io.write(lang === 'js' ? `Добро пожаловать в Node.js REPL (песочница CodeVerse).\nВведи ${bold}.exit${reset} для выхода.` : `Python 3 (Pyodide) — интерактивный режим.\nВведи ${bold}exit()${reset} для выхода.`, 'info');
          return '';
        }
        const path = p(pos[0]);
        const code = fs.readFile(path);
        const collected: string[] = [];
        const res = await runCode(lang, code, stdin ? stdin.replace(/\n$/, '').split('\n') : [], {
          onOut: (text, stream) => (capture ? collected.push(text) : this.io.write(text, stream === 'err' ? 'err' : stream === 'info' ? 'info' : 'out')),
          onStatus: (t) => this.io.write(`${dim}${t}${reset}`, 'info'),
          onClear: () => this.io.clear(),
        });
        if (!res.ok) this.io.write(`${red}${res.errorName ?? 'Error'}${res.errorLine ? ` (строка ${res.errorLine})` : ''}: ${res.error}${reset}`, 'err');
        return capture ? collected.join('\n') + '\n' : '';
      }
      case 'npm':
        return out(this.npm(pos));
      case 'pip':
      case 'pip3':
        return out(await this.pip(pos));
      case 'git':
        return out(git(args, this.cwd));
      case 'sudo':
        this.io.write(`${yellow}Здесь ты и так главный 😎${reset}`, 'info');
        return this.run(args, stdin, capture);
      case 'exit':
        return out('Это виртуальная консоль — закрыть её можно, просто уйдя на другую страницу 🙂');
      default: {
        // ./script.js или ./script.py
        if (cmd.startsWith('./') && /\.(js|py)$/.test(cmd)) return this.run([cmd.endsWith('.js') ? 'node' : 'python', cmd, ...args], stdin, capture);
        const guess = Object.keys(COMMANDS).find((c) => levenshtein(c, cmd) <= 2);
        throw new Error(`команда не найдена.${guess ? ` Может быть, ты имел в виду ${bold}${guess}${reset}?` : ' Введи help.'}`);
      }
    }
  }

  private npm(args: string[]): string {
    const pkgPath = fs.resolvePath('package.json', this.cwd);
    const readPkg = () => (fs.exists(pkgPath) ? JSON.parse(fs.readFile(pkgPath)) : null) as { name: string; version: string; scripts: Record<string, string>; dependencies: Record<string, string> } | null;
    const [sub, ...rest] = args;
    if (sub === 'init') {
      const name = fs.basename(this.cwd);
      fs.writeFile(pkgPath, JSON.stringify({ name, version: '1.0.0', scripts: { start: 'node index.js' }, dependencies: {} }, null, 2));
      return `Создан package.json для проекта ${name}`;
    }
    if (sub === 'install' || sub === 'i' || sub === 'add') {
      const pkg = readPkg();
      if (!pkg) return `${red}npm ERR! нет package.json. Сначала выполни npm init${reset}`;
      if (!rest.length) return `up to date, audited ${Object.keys(pkg.dependencies).length} packages`;
      for (const name of rest) {
        pkg.dependencies[name] = '^' + (KNOWN_NPM[name] ?? '1.0.0');
        const dir = fs.resolvePath(`node_modules/${name}`, this.cwd);
        fs.mkdir(dir, true);
        fs.writeFile(`${dir}/package.json`, JSON.stringify({ name, version: KNOWN_NPM[name] ?? '1.0.0' }, null, 2));
      }
      fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
      return `\nadded ${rest.length} package(s) in 0.4s\n${dim}(Виртуальная установка: пакеты записаны в package.json и node_modules. В песочнице доступны встроенные API браузера.)${reset}`;
    }
    if (sub === 'list' || sub === 'ls') {
      const pkg = readPkg();
      if (!pkg) return 'нет package.json';
      return `${pkg.name}@${pkg.version}\n` + Object.entries(pkg.dependencies).map(([k, v]) => `├── ${k}@${v.replace('^', '')}`).join('\n');
    }
    if (sub === 'run' || sub === 'start') {
      const pkg = readPkg();
      const script = sub === 'start' ? 'start' : rest[0];
      const cmd = pkg?.scripts?.[script];
      if (!cmd) return `${red}npm ERR! скрипт "${script}" не найден${reset}`;
      void this.exec(cmd);
      return `> ${pkg!.name} ${script}\n> ${cmd}\n`;
    }
    return 'Использование: npm init | npm install <пакет> | npm list | npm run <скрипт>';
  }

  private async pip(args: string[]): Promise<string> {
    const [sub, ...rest] = args;
    const reqPath = fs.resolvePath('requirements.txt', this.cwd);
    if (sub === 'install') {
      if (rest[0] === '-r') {
        if (!fs.exists(reqPath)) return `${red}нет requirements.txt${reset}`;
        rest.splice(0, 2, ...fs.readFile(reqPath).split('\n').filter(Boolean));
      }
      const results: string[] = [];
      for (const name of rest) {
        this.io.write(`Collecting ${name}`, 'info');
        const r = await installPythonPackage(name, { onStatus: (t) => this.io.write(`${dim}  ${t}${reset}`, 'info') });
        if (r.ok) {
          results.push(`${green}Successfully installed ${name}${reset}`);
          const prev = fs.exists(reqPath) ? fs.readFile(reqPath) : '';
          if (!prev.split('\n').includes(name)) fs.writeFile(reqPath, prev + name + '\n');
        } else results.push(`${red}ERROR: не удалось установить ${name}: ${r.error}${reset}`);
      }
      return results.join('\n');
    }
    if (sub === 'list' || sub === 'freeze') return fs.exists(reqPath) ? fs.readFile(reqPath).trim() : 'Пакеты не установлены (используй pip install)';
    return 'Использование: pip install <пакет> | pip install -r requirements.txt | pip list';
  }

  private async replLine(line: string) {
    const lang = this.mode === 'js' ? 'js' : 'python';
    const t = line.trim();
    if ((this.mode === 'js' && t === '.exit') || (this.mode === 'py' && (t === 'exit()' || t === 'quit()'))) {
      this.mode = 'sh';
      this.replBuffer = '';
      resetRepl(lang === 'js' ? 'js' : 'python');
      return;
    }
    this.history.push(line);
    // Многострочный ввод: Python — после «:» до пустой строки; JS — пока скобки не закрыты.
    const buf = this.replBuffer ? this.replBuffer + '\n' + line : line;
    const needMore = this.mode === 'py' ? (buf.trimEnd().endsWith(':') || (this.replBuffer && t !== '')) : unbalanced(buf);
    if (needMore) {
      this.replBuffer = buf;
      return;
    }
    this.replBuffer = '';
    let code = buf;
    if (lang === 'js') code = code.replace(/^(\s*)(let|const)\s/gm, '$1var ');
    const res = await replEval(lang, code, {
      onOut: (text, stream) => this.io.write(stream === 'info' && lang === 'js' ? `${dim}${text}${reset}` : text, stream === 'err' ? 'err' : 'out'),
      onStatus: (s) => this.io.write(`${dim}${s}${reset}`, 'info'),
    });
    if (!res.ok) this.io.write(`${red}${res.errorName ? res.errorName + ': ' : ''}${res.error}${reset}`, 'err');
  }
}

function unbalanced(code: string) {
  let depth = 0;
  for (const ch of code.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '')) {
    if ('([{'.includes(ch)) depth++;
    if (')]}'.includes(ch)) depth--;
  }
  return depth > 0;
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

const KNOWN_NPM: Record<string, string> = {
  react: '19.1.0', 'react-dom': '19.1.0', express: '5.1.0', lodash: '4.17.21', axios: '1.9.0', vite: '7.0.0', typescript: '5.8.3',
  next: '15.3.0', 'socket.io': '4.8.1', jsonwebtoken: '9.0.2', three: '0.177.0', electron: '36.4.0', dotenv: '16.5.0', jest: '30.0.0',
};
