// Учебная реализация Git поверх виртуальной файловой системы.
// Поддерживает: init, status, add, commit, log, branch, checkout/switch, merge (с конфликтами), diff,
// restore, reset, rm, remote, push, show, config. Данные репозитория лежат в .git/repo.json.
import { exists, isDir, mkdir, readFile, resolvePath, rm, walk, writeFile, dirname } from './vfs';

interface Commit {
  id: string;
  msg: string;
  parent: string | null;
  parent2?: string | null;
  tree: Record<string, string>;
  date: number;
  author: string;
}
interface Repo {
  head: string;
  branches: Record<string, string | null>;
  commits: Record<string, Commit>;
  index: Record<string, string>;
  remotes: Record<string, string>;
  pushed: Record<string, string>;
  user: { name: string; email: string };
  merging?: string | null;
}

const C = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m', dim: '\x1b[2m', reset: '\x1b[0m' };

function findRoot(cwd: string): string | null {
  let d = cwd;
  for (;;) {
    if (exists(`${d === '/' ? '' : d}/.git/repo.json`)) return d;
    if (d === '/') return null;
    d = dirname(d);
  }
}

const repoPath = (root: string) => `${root === '/' ? '' : root}/.git/repo.json`;
const load = (root: string) => JSON.parse(readFile(repoPath(root))) as Repo;
const save = (root: string, r: Repo) => writeFile(repoPath(root), JSON.stringify(r));

function working(root: string): Record<string, string> {
  const files = walk(root);
  for (const k of Object.keys(files)) if (k.startsWith('.git/') || k === '.git') delete files[k];
  return files;
}

const headCommit = (r: Repo) => (r.branches[r.head] ? r.commits[r.branches[r.head]!] : null);
const headTree = (r: Repo) => headCommit(r)?.tree ?? {};
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 7);

function changes(a: Record<string, string>, b: Record<string, string>) {
  const out: { path: string; kind: 'new' | 'modified' | 'deleted' }[] = [];
  for (const p of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (!(p in a)) out.push({ path: p, kind: 'new' });
    else if (!(p in b)) out.push({ path: p, kind: 'deleted' });
    else if (a[p] !== b[p]) out.push({ path: p, kind: 'modified' });
  }
  return out.sort((x, y) => x.path.localeCompare(y.path));
}

/** Построчный diff на основе наибольшей общей подпоследовательности. */
export function lineDiff(a: string, b: string): string[] {
  const x = a.split('\n');
  const y = b.split('\n');
  const n = x.length;
  const m = y.length;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) {
      out.push(`  ${x[i]}`);
      i++;
      j++;
    } else if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) out.push(`${C.green}+ ${y[j++]}${C.reset}`);
    else out.push(`${C.red}- ${x[i++]}${C.reset}`);
  }
  return out;
}

function ancestors(r: Repo, id: string | null): Set<string> {
  const seen = new Set<string>();
  const stack = id ? [id] : [];
  while (stack.length) {
    const c = stack.pop()!;
    if (seen.has(c)) continue;
    seen.add(c);
    const cm = r.commits[c];
    if (cm?.parent) stack.push(cm.parent);
    if (cm?.parent2) stack.push(cm.parent2);
  }
  return seen;
}

function mergeBase(r: Repo, a: string, b: string): string | null {
  const anc = ancestors(r, a);
  const queue = [b];
  const seen = new Set<string>();
  while (queue.length) {
    const c = queue.shift()!;
    if (anc.has(c)) return c;
    if (seen.has(c)) continue;
    seen.add(c);
    const cm = r.commits[c];
    if (cm?.parent) queue.push(cm.parent);
    if (cm?.parent2) queue.push(cm.parent2);
  }
  return null;
}

function writeTree(root: string, from: Record<string, string>, to: Record<string, string>) {
  const base = root === '/' ? '' : root;
  for (const p of Object.keys(from)) if (!(p in to) && exists(`${base}/${p}`)) rm(`${base}/${p}`);
  for (const [p, content] of Object.entries(to)) {
    const full = `${base}/${p}`;
    if (!exists(dirname(full))) mkdir(dirname(full), true);
    writeFile(full, content);
  }
}

