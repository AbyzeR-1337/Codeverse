// Курс JavaScript, углублённые главы: числа и строки, практика циклов, функции и коллекции глубже.
import type { Chapter } from '../types';

const js = String.raw;

export const jsExtraChapters: Record<string, Chapter[]> = {
  'js-start': [
    {
      id: 'js-start-3',
      title: 'Числа и строки глубже',
      description: 'Дробные числа и их ловушки, Math, коды символов, шифры и обработка текста.',
      lessons: [
        {
          id: 'js-numbers',
          title: 'Числа: точность, округление, Math',
          minutes: 11,
          steps: [
            {
              kind: 'theory',
              topic: 'math',
              title: 'Один тип number на все случаи',
              md: `В JavaScript целые и дробные числа — один тип \`number\` (64-битное число с плавающей точкой).

**Ловушка точности:** дроби хранятся в двоичном виде приблизительно.
\`\`\`js
0.1 + 0.2              // 0.30000000000000004
0.1 + 0.2 === 0.3      // false
(0.1 + 0.2).toFixed(2) // "0.30" — строка!
Math.abs(a - b) < 1e-9 // так сравнивают дроби
\`\`\`
Деньги считают в **копейках** (целыми числами), а не в рублях с дробями.

**Округление:**
| Функция | 2.5 | -2.5 | 2.4 |
|---|---|---|---|
| \`Math.round\` | 3 | -2 | 2 |
| \`Math.floor\` (вниз) | 2 | -3 | 2 |
| \`Math.ceil\` (вверх) | 3 | -2 | 3 |
| \`Math.trunc\` (отбросить дробь) | 2 | -2 | 2 |

**Строка → число:**
\`\`\`js
Number("42")      // 42
Number("42px")    // NaN — «не число»
parseInt("42px")  // 42 — читает, пока идут цифры
parseFloat("3.5кг") // 3.5
Number.isNaN(x)   // проверка на NaN (NaN !== NaN!)
Number.isInteger(5.0) // true
\`\`\`

**Остаток от отрицательного:** \`-7 % 3\` → \`-1\` (знак берётся от делимого). Для «правильного» остатка: \`((n % m) + m) % m\`.

**Большие числа:** точно представимы целые до \`Number.MAX_SAFE_INTEGER\` (≈ 9·10¹⁵). Дальше — \`BigInt\`: \`2n ** 100n\`.`,
            },
            { kind: 'predict', topic: 'math', lang: 'js', code: js`console.log(0.1 + 0.2 === 0.3);
console.log((0.1 + 0.2).toFixed(2));
console.log(parseInt("42px"), Number("42px"));`, answer: 'false\n0.30\n42 NaN', explain: 'Дроби неточны; toFixed возвращает строку; parseInt читает начало строки, а Number требует, чтобы вся строка была числом.' },
            { kind: 'match', topic: 'math', prompt: 'Сопоставь выражение и результат', pairs: [['Math.floor(-2.5)', '-3'], ['Math.trunc(-2.5)', '-2'], ['Math.ceil(2.1)', '3'], ['-7 % 3', '-1']] },
            { kind: 'quiz', topic: 'math', question: 'Как правильно проверить, что `x` — это NaN?', options: ['Number.isNaN(x)', 'x === NaN', 'x == NaN', 'typeof x === "NaN"'], answer: 0, explain: 'NaN — единственное значение, не равное самому себе, поэтому x === NaN всегда false.' },
            {
              kind: 'code',
              topic: 'math',
              lang: 'js',
              prompt: 'Напиши `roundTo(x, digits)` — округлить число до `digits` знаков после точки и вернуть **число** (не строку).',
              starter: 'function roundTo(x, digits) {\n  \n}\n',
              tests: [{ expr: 'roundTo(3.14159, 2)', expected: '3.14' }, { expr: 'roundTo(2.5, 0)', expected: '3' }, { expr: 'roundTo(1234.5678, 1)', expected: '1234.6' }],
              hints: ['Умножь на `10 ** digits`, округли `Math.round`, раздели обратно.'],
              solution: js`function roundTo(x, digits) {
  const k = 10 ** digits;
  return Math.round(x * k) / k;
}`,
            },
            {
              kind: 'code',
              topic: 'math',
              lang: 'js',
              prompt: 'Напиши `reverseNumber(n)` — число с цифрами в обратном порядке, сохраняя знак: `1234 → 4321`, `1200 → 21`, `-45 → -54`.',
              starter: 'function reverseNumber(n) {\n  \n}\n',
              tests: [{ expr: 'reverseNumber(1234)', expected: '4321' }, { expr: 'reverseNumber(1200)', expected: '21' }, { expr: 'reverseNumber(-45)', expected: '-54' }, { expr: 'reverseNumber(0)', expected: '0' }],
              hints: ['Работай с `Math.abs(n)`, знак верни в конце через `Math.sign(n)`.', 'Можно через строку: `String(...).split("").reverse().join("")` и `Number(...)`.'],
              solution: js`function reverseNumber(n) {
  const reversed = Number(String(Math.abs(n)).split("").reverse().join(""));
  return n < 0 ? -reversed : reversed;
}`,
            },
          ],
        },
        {
          id: 'js-strings-deep',
          title: 'Строки глубже: коды символов и обработка текста',
          minutes: 12,
          steps: [
            {
              kind: 'theory',
              topic: 'strings',
              title: 'Символы, коды и текстовые задачи',
              md: `**Коды символов:**
\`\`\`js
"A".charCodeAt(0)        // 65
String.fromCharCode(66)  // "B"
"a".codePointAt(0)       // 97 (работает и с эмодзи)
\`\`\`

**Перебор символов** — \`for...of\` (правильно работает с эмодзи) или \`[...str]\`:
\`\`\`js
for (const ch of "кот") console.log(ch);
[..."привет"].reverse().join("")   // "тевирп"
\`\`\`

**Полезные приёмы:**
\`\`\`js
"  Привет  ".trim()                 // "Привет"
"a-b-c".split("-")                  // ["a", "b", "c"]
"Привет мир".split(" ").length      // 2 — число слов
"abc".includes("b")                 // true
"ab".localeCompare("аб")            // сравнение строк с учётом языка
"5".padStart(3, "0")                // "005"
"Hello".at(-1)                      // "o"
\`\`\`

**Проверки символов** (в JS нет isdigit — используют сравнения или регулярки):
\`\`\`js
const isDigit = (ch) => ch >= "0" && ch <= "9";
const isLetter = (ch) => ch.toLowerCase() !== ch.toUpperCase();
\`\`\`

> 💡 Строки неизменяемы: каждый метод возвращает новую строку. Для сборки большой строки складывай куски в массив и делай \`join("")\`.`,
            },
            { kind: 'predict', topic: 'strings', lang: 'js', code: js`console.log("A".charCodeAt(0), String.fromCharCode(66));
console.log([..."кот"].reverse().join(""));
console.log("7".padStart(3, "0"));`, answer: '65 B\nток\n007', explain: 'Коды символов, разворот через массив и дополнение нулями слева.' },
            { kind: 'quiz', topic: 'strings', question: 'Как проще всего посчитать количество слов в строке `text`, где слова разделены пробелами (возможно, несколькими)?', options: ['text.trim().split(/\\s+/).length', 'text.length', 'text.split("").length', 'text.count(" ") + 1'], answer: 0, explain: 'split по регулярке \\s+ корректно обрабатывает несколько пробелов подряд; trim убирает пробелы по краям.' },
            {
              kind: 'code',
              topic: 'strings',
              lang: 'js',
              prompt: 'Напиши `caesar(text, shift)` — шифр Цезаря для латинских букв (регистр сохраняется, остальные символы не меняются, сдвиг может быть отрицательным).',
              starter: 'function caesar(text, shift) {\n  \n}\n',
              tests: [{ expr: 'caesar("abc xyz", 1)', expected: '"bcd yza"' }, { expr: 'caesar("Hello, World!", 3)', expected: '"Khoor, Zruog!"' }, { expr: 'caesar("abc", -1)', expected: '"zab"' }],
              hints: ['База: 65 для заглавных, 97 для строчных.', 'Новый код: `((code - base + shift) % 26 + 26) % 26 + base` — так работает и отрицательный сдвиг.'],
              solution: js`function caesar(text, shift) {
  let out = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    let base = null;
    if (code >= 65 && code <= 90) base = 65;
    else if (code >= 97 && code <= 122) base = 97;
    out += base === null ? ch : String.fromCharCode((((code - base + shift) % 26) + 26) % 26 + base);
  }
  return out;
}`,
            },
            {
              kind: 'code',
              topic: 'strings',
              lang: 'js',
              prompt: 'Напиши `wordStats(text)` — объект `{ words, longest }`: количество слов (разделены пробелами, возможно несколькими) и самое длинное слово (первое из самых длинных). Для пустой строки — `{ words: 0, longest: "" }`.',
              starter: 'function wordStats(text) {\n  \n}\n',
              tests: [{ expr: 'wordStats("кот   и  бегемот")', expected: '{"words": 3, "longest": "бегемот"}' }, { expr: 'wordStats("   ")', expected: '{"words": 0, "longest": ""}' }, { expr: 'wordStats("ab cd")', expected: '{"words": 2, "longest": "ab"}' }],
              hints: ['`text.split(" ").filter(Boolean)` — слова без пустых строк.', 'Самое длинное — перебором или через `reduce`.'],
              solution: js`function wordStats(text) {
  const words = text.split(" ").filter(Boolean);
  let longest = "";
  for (const w of words) if (w.length > longest.length) longest = w;
  return { words: words.length, longest };
}`,
            },
          ],
        },
      ],
    },
    {
      id: 'js-start-4',
      title: 'Практика циклов',
      lessons: [
        {
          id: 'js-loop-patterns',
          title: 'Вложенные циклы, break, continue и шаблоны',
          minutes: 13,
          steps: [
            {
              kind: 'theory',
              topic: 'loops',
              title: 'Типовые задачи на циклы',
              md: `**Вложенные циклы** — для таблиц, пар и узоров. Внутренний проходит целиком на каждом шаге внешнего:
\`\`\`js
for (let i = 1; i <= 3; i++) {
  let row = "";
  for (let j = 1; j <= 3; j++) row += i * j + " ";
  console.log(row);
}
\`\`\`

**break** — выйти из цикла, **continue** — перейти к следующей итерации:
\`\`\`js
for (const n of [1, -2, 3, 0, 5]) {
  if (n === 0) break;       // дальше не смотрим
  if (n < 0) continue;      // пропускаем отрицательные
  console.log(n);           // 1, 3
}
\`\`\`

**Метки** позволяют выйти сразу из нескольких циклов:
\`\`\`js
outer: for (const row of grid) {
  for (const cell of row) {
    if (cell === "X") break outer;
  }
}
\`\`\`

**Шаблоны:** накопитель (\`sum += x\`), счётчик (\`count++\`), поиск максимума (начинай с **первого элемента**, а не с 0), флаг \`found = true\` + break.`,
            },
            { kind: 'predict', topic: 'loops', lang: 'js', code: js`for (const n of [1, -2, 3, 0, 5]) {
  if (n === 0) break;
  if (n < 0) continue;
  console.log(n);
}`, answer: '1\n3', explain: '-2 пропущено (continue), на 0 цикл прерван (break), до 5 дело не дошло.' },
            { kind: 'findline', topic: 'loops', lang: 'js', prompt: 'Для `[-5, -2, -9]` функция возвращает 0 вместо -2. Где ошибка?', code: js`function findMax(nums) {
  let best = 0;
  for (const n of nums) {
    if (n > best) best = n;
  }
  return best;
}`, answer: 2, explain: 'Начинать нужно с первого элемента: `let best = nums[0];`.' },
            {
              kind: 'code',
              topic: 'loops',
              lang: 'js',
              prompt: 'Напиши `primesBelow(n)` — массив всех простых чисел меньше n (используй вложенный цикл проверки делителей).',
              starter: 'function primesBelow(n) {\n  \n}\n',
              tests: [{ expr: 'primesBelow(20)', expected: '[2, 3, 5, 7, 11, 13, 17, 19]' }, { expr: 'primesBelow(2)', expected: '[]' }, { expr: 'primesBelow(100).length', expected: '25', hidden: true }],
              hints: ['Внешний цикл — кандидаты от 2 до n − 1.', 'Внутренний — делители от 2 до `Math.sqrt(k)`; нашёл делитель — `continue` внешнего цикла через метку или флаг.'],
              solution: js`function primesBelow(n) {
  const result = [];
  outer: for (let k = 2; k < n; k++) {
    for (let d = 2; d * d <= k; d++) {
      if (k % d === 0) continue outer;
    }
    result.push(k);
  }
  return result;
}`,
            },
            {
              kind: 'code',
              topic: 'loops',
              lang: 'js',
              prompt: 'Напиши `multiplicationTable(n)` — массив строк таблицы умножения n×n, числа в строке через пробел. Для n = 3: `["1 2 3", "2 4 6", "3 6 9"]`.',
              starter: 'function multiplicationTable(n) {\n  \n}\n',
              tests: [{ expr: 'multiplicationTable(3)', expected: '["1 2 3", "2 4 6", "3 6 9"]' }, { expr: 'multiplicationTable(1)', expected: '["1"]' }],
              hints: ['Внешний цикл по строкам i, внутренний собирает массив `i * j`.', '`row.join(" ")`.'],
              solution: js`function multiplicationTable(n) {
  const rows = [];
  for (let i = 1; i <= n; i++) {
    const row = [];
    for (let j = 1; j <= n; j++) row.push(i * j);
    rows.push(row.join(" "));
  }
  return rows;
}`,
            },
          ],
        },
      ],
    },
  ],
  'js-core': [
    {
      id: 'js-core-3',
      title: 'Функции глубже',
      lessons: [
        {
          id: 'js-recursion',
          title: 'Рекурсия',
          minutes: 13,
          steps: [
            {
              kind: 'theory',
              topic: 'recursion',
              title: 'Функция вызывает саму себя',
              md: `Рекурсивная функция решает задачу через **меньшую версию той же задачи**. Нужны:
1. **Базовый случай** — когда остановиться.
2. **Рекурсивный шаг** — вызов себя с задачей поменьше.

\`\`\`js
function factorial(n) {
  if (n <= 1) return 1;          // базовый случай
  return n * factorial(n - 1);   // шаг
}
\`\`\`

Рекурсия естественна для **вложенных структур** — деревьев, папок, вложенных массивов и объектов:
\`\`\`js
function sumDeep(arr) {
  let total = 0;
  for (const x of arr) {
    total += Array.isArray(x) ? sumDeep(x) : x;
  }
  return total;
}
sumDeep([1, [2, [3, 4]], 5]);   // 15
\`\`\`

Каждый вызов занимает место в **стеке вызовов**. Без базового случая — \`RangeError: Maximum call stack size exceeded\`.

> 💡 Запусти рекурсию в отладчике 🐞 и открой вкладку «Вызовы» — увидишь, как стек растёт и сворачивается.`,
            },
            { kind: 'predict', topic: 'recursion', lang: 'js', code: js`function countdown(n) {
  if (n === 0) return "старт!";
  return n + " " + countdown(n - 1);
}
console.log(countdown(3));`, answer: '3 2 1 старт!', explain: 'countdown(3) = "3 " + countdown(2) = "3 2 " + countdown(1) = … = "3 2 1 старт!".' },
            { kind: 'findline', topic: 'recursion', lang: 'js', prompt: 'Эта функция переполняет стек для отрицательных n. Какая строка неверна?', code: js`function sumTo(n) {
  if (n === 0) return 0;
  return n + sumTo(n - 1);
}`, answer: 2, explain: 'Для n < 0 условие n === 0 никогда не выполнится. Надёжнее `if (n <= 0) return 0;`.' },
            {
              kind: 'code',
              topic: 'recursion',
              lang: 'js',
              prompt: 'Напиши рекурсивную `flattenDeep(arr)` — превратить массив любой вложенности в плоский (без `arr.flat`).',
              starter: 'function flattenDeep(arr) {\n  \n}\n',
              tests: [{ expr: 'flattenDeep([1, [2, [3, [4]]], 5])', expected: '[1, 2, 3, 4, 5]' }, { expr: 'flattenDeep([])', expected: '[]' }, { expr: 'flattenDeep([[["a"]], "b"])', expected: '["a", "b"]' }],
              hints: ['Для каждого элемента: если `Array.isArray(x)` — добавь элементы `flattenDeep(x)`, иначе — сам x.'],
              solution: js`function flattenDeep(arr) {
  const out = [];
  for (const x of arr) {
    if (Array.isArray(x)) out.push(...flattenDeep(x));
    else out.push(x);
  }
  return out;
}`,
            },
            {
              kind: 'code',
              topic: 'recursion',
              lang: 'js',
              prompt: 'Дано дерево папок: объект `{ name, size, children: [...] }` (у файлов нет children). Напиши `totalSize(node)` — суммарный размер узла со всем содержимым.',
              starter: 'function totalSize(node) {\n  \n}\n',
              tests: [{ expr: 'totalSize({ name: "root", size: 0, children: [{ name: "a.txt", size: 10 }, { name: "img", size: 0, children: [{ name: "b.png", size: 200 }, { name: "c.png", size: 50 }] }] })', expected: '260' }, { expr: 'totalSize({ name: "f", size: 7 })', expected: '7' }],
              hints: ['Базовый случай: нет детей — вернуть `node.size`.', 'Иначе: свой размер + сумма `totalSize(child)` по детям.'],
              solution: js`function totalSize(node) {
  let total = node.size;
  for (const child of node.children ?? []) total += totalSize(child);
  return total;
}`,
            },
          ],
        },
        {
          id: 'js-higher-order',
          title: 'Функции высшего порядка',
          minutes: 13,
          steps: [
            {
              kind: 'theory',
              topic: 'functions',
              title: 'Функции, которые работают с функциями',
              md: `**Функция высшего порядка** принимает функцию как аргумент или возвращает функцию. Ты уже знаешь их: \`map\`, \`filter\`, \`reduce\`, \`addEventListener\`, \`setTimeout\`.

**Возвращаем функцию (фабрика):**
\`\`\`js
const multiplier = (k) => (x) => x * k;
const double = multiplier(2);
double(21);   // 42
\`\`\`

**Композиция** — соединяем функции в конвейер:
\`\`\`js
const pipe = (...fns) => (x) => fns.reduce((acc, f) => f(acc), x);
const process = pipe((s) => s.trim(), (s) => s.toUpperCase());
process("  hi  ");   // "HI"
\`\`\`

**Каррирование** — функция многих аргументов превращается в цепочку функций одного аргумента: \`add(1)(2)(3)\`.

**once** — выполнить только один раз; **debounce** — выполнить, когда пользователь перестал печатать (поиск «на лету»). Всё это — функции, оборачивающие другие функции (как декораторы в Python).`,
            },
            { kind: 'predict', topic: 'functions', lang: 'js', code: js`const multiplier = (k) => (x) => x * k;
const triple = multiplier(3);
console.log(triple(5), multiplier(10)(2));`, answer: '15 20', explain: 'multiplier возвращает новую функцию, которая помнит k (замыкание).' },
            { kind: 'predict', topic: 'functions', lang: 'js', code: js`const pipe = (...fns) => (x) => fns.reduce((acc, f) => f(acc), x);
const f = pipe((x) => x + 1, (x) => x * 10, String);
console.log(f(4), typeof f(4));`, answer: '50 string', explain: '4 + 1 = 5, 5 × 10 = 50, String(50) = "50" — строка.' },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'js',
              prompt: 'Напиши `once(fn)` — вернуть функцию, которая вызывает `fn` только при **первом** вызове, а дальше возвращает тот же первый результат.',
              starter: 'function once(fn) {\n  \n}\n',
              tests: [{ expr: '(() => { let n = 0; const f = once(() => ++n); return [f(), f(), f(), n]; })()', expected: '[1, 1, 1, 1]' }, { expr: 'once((a, b) => a + b)(2, 3)', expected: '5' }],
              hints: ['Храни в замыкании `called = false` и `result`.', 'Обёртка принимает `(...args)` и передаёт их в `fn`.'],
              solution: js`function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}`,
            },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'js',
              prompt: 'Напиши `curry3(fn)` для функции трёх аргументов: `curry3(f)(a)(b)(c) === f(a, b, c)`.',
              starter: 'function curry3(fn) {\n  \n}\n',
              tests: [{ expr: 'curry3((a, b, c) => a + b + c)(1)(2)(3)', expected: '6' }, { expr: 'curry3((a, b, c) => [a, b, c].join("-"))("x")("y")("z")', expected: '"x-y-z"' }],
              hints: ['Три вложенные стрелочные функции: `(a) => (b) => (c) => fn(a, b, c)`.'],
              solution: js`function curry3(fn) {
  return (a) => (b) => (c) => fn(a, b, c);
}`,
            },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'js',
              prompt: 'Реализуй свой `myMap(arr, fn)` через цикл (без встроенного map). Функция `fn` получает `(элемент, индекс)`.',
              starter: 'function myMap(arr, fn) {\n  \n}\n',
              tests: [{ expr: 'myMap([1, 2, 3], (x) => x * 2)', expected: '[2, 4, 6]' }, { expr: 'myMap(["a", "b"], (x, i) => x + i)', expected: '["a0", "b1"]' }],
              hints: ['Создай пустой массив и в цикле добавляй `fn(arr[i], i)`.'],
              solution: js`function myMap(arr, fn) {
  const out = [];
  for (let i = 0; i < arr.length; i++) out.push(fn(arr[i], i));
  return out;
}`,
            },
          ],
        },
      ],
    },
    {
      id: 'js-core-4',
      title: 'Коллекции глубже',
      lessons: [
        {
          id: 'js-sort',
          title: 'Сортировка массивов',
          minutes: 11,
          steps: [
            {
              kind: 'theory',
              topic: 'sorting',
              title: 'sort и функция сравнения',
              md: `\`arr.sort()\` **меняет массив** и по умолчанию сравнивает элементы **как строки**:
\`\`\`js
[10, 9, 1].sort()   // [1, 10, 9] 😱
\`\`\`

Для чисел нужна **функция сравнения** \`(a, b) => ...\`: отрицательный результат — a раньше b, положительный — b раньше a.
\`\`\`js
nums.sort((a, b) => a - b);   // по возрастанию
nums.sort((a, b) => b - a);   // по убыванию
\`\`\`

**Объекты — по полю:**
\`\`\`js
users.sort((a, b) => a.age - b.age);
users.sort((a, b) => a.name.localeCompare(b.name));   // строки с учётом алфавита
\`\`\`

**Несколько ключей:** сначала по городу, при равенстве — по возрасту:
\`\`\`js
users.sort((a, b) => a.city.localeCompare(b.city) || a.age - b.age);
\`\`\`
\`||\` срабатывает, когда первое сравнение дало 0.

**Не портить исходный массив:** \`arr.toSorted(...)\` или \`[...arr].sort(...)\`.

Сортировка в JS **стабильная**: элементы с равными ключами сохраняют исходный порядок.`,
            },
            { kind: 'predict', topic: 'sorting', lang: 'js', code: js`console.log([10, 9, 1].sort());
console.log([10, 9, 1].sort((a, b) => a - b));`, answer: '[1, 10, 9]\n[1, 9, 10]', explain: 'Без функции сравниваются строки "10" < "9". С функцией — числа.' },
            { kind: 'quiz', topic: 'sorting', question: 'Как отсортировать товары по убыванию цены, а при равной цене — по названию?', options: ['items.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name))', 'items.sort((a, b) => a.price - b.price)', 'items.sort().reverse()', 'items.sort((a, b) => a.name > b.name)'], answer: 0, explain: 'Сначала разница цен (b − a — по убыванию), при нуле — сравнение названий.' },
            {
              kind: 'code',
              topic: 'sorting',
              lang: 'js',
              prompt: 'Напиши `sortStudents(list)` — **новый** массив учеников `{name, grade}`: по убыванию оценки, при равенстве — по имени в алфавитном порядке. Исходный массив не менять.',
              starter: 'function sortStudents(list) {\n  \n}\n',
              tests: [{ expr: 'sortStudents([{ name: "Вика", grade: 4 }, { name: "Аня", grade: 5 }, { name: "Боря", grade: 4 }]).map((s) => s.name)', expected: '["Аня", "Боря", "Вика"]' }, { expr: '(() => { const a = [{ name: "Б", grade: 1 }, { name: "А", grade: 2 }]; sortStudents(a); return a[0].name; })()', expected: '"Б"', name: 'Исходный массив не изменён' }],
              hints: ['Копия: `[...list]`.', 'Сравнение: `b.grade - a.grade || a.name.localeCompare(b.name)`.'],
              solution: js`function sortStudents(list) {
  return [...list].sort((a, b) => b.grade - a.grade || a.name.localeCompare(b.name));
}`,
            },
            {
              kind: 'code',
              topic: 'sorting',
              lang: 'js',
              prompt: 'Напиши `sortByFrequency(arr)` — отсортировать числа по убыванию частоты встречаемости, при равной частоте — по возрастанию значения.',
              starter: 'function sortByFrequency(arr) {\n  \n}\n',
              tests: [{ expr: 'sortByFrequency([4, 1, 2, 2, 4, 4, 3])', expected: '[4, 4, 4, 2, 2, 1, 3]' }, { expr: 'sortByFrequency([])', expected: '[]' }],
              hints: ['Сначала посчитай частоты в `Map` или объекте.', 'Сравнение: `freq(b) - freq(a) || a - b`.'],
              solution: js`function sortByFrequency(arr) {
  const freq = new Map();
  for (const x of arr) freq.set(x, (freq.get(x) ?? 0) + 1);
  return [...arr].sort((a, b) => freq.get(b) - freq.get(a) || a - b);
}`,
            },
          ],
        },
        {
          id: 'js-map-set',
          title: 'Map и Set',
          minutes: 11,
          steps: [
            {
              kind: 'theory',
              topic: 'objects',
              title: 'Настоящие словари и множества',
              md: `**Set** — множество уникальных значений:
\`\`\`js
const s = new Set([1, 2, 2, 3]);   // {1, 2, 3}
s.add(4); s.has(2); s.delete(1); s.size;
[...new Set(arr)]                  // убрать дубликаты
\`\`\`

**Map** — словарь «ключ → значение». В отличие от обычного объекта:
- ключом может быть **что угодно** (число, объект, массив), а не только строка;
- сохраняется порядок добавления;
- есть \`size\`, удобный перебор и нет «лишних» унаследованных ключей.

\`\`\`js
const m = new Map();
m.set("Аня", 5).set("Боря", 3);
m.get("Аня");        // 5
m.has("Вика");       // false
m.get("Вика") ?? 0   // значение по умолчанию
for (const [name, grade] of m) console.log(name, grade);
\`\`\`

**Частый приём — подсчёт:**
\`\`\`js
const counts = new Map();
for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
\`\`\`

Преобразования: \`Object.fromEntries(map)\` → объект, \`new Map(Object.entries(obj))\` → Map.`,
            },
            { kind: 'predict', topic: 'objects', lang: 'js', code: js`const s = new Set([3, 1, 3, 2, 1]);
console.log(s.size, [...s]);
const m = new Map([["a", 1]]);
m.set("a", m.get("a") + 10);
console.log(m.get("a"), m.has("b"));`, answer: '3 [3, 1, 2]\n11 false', explain: 'Set хранит уникальные значения в порядке первого добавления. В Map значение по ключу "a" обновилось.' },
            { kind: 'match', topic: 'objects', prompt: 'Что использовать?', pairs: [['Уникальные посетители', 'Set'], ['Слово → сколько раз встретилось', 'Map'], ['Ключ — объект пользователя', 'Map'], ['Быстро проверить «уже видели?»', 'Set.has']] },
            {
              kind: 'code',
              topic: 'objects',
              lang: 'js',
              prompt: 'Напиши `firstRepeated(arr)` — первый элемент, который встречается **второй раз** при проходе слева направо, или `null`. Используй Set.',
              starter: 'function firstRepeated(arr) {\n  \n}\n',
              tests: [{ expr: 'firstRepeated([2, 5, 1, 5, 2])', expected: '5' }, { expr: 'firstRepeated(["a", "b"])', expected: 'null' }, { expr: 'firstRepeated([])', expected: 'null' }],
              hints: ['Иди по массиву, держи `seen = new Set()`.', 'Если `seen.has(x)` — это ответ.'],
              solution: js`function firstRepeated(arr) {
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(x)) return x;
    seen.add(x);
  }
  return null;
}`,
            },
            {
              kind: 'code',
              topic: 'objects',
              lang: 'js',
              prompt: 'Напиши `groupAnagrams(words)` — массив групп слов-анаграмм (группы — в порядке появления первого слова). Используй Map с ключом «отсортированные буквы».',
              starter: 'function groupAnagrams(words) {\n  \n}\n',
              tests: [{ expr: 'groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])', expected: '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]' }, { expr: 'groupAnagrams([])', expected: '[]' }],
              hints: ['Ключ: `[...w].sort().join("")`.', 'В конце: `[...map.values()]`.'],
              solution: js`function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = [...w].sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}`,
            },
          ],
        },
        {
          id: 'js-destructuring',
          title: 'Деструктуризация, spread и копирование',
          minutes: 12,
          steps: [
            {
              kind: 'theory',
              topic: 'objects',
              title: 'Достаём и собираем данные удобно',
              md: `**Деструктуризация объектов** — с переименованием, значением по умолчанию и вложенностью:
\`\`\`js
const user = { name: "Аня", address: { city: "Казань" } };
const { name: userName, age = 18, address: { city } } = user;
// userName = "Аня", age = 18, city = "Казань"
\`\`\`

**Массивы:** \`const [first, , third, ...rest] = arr;\`, обмен: \`[a, b] = [b, a];\`

**В параметрах функции** — так передают «настройки»:
\`\`\`js
function createButton({ text, color = "blue", size = "md" } = {}) { ... }
createButton({ text: "OK" });
\`\`\`

**Spread \`...\`** — разворачивает:
\`\`\`js
const merged = { ...defaults, ...options };      // поздние ключи побеждают
const all = [...arr1, ...arr2];
Math.max(...nums);
\`\`\`

**Rest \`...\`** — собирает остаток: \`const { password, ...safeUser } = user;\`

**Поверхностная и глубокая копия:**
\`\`\`js
const shallow = { ...obj };              // вложенные объекты ОБЩИЕ
const deep = structuredClone(obj);       // полная независимая копия
\`\`\``,
            },
            { kind: 'predict', topic: 'objects', lang: 'js', code: js`const user = { name: "Аня", tags: ["js"] };
const copy = { ...user };
copy.name = "Оля";
copy.tags.push("css");
console.log(user.name, user.tags.length);`, answer: 'Аня 2', explain: 'Spread копирует только верхний уровень: name скопировалось, а массив tags — общий для обоих объектов.' },
            { kind: 'predict', topic: 'objects', lang: 'js', code: js`const { a, b = 5, ...rest } = { a: 1, c: 3, d: 4 };
const [x, , z = 9] = [10, 20];
console.log(a, b, Object.keys(rest).length, x, z);`, answer: '1 5 2 10 9', explain: 'b не было — взялось значение по умолчанию; rest = {c, d}; второй элемент массива пропущен, третьего нет — z = 9.' },
            { kind: 'fill', topic: 'objects', lang: 'js', prompt: 'Убери пароль из объекта пользователя, не изменяя исходный объект', template: 'const { password, ___ } = user;\nsend(safeUser);', answers: [['...safeUser']] },
            {
              kind: 'code',
              topic: 'objects',
              lang: 'js',
              prompt: 'Напиши `formatUser({ name, age = "?", address: { city = "неизвестно" } = {} })` — используй деструктуризацию **в параметрах**. Верни строку `"Имя (возраст), город"`.',
              starter: 'function formatUser(user) {\n  \n}\n',
              tests: [{ expr: 'formatUser({ name: "Аня", age: 17, address: { city: "Казань" } })', expected: '"Аня (17), Казань"' }, { expr: 'formatUser({ name: "Боря" })', expected: '"Боря (?), неизвестно"' }],
              hints: ['Параметр: `function formatUser({ name, age = "?", address: { city = "неизвестно" } = {} })`.', 'Строку собери через шаблон или конкатенацию.'],
              solution: js`function formatUser({ name, age = "?", address: { city = "неизвестно" } = {} }) {
  return name + " (" + age + "), " + city;
}`,
            },
            {
              kind: 'code',
              topic: 'objects',
              lang: 'js',
              prompt: 'Напиши `mergeSettings(defaults, user)` — **глубокое** слияние настроек на один уровень вложенности: вложенные объекты тоже сливаются, а не заменяются целиком. Исходные объекты не менять.',
              starter: 'function mergeSettings(defaults, user) {\n  \n}\n',
              tests: [{ expr: 'mergeSettings({ theme: "dark", editor: { size: 14, tabs: 2 } }, { editor: { size: 16 } })', expected: '{"theme": "dark", "editor": {"size": 16, "tabs": 2}}' }, { expr: '(() => { const d = { a: { x: 1 } }; mergeSettings(d, { a: { x: 2 } }); return d.a.x; })()', expected: '1', name: 'Исходный объект не изменён' }],
              hints: ['Начни с `{ ...defaults, ...user }`.', 'Для каждого ключа, где оба значения — объекты, слей их отдельно: `{ ...defaults[k], ...user[k] }`.'],
              solution: js`function mergeSettings(defaults, user) {
  const result = { ...defaults, ...user };
  for (const key of Object.keys(user)) {
    const a = defaults[key];
    const b = user[key];
    if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a)) {
      result[key] = { ...a, ...b };
    }
  }
  return result;
}`,
            },
          ],
        },
        {
          id: 'js-matrix',
          title: 'Двумерные массивы',
          minutes: 11,
          steps: [
            {
              kind: 'theory',
              topic: 'arrays',
              title: 'Сетки, поля и таблицы',
              md: `Игровое поле, таблица, картинка — это **массив массивов**:
\`\`\`js
const grid = [
  [1, 2, 3],
  [4, 5, 6],
];
grid[1][2];          // 6 — строка 1, столбец 2
grid.length;         // строк
grid[0].length;      // столбцов
\`\`\`

**Создание пустой сетки — ловушка:**
\`\`\`js
const bad = Array(3).fill(Array(3).fill(0));          // ❌ три ссылки на ОДИН массив
const good = Array.from({ length: 3 }, () => Array(3).fill(0));   // ✅
\`\`\`

**Перебор и типичные операции:**
\`\`\`js
for (let r = 0; r < grid.length; r++)
  for (let c = 0; c < grid[r].length; c++) console.log(grid[r][c]);

grid.flat()                                  // все элементы в один массив
grid.map((row) => row.reduce((a, b) => a + b, 0))   // суммы строк
grid[0].map((_, c) => grid.map((row) => row[c]))    // транспонирование
\`\`\`

**Соседи клетки** (вверх, вниз, влево, вправо):
\`\`\`js
const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
for (const [dr, dc] of dirs) { const nr = r + dr, nc = c + dc; /* проверь границы! */ }
\`\`\``,
            },
            { kind: 'predict', topic: 'arrays', lang: 'js', code: js`const bad = Array(2).fill(Array(2).fill(0));
bad[0][0] = 7;
console.log(bad);`, answer: '[[7, 0], [7, 0]]', explain: 'fill положил в обе строки ссылку на один и тот же массив.' },
            {
              kind: 'code',
              topic: 'arrays',
              lang: 'js',
              prompt: 'Напиши `rotate90(m)` — повернуть квадратную матрицу на 90° **по часовой стрелке** (вернуть новую).',
              starter: 'function rotate90(m) {\n  \n}\n',
              tests: [{ expr: 'rotate90([[1, 2], [3, 4]])', expected: '[[3, 1], [4, 2]]' }, { expr: 'rotate90([[1, 2, 3], [4, 5, 6], [7, 8, 9]])', expected: '[[7, 4, 1], [8, 5, 2], [9, 6, 3]]' }],
              hints: ['Новая строка i — это столбец i старой матрицы, прочитанный снизу вверх.', '`m[0].map((_, c) => m.map((row) => row[c]).reverse())`.'],
              solution: js`function rotate90(m) {
  return m[0].map((_, c) => m.map((row) => row[c]).reverse());
}`,
            },
            {
              kind: 'code',
              topic: 'arrays',
              lang: 'js',
              prompt: '«Сапёр»: дано поле из строк, где `*` — мина, `.` — пусто. Напиши `minesweeper(field)` — массив строк, где каждая пустая клетка заменена числом мин среди 8 соседей, а мины остаются `*`.',
              starter: 'function minesweeper(field) {\n  \n}\n',
              tests: [{ expr: 'minesweeper(["*..", "...", "..*"])', expected: '["*10", "121", "01*"]' }, { expr: 'minesweeper(["."])', expected: '["0"]' }],
              hints: ['Для каждой клетки перебери dr и dc от -1 до 1 (кроме 0, 0).', 'Проверяй границы: `field[nr]?.[nc] === "*"`.'],
              solution: js`function minesweeper(field) {
  return field.map((row, r) =>
    [...row]
      .map((cell, c) => {
        if (cell === "*") return "*";
        let count = 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++)
            if ((dr || dc) && field[r + dr]?.[c + dc] === "*") count++;
        return String(count);
      })
      .join(""),
  );
}`,
            },
          ],
        },
      ],
    },
  ],
};
