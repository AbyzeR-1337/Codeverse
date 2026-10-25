// Проверка контента: эталонные решения задач и уроков должны проходить собственные тесты,
// а ответы «предскажи вывод» — совпадать с реальным выводом программ.
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { ALL_LESSONS } from '../src/content/course';
import { PROBLEMS } from '../src/content/problems';
import { PROJECTS } from '../src/content/projects';
import { problemTests } from '../src/runtime/runner';
import { sameResult } from '../src/runtime/compare';
import { inspect } from '../src/runtime/inspect';
import type { TestCase } from '../src/content/types';

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

async function runJs(code: string, test: TestCase) {
  const out: string[] = [];
  const input = [...(test.stdin ?? [])];
  const con = { log: (...a: unknown[]) => out.push(a.map((x) => inspect(x)).join(' ')), warn: () => {}, error: () => {}, info: () => {} };
  const body = test.expr ? `${code}\n;return (${test.expr});` : code;
  const fn = new AsyncFunction('console', 'prompt', body);
  const v = await fn(con, () => input.shift() ?? null);
  await new Promise((r) => setTimeout(r, 120));
  return test.expr ? (v === undefined ? 'undefined' : JSON.stringify(v)) : out.join('\n');
}

const PY_HARNESS = `
import sys, json, io, builtins
data = json.loads(sys.stdin.read())
results = []
for t in data["tests"]:
    q = list(t.get("stdin") or [])
    builtins.input = lambda prompt="": q.pop(0)
    buf = io.StringIO(); real = sys.stdout; sys.stdout = buf
    g = {"__name__": "__main__"}
    try:
        exec(compile(data["code"], "<main>", "exec"), g)
        got = json.dumps(eval(t["expr"], g), ensure_ascii=False) if t.get("expr") else buf.getvalue()
        err = None
    except Exception as e:
        got, err = buf.getvalue(), repr(e)
    finally:
        sys.stdout = real
    results.append({"got": got, "err": err})
print(json.dumps(results, ensure_ascii=False))
`;
const hasNumpy = (() => { try { execFileSync('python3', ['-c', 'import numpy, bs4']); return true; } catch { return false; } })();

function runPy(code: string, tests: TestCase[]) {
  const res = execFileSync('python3', ['-c', PY_HARNESS], { input: JSON.stringify({ code, tests }), cwd: '/tmp' }).toString();
  return JSON.parse(res) as { got: string; err: string | null }[];
}

describe('задачник: эталонные решения проходят тесты', () => {
  for (const p of PROBLEMS) {
    it(`${p.id} (JS)`, async () => {
      for (const t of problemTests('js', p.fnName, p.cases)) {
        const got = await runJs(p.solutionJs!, t);
        expect(sameResult(got, t.expected, true), `${t.expr} → ${got}, ожидалось ${t.expected}`).toBe(true);
      }
    });
    it(`${p.id} (Python)`, () => {
      const tests = problemTests('python', p.fnPy ?? p.fnName, p.cases);
      runPy(p.solutionPy!, tests).forEach((r, i) => {
        expect(r.err, tests[i].expr).toBeNull();
        expect(sameResult(r.got, tests[i].expected, true), `${tests[i].expr} → ${r.got}`).toBe(true);
      });
    });
  }
});

describe('уроки: решения заданий с кодом проходят тесты', () => {
  for (const { lesson } of ALL_LESSONS) {
    lesson.steps.forEach((s, i) => {
      if ((s.kind !== 'code' && s.kind !== 'fixbug') || !s.solution) return;
      const needsPkgs = /import (numpy|pandas)|from bs4/.test(s.solution);
      it.skipIf(s.lang === 'python' && needsPkgs && !hasNumpy)(`${lesson.id} #${i + 1} (${s.lang})`, async () => {
        if (s.lang === 'js') {
          for (const t of s.tests) {
            const got = await runJs(s.solution!, t);
            expect(sameResult(got, t.expected, !!t.expr), `получено: ${got}`).toBe(true);
          }
        } else {
          runPy(s.solution!, s.tests).forEach((r, k) => {
            expect(r.err).toBeNull();
            expect(sameResult(r.got, s.tests[k].expected, !!s.tests[k].expr), `получено: ${r.got}`).toBe(true);
          });
        }
      });
    });
  }
});

