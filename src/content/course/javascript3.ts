// Курс JavaScript: «Под капотом JavaScript» и «Инструменты разработчика».
import type { Chapter } from '../types';

const js = String.raw;

export const jsExtraChapters2: Record<string, Chapter[]> = {
  'js-advanced': [
    {
      id: 'js-adv-4',
      title: 'Под капотом JavaScript',
      description: 'this, прототипы, итераторы, генераторы и промисы в деталях.',
      lessons: [
        {
          id: 'js-this-prototypes',
          title: 'this, call/bind и прототипы',
          minutes: 14,
          steps: [
            {
              kind: 'theory',
              topic: 'objects',
              title: 'Кто такой this',
              md: `\`this\` — объект, **через который вызвали** функцию. Он определяется в момент вызова, а не при создании:

\`\`\`js
const user = {
  name: "Аня",
  hi() { return "Привет, " + this.name; },
};
user.hi();                 // "Привет, Аня" — this = user
const f = user.hi;
f();                       // this потерян: undefined.name → ошибка
\`\`\`

**Стрелочные функции** не имеют своего \`this\` — берут его снаружи. Поэтому их удобно использовать внутри методов (колбэки, таймеры), но нельзя делать методами объекта.

**Явная привязка:**
\`\`\`js
f.call(user, arg1, arg2);       // вызвать с this = user
f.apply(user, [arg1, arg2]);    // то же, аргументы массивом
const bound = f.bind(user);     // новая функция с навсегда привязанным this
\`\`\`

**Прототипы.** У каждого объекта есть скрытая ссылка на «родителя» — прототип. Если свойства нет в объекте, JS ищет его в прототипе, потом в прототипе прототипа (**цепочка прототипов**):
\`\`\`js
const animal = { speak() { return "..." } };
const cat = Object.create(animal);   // прототип cat — animal
cat.speak();                         // "..." — найдено в прототипе
\`\`\`

\`class\` — удобный синтаксис над прототипами: методы класса лежат в \`Класс.prototype\` и общие для всех экземпляров.`,
            },
            { kind: 'predict', topic: 'objects', lang: 'js', code: js`const counter = {
  count: 0,
  inc() { this.count++; return this.count; },
};
counter.inc();
const other = { count: 100 };
console.log(counter.inc.call(other), counter.count);`, answer: '101 1', explain: 'call вызвал inc с this = other, поэтому увеличился other.count. counter.count остался 1.' },
            { kind: 'predict', topic: 'objects', lang: 'js', code: js`const base = { greet() { return "hi " + this.name; } };
const a = Object.create(base);
a.name = "Аня";
console.log(a.greet(), Object.keys(a).length, "greet" in a);`, answer: 'hi Аня 1 true', explain: 'greet найден в прототипе, а this — объект a. Собственный ключ у a только name, но оператор in видит и прототип.' },
            { kind: 'quiz', topic: 'objects', question: 'Почему метод объекта нельзя писать стрелочной функцией, если он использует `this`?', options: ['У стрелочной функции нет своего this — он берётся из внешней области, а не из объекта', 'Стрелочные функции медленнее', 'Стрелочные функции нельзя хранить в объектах', 'Можно, разницы нет'], answer: 0, explain: 'Стрелки «захватывают» this снаружи — это удобно в колбэках, но не для методов.' },
            {
              kind: 'code',
              topic: 'objects',
              lang: 'js',
              prompt: 'Реализуй свой `myBind(fn, ctx)` — вернуть функцию, которая вызывает `fn` с `this = ctx` и всеми переданными аргументами (без встроенного bind).',
              starter: 'function myBind(fn, ctx) {\n  \n}\n',
              tests: [{ expr: 'myBind(function () { return this.x; }, { x: 42 })()', expected: '42' }, { expr: 'myBind(function (a, b) { return this.base + a + b; }, { base: 10 })(1, 2)', expected: '13' }],
              hints: ['Верни `(...args) => fn.apply(ctx, args)` или используй `fn.call(ctx, ...args)`.'],
              solution: js`function myBind(fn, ctx) {
  return (...args) => fn.apply(ctx, args);
}`,
            },
            {
              kind: 'code',
              topic: 'classes',
              lang: 'js',
              prompt: 'Добавь в прототип конструктора `Point` метод `dist()` — расстояние от точки до начала координат. Используй **функцию-конструктор и prototype**, без class.',
              starter: 'function Point(x, y) {\n  this.x = x;\n  this.y = y;\n}\n\n// добавь метод в Point.prototype\n',
              tests: [{ expr: 'new Point(3, 4).dist()', expected: '5' }, { expr: 'Object.keys(new Point(1, 1)).includes("dist")', expected: 'false', name: 'Метод в прототипе, а не в объекте' }],
              hints: ['`Point.prototype.dist = function () { ... }` — именно function, не стрелка.', '`Math.hypot(this.x, this.y)` или `Math.sqrt(x² + y²)`.'],
              solution: js`function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.dist = function () {
  return Math.hypot(this.x, this.y);
};`,
            },
          ],
        },
        {
          id: 'js-generators',
          title: 'Итераторы и генераторы',
          minutes: 12,
          steps: [
            {
              kind: 'theory',
              topic: 'functions',
              title: 'Протокол итерации',
              md: `\`for...of\`, spread \`[...x]\` и деструктуризация работают с любым **итерируемым** объектом — у которого есть метод \`[Symbol.iterator]\`, возвращающий итератор с методом \`next()\` → \`{ value, done }\`.

**Генератор** \`function*\` — самый простой способ создать итератор. \`yield\` отдаёт значение и ставит функцию на паузу:
\`\`\`js
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i;
}
[...range(0, 10, 3)];   // [0, 3, 6, 9]

const it = range(0, 2);
it.next();   // { value: 0, done: false }
it.next();   // { value: 1, done: false }
it.next();   // { value: undefined, done: true }
\`\`\`

**Бесконечные последовательности** — генератор может работать вечно, мы берём сколько нужно:
\`\`\`js
function* naturals() { let n = 1; while (true) yield n++; }
\`\`\`

**Свой итерируемый класс:**
\`\`\`js
class Countdown {
  constructor(n) { this.n = n; }
  *[Symbol.iterator]() { for (let i = this.n; i > 0; i--) yield i; }
}
[...new Countdown(3)];   // [3, 2, 1]
\`\`\``,
            },
            { kind: 'predict', topic: 'functions', lang: 'js', code: js`function* gen() {
  yield "a";
  yield "b";
}
const it = gen();
console.log(it.next().value, it.next().value, it.next().done);`, answer: 'a b true', explain: 'Третий вызов next: значений больше нет — done: true.' },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'js',
              prompt: 'Напиши генератор `fib()` — бесконечная последовательность Фибоначчи, и функцию `take(iterable, n)` — массив первых n значений.',
              starter: 'function* fib() {\n  \n}\n\nfunction take(iterable, n) {\n  \n}\n',
              tests: [{ expr: 'take(fib(), 8)', expected: '[0, 1, 1, 2, 3, 5, 8, 13]' }, { expr: 'take([10, 20, 30], 2)', expected: '[10, 20]' }, { expr: 'take(fib(), 0)', expected: '[]' }],
              hints: ['В fib: `let [a, b] = [0, 1]; while (true) { yield a; [a, b] = [b, a + b]; }`.', 'В take: перебирай `for (const x of iterable)` и выходи, когда набрал n (проверь n === 0 до цикла).'],
              solution: js`function* fib() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function take(iterable, n) {
  const out = [];
  if (n <= 0) return out;
  for (const x of iterable) {
    out.push(x);
    if (out.length === n) break;
  }
  return out;
}`,
            },
            {
              kind: 'code',
              topic: 'classes',
              lang: 'js',
              prompt: 'Сделай класс `Range(start, end)` итерируемым: `[...new Range(1, 4)]` → `[1, 2, 3]` (end не включается).',
              starter: 'class Range {\n  constructor(start, end) {\n    this.start = start;\n    this.end = end;\n  }\n}\n',
              tests: [{ expr: '[...new Range(1, 4)]', expected: '[1, 2, 3]' }, { expr: '[...new Range(5, 5)]', expected: '[]' }, { expr: '(() => { let s = 0; for (const x of new Range(0, 5)) s += x; return s; })()', expected: '10' }],
              hints: ['Добавь метод-генератор `*[Symbol.iterator]() { ... }`.'],
              solution: js`class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  *[Symbol.iterator]() {
    for (let i = this.start; i < this.end; i++) yield i;
  }
}`,
            },
          ],
        },
        {
          id: 'js-promises',
          title: 'Промисы в деталях',
          minutes: 14,
          steps: [
            {
              kind: 'theory',
              topic: 'async',
              title: 'Цепочки, ошибки и параллельность',
              md: `**Создание промиса:**
\`\`\`js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = () => new Promise((_, reject) => reject(new Error("сбой")));
\`\`\`

**Цепочки** — каждый \`.then\` возвращает новый промис со значением, которое вернула функция:
\`\`\`js
fetchUser()
  .then((user) => fetchOrders(user.id))   // вернули промис — следующий then его дождётся
  .then((orders) => orders.length)
  .catch((err) => 0)                      // ловит ошибку из ЛЮБОГО шага выше
  .finally(() => hideSpinner());
\`\`\`

**async/await** — тот же код, но читается сверху вниз; ошибки ловятся обычным try/catch.

**Несколько промисов сразу:**
| Метод | Результат |
|---|---|
| \`Promise.all([...])\` | массив всех результатов; падает при первой ошибке |
| \`Promise.allSettled([...])\` | статусы всех: \`{status: "fulfilled", value}\` / \`{status: "rejected", reason}\` |
| \`Promise.race([...])\` | результат первого завершившегося |
| \`Promise.any([...])\` | первый **успешный** |

> ⚠️ \`await\` в цикле выполняет запросы **по очереди**. Если они независимы — запусти все сразу и дождись через \`Promise.all\`: это в разы быстрее.`,
            },
            { kind: 'predict', topic: 'async', lang: 'js', code: js`const p = Promise.resolve(2)
  .then((x) => x * 10)
  .then((x) => { throw new Error("стоп " + x); })
  .then(() => "не выполнится")
  .catch((e) => e.message)
  .then((msg) => console.log(msg));
await p;`, answer: 'стоп 20', explain: 'Ошибка пропускает все then до ближайшего catch; catch вернул строку, и цепочка продолжилась.' },
            { kind: 'predict', topic: 'async', lang: 'js', code: js`const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const results = await Promise.allSettled([wait(20, "A"), Promise.reject(new Error("B")), wait(10, "C")]);
console.log(results.map((r) => r.status === "fulfilled" ? r.value : "ошибка").join(","));
console.log(await Promise.race([wait(30, "медленный"), wait(5, "быстрый")]));`, answer: 'A,ошибка,C\nбыстрый', explain: 'allSettled дожидается всех и сохраняет порядок; race берёт первый завершившийся.' },
            { kind: 'quiz', topic: 'async', question: 'Есть 5 независимых запросов, каждый по 1 секунде. Сколько займёт `for (const u of urls) await fetch(u)` и сколько — `await Promise.all(urls.map(fetch))`?', options: ['~5 с и ~1 с', '~1 с и ~5 с', 'Оба ~5 с', 'Оба ~1 с'], answer: 0, explain: 'await в цикле ждёт каждый запрос по очереди. Promise.all запускает все одновременно.' },
            {
              kind: 'code',
              topic: 'async',
              lang: 'js',
              prompt: 'Напиши `withTimeout(promise, ms)` — промис, который завершается результатом `promise`, а если тот не успел за `ms` миллисекунд — отклоняется с ошибкой `"Таймаут"`.',
              starter: 'const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\n\nfunction withTimeout(promise, ms) {\n  \n}\n',
              tests: [{ expr: 'withTimeout(wait(10, "ok"), 100)', expected: '"ok"' }, { expr: 'withTimeout(wait(200, "поздно"), 20).catch((e) => e.message)', expected: '"Таймаут"' }],
              hints: ['Используй `Promise.race` с промисом, который отклоняется через `setTimeout`.', '`new Promise((_, reject) => setTimeout(() => reject(new Error("Таймаут")), ms))`.'],
              solution: js`const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Таймаут")), ms));
  return Promise.race([promise, timeout]);
}`,
            },
            {
              kind: 'code',
              topic: 'async',
              lang: 'js',
              prompt: 'Напиши `retry(fn, attempts)` — async-функцию, которая вызывает `fn()` (возвращает промис) и при ошибке пробует снова, всего не более `attempts` раз. Если все попытки неудачны — пробрось последнюю ошибку.',
              starter: 'async function retry(fn, attempts) {\n  \n}\n',
              tests: [{ expr: '(async () => { let n = 0; return retry(async () => { n++; if (n < 3) throw new Error("x"); return "успех с попытки " + n; }, 5); })()', expected: '"успех с попытки 3"' }, { expr: 'retry(async () => { throw new Error("всегда сбой"); }, 2).catch((e) => e.message)', expected: '"всегда сбой"' }],
              hints: ['Цикл `for (let i = 1; i <= attempts; i++)` с try/catch внутри.', 'В try: `return await fn();`. В catch запоминай ошибку, после цикла — `throw lastError`.'],
              solution: js`async function retry(fn, attempts) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}`,
            },
          ],
        },
      ],
    },
    {
      id: 'js-adv-5',
      title: 'Инструменты разработчика',
      description: 'Регулярные выражения, модули и тестирование.',
      lessons: [
        {
          id: 'js-regex',
          title: 'Регулярные выражения',
          minutes: 12,
          steps: [
            {
              kind: 'theory',
              topic: 'strings',
              title: 'Поиск и замена по шаблону',
              md: `Регулярное выражение пишется между слэшами: \`/шаблон/флаги\`.

| Шаблон | Значение |
|---|---|
| \`\\d\`, \`\\w\`, \`\\s\` | цифра, буква/цифра/_, пробел |
| \`.\` | любой символ |
| \`[a-zа-я]\` | символ из набора |
| \`+\`, \`*\`, \`?\`, \`{2,4}\` | количество повторов |
| \`^\`, \`$\` | начало, конец строки |
| \`(...)\` | группа |

Флаги: \`g\` — все совпадения, \`i\` — без учёта регистра, \`u\` — Юникод.

\`\`\`js
/^\\d{3}-\\d{2}$/.test("123-45")         // true — проверка формата
"a1b22c333".match(/\\d+/g)               // ["1", "22", "333"]
"много    пробелов".replace(/\\s+/g, " ")  // "много пробелов"
"25.10.2025".replace(/(\\d+)\\.(\\d+)\\.(\\d+)/, "$3-$2-$1")   // "2025-10-25"
const m = "Цена: 450 ₽".match(/(\\d+)/);
m[1];                                    // "450" — первая группа
\`\`\`

Именованные группы: \`/(?<year>\\d{4})/\` → \`match.groups.year\`.`,
            },
            { kind: 'predict', topic: 'strings', lang: 'js', code: js`console.log("a1b22c333".match(/\d+/g).length);
console.log("Hello World".replace(/o/g, "0"));
console.log(/^[A-Z]\d{3}$/.test("A123"), /^[A-Z]\d{3}$/.test("a123"));`, answer: '3\nHell0 W0rld\ntrue false', explain: 'Три группы цифр; флаг g заменил все «o»; без флага i регистр важен.' },
            { kind: 'match', topic: 'strings', prompt: 'Шаблон и что он проверяет', pairs: [['/^\\d+$/', 'строка только из цифр'], ['/\\s+/g', 'все группы пробелов'], ['/^\\+7\\d{10}$/', 'телефон +7XXXXXXXXXX'], ['/[aeiou]/gi', 'гласные латиницы в любом регистре']] },
            {
              kind: 'code',
              topic: 'strings',
              lang: 'js',
              prompt: 'Напиши `isStrongPassword(p)`: не короче 8 символов, есть цифра, строчная и заглавная латинская буква. Используй регулярные выражения.',
              starter: 'function isStrongPassword(p) {\n  \n}\n',
              tests: [{ expr: 'isStrongPassword("Secret123")', expected: 'true' }, { expr: 'isStrongPassword("secret123")', expected: 'false' }, { expr: 'isStrongPassword("Sh0rt")', expected: 'false' }, { expr: 'isStrongPassword("NoDigitsHere")', expected: 'false' }],
              hints: ['Проверь по отдельности: `/\\d/.test(p)`, `/[a-z]/.test(p)`, `/[A-Z]/.test(p)` и длину.'],
              solution: js`function isStrongPassword(p) {
  return p.length >= 8 && /\d/.test(p) && /[a-z]/.test(p) && /[A-Z]/.test(p);
}`,
            },
            {
              kind: 'code',
              topic: 'strings',
              lang: 'js',
              prompt: 'Напиши `extractHashtags(text)` — массив хештегов без `#`, в нижнем регистре, без повторов (порядок первого появления). Хештег — `#` и затем буквы/цифры/подчёркивания, включая русские буквы.',
              starter: 'function extractHashtags(text) {\n  \n}\n',
              tests: [{ expr: 'extractHashtags("Учу #JavaScript и #python, #js #JavaScript! #код_2025")', expected: '["javascript", "python", "js", "код_2025"]' }, { expr: 'extractHashtags("без тегов")', expected: '[]' }],
              hints: ['Шаблон с флагами `gu`: `/#([\\p{L}\\d_]+)/gu`.', '`[...text.matchAll(re)].map((m) => m[1].toLowerCase())`, затем убрать дубли через Set.'],
              solution: js`function extractHashtags(text) {
  const tags = [...text.matchAll(/#([\p{L}\d_]+)/gu)].map((m) => m[1].toLowerCase());
  return [...new Set(tags)];
}`,
            },
          ],
        },
        {
          id: 'js-modules',
          title: 'Модули: import и export',
          minutes: 9,
          steps: [
            {
              kind: 'theory',
              topic: 'modules',
              title: 'Разбиваем программу на файлы',
              md: `Большую программу делят на **модули** — файлы, которые экспортируют функции, классы и константы, а другие файлы их импортируют.

\`\`\`js
// math.js
export const PI = 3.14159;
export function area(r) { return PI * r * r; }
export default class Calculator { /* ... */ }   // экспорт по умолчанию — один на файл
\`\`\`

\`\`\`js
// main.js
import Calculator, { area, PI as pi } from "./math.js";
import * as math from "./math.js";       // всё как объект: math.area(2)
const { format } = await import("./fmt.js");   // динамический импорт — загрузка по требованию
\`\`\`

**Именованный** экспорт — сколько угодно, импорт в фигурных скобках по точному имени. **Экспорт по умолчанию** — один, при импорте можно назвать как угодно.

**npm-пакеты** импортируются по имени: \`import express from "express";\` — после \`npm install express\`.

**Почему модули — это хорошо:**
- у каждого файла своя область видимости — нет конфликтов имён;
- понятно, откуда что берётся;
- сборщики (Vite, webpack) выкидывают неиспользуемый код (tree shaking).

В браузере: \`<script type="module" src="main.js">\`. В Node.js — \`"type": "module"\` в package.json или расширение \`.mjs\`.`,
            },
            { kind: 'quiz', topic: 'modules', question: 'В файле `utils.js`: `export function sum() {}` и `export default function log() {}`. Какой импорт правильный?', options: ['import log, { sum } from "./utils.js"', 'import { log, sum } from "./utils.js"', 'import sum, log from "./utils.js"', 'import * from "./utils.js"'], answer: 0, explain: 'Экспорт по умолчанию — без скобок (имя любое), именованные — в фигурных скобках.' },
            { kind: 'match', topic: 'modules', prompt: 'Запись и смысл', pairs: [['export const X = 1', 'Именованный экспорт'], ['export default App', 'Экспорт по умолчанию'], ['import * as api from "./api.js"', 'Всё содержимое модуля как объект'], ['await import("./big.js")', 'Загрузка модуля по требованию']] },
            { kind: 'order', topic: 'modules', lang: 'js', prompt: 'Собери модуль `greet.js`, экспортирующий функцию по умолчанию и константу', lines: ['export const GREETING = "Привет";', 'export default function greet(name) {', '  return GREETING + ", " + name + "!";', '}'] },
            { kind: 'quiz', topic: 'modules', question: 'Зачем нужен файл `package.json` в JS-проекте?', options: ['Описывает проект: имя, скрипты запуска и список зависимостей', 'Хранит код программы', 'Это база данных проекта', 'Нужен только для TypeScript'], answer: 0, explain: '`npm install` читает зависимости из package.json, а `npm run <скрипт>` — команды из раздела scripts.' },
          ],
        },
        {
          id: 'js-testing',
          title: 'Тестирование кода',
          minutes: 11,
          steps: [
            {
              kind: 'theory',
              topic: 'errors',
              title: 'Тесты — страховка программиста',
              md: `Тест — код, который проверяет другой код. В JS популярны **Vitest** и **Jest**:

\`\`\`js
import { describe, it, expect } from "vitest";
import { sum } from "./sum.js";

describe("sum", () => {
  it("складывает числа", () => {
    expect(sum(2, 3)).toBe(5);
  });
  it("работает с отрицательными", () => {
    expect(sum(-1, -1)).toBe(-2);
  });
});
\`\`\`
Запуск: \`npx vitest\`.

| Проверка | Смысл |
|---|---|
| \`toBe(x)\` | строгое равенство (===) |
| \`toEqual(obj)\` | равенство структуры объектов/массивов |
| \`toThrow()\` | функция выбрасывает ошибку |
| \`toContain(x)\` | массив/строка содержит x |

**Что тестировать:** обычные случаи, **граничные** (пустой массив, 0, отрицательные, очень большие числа) и **ошибочный ввод**.

**Почему \`toEqual\`, а не \`toBe\` для массивов?** \`[1] === [1]\` — false: это разные объекты. Нужно сравнивать содержимое.

> 💡 Все задания в CodeVerse проверяются именно так — автотестами. Ты уже много раз видел их результаты!`,
            },
            { kind: 'predict', topic: 'errors', lang: 'js', code: js`function expectEqual(actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(ok ? "✓" : "✗ получено " + JSON.stringify(actual));
}
expectEqual([1, 2].concat(3), [1, 2, 3]);
expectEqual("abc".toUpperCase(), "Abc");
console.log([1] === [1]);`, answer: '✓\n✗ получено "ABC"\nfalse', explain: 'Свой мини-фреймворк сравнивает JSON-представления. Массивы через === не равны — это разные объекты.' },
            { kind: 'quiz', topic: 'errors', question: 'Функция `average(arr)` делит сумму на длину. Какой тест найдёт в ней баг?', options: ['average([]) — деление на ноль даст NaN', 'average([2, 4]) === 3', 'average([5]) === 5', 'average([1, 2, 3]) === 2'], answer: 0, explain: 'Граничный случай — пустой массив: 0 / 0 = NaN.' },
            {
              kind: 'code',
              topic: 'errors',
              lang: 'js',
              prompt: 'Напиши свою мини-функцию тестирования `expectEqual(actual, expected)`: если значения равны по содержимому (сравни через JSON.stringify) — вернуть `"ok"`, иначе **выбросить** `Error` с текстом `"Ожидалось X, получено Y"` (X и Y — JSON).',
              starter: 'function expectEqual(actual, expected) {\n  \n}\n',
              tests: [{ expr: 'expectEqual([1, 2], [1, 2])', expected: '"ok"' }, { expr: '(() => { try { expectEqual(3, 4); return "нет ошибки"; } catch (e) { return e.message; } })()', expected: '"Ожидалось 4, получено 3"' }, { expr: '(() => { try { expectEqual({ a: 1 }, { a: 2 }); } catch (e) { return e.message; } })()', expected: '"Ожидалось {\\"a\\":2}, получено {\\"a\\":1}"' }],
              hints: ['`const a = JSON.stringify(actual), e = JSON.stringify(expected);`', 'Если не равны — `throw new Error("Ожидалось " + e + ", получено " + a)`.'],
              solution: js`function expectEqual(actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error("Ожидалось " + e + ", получено " + a);
  return "ok";
}`,
            },
            {
              kind: 'fixbug',
              topic: 'errors',
              lang: 'js',
              prompt: 'Тесты внизу показывают, что `median` работает неправильно. Исправь функцию, чтобы все проверки прошли и вывелось `Все тесты пройдены`.',
              code: js`function median(nums) {
  const s = nums.sort();
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid] + s[mid + 1]) / 2;
}

const check = (got, exp) => { if (got !== exp) throw new Error("ожидалось " + exp + ", получено " + got); };
check(median([3, 1, 2]), 2);
check(median([10, 2, 30, 4]), 7);
check(median([5]), 5);
console.log("Все тесты пройдены");`,
              tests: [{ expected: 'Все тесты пройдены' }],
              hints: ['Ошибка 1: `sort()` без функции сравнивает строки — [10, 2, 30, 4] отсортируется неправильно.', 'Ошибка 2: при чётной длине средние элементы — `mid - 1` и `mid`.', 'Бонус: `sort` меняет исходный массив — лучше сортировать копию `[...nums]`.'],
              solution: js`function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const check = (got, exp) => { if (got !== exp) throw new Error("ожидалось " + exp + ", получено " + got); };
check(median([3, 1, 2]), 2);
check(median([10, 2, 30, 4]), 7);
check(median([5]), 5);
console.log("Все тесты пройдены");`,
            },
          ],
        },
      ],
    },
  ],
};