const HELP = `Поддерживаемые команды git:
  git init                       создать репозиторий
  git status                     состояние файлов
  git add <файл|.>               добавить изменения в индекс
  git commit -m "сообщение"      сохранить снимок
  git log [--oneline] [--graph]  история коммитов
  git diff [--staged]            что изменилось
  git branch [имя] [-d имя]      ветки
  git checkout [-b] <ветка>      переключиться на ветку (или git switch [-c])
  git merge <ветка>              слить ветку в текущую
  git restore <файл>             отменить изменения в файле
  git reset [<файл>]             убрать файл из индекса
  git rm <файл>                  удалить файл и проиндексировать удаление
  git show [коммит]              показать коммит
  git remote add origin <url>    добавить удалённый репозиторий
  git push [-u origin <ветка>]   отправить коммиты на «виртуальный GitHub»
  git config user.name "Имя"     настроить автора`;

export function git(args: string[], cwd: string): string {
  const sub = args[0];
  if (!sub || sub === 'help' || sub === '--help') return HELP;

  if (sub === 'init') {
    const root = cwd;
    if (exists(repoPath(root))) return 'Репозиторий уже инициализирован в ' + root;
    if (!isDir(`${root === '/' ? '' : root}/.git`)) mkdir(`${root === '/' ? '' : root}/.git`);
    const repo: Repo = { head: 'main', branches: { main: null }, commits: {}, index: {}, remotes: {}, pushed: {}, user: { name: 'Student', email: 'student@codeverse.dev' } };
    save(root, repo);
    return `Инициализирован пустой репозиторий Git в ${root}/.git/\n${C.dim}Подсказка: теперь добавь файлы (git add .) и сделай первый коммит (git commit -m "Первый коммит").${C.reset}`;
  }

  const root = findRoot(cwd);
  if (!root) return `${C.red}fatal: это не git-репозиторий.${C.reset} Выполни ${C.bold}git init${C.reset}, чтобы создать его.`;
  const r = load(root);
  const rel = (p: string) => {
    const abs = resolvePath(p, cwd);
    const base = root === '/' ? '/' : root + '/';
    return abs === root ? '' : abs.startsWith(base) ? abs.slice(base.length) : null;
  };
  const opt = (name: string) => args.includes(name);

  switch (sub) {
    case 'status': {
      const head = headTree(r);
      const work = working(root);
      const staged = changes(head, r.index);
      const unstaged = changes(r.index, work).filter((c) => c.kind !== 'new');
      const untracked = changes(r.index, work).filter((c) => c.kind === 'new');
      const lines = [`На ветке ${C.bold}${r.head}${C.reset}`];
      if (!headCommit(r)) lines.push('\nЕщё нет коммитов');
      if (r.merging) lines.push(`${C.yellow}Идёт слияние ветки ${r.merging}. Исправь конфликты и сделай коммит.${C.reset}`);
      const kindRu = { new: 'новый файл', modified: 'изменён', deleted: 'удалён' } as const;
      if (staged.length) lines.push('\nИзменения, которые будут закоммичены:', ...staged.map((c) => `   ${C.green}${kindRu[c.kind]}:  ${c.path}${C.reset}`));
      if (unstaged.length) lines.push('\nИзменения, не добавленные в индекс (git add):', ...unstaged.map((c) => `   ${C.red}${kindRu[c.kind]}:  ${c.path}${C.reset}`));
      if (untracked.length) lines.push('\nНеотслеживаемые файлы (git add, чтобы начать отслеживать):', ...untracked.map((c) => `   ${C.red}${c.path}${C.reset}`));
      if (!staged.length && !unstaged.length && !untracked.length) lines.push('нечего коммитить, рабочее дерево чистое');
      return lines.join('\n');
    }
    case 'add': {
      const targets = args.slice(1).filter((a) => !a.startsWith('-'));
      if (!targets.length && !opt('-A') && !opt('--all')) return 'Ничего не указано. Пример: git add . или git add file.txt';
      const work = working(root);
      const prefixes = opt('-A') || opt('--all') ? [''] : targets.map(rel);
      if (prefixes.some((p) => p === null)) return `${C.red}fatal: путь вне репозитория${C.reset}`;
      let count = 0;
      const match = (p: string) => prefixes.some((pre) => pre === '' || p === pre || p.startsWith(pre + '/'));
      for (const [p, c] of Object.entries(work)) if (match(p) && r.index[p] !== c) {
        r.index[p] = c;
        count++;
      }
      for (const p of Object.keys(r.index)) if (match(p) && !(p in work)) {
        delete r.index[p];
        count++;
      }
      if (!count && targets.length && !targets.some((t) => t === '.') && !Object.keys(work).some(match)) return `${C.red}fatal: путь '${targets[0]}' не найден${C.reset}`;
      save(root, r);
      return '';
    }
    case 'commit': {
      const mi = args.findIndex((a) => a === '-m' || a === '-am');
      if (args.includes('-am') || args.includes('-a')) {
        const work = working(root);
        for (const p of Object.keys(r.index)) if (p in work) r.index[p] = work[p];
        else delete r.index[p];
      }
      const msg = mi >= 0 ? args[mi + 1] : undefined;
      if (!msg) return 'Укажи сообщение коммита: git commit -m "что сделано"';
      if (!changes(headTree(r), r.index).length && !r.merging) return 'нечего коммитить (используй git add, чтобы добавить файлы)';
      const id = newId();
      r.commits[id] = { id, msg, parent: r.branches[r.head] ?? null, parent2: r.merging ? r.branches[r.merging] : undefined, tree: { ...r.index }, date: Date.now(), author: r.user.name };
      const n = changes(headTree(r), r.index).length;
      const first = !r.branches[r.head];
      r.branches[r.head] = id;
      r.merging = null;
      save(root, r);
      return `[${r.head}${first ? ' (корневой коммит)' : ''} ${C.yellow}${id}${C.reset}] ${msg}\n ${n} файл(ов) изменено`;
    }
    case 'log': {
      const id = r.branches[r.head];
      if (!id) return `fatal: на ветке '${r.head}' ещё нет коммитов`;
      const out: string[] = [];
      const labels = (cid: string) => {
        const names = Object.entries(r.branches).filter(([, v]) => v === cid).map(([k]) => (k === r.head ? `${C.cyan}HEAD -> ${k}${C.reset}` : `${C.green}${k}${C.reset}`));
        if (Object.values(r.pushed).includes(cid)) names.push(`${C.red}origin/${Object.entries(r.pushed).find(([, v]) => v === cid)![0]}${C.reset}`);
        return names.length ? ` (${names.join(', ')})` : '';
      };
      // Показываем все коммиты, достижимые из HEAD (включая влитые ветки), от новых к старым.
      const reachable = ancestors(r, id);
      for (const c of Object.values(r.commits).filter((x) => reachable.has(x.id)).reverse()) {
        if (opt('--oneline') || opt('--graph')) out.push(`${opt('--graph') ? '* ' : ''}${C.yellow}${c.id}${C.reset}${labels(c.id)} ${c.msg}`);
        else out.push(`${C.yellow}commit ${c.id}${C.reset}${labels(c.id)}\nАвтор: ${c.author}\nДата:  ${new Date(c.date).toLocaleString('ru-RU')}\n\n    ${c.msg}\n`);
      }
      return out.join('\n');
    }
    case 'branch': {
      const del = args.indexOf('-d') >= 0 ? args.indexOf('-d') : args.indexOf('-D');
      if (del >= 0) {
        const name = args[del + 1];
        if (!name || !(name in r.branches)) return `error: ветка '${name}' не найдена`;
        if (name === r.head) return `error: нельзя удалить текущую ветку '${name}'`;
        delete r.branches[name];
        save(root, r);
        return `Ветка ${name} удалена.`;
      }
      const name = args[1];
      if (!name) return Object.keys(r.branches).map((b) => (b === r.head ? `* ${C.green}${b}${C.reset}` : `  ${b}`)).join('\n');
      if (name in r.branches) return `fatal: ветка '${name}' уже существует`;
      if (!r.branches[r.head]) return 'fatal: сначала сделай хотя бы один коммит';
      r.branches[name] = r.branches[r.head];
      save(root, r);
      return '';
    }
    case 'checkout':
    case 'switch': {
      const create = opt('-b') || opt('-c');
      const name = args.filter((a) => !a.startsWith('-'))[1];
      if (!name) return 'Укажи ветку: git checkout <ветка>';
      if (!create && !(name in r.branches)) {
        // git checkout -- файл: восстановить файл
        const p = rel(name);
        if (p && p in r.index) {
          writeFile(`${root === '/' ? '' : root}/${p}`, r.index[p]);
          return `Файл ${p} восстановлен`;
        }
        return `error: ветка '${name}' не найдена. Создать: git checkout -b ${name}`;
      }
      if (create) {
        if (name in r.branches) return `fatal: ветка '${name}' уже существует`;
        r.branches[name] = r.branches[r.head];
        r.head = name;
        save(root, r);
        return `Переключено на новую ветку '${name}'`;
      }
      const work = working(root);
      const dirty = changes(r.index, work).filter((c) => c.kind !== 'new').length + changes(headTree(r), r.index).length;
      if (dirty) return `${C.red}error: есть незакоммиченные изменения.${C.reset} Сделай коммит или отмени их перед переключением.`;
      const from = headTree(r);
      r.head = name;
      const to = headTree(r);
      writeTree(root, from, to);
      r.index = { ...to };
      save(root, r);
      return `Переключено на ветку '${name}'`;
    }
    case 'merge': {
      const name = args[1];
      if (!name || !(name in r.branches)) return `merge: ветка '${name}' не найдена`;
      const ours = r.branches[r.head];
      const theirs = r.branches[name];
      if (!theirs) return 'Нечего сливать';
      if (ours && ancestors(r, ours).has(theirs)) return 'Уже актуально.';
      if (!ours || ancestors(r, theirs).has(ours)) {
        const from = headTree(r);
        r.branches[r.head] = theirs;
        writeTree(root, from, r.commits[theirs].tree);
        r.index = { ...r.commits[theirs].tree };
        save(root, r);
        return `Обновление ${ours ?? '∅'}..${theirs}\nFast-forward (перемотка вперёд)`;
      }
      const base = mergeBase(r, ours, theirs);
      const b = base ? r.commits[base].tree : {};
      const o = r.commits[ours].tree;
      const t = r.commits[theirs].tree;
      const result: Record<string, string> = {};
      const conflicts: string[] = [];
      for (const p of new Set([...Object.keys(b), ...Object.keys(o), ...Object.keys(t)])) {
        const [bv, ov, tv] = [b[p], o[p], t[p]];
        if (ov === tv) {
          if (ov !== undefined) result[p] = ov;
        } else if (ov === bv) {
          if (tv !== undefined) result[p] = tv;
        } else if (tv === bv) {
          if (ov !== undefined) result[p] = ov;
        } else {
          conflicts.push(p);
          result[p] = `<<<<<<< HEAD\n${ov ?? ''}\n=======\n${tv ?? ''}\n>>>>>>> ${name}\n`;
        }
      }
      writeTree(root, o, result);
      if (conflicts.length) {
        r.merging = name;
        for (const [p, v] of Object.entries(result)) if (!conflicts.includes(p)) r.index[p] = v;
        save(root, r);
        return `${C.red}КОНФЛИКТ слияния в: ${conflicts.join(', ')}${C.reset}\nОткрой файлы, оставь нужный вариант (удали маркеры <<<<<<< ======= >>>>>>>),\nзатем: git add . && git commit -m "Слияние ${name}"`;
      }
      const id = newId();
      r.commits[id] = { id, msg: `Merge branch '${name}'`, parent: ours, parent2: theirs, tree: result, date: Date.now(), author: r.user.name };
      r.branches[r.head] = id;
      r.index = { ...result };
      save(root, r);
      return `Слияние выполнено (стратегия 'ort'). Создан коммит ${C.yellow}${id}${C.reset}`;
    }
    case 'diff': {
      const staged = opt('--staged') || opt('--cached');
      const a = staged ? headTree(r) : r.index;
      const bTree = staged ? r.index : working(root);
      const ch = changes(a, bTree).filter((c) => staged || c.kind !== 'new');
      if (!ch.length) return '';
      return ch.map((c) => `${C.bold}diff --git a/${c.path} b/${c.path}${C.reset}\n${lineDiff(a[c.path] ?? '', bTree[c.path] ?? '').join('\n')}`).join('\n\n');
    }
    case 'restore': {
      const stagedFlag = opt('--staged');
      const files = args.slice(1).filter((a) => !a.startsWith('-'));
      for (const f of files) {
        const p = rel(f);
        if (!p) continue;
        if (stagedFlag) {
          const h = headTree(r);
          if (p in h) r.index[p] = h[p];
          else delete r.index[p];
        } else if (p in r.index) writeFile(`${root === '/' ? '' : root}/${p}`, r.index[p]);
      }
      save(root, r);
      return '';
    }
    case 'reset': {
      const files = args.slice(1).filter((a) => !a.startsWith('-'));
      const h = headTree(r);
      if (!files.length) r.index = { ...h };
      for (const f of files) {
        const p = rel(f);
        if (!p) continue;
        if (p in h) r.index[p] = h[p];
        else delete r.index[p];
      }
      save(root, r);
      return 'Изменения убраны из индекса';
    }
    case 'rm': {
      for (const f of args.slice(1).filter((a) => !a.startsWith('-'))) {
        const p = rel(f);
        if (!p) continue;
        delete r.index[p];
        const full = `${root === '/' ? '' : root}/${p}`;
        if (exists(full)) rm(full);
      }
      save(root, r);
      return '';
    }
    case 'show': {
      const id = args[1] ?? r.branches[r.head];
      const c = id ? r.commits[id] : undefined;
      if (!c) return 'fatal: коммит не найден';
      const parent = c.parent ? r.commits[c.parent].tree : {};
      const ch = changes(parent, c.tree);
      return `${C.yellow}commit ${c.id}${C.reset}\nАвтор: ${c.author}\n\n    ${c.msg}\n\n` + ch.map((x) => `${C.bold}${x.kind}: ${x.path}${C.reset}\n${lineDiff(parent[x.path] ?? '', c.tree[x.path] ?? '').join('\n')}`).join('\n\n');
    }
    case 'remote': {
      if (args[1] === 'add' && args[2] && args[3]) {
        r.remotes[args[2]] = args[3];
        save(root, r);
        return '';
      }
      return Object.entries(r.remotes).map(([k, v]) => (opt('-v') ? `${k}\t${v} (fetch)\n${k}\t${v} (push)` : k)).join('\n');
    }
    case 'push': {
      if (!Object.keys(r.remotes).length) return `fatal: не настроен удалённый репозиторий.\nДобавь: git remote add origin https://github.com/<ты>/<репо>.git`;
      const branch = args.filter((a) => !a.startsWith('-'))[2] ?? r.head;
      const id = r.branches[branch];
      if (!id) return `error: ветка '${branch}' пуста`;
      const url = Object.values(r.remotes)[0];
      const count = [...ancestors(r, id)].filter((c) => !ancestors(r, r.pushed[branch] ?? null).has(c)).length;
      r.pushed[branch] = id;
      save(root, r);
      return `Перечисление объектов: ${count}, готово.\nЗапись объектов: 100% (${count}/${count}), готово.\nTo ${url}\n   ${C.green}${branch} -> ${branch}${C.reset}\n${C.dim}(Это виртуальный GitHub: в настоящем проекте команда отправит код на сервер.)${C.reset}`;
    }
    case 'config': {
      const key = args[1];
      const val = args[2];
      if (key === 'user.name' && val) r.user.name = val;
      else if (key === 'user.email' && val) r.user.email = val;
      else if (key === '--list') return `user.name=${r.user.name}\nuser.email=${r.user.email}`;
      else if (key === 'user.name') return r.user.name;
      save(root, r);
      return '';
    }
    default:
      return `git: '${sub}' — неизвестная команда. Смотри git help`;
  }
}