describe('уроки: ответы «предскажи вывод» совпадают с реальным выводом', () => {
  for (const { lesson } of ALL_LESSONS) {
    lesson.steps.forEach((s, i) => {
      if (s.kind !== 'predict' || s.code.includes('# один проход')) return;
      // Предсказание, опирающееся на функцию из теории, проверить отдельно нельзя.
      if (s.code.startsWith('print(merge(')) return;
      it(`${lesson.id} #${i + 1} (${s.lang})`, async () => {
        if (s.lang === 'js') {
          const out: string[] = [];
          const con = { log: (...a: unknown[]) => out.push(a.map((x) => inspect(x)).join(' ')) };
          await new AsyncFunction('console', s.code)(con);
          await new Promise((r) => setTimeout(r, 50));
          expect(out.join('\n').trim()).toBe(s.answer);
        } else {
          let got = '';
          try {
            got = execFileSync('python3', ['-c', s.code], { stdio: ['pipe', 'pipe', 'pipe'], cwd: '/tmp' }).toString();
          } catch (e) {
            got = (e as { stdout: Buffer }).stdout.toString();
          }
          expect(got.trim()).toBe(s.answer);
        }
      });
    });
  }
});


/** Эталонные решения шагов проектов: ключ — `${projectId}#${stepIndex}`. */
const PROJECT_SOLUTIONS: Record<string, string> = {
  'py-calculator#0': 'def calculate(a, op, b):\n    if op == "+": return a + b\n    if op == "-": return a - b\n    if op == "*": return a * b\n    if op == "/": return a / b\n    return "Неизвестная операция"',
  'py-calculator#1': 'def calculate(a, op, b):\n    if op == "/" and b == 0: return "Ошибка: деление на ноль"\n    return {"+": a + b, "-": a - b, "*": a * b, "/": a / b if b else 0}.get(op, "Неизвестная операция")',
  'py-calculator#2': 'def calculate(a, op, b):\n    if op == "/" and b == 0: return "Ошибка: деление на ноль"\n    return {"+": a + b, "-": a - b, "*": a * b, "/": a / b if b else 0}.get(op, "Неизвестная операция")\n\ndef evaluate(expr):\n    a, op, b = expr.split()\n    return calculate(float(a), op, float(b))',
  'py-calculator#3': 'def evaluate(expr):\n    a, op, b = expr.split()\n    a, b = float(a), float(b)\n    return {"+": a + b, "-": a - b, "*": a * b, "/": a / b}[op]\n\nhistory = []\nwhile True:\n    line = input()\n    if line == "выход":\n        break\n    r = evaluate(line)\n    history.append(r)\n    print("=", r)\nprint("Вычислений:", len(history))',
  'py-guess#0': 'def hint(secret, guess):\n    if guess < secret: return "Больше"\n    if guess > secret: return "Меньше"\n    return "Угадал!"',
  'py-guess#1': 'secret = 42\nattempts = 0\nwhile True:\n    g = int(input())\n    attempts += 1\n    if g < secret: print("Больше")\n    elif g > secret: print("Меньше")\n    else:\n        print("Угадал!")\n        print("Попыток:", attempts)\n        break',
  'py-guess#2': 'def bot_guess(secret, low=1, high=100):\n    attempts = 0\n    while True:\n        attempts += 1\n        mid = (low + high) // 2\n        if mid == secret: return attempts\n        if mid < secret: low = mid + 1\n        else: high = mid - 1',
  'py-todo#0': 'class TaskManager:\n    def __init__(self):\n        self.tasks = []\n    def add(self, title):\n        self.tasks.append({"id": len(self.tasks) + 1, "title": title, "done": False})\n        return len(self.tasks)\n    def complete(self, i):\n        for t in self.tasks:\n            if t["id"] == i: t["done"] = True\n    def pending(self):\n        return [t["title"] for t in self.tasks if not t["done"]]',
  'py-todo#1': 'import json\nclass TaskManager:\n    def __init__(self):\n        self.tasks = []\n    def add(self, title):\n        self.tasks.append({"id": len(self.tasks) + 1, "title": title, "done": False})\n        return len(self.tasks)\n    def complete(self, i):\n        for t in self.tasks:\n            if t["id"] == i: t["done"] = True\n    def pending(self):\n        return [t["title"] for t in self.tasks if not t["done"]]\n    def save(self, path):\n        with open(path, "w") as f: json.dump(self.tasks, f)\n    def load(self, path):\n        with open(path) as f: self.tasks = json.load(f)',
  'py-telegram-bot#0': 'def handle(text):\n    if text == "/start": return "Привет! Я бот CodeVerse 🤖"\n    if text == "/help": return "Команды: /start, /help, /echo <текст>"\n    if text.startswith("/echo "): return text[6:]\n    return "Не понимаю 🤔 Напиши /help"',
  'py-telegram-bot#1': 'todos = {}\ndef handle(user_id, text):\n    items = todos.setdefault(user_id, [])\n    if text.startswith("/add "):\n        items.append(text[5:]); return "Добавлено"\n    if text == "/list":\n        return "; ".join(items) if items else "Список пуст"',
  'js-discord-bot#0': 'function handleCommand(c) {\n  if (c === "!ping") return "Pong! 🏓";\n  if (c === "!roll") return "🎲 " + (1 + Math.floor(Math.random() * 6));\n  if (c.startsWith("!say ")) return c.slice(5);\n  return null;\n}',
  'js-discord-bot#1': 'class Levels {\n  constructor() { this.xp = new Map(); }\n  level(u) { return Math.floor((this.xp.get(u) ?? 0) / 50) + 1; }\n  message(u) {\n    const before = this.level(u);\n    this.xp.set(u, (this.xp.get(u) ?? 0) + 10);\n    const after = this.level(u);\n    return after > before ? `🎉 Уровень ${after}!` : null;\n  }\n}',
  'web-calculator#0': 'function compute(a, op, b) {\n  if (op === "÷" && b === 0) return "Ошибка";\n  const r = { "+": a + b, "-": a - b, "×": a * b, "÷": a / b }[op];\n  return Math.round(r * 1e10) / 1e10;\n}',
  'web-weather#0': 'function describe(c) {\n  if (c === 0) return "☀️ Ясно";\n  if (c <= 3) return "⛅ Облачно";\n  if (c >= 45 && c <= 48) return "🌫️ Туман";\n  if (c >= 51 && c <= 67) return "🌧️ Дождь";\n  if (c >= 71 && c <= 77) return "❄️ Снег";\n  if (c >= 95) return "⛈️ Гроза";\n  return "🌡️ Неизвестно";\n}',
  'js-rest-api#0': 'function matchRoute(pattern, path) {\n  const a = pattern.split("/"), b = path.split("/");\n  if (a.length !== b.length) return null;\n  const params = {};\n  for (let i = 0; i < a.length; i++) {\n    if (a[i].startsWith(":")) params[a[i].slice(1)] = b[i];\n    else if (a[i] !== b[i]) return null;\n  }\n  return params;\n}',
  'js-rest-api#1': 'function createApp() {\n  const notes = []; let nextId = 1;\n  return { handle(method, path, body) {\n    const m = path.match(/^\\/notes(?:\\/(\\d+))?$/);\n    if (!m) return { status: 404, body: { error: "Not found" } };\n    const id = m[1] && Number(m[1]);\n    if (!id && method === "GET") return { status: 200, body: notes };\n    if (!id && method === "POST") { const n = { id: nextId++, text: body.text }; notes.push(n); return { status: 201, body: n }; }\n    const i = notes.findIndex((n) => n.id === id);\n    if (i < 0) return { status: 404, body: { error: "Not found" } };\n    if (method === "GET") return { status: 200, body: notes[i] };\n    if (method === "DELETE") { notes.splice(i, 1); return { status: 204, body: null }; }\n  } };\n}',
  'py-auth#0': 'def password_strength(p):\n    problems = []\n    if len(p) < 8: problems.append("короткий")\n    if not any(c.isdigit() for c in p): problems.append("нет цифр")\n    if not any(c.isupper() for c in p): problems.append("нет заглавных")\n    return problems',
  'py-auth#1': 'import hashlib, secrets\ndef hash_password(password, salt):\n    return hashlib.sha256((salt + password).encode()).hexdigest()\nclass Auth:\n    def __init__(self):\n        self.users = {}\n    def register(self, login, password):\n        if login in self.users: return False\n        salt = secrets.token_hex(8)\n        self.users[login] = {"salt": salt, "hash": hash_password(password, salt), "fails": 0}\n        return True\n    def login(self, login, password):\n        u = self.users.get(login)\n        if not u: return False\n        if u["fails"] >= 3: return "blocked"\n        if hash_password(password, u["salt"]) == u["hash"]:\n            u["fails"] = 0; return True\n        u["fails"] += 1\n        return False',
  'py-neural#0': 'def predict(inputs, weights, bias):\n    s = sum(x * w for x, w in zip(inputs, weights)) + bias\n    return 1 if s > 0 else 0',
  'py-neural#1': 'def predict(inputs, weights, bias):\n    s = sum(x * w for x, w in zip(inputs, weights)) + bias\n    return 1 if s > 0 else 0\ndef train(data, epochs=20, lr=0.1):\n    weights = [0.0, 0.0]; bias = 0.0\n    for _ in range(epochs):\n        for x, target in data:\n            err = target - predict(x, weights, bias)\n            weights = [w + lr * err * xi for w, xi in zip(weights, x)]\n            bias += lr * err\n    return weights, bias',
  'py-parser#0': 'from bs4 import BeautifulSoup\nHTML = """\n<div class="news">\n  <h2 class="title">Python 4 не выйдет</h2><p>…</p>\n  <h2 class="title"> Вышел новый процессор </h2>\n  <h2 class="ad">Реклама</h2>\n  <h2 class="title">Учёные научили ИИ шутить</h2>\n</div>\n"""\ndef get_titles(html):\n    return [h.get_text(strip=True) for h in BeautifulSoup(html, "html.parser").select("h2.title")]',
  'py-parser#1': 'from bs4 import BeautifulSoup\nHTML = """\n<ul>\n  <li class="product"><span class="name">Мышь</span><span class="price">1 299 ₽</span></li>\n  <li class="product"><span class="name">Клавиатура</span><span class="price">3 490 ₽</span></li>\n</ul>\n"""\ndef parse_products(html):\n    soup = BeautifulSoup(html, "html.parser")\n    return [{"name": p.select_one(".name").get_text(), "price": int(p.select_one(".price").get_text().replace(" ", "").replace("₽", ""))} for p in soup.select(".product")]',
  'web-synth#0': 'const noteFrequency = (n) => Math.round(440 * 2 ** (n / 12) * 100) / 100;',
  'web-shop#0': 'class Cart {\n  constructor() { this.items = new Map(); this.discount = 0; }\n  add(p, qty = 1) { const it = this.items.get(p.id); this.items.set(p.id, { product: p, qty: (it?.qty ?? 0) + qty }); }\n  remove(id) { this.items.delete(id); }\n  total() { const s = [...this.items.values()].reduce((a, i) => a + i.product.price * i.qty, 0); return s * (1 - this.discount); }\n  applyPromo(code) { if (code === "SALE10") { this.discount = 0.1; return true; } return false; }\n}',
  'web-editor#0': 'function md(line) {\n  const inl = (s) => s.replace(/\\*\\*(.+?)\\*\\*/g, "<b>$1</b>");\n  if (line.startsWith("## ")) return "<h2>" + inl(line.slice(3)) + "</h2>";\n  if (line.startsWith("# ")) return "<h1>" + inl(line.slice(2)) + "</h1>";\n  if (line.startsWith("- ")) return "<li>" + inl(line.slice(2)) + "</li>";\n  return "<p>" + inl(line) + "</p>";\n}',
};

describe('проекты: тесты шагов проходят на эталонных реализациях', () => {
  for (const p of PROJECTS) {
    p.steps.forEach((step, i) => {
      if (!step.tests?.length) return;
      const key = `${p.id}#${i}`;
      it(key, async () => {
        const sol = PROJECT_SOLUTIONS[key];
        expect(sol, `нет эталона для ${key}`).toBeTruthy();
        if (step.lang === 'js') {
          for (const t of step.tests!) {
            const got = await runJs(sol, t);
            expect(sameResult(got, t.expected, !!t.expr), `${t.expr} → ${got}`).toBe(true);
          }
        } else {
          if (/bs4/.test(sol) && !hasNumpy) return;
          runPy(sol, step.tests!).forEach((r, k) => {
            expect(r.err, step.tests![k].expr).toBeNull();
            expect(sameResult(r.got, step.tests![k].expected, !!step.tests![k].expr), `${step.tests![k].expr} → ${r.got}`).toBe(true);
          });
        }
      });
    });
  }
});
