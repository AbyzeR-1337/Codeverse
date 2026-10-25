// Виртуальная файловая система: плоская карта «путь → содержимое» (null — папка).
// Общая для IDE и консоли, сохраняется в localStorage и синхронизируется вместе с прогрессом.

const KEY = 'codeverse.vfs.v1';
export const HOME = '/home/student';

type Entries = Record<string, string | null>;

const SAMPLE: Entries = {
  '/': null,
  '/home': null,
  [HOME]: null,
  [`${HOME}/projects`]: null,
  [`${HOME}/hello.py`]: `# Моя первая программа на Python\nname = input("Как тебя зовут? ")\nprint(f"Привет, {name}! Добро пожаловать в CodeVerse 🚀")\n\nfor i in range(1, 4):\n    print("Шаг", i)\n`,
  [`${HOME}/hello.js`]: `// Моя первая программа на JavaScript\nconst name = prompt("Как тебя зовут?");\nconsole.log(\`Привет, \${name}! Добро пожаловать в CodeVerse 🚀\`);\n\nfor (let i = 1; i <= 3; i++) {\n  console.log("Шаг", i);\n}\n`,
  [`${HOME}/projects/site`]: null,
  [`${HOME}/projects/site/index.html`]: `<!doctype html>\n<html lang="ru">\n<head>\n  <meta charset="utf-8">\n  <title>Мой сайт</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Привет, веб! 👋</h1>\n  <p>Нажми на кнопку:</p>\n  <button id="btn">Нажми меня</button>\n  <p id="out"></p>\n  <script src="script.js"></script>\n</body>\n</html>\n`,
  [`${HOME}/projects/site/style.css`]: `body {\n  font-family: system-ui, sans-serif;\n  background: #0f172a;\n  color: #e2e8f0;\n  padding: 2rem;\n}\nbutton {\n  padding: .6rem 1.2rem;\n  border-radius: 8px;\n  border: 0;\n  background: #7c5cff;\n  color: white;\n  font-size: 1rem;\n  cursor: pointer;\n}\n`,
  [`${HOME}/projects/site/script.js`]: `let clicks = 0;\ndocument.getElementById('btn').addEventListener('click', () => {\n  clicks++;\n  document.getElementById('out').textContent = 'Нажатий: ' + clicks;\n});\n`,
  [`${HOME}/README.md`]: `# Добро пожаловать в виртуальную консоль CodeVerse\n\nПопробуй команды:\n  ls, cd projects, cat hello.py, python hello.py, node hello.js,\n  mkdir test, touch test/a.txt, git init, help\n`,
};

let entries: Entries = load();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function load(): Entries {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) return JSON.parse(raw) as Entries;
  } catch {
    /* повреждённые данные — начинаем с примера */
  }
  return { ...SAMPLE };
}

function changed() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }, 200);
  listeners.forEach((l) => l());
}

export function subscribeVfs(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function loadVfsSnapshot() {
  return JSON.stringify(entries);
}
export function restoreVfsSnapshot(json: string) {
  entries = JSON.parse(json) as Entries;
  changed();
}
export function resetVfs() {
  entries = { ...SAMPLE };
  changed();
}

export class FsError extends Error {}

export function resolvePath(path: string, cwd = HOME): string {
  if (path === '~' || path.startsWith('~/')) path = HOME + path.slice(1);
  const parts = (path.startsWith('/') ? path : `${cwd}/${path}`).split('/');
  const out: string[] = [];
  for (const p of parts) {
    if (!p || p === '.') continue;
    if (p === '..') out.pop();
    else out.push(p);
  }
  return '/' + out.join('/');
}

export const dirname = (p: string) => p.slice(0, p.lastIndexOf('/')) || '/';
export const basename = (p: string) => p.slice(p.lastIndexOf('/') + 1);

export function exists(p: string) {
  return p in entries;
}
export function isDir(p: string) {
  return entries[p] === null;
}

export function readFile(p: string): string {
  const v = entries[p];
  if (v === undefined) throw new FsError(`нет такого файла: ${p}`);
  if (v === null) throw new FsError(`это папка: ${p}`);
  return v;
}

export function writeFile(p: string, content: string) {
  const parent = dirname(p);
  if (!isDir(parent)) throw new FsError(`папка не существует: ${parent}`);
  if (isDir(p)) throw new FsError(`это папка: ${p}`);
  entries[p] = content;
  changed();
}

export function mkdir(p: string, recursive = false) {
  if (exists(p)) {
    if (recursive && isDir(p)) return;
    throw new FsError(`уже существует: ${p}`);
  }
  const parent = dirname(p);
  if (!exists(parent)) {
    if (!recursive) throw new FsError(`папка не существует: ${parent}`);
    mkdir(parent, true);
  }
  entries[p] = null;
  changed();
}

export function readdir(p: string): { name: string; dir: boolean }[] {
  if (!isDir(p)) throw new FsError(`не папка: ${p}`);
  const prefix = p === '/' ? '/' : p + '/';
  const out: { name: string; dir: boolean }[] = [];
  for (const k of Object.keys(entries)) {
    if (k !== p && k.startsWith(prefix) && !k.slice(prefix.length).includes('/')) {
      out.push({ name: k.slice(prefix.length), dir: entries[k] === null });
    }
  }
  return out.sort((a, b) => Number(b.dir) - Number(a.dir) || a.name.localeCompare(b.name));
}

export function rm(p: string, recursive = false) {
  if (!exists(p)) throw new FsError(`нет такого файла или папки: ${p}`);
  if (p === '/' || p === HOME) throw new FsError('эту папку удалять нельзя');
  if (isDir(p)) {
    const children = Object.keys(entries).filter((k) => k.startsWith(p + '/'));
    if (children.length && !recursive) throw new FsError(`папка не пуста (используй -r): ${p}`);
    children.forEach((k) => delete entries[k]);
  }
  delete entries[p];
  changed();
}

export function copy(src: string, dst: string) {
  if (!exists(src)) throw new FsError(`нет такого файла: ${src}`);
  if (isDir(dst)) dst = `${dst}/${basename(src)}`;
  if (isDir(src)) {
    for (const k of Object.keys(entries).filter((k) => k === src || k.startsWith(src + '/'))) {
      entries[dst + k.slice(src.length)] = entries[k];
    }
  } else {
    entries[dst] = entries[src];
  }
  changed();
}

export function move(src: string, dst: string) {
  if (isDir(dst)) dst = `${dst}/${basename(src)}`;
  copy(src, dst);
  rm(src, true);
}

/** Все файлы в папке (рекурсивно), пути относительно `root`. */
export function walk(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  const prefix = root === '/' ? '/' : root + '/';
  for (const [k, v] of Object.entries(entries)) {
    if (v !== null && k.startsWith(prefix)) out[k.slice(prefix.length)] = v;
  }
  return out;
}

export function tree(root: string, indent = ''): string {
  const items = readdir(root);
  return items
    .map((it, i) => {
      const last = i === items.length - 1;
      const line = `${indent}${last ? '└── ' : '├── '}${it.name}${it.dir ? '/' : ''}`;
      if (!it.dir || it.name === '.git') return line;
      const sub = tree(`${root === '/' ? '' : root}/${it.name}`, indent + (last ? '    ' : '│   '));
      return sub ? `${line}\n${sub}` : line;
    })
    .join('\n');
}
