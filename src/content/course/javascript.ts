// Трек JavaScript: от console.log() до классов, асинхронности, DOM и дорожной карты экосистемы.
import type { Track } from '../types';

export const jsTrack: Track = {
  id: 'js',
  title: 'JavaScript',
  icon: '🟨',
  color: '#facc15',
  description: 'Язык веба: сайты, игры в браузере, серверы на Node.js, мобильные и десктопные приложения. От console.log() до React и Node.js.',
  modules: [
    {
      id: 'js-start',
      title: 'Первые шаги',
      chapters: [
        {
          id: 'js-start-1',
          title: 'Основы языка',
          lessons: [
            {
              id: 'js-console',
              title: 'console.log() и первая программа',
              minutes: 6,
              steps: [
                {
                  kind: 'theory',
                  topic: 'output',
                  title: 'JavaScript — язык, на котором работает веб',
                  md: `**JavaScript (JS)** выполняется в каждом браузере: кнопки, анимации, игры, чаты — всё это JS. С **Node.js** он работает и на серверах, с **Electron** — в десктопных приложениях (VS Code, Discord), с **React Native** — на телефонах.

Вывод в консоль — \`console.log()\`:

\`\`\`js
console.log("Привет, мир!");
console.log(42);
console.log("Сумма:", 2 + 3);
\`\`\`

- Строки — в кавычках: \`"..."\`, \`'...'\` или \`\`...\`\`.
- В конце инструкции принято ставить **точку с запятой** \`;\`.
- Комментарии: \`// однострочный\` и \`/* многострочный */\`.
- Регистр важен: \`Console.log\` — ошибка.

Ещё есть \`console.error()\` (ошибки, красным), \`console.warn()\` (предупреждения), \`console.table()\` (таблицы).`,
                },
                { kind: 'example', topic: 'output', lang: 'js', code: 'console.log("Привет, мир!");\nconsole.log("Мне", 15, "лет");\nconsole.log(10 + 5);\nconsole.log("10" + 5); // строка + число = склейка!\nconsole.warn("Это предупреждение");\nconsole.error("А это ошибка");' },
                { kind: 'predict', topic: 'output', lang: 'js', code: 'console.log("5 + 5");\nconsole.log(5 + 5);', answer: '5 + 5\n10', explain: 'В кавычках — строка (выводится как есть). Без кавычек — выражение (вычисляется).' },
                { kind: 'findline', topic: 'syntax', lang: 'js', prompt: 'Какая строка вызовет ошибку?', code: 'console.log("Раз");\nconsole.Log("Два");\nconsole.log("Три");', answer: 2, explain: 'Метод называется `log` с маленькой буквы. `console.Log` — не функция.' },
                { kind: 'code', topic: 'output', lang: 'js', prompt: 'Выведи две строки: `Hello, JavaScript!` и `2 + 2 = 4` (вторую — с вычислением: текст + результат выражения).', starter: '// твой код\n', tests: [{ expected: 'Hello, JavaScript!\n2 + 2 = 4' }], hints: ['Первая строка — просто `console.log("Hello, JavaScript!")`.', 'Вторая: `console.log("2 + 2 =", 2 + 2)`.'], solution: 'console.log("Hello, JavaScript!");\nconsole.log("2 + 2 =", 2 + 2);' },
              ],
            },
            {
              id: 'js-variables',
              title: 'let, const и типы данных',
              minutes: 10,
              steps: [
                {
                  kind: 'theory',
                  topic: 'variables',
                  title: 'Переменные в JavaScript',
                  md: `Переменные объявляют словами \`let\` и \`const\`:

\`\`\`js
let score = 0;        // можно менять
score = score + 10;
score += 5;

const name = "Аня";   // константа — нельзя переприсвоить
// name = "Оля";      // TypeError!
\`\`\`

> 💡 Правило: по умолчанию пиши \`const\`. Используй \`let\`, только если значение действительно будет меняться. Старое слово \`var\` не используй — у него странные правила видимости.

**Типы данных:**

| Тип | Пример |
|---|---|
| number | \`42\`, \`3.14\`, \`-7\`, \`NaN\`, \`Infinity\` |
| string | \`"текст"\`, \`'текст'\`, \`\`шаблон \${x}\`\` |
| boolean | \`true\`, \`false\` |
| undefined | переменная объявлена, но значения нет |
| null | «пусто» — значение задано явно |
| object | \`{ name: "Аня" }\`, массивы \`[1, 2]\` |
| bigint, symbol | для особых случаев |

Узнать тип: \`typeof 42\` → \`"number"\`.

**Приведение типов** — источник сюрпризов:
- \`"5" + 3\` → \`"53"\` (плюс со строкой склеивает);
- \`"5" - 3\` → \`2\` (минус превращает в числа);
- \`Number("42")\` → 42, \`String(42)\` → "42", \`parseInt("42px")\` → 42.`,
                },
                { kind: 'example', topic: 'types', lang: 'js', code: 'const age = 16;\nlet city;\nconst empty = null;\nconsole.log(typeof age, typeof "hi", typeof true);\nconsole.log(typeof city, city);\nconsole.log(typeof empty); // историческая ошибка языка: "object"\nconsole.log("5" + 3, "5" - 3, "5" * "2");' },
                { kind: 'match', topic: 'types', prompt: 'Сопоставь выражение и результат', pairs: [['typeof 3.14', '"number"'], ['typeof "3"', '"string"'], ['"7" + 1', '"71"'], ['"7" - 1', '6']] },
                { kind: 'quiz', topic: 'variables', question: 'Когда использовать `const`?', options: ['Когда переменной не нужно присваивать новое значение', 'Только для чисел', 'Для всех переменных внутри циклов', 'Никогда, это устарело'], answer: 0, explain: 'const защищает от случайного переприсваивания. Это делает код надёжнее.' },
                { kind: 'findline', topic: 'variables', lang: 'js', prompt: 'Какая строка вызовет ошибку?', code: 'const lives = 3;\nlet score = 0;\nscore += 100;\nlives -= 1;\nconsole.log(score, lives);', answer: 4, explain: 'lives объявлена через const — её нельзя изменить. Нужно `let lives = 3`.' },
                { kind: 'fixbug', topic: 'types', lang: 'js', prompt: 'Программа должна вывести сумму двух чисел из строк, но выводит `1020`. Исправь, чтобы получилось `30`.', code: 'const a = "10";\nconst b = "20";\nconsole.log(a + b);', tests: [{ expected: '30' }], hints: ['Строки при + склеиваются.', 'Преобразуй: `Number(a) + Number(b)`.'], solution: 'const a = "10";\nconst b = "20";\nconsole.log(Number(a) + Number(b));' },
              ],
            },
            {
              id: 'js-operators',
              title: 'Операторы и сравнение',
              minutes: 9,
              steps: [
                {
                  kind: 'theory',
                  topic: 'math',
                  title: 'Математика и логика',
                  md: `**Арифметика:** \`+ - * /\`, \`%\` (остаток), \`**\` (степень). В JS деление всегда дробное: \`7 / 2\` → \`3.5\`. Целая часть: \`Math.floor(7 / 2)\` → 3.

**Инкремент:** \`i++\` (увеличить на 1), \`i--\`, а также \`+=\`, \`-=\`, \`*=\`.

**Сравнение:**

| Оператор | Смысл |
|---|---|
| \`===\` | строго равно (тип и значение) |
| \`!==\` | строго не равно |
| \`==\` | равно с приведением типов (не используй!) |
| \`>\` \`<\` \`>=\` \`<=\` | больше / меньше |

\`\`\`js
5 === 5      // true
5 === "5"    // false — разные типы
5 == "5"     // true — коварное приведение
\`\`\`

**Логические:** \`&&\` (и), \`||\` (или), \`!\` (не).

**«Ложные» значения (falsy):** \`false\`, \`0\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`. Всё остальное — истинно.

**Полезные операторы:**
- \`a ?? b\` — b, если a равно null/undefined;
- \`a || b\` — b, если a ложно;
- \`user?.address?.city\` — безопасный доступ (не упадёт на undefined).

**Объект Math:** \`Math.round\`, \`Math.floor\`, \`Math.ceil\`, \`Math.max\`, \`Math.min\`, \`Math.abs\`, \`Math.sqrt\`, \`Math.random()\` (от 0 до 1).`,
                },
                { kind: 'predict', topic: 'logic', lang: 'js', code: 'console.log(10 % 3);\nconsole.log(2 ** 4);\nconsole.log(3 === "3");\nconsole.log(!true || 5 > 2);', answer: '1\n16\nfalse\ntrue', explain: '10 % 3 = 1; 2⁴ = 16; число и строка не равны строго; !true || true → true.' },
                { kind: 'quiz', topic: 'logic', question: 'Какое значение **истинно** (truthy)?', options: ['"0"', '0', '""', 'null'], answer: 0, explain: '"0" — непустая строка, а значит истинна. Ложны: 0, "", null, undefined, NaN, false.' },
                { kind: 'predict', topic: 'logic', lang: 'js', code: 'const nick = "";\nconst shown = nick || "Гость";\nconst count = 0;\nconsole.log(shown, count ?? 10, count || 10);', answer: 'Гость 0 10', explain: '|| заменяет любое ложное значение, ?? — только null/undefined. Поэтому 0 ?? 10 = 0, а 0 || 10 = 10.' },
                { kind: 'code', topic: 'math', lang: 'js', prompt: 'Напиши функцию `randomInt(min, max)`, возвращающую случайное **целое** число от min до max включительно. (Тест проверит, что результат целый и в диапазоне.)', starter: 'function randomInt(min, max) {\n  \n}\n', tests: [{ expr: 'Array.from({length: 200}, () => randomInt(1, 6)).every(n => Number.isInteger(n) && n >= 1 && n <= 6)', expected: 'true' }, { expr: 'new Set(Array.from({length: 500}, () => randomInt(1, 3))).size', expected: '3' }, { expr: 'randomInt(5, 5)', expected: '5' }], hints: ['`Math.random()` даёт число от 0 (включительно) до 1 (не включительно).', 'Количество вариантов: `max - min + 1`.', '`Math.floor(Math.random() * (max - min + 1)) + min`'], solution: 'function randomInt(min, max) {\n  return Math.floor(Math.random() * (max - min + 1)) + min;\n}' },
              ],
            },
            {
              id: 'js-strings',
              title: 'Строки и шаблонные строки',
              minutes: 10,
              steps: [
                {
                  kind: 'theory',
                  topic: 'strings',
                  title: 'Работа с текстом',
                  md: `**Шаблонные строки** — в обратных кавычках \`\`...\`\`, значения вставляются через \`\${...}\`:

\`\`\`js
const name = "Аня";
const age = 15;
console.log(\`Меня зовут \${name}, через год мне \${age + 1}\`);
\`\`\`

Они могут быть многострочными.

**Индексы и длина:** \`s[0]\`, \`s.at(-1)\` (последний символ), \`s.length\` (без скобок — это свойство!).

| Метод | Пример | Результат |
|---|---|---|
| \`toUpperCase()\` | \`"hi".toUpperCase()\` | \`"HI"\` |
| \`trim()\` | \`"  a ".trim()\` | \`"a"\` |
| \`includes(x)\` | \`"банан".includes("ан")\` | \`true\` |
| \`indexOf(x)\` | \`"банан".indexOf("н")\` | \`2\` |
| \`slice(a, b)\` | \`"JavaScript".slice(0, 4)\` | \`"Java"\` |
| \`split(sep)\` | \`"a,b".split(",")\` | \`["a", "b"]\` |
| \`replaceAll(a, b)\` | \`"a-b-c".replaceAll("-", " ")\` | \`"a b c"\` |
| \`repeat(n)\` | \`"ab".repeat(3)\` | \`"ababab"\` |
| \`padStart(n, c)\` | \`"7".padStart(3, "0")\` | \`"007"\` |
| \`startsWith/endsWith\` | \`"file.js".endsWith(".js")\` | \`true\` |

Развернуть строку: \`s.split("").reverse().join("")\`.

> 🧠 Строки неизменяемы: методы возвращают **новую** строку.`,
                },
                { kind: 'example', topic: 'strings', lang: 'js', code: 'const s = "JavaScript";\nconsole.log(s.length, s[0], s.at(-1));\nconsole.log(s.slice(4));\nconsole.log(s.toUpperCase());\nconsole.log(s.split("").reverse().join(""));\nconsole.log(`${s} — это ${s.length} символов`);' },
                { kind: 'predict', topic: 'strings', lang: 'js', code: 'const word = "программа";\nconsole.log(word.slice(0, 3).toUpperCase());\nconsole.log(word.indexOf("г"));', answer: 'ПРО\n3', explain: 'slice(0, 3) → "про" → "ПРО". Буква «г» стоит на индексе 3 (п=0, р=1, о=2, г=3).' },
                { kind: 'fill', topic: 'strings', lang: 'js', prompt: 'Выведи приветствие через шаблонную строку', template: 'const user = "Макс";\nconsole.log(___Привет, ___user}!___);', answers: [['`'], ['${'], ['`']] },
                { kind: 'code', topic: 'strings', lang: 'js', prompt: 'Напиши функцию `capitalize(s)`, которая делает первую букву строки заглавной, а остальные — строчными: `capitalize("пРИВЕТ")` → `"Привет"`.', starter: 'function capitalize(s) {\n  \n}\n', tests: [{ expr: 'capitalize("пРИВЕТ")', expected: '"Привет"' }, { expr: 'capitalize("javascript")', expected: '"Javascript"' }, { expr: 'capitalize("a")', expected: '"A"' }], hints: ['Первая буква: `s[0].toUpperCase()`.', 'Остальное: `s.slice(1).toLowerCase()`.'], solution: 'function capitalize(s) {\n  return s[0].toUpperCase() + s.slice(1).toLowerCase();\n}' },
                { kind: 'code', topic: 'strings', lang: 'js', prompt: 'Напиши функцию `countVowels(s)`, считающую гласные (`аеёиоуыэюя` и `aeiou`) в строке без учёта регистра.', starter: 'function countVowels(s) {\n  \n}\n', tests: [{ expr: 'countVowels("Привет, мир")', expected: '3' }, { expr: 'countVowels("JavaScript")', expected: '3' }, { expr: 'countVowels("ррр")', expected: '0' }], hints: ['Строка гласных: `const vowels = "аеёиоуыэюяaeiou";`', 'Перебери символы `for (const ch of s.toLowerCase())` и проверь `vowels.includes(ch)`.'], solution: 'function countVowels(s) {\n  const vowels = "аеёиоуыэюяaeiou";\n  let count = 0;\n  for (const ch of s.toLowerCase()) {\n    if (vowels.includes(ch)) count++;\n  }\n  return count;\n}' },
              ],
            },
          ],
        },
        {
          id: 'js-start-2',
          title: 'Условия и циклы',
          lessons: [
            {
              id: 'js-if',
              title: 'if, else, тернарный оператор, switch',
              minutes: 10,
              steps: [
                {
                  kind: 'theory',
                  topic: 'conditions',
                  title: 'Ветвление',
                  md: `\`\`\`js
const temp = 18;
if (temp > 25) {
  console.log("Жарко");
} else if (temp > 10) {
  console.log("Тепло");
} else {
  console.log("Холодно");
}
\`\`\`

Условие — в **круглых скобках**, блок кода — в **фигурных**. Отступы в JS не обязательны (в отличие от Python), но без них код нечитаем.

**Тернарный оператор** — короткий if для выбора значения:
\`\`\`js
const status = age >= 18 ? "взрослый" : "подросток";
\`\`\`

**switch** — выбор по конкретным значениям:
\`\`\`js
switch (day) {
  case "сб":
  case "вс":
    console.log("Выходной");
    break;
  case "пн":
    console.log("Тяжёлый день");
    break;
  default:
    console.log("Рабочий день");
}
\`\`\`

> ⚠️ В switch не забывай \`break\`, иначе выполнение «провалится» в следующий case.`,
                },
                { kind: 'predict', topic: 'conditions', lang: 'js', code: 'const score = 72;\nconst grade = score >= 90 ? "A" : score >= 70 ? "B" : "C";\nconsole.log(grade);', answer: 'B', explain: '72 >= 90 — нет, 72 >= 70 — да → "B".' },
                { kind: 'predict', topic: 'conditions', lang: 'js', code: 'const x = 2;\nswitch (x) {\n  case 1:\n    console.log("один");\n  case 2:\n    console.log("два");\n  case 3:\n    console.log("три");\n    break;\n  default:\n    console.log("много");\n}', answer: 'два\nтри', explain: 'Нет break после case 2 — выполнение «проваливается» в case 3 до ближайшего break.' },
                { kind: 'order', topic: 'conditions', lang: 'js', prompt: 'Собери функцию, определяющую знак числа', lines: ['function sign(n) {', '  if (n > 0) return "плюс";', '  if (n < 0) return "минус";', '  return "ноль";', '}'] },
                { kind: 'code', topic: 'conditions', lang: 'js', prompt: 'Напиши функцию `ticketPrice(age)`: до 7 лет — 0, от 7 до 17 — 200, от 18 до 64 — 500, 65 и старше — 250.', starter: 'function ticketPrice(age) {\n  \n}\n', tests: [{ expr: 'ticketPrice(5)', expected: '0' }, { expr: 'ticketPrice(7)', expected: '200' }, { expr: 'ticketPrice(17)', expected: '200' }, { expr: 'ticketPrice(30)', expected: '500' }, { expr: 'ticketPrice(65)', expected: '250' }], hints: ['Проверяй границы по порядку: `if (age < 7) return 0;`', 'Затем `if (age < 18) return 200;` и т.д.'], solution: 'function ticketPrice(age) {\n  if (age < 7) return 0;\n  if (age < 18) return 200;\n  if (age < 65) return 500;\n  return 250;\n}' },
              ],
            },
            {
              id: 'js-loops',
              title: 'Циклы for, while, for...of',
              minutes: 11,
              steps: [
                {
                  kind: 'theory',
                  topic: 'loops',
                  title: 'Повторение',
                  md: `**Классический for** — три части через точку с запятой: начало; условие; шаг.

\`\`\`js
for (let i = 0; i < 5; i++) {
  console.log("Итерация", i);
}
\`\`\`

**while** — пока условие истинно:
\`\`\`js
let n = 3;
while (n > 0) {
  console.log(n);
  n--;
}
\`\`\`

**for...of** — перебор элементов массива или символов строки:
\`\`\`js
for (const fruit of ["яблоко", "груша"]) {
  console.log(fruit);
}
\`\`\`

**for...in** — перебор **ключей** объекта: \`for (const key in user) { ... }\`.

\`break\` — выйти из цикла, \`continue\` — следующая итерация.

> ⚠️ Классическая ошибка: \`i <= arr.length\` вместо \`i < arr.length\` — последняя итерация обратится к несуществующему элементу (\`undefined\`).`,
                },
                { kind: 'animation', topic: 'loops', title: 'Цикл for по шагам', anim: { lang: 'js', code: 'let sum = 0;\nfor (let i = 1; i <= 3; i++) {\n  sum += i;\n}\nconsole.log(sum);', width: 360, height: 160, frames: [
                  { caption: 'sum = 0', line: 1, boxes: [{ id: 's', label: 'sum', value: '0', x: 30, y: 40, color: 'green', highlight: true }] },
                  { caption: 'i = 1, проверка 1 <= 3 — да', line: 2, boxes: [{ id: 's', label: 'sum', value: '0', x: 30, y: 40, color: 'green' }, { id: 'i', label: 'i', value: '1', x: 200, y: 40, color: 'blue', highlight: true }] },
                  { caption: 'sum += 1 → 1, затем i++ → 2', line: 3, boxes: [{ id: 's', label: 'sum', value: '1', x: 30, y: 40, color: 'green', highlight: true }, { id: 'i', label: 'i', value: '2', x: 200, y: 40, color: 'blue' }] },
                  { caption: 'sum += 2 → 3, затем i++ → 3', line: 3, boxes: [{ id: 's', label: 'sum', value: '3', x: 30, y: 40, color: 'green', highlight: true }, { id: 'i', label: 'i', value: '3', x: 200, y: 40, color: 'blue' }] },
                  { caption: 'sum += 3 → 6, затем i++ → 4', line: 3, boxes: [{ id: 's', label: 'sum', value: '6', x: 30, y: 40, color: 'green', highlight: true }, { id: 'i', label: 'i', value: '4', x: 200, y: 40, color: 'blue' }] },
                  { caption: '4 <= 3 — нет. Цикл окончен, выводим 6.', line: 5, boxes: [{ id: 's', label: 'sum', value: '6', x: 30, y: 40, color: 'yellow', highlight: true }, { id: 'i', label: 'i', value: '4', x: 200, y: 40, color: 'red' }] },
                ] } },
                { kind: 'predict', topic: 'loops', lang: 'js', code: 'let out = "";\nfor (let i = 10; i > 0; i -= 3) {\n  out += i + " ";\n}\nconsole.log(out.trim());', answer: '10 7 4 1', explain: 'i: 10 → 7 → 4 → 1 → -2 (условие ложно).' },
                { kind: 'findline', topic: 'arrays', lang: 'js', prompt: 'Какая строка приведёт к выводу лишнего `NaN`?', code: 'const prices = [100, 250, 80];\nfor (let i = 0; i <= prices.length; i++) {\n  console.log(prices[i] * 2);\n}', answer: 2, explain: 'При i = 3 prices[3] — undefined, а undefined * 2 = NaN. Нужно `i < prices.length`.' },
                { kind: 'code', topic: 'loops', lang: 'js', prompt: 'Напиши функцию `sumDigits(n)`, возвращающую сумму цифр положительного целого числа, используя цикл **while**.', starter: 'function sumDigits(n) {\n  \n}\n', tests: [{ expr: 'sumDigits(1234)', expected: '10' }, { expr: 'sumDigits(9)', expected: '9' }, { expr: 'sumDigits(1000001)', expected: '2' }], hints: ['Последняя цифра: `n % 10`.', 'Отбросить последнюю цифру: `n = Math.floor(n / 10)`.', 'Повторяй, пока `n > 0`.'], solution: 'function sumDigits(n) {\n  let sum = 0;\n  while (n > 0) {\n    sum += n % 10;\n    n = Math.floor(n / 10);\n  }\n  return sum;\n}' },
                { kind: 'code', topic: 'loops', lang: 'js', prompt: 'Выведи «ёлочку» высотой 4 из звёздочек (каждый ряд: пробелы + звёздочки, 1, 3, 5, 7 звёздочек):\n```\n   *\n  ***\n *****\n*******\n```', starter: 'const height = 4;\n', tests: [{ expected: '   *\n  ***\n *****\n*******' }], hints: ['В ряду i (от 0): пробелов `height - i - 1`, звёздочек `2 * i + 1`.', 'Используй `" ".repeat(k)` и `"*".repeat(k)`.'], solution: 'const height = 4;\nfor (let i = 0; i < height; i++) {\n  console.log(" ".repeat(height - i - 1) + "*".repeat(2 * i + 1));\n}' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'js-core',
      title: 'Функции, массивы, объекты',
      chapters: [
        {
          id: 'js-core-1',
          title: 'Функции',
          lessons: [
            {
              id: 'js-functions',
              title: 'Функции и стрелочные функции',
              minutes: 11,
              steps: [
                {
                  kind: 'theory',
                  topic: 'functions',
                  title: 'Три способа создать функцию',
                  md: `**Объявление функции (function declaration):**
\`\`\`js
function add(a, b) {
  return a + b;
}
\`\`\`

**Функциональное выражение:**
\`\`\`js
const multiply = function (a, b) {
  return a * b;
};
\`\`\`

**Стрелочная функция (arrow function)** — современный короткий синтаксис:
\`\`\`js
const square = (x) => x * x;            // одно выражение — return неявный
const greet = (name) => {
  const text = \`Привет, \${name}!\`;
  return text;
};
const sayHi = () => console.log("Hi");  // без параметров
\`\`\`

**Параметры по умолчанию и rest-параметры:**
\`\`\`js
function power(base, exp = 2) { return base ** exp; }
function sum(...nums) { return nums.reduce((a, b) => a + b, 0); }
\`\`\`

**Функции — это значения.** Их можно передавать в другие функции (**колбэки**):
\`\`\`js
function repeat(n, action) {
  for (let i = 0; i < n; i++) action(i);
}
repeat(3, (i) => console.log("шаг", i));
\`\`\`

> ⚠️ Функция без \`return\` возвращает \`undefined\`.`,
                },
                { kind: 'predict', topic: 'functions', lang: 'js', code: 'const double = (x) => x * 2;\nconst addOne = (x) => x + 1;\nconsole.log(double(addOne(4)));\nconsole.log(addOne(double(4)));', answer: '10\n9', explain: 'double(5) = 10; addOne(8) = 9. Порядок вызова важен.' },
                { kind: 'match', topic: 'functions', prompt: 'Сопоставь запись и её смысл', pairs: [['(x) => x * 2', 'Стрелочная функция с неявным return'], ['function f() {}', 'Объявление функции'], ['(...args) => args', 'Rest-параметры'], ['(a, b = 1) => a + b', 'Параметр по умолчанию']] },
                { kind: 'fixbug', topic: 'functions', lang: 'js', prompt: 'Функция должна возвращать площадь прямоугольника, но выводится `undefined`. Исправь.', code: 'const area = (w, h) => {\n  w * h;\n};\nconsole.log(area(3, 4));', tests: [{ expected: '12' }], hints: ['В стрелочной функции с фигурными скобками return не добавляется автоматически.', 'Либо добавь `return`, либо убери фигурные скобки: `(w, h) => w * h`.'], solution: 'const area = (w, h) => w * h;\nconsole.log(area(3, 4));' },
                { kind: 'code', topic: 'functions', lang: 'js', prompt: 'Напиши функцию `applyTwice(fn, x)`, которая применяет функцию `fn` к `x` дважды: `applyTwice(n => n + 3, 1)` → 7.', starter: 'function applyTwice(fn, x) {\n  \n}\n', tests: [{ expr: 'applyTwice(n => n + 3, 1)', expected: '7' }, { expr: 'applyTwice(n => n * n, 3)', expected: '81' }, { expr: 'applyTwice(s => s + "!", "Hi")', expected: '"Hi!!"' }], hints: ['Сначала `fn(x)`, затем снова `fn` от результата.', '`return fn(fn(x));`'], solution: 'function applyTwice(fn, x) {\n  return fn(fn(x));\n}' },
              ],
            },
            {
              id: 'js-closures',
              title: 'Область видимости и замыкания',
              minutes: 11,
              steps: [
                {
                  kind: 'theory',
                  topic: 'scope',
                  title: 'Где «живут» переменные',
                  md: `**Блочная область видимости.** Переменные \`let\` и \`const\` видны только внутри блока \`{ ... }\`, где объявлены:

\`\`\`js
if (true) {
  const secret = 42;
}
console.log(secret); // ReferenceError
\`\`\`

Внутренние блоки и функции видят переменные внешних — это **цепочка областей видимости**.

**Замыкание (closure)** — функция «запоминает» переменные из места, где была создана, даже когда внешняя функция уже завершилась:

\`\`\`js
function makeCounter() {
  let count = 0;              // «спрятанная» переменная
  return () => {
    count++;
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
const other = makeCounter();
other();   // 1 — у каждого счётчика свой count
\`\`\`

Замыкания используют повсюду: обработчики событий, приватные данные, фабрики функций, хуки в React.`,
                },
                { kind: 'predict', topic: 'scope', lang: 'js', code: 'function makeAdder(n) {\n  return (x) => x + n;\n}\nconst add5 = makeAdder(5);\nconst add10 = makeAdder(10);\nconsole.log(add5(1), add10(1));', answer: '6 11', explain: 'Каждая возвращённая функция помнит своё значение n.' },
                { kind: 'predict', topic: 'scope', lang: 'js', code: 'let x = "глобальная";\nfunction show() {\n  let x = "локальная";\n  console.log(x);\n}\nshow();\nconsole.log(x);', answer: 'локальная\nглобальная', explain: 'Внутри функции своя x затеняет внешнюю. Снаружи — глобальная.' },
                { kind: 'quiz', topic: 'scope', question: 'Что такое замыкание?', options: ['Функция вместе с переменными из окружения, где она создана', 'Закрытие вкладки браузера', 'Функция без параметров', 'Ошибка в цикле'], answer: 0, explain: 'Функция «замыкает» в себе доступ к внешним переменным.' },
                { kind: 'code', topic: 'scope', lang: 'js', prompt: 'Напиши `createWallet(start)`, возвращающую объект с методами `add(n)`, `spend(n)` и `balance()`. Баланс хранится в замыкании; `spend` не даёт уйти в минус (просто ничего не делает).', starter: 'function createWallet(start) {\n  \n}\n', tests: [{ expr: '(() => { const w = createWallet(100); w.add(50); w.spend(30); return w.balance(); })()', expected: '120' }, { expr: '(() => { const w = createWallet(10); w.spend(50); return w.balance(); })()', expected: '10' }, { expr: '(() => { const a = createWallet(1); const b = createWallet(2); a.add(5); return [a.balance(), b.balance()]; })()', expected: '[6, 2]' }], hints: ['Внутри функции: `let money = start;`', 'Верни объект: `return { add: (n) => { money += n; }, ... }`.', 'В spend: `if (n <= money) money -= n;`'], solution: 'function createWallet(start) {\n  let money = start;\n  return {\n    add: (n) => { money += n; },\n    spend: (n) => { if (n <= money) money -= n; },\n    balance: () => money,\n  };\n}' },
              ],
            },
          ],
        },
        {
          id: 'js-core-2',
          title: 'Массивы и объекты',
          lessons: [
            {
              id: 'js-arrays',
              title: 'Массивы',
              minutes: 11,
              steps: [
                {
                  kind: 'theory',
                  topic: 'arrays',
                  title: 'Упорядоченные коллекции',
                  md: `\`\`\`js
const fruits = ["яблоко", "банан", "киви"];
console.log(fruits[0]);       // "яблоко"
console.log(fruits.length);   // 3
fruits[1] = "манго";          // замена (const не мешает менять содержимое!)
\`\`\`

| Метод | Действие |
|---|---|
| \`push(x)\` / \`pop()\` | добавить / убрать в конце |
| \`unshift(x)\` / \`shift()\` | добавить / убрать в начале |
| \`includes(x)\` | есть ли элемент |
| \`indexOf(x)\` | индекс (или -1) |
| \`slice(a, b)\` | копия части |
| \`splice(i, n)\` | удалить n элементов с позиции i |
| \`concat(arr)\` / \`[...a, ...b]\` | объединить |
| \`join(sep)\` | склеить в строку |
| \`reverse()\` | развернуть (меняет массив) |
| \`sort()\` | сортировка (меняет массив!) |

> ⚠️ \`[10, 9, 1].sort()\` → \`[1, 10, 9]\` — по умолчанию сортирует как строки! Для чисел: \`.sort((a, b) => a - b)\`.

**Ссылки:** массив — объект. \`const b = a\` не копирует массив. Копия: \`const b = [...a]\`.

**Деструктуризация:**
\`\`\`js
const [first, second, ...rest] = [1, 2, 3, 4];
\`\`\``,
                },
                { kind: 'predict', topic: 'arrays', lang: 'js', code: 'const a = [3, 1, 2];\nconst b = a;\nb.push(4);\nconsole.log(a.length);\nconsole.log([10, 9, 1].sort());', answer: '4\n[1, 10, 9]', explain: 'a и b — один массив. sort() без функции сравнивает как строки: "1" < "10" < "9".' },
                { kind: 'match', topic: 'arrays', prompt: 'Метод и что он делает', pairs: [['push', 'Добавить в конец'], ['shift', 'Удалить первый элемент'], ['includes', 'Проверить наличие'], ['splice', 'Удалить/вставить по индексу']] },
                { kind: 'code', topic: 'arrays', lang: 'js', prompt: 'Напиши функцию `secondLargest(arr)`, возвращающую второе по величине **уникальное** число массива (массив содержит минимум 2 разных числа).', starter: 'function secondLargest(arr) {\n  \n}\n', tests: [{ expr: 'secondLargest([4, 1, 7, 3])', expected: '4' }, { expr: 'secondLargest([5, 5, 2])', expected: '2' }, { expr: 'secondLargest([-1, -5, -3])', expected: '-3' }], hints: ['Убери дубликаты: `[...new Set(arr)]`.', 'Отсортируй по убыванию: `.sort((a, b) => b - a)` и возьми элемент [1].'], solution: 'function secondLargest(arr) {\n  const unique = [...new Set(arr)].sort((a, b) => b - a);\n  return unique[1];\n}' },
              ],
            },
            {
              id: 'js-array-methods',
              title: 'map, filter, reduce, find',
              minutes: 12,
              steps: [
                {
                  kind: 'theory',
                  topic: 'arrays',
                  title: 'Функциональные методы массивов',
                  md: `Эти методы принимают **функцию** и не меняют исходный массив:

\`\`\`js
const nums = [1, 2, 3, 4, 5];

nums.map((n) => n * 2);          // [2, 4, 6, 8, 10]   — преобразовать каждый
nums.filter((n) => n % 2 === 0); // [2, 4]              — оставить подходящие
nums.reduce((acc, n) => acc + n, 0); // 15             — свернуть в одно значение
nums.find((n) => n > 3);         // 4                   — первый подходящий
nums.findIndex((n) => n > 3);    // 3
nums.some((n) => n > 4);         // true  — хотя бы один
nums.every((n) => n > 0);        // true  — все
nums.forEach((n) => console.log(n)); // просто перебрать
\`\`\`

**Цепочки:**
\`\`\`js
const users = [
  { name: "Аня", age: 17, active: true },
  { name: "Боря", age: 22, active: false },
  { name: "Вика", age: 19, active: true },
];
const names = users
  .filter((u) => u.active)
  .map((u) => u.name.toUpperCase());   // ["АНЯ", "ВИКА"]
\`\`\`

**reduce** — самый мощный: аккумулятор \`acc\` проходит через все элементы. Им можно посчитать сумму, максимум, сгруппировать данные в объект и т.д.`,
                },
                { kind: 'animation', topic: 'arrays', title: 'Как работает reduce', anim: { lang: 'js', code: 'const total = [5, 10, 20].reduce(\n  (acc, n) => acc + n,\n  0\n);', width: 420, height: 160, frames: [
                  { caption: 'Начальное значение аккумулятора acc = 0', line: 3, boxes: [{ id: 'acc', label: 'acc', value: '0', x: 30, y: 40, color: 'green', highlight: true }, { id: 'n', label: 'n', value: '—', x: 230, y: 40, color: 'gray' }] },
                  { caption: 'n = 5 → acc = 0 + 5 = 5', line: 2, boxes: [{ id: 'acc', label: 'acc', value: '5', x: 30, y: 40, color: 'green', highlight: true }, { id: 'n', label: 'n', value: '5', x: 230, y: 40, color: 'blue' }] },
                  { caption: 'n = 10 → acc = 5 + 10 = 15', line: 2, boxes: [{ id: 'acc', label: 'acc', value: '15', x: 30, y: 40, color: 'green', highlight: true }, { id: 'n', label: 'n', value: '10', x: 230, y: 40, color: 'blue' }] },
                  { caption: 'n = 20 → acc = 15 + 20 = 35. Это и есть результат reduce.', line: 2, boxes: [{ id: 'acc', label: 'total', value: '35', x: 30, y: 40, color: 'yellow', highlight: true }, { id: 'n', label: 'n', value: '20', x: 230, y: 40, color: 'blue' }] },
                ] } },
                { kind: 'predict', topic: 'arrays', lang: 'js', code: 'const words = ["кот", "собака", "ёж", "попугай"];\nconst result = words.filter((w) => w.length > 2).map((w) => w.length);\nconsole.log(result);', answer: '[3, 6, 7]', explain: 'filter убирает «ёж», map превращает слова в их длины.' },
                { kind: 'match', topic: 'arrays', prompt: 'Какой метод нужен?', pairs: [['Получить цены со скидкой', 'map'], ['Оставить только товары в наличии', 'filter'], ['Посчитать сумму корзины', 'reduce'], ['Найти товар по id', 'find']] },
                { kind: 'code', topic: 'arrays', lang: 'js', prompt: 'Дан массив заказов. Напиши функцию `totalPaid(orders)`, возвращающую **сумму** `amount` только у заказов со статусом `"paid"`.', starter: 'function totalPaid(orders) {\n  \n}\n', tests: [{ expr: 'totalPaid([{amount: 100, status: "paid"}, {amount: 50, status: "new"}, {amount: 30, status: "paid"}])', expected: '130' }, { expr: 'totalPaid([])', expected: '0' }], hints: ['Сначала `filter` по статусу.', 'Затем `reduce((sum, o) => sum + o.amount, 0)`.'], solution: 'function totalPaid(orders) {\n  return orders\n    .filter((o) => o.status === "paid")\n    .reduce((sum, o) => sum + o.amount, 0);\n}' },
                { kind: 'code', topic: 'arrays', lang: 'js', prompt: 'Напиши `groupByFirstLetter(words)`, возвращающую объект: первая буква → массив слов. `["арбуз", "банан", "абрикос"]` → `{а: ["арбуз", "абрикос"], б: ["банан"]}`.', starter: 'function groupByFirstLetter(words) {\n  \n}\n', tests: [{ expr: 'groupByFirstLetter(["арбуз", "банан", "абрикос"])', expected: '{"а": ["арбуз", "абрикос"], "б": ["банан"]}' }, { expr: 'groupByFirstLetter([])', expected: '{}' }], hints: ['Используй `reduce` с начальным значением `{}`.', 'Внутри: `const k = w[0]; (acc[k] ??= []).push(w); return acc;`'], solution: 'function groupByFirstLetter(words) {\n  return words.reduce((acc, w) => {\n    const k = w[0];\n    (acc[k] ??= []).push(w);\n    return acc;\n  }, {});\n}' },
              ],
            },
            {
              id: 'js-objects',
              title: 'Объекты, деструктуризация, spread',
              minutes: 12,
              steps: [
                {
                  kind: 'theory',
                  topic: 'objects',
                  title: 'Объект — набор свойств',
                  md: `\`\`\`js
const user = {
  name: "Аня",
  age: 17,
  skills: ["JS", "CSS"],
  greet() {                       // метод
    return \`Привет, я \${this.name}\`;
  },
};

user.age = 18;                    // изменить
user.city = "Казань";             // добавить
delete user.skills;               // удалить
console.log(user["name"]);        // доступ через скобки (для динамических ключей)
console.log(user.greet());
\`\`\`

**this** внутри метода — объект, у которого вызван метод.

**Перебор:** \`Object.keys(obj)\`, \`Object.values(obj)\`, \`Object.entries(obj)\`.

**Деструктуризация** — достать свойства в переменные:
\`\`\`js
const { name, age, city = "неизвестно" } = user;
\`\`\`

**Spread** — скопировать и дополнить:
\`\`\`js
const updated = { ...user, age: 19 };   // новый объект, исходный не меняется
const merged = { ...defaults, ...options };
\`\`\`

**Короткая запись:** \`const x = 1; const p = { x };\` → \`{ x: 1 }\`.

> 🧠 Объекты, как и массивы, передаются **по ссылке**. Сравнение \`{} === {}\` — \`false\`: это два разных объекта.`,
                },
                { kind: 'predict', topic: 'objects', lang: 'js', code: 'const car = { brand: "Lada", year: 2015 };\nconst copy = { ...car, year: 2020 };\nconst { brand, year } = car;\nconsole.log(brand, year, copy.year);', answer: 'Lada 2015 2020', explain: 'spread создаёт новый объект; исходный car не изменился.' },
                { kind: 'predict', topic: 'objects', lang: 'js', code: 'const prices = { хлеб: 50, сыр: 400, чай: 150 };\nlet sum = 0;\nfor (const [item, price] of Object.entries(prices)) {\n  if (price > 100) sum += price;\n}\nconsole.log(sum);', answer: '550', explain: 'Сыр 400 + чай 150 = 550.' },
                { kind: 'quiz', topic: 'objects', question: 'Что выведет `console.log({ a: 1 } === { a: 1 })`?', options: ['false', 'true', 'undefined', 'Ошибка'], answer: 0, explain: 'Сравниваются ссылки. Это два разных объекта в памяти.' },
                { kind: 'code', topic: 'objects', lang: 'js', prompt: 'Напиши функцию `invert(obj)`, меняющую местами ключи и значения: `{a: "x", b: "y"}` → `{x: "a", y: "b"}`.', starter: 'function invert(obj) {\n  \n}\n', tests: [{ expr: 'invert({a: "x", b: "y"})', expected: '{"x": "a", "y": "b"}' }, { expr: 'invert({})', expected: '{}' }], hints: ['`Object.entries(obj)` даёт пары [ключ, значение].', 'Создай новый объект и заполни: `result[value] = key`.', 'Или: `Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))`.'], solution: 'function invert(obj) {\n  const result = {};\n  for (const [k, v] of Object.entries(obj)) result[v] = k;\n  return result;\n}' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'js-advanced',
      title: 'Классы, ошибки, асинхронность, веб',
      chapters: [
        {
          id: 'js-adv-1',
          title: 'Классы и ошибки',
          lessons: [
            {
              id: 'js-classes',
              title: 'Классы в JavaScript',
              minutes: 11,
              steps: [
                {
                  kind: 'theory',
                  topic: 'classes',
                  title: 'class, constructor, extends',
                  md: `\`\`\`js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return \`\${this.name} издаёт звук\`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);              // вызвать конструктор родителя
    this.breed = breed;
  }
  speak() {                   // переопределение
    return \`\${this.name}: Гав!\`;
  }
}

const rex = new Dog("Рекс", "овчарка");
console.log(rex.speak());
console.log(rex instanceof Animal); // true
\`\`\`

- \`new\` создаёт объект и вызывает \`constructor\`.
- \`extends\` — наследование, \`super\` — обращение к родителю.
- **Геттеры/сеттеры:** \`get area() { ... }\` — читается как свойство: \`rect.area\`.
- **Статические методы:** \`static create() {}\` — вызываются у класса: \`User.create()\`.
- **Приватные поля:** \`#balance = 0;\` — недоступны снаружи класса.`,
                },
                { kind: 'example', topic: 'classes', lang: 'js', code: 'class Rectangle {\n  #id = Math.floor(Math.random() * 1000);\n  constructor(w, h) {\n    this.w = w;\n    this.h = h;\n  }\n  get area() {\n    return this.w * this.h;\n  }\n  static square(side) {\n    return new Rectangle(side, side);\n  }\n}\n\nconst r = new Rectangle(3, 4);\nconsole.log(r.area);\nconsole.log(Rectangle.square(5).area);' },
                { kind: 'predict', topic: 'classes', lang: 'js', code: 'class Counter {\n  constructor() { this.n = 0; }\n  inc() { this.n++; return this; }\n}\nconst c = new Counter();\nc.inc().inc().inc();\nconsole.log(c.n);', answer: '3', explain: 'inc возвращает this, поэтому вызовы можно связывать в цепочку.' },
                { kind: 'code', topic: 'classes', lang: 'js', prompt: 'Создай класс `Stack` с методами `push(x)`, `pop()` (возвращает и удаляет верхний элемент, или `undefined` если пусто), `peek()` и геттером `size`.', starter: 'class Stack {\n  \n}\n', tests: [{ expr: '(() => { const s = new Stack(); s.push(1); s.push(2); return [s.pop(), s.size, s.peek()]; })()', expected: '[2, 1, 1]' }, { expr: 'new Stack().pop() === undefined', expected: 'true' }], hints: ['Храни элементы в массиве: `this.items = []` в конструкторе.', '`get size() { return this.items.length; }`', 'peek — `this.items.at(-1)`.'], solution: 'class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(x) {\n    this.items.push(x);\n  }\n  pop() {\n    return this.items.pop();\n  }\n  peek() {\n    return this.items.at(-1);\n  }\n  get size() {\n    return this.items.length;\n  }\n}' },
              ],
            },
            {
              id: 'js-errors',
              title: 'Ошибки: try, catch, throw',
              minutes: 8,
              steps: [
                {
                  kind: 'theory',
                  topic: 'errors',
                  title: 'Обработка исключений',
                  md: `\`\`\`js
try {
  const data = JSON.parse("{ это не json }");
} catch (error) {
  console.log("Не удалось разобрать:", error.message);
} finally {
  console.log("Выполнится всегда");
}
\`\`\`

**Свои ошибки** — \`throw\`:
\`\`\`js
function withdraw(balance, amount) {
  if (amount > balance) {
    throw new Error("Недостаточно средств");
  }
  return balance - amount;
}
\`\`\`

**Типы встроенных ошибок:** \`SyntaxError\`, \`ReferenceError\` (неизвестная переменная), \`TypeError\` (неверная операция с типом, например вызов не-функции), \`RangeError\`.

Можно создавать свои классы ошибок: \`class ValidationError extends Error {}\` и проверять \`error instanceof ValidationError\`.`,
                },
                { kind: 'predict', topic: 'errors', lang: 'js', code: 'function check(age) {\n  if (age < 0) throw new Error("Отрицательный возраст");\n  return "ок";\n}\ntry {\n  console.log(check(5));\n  console.log(check(-1));\n  console.log("сюда не дойдём");\n} catch (e) {\n  console.log(e.message);\n}', answer: 'ок\nОтрицательный возраст', explain: 'После throw выполнение прыгает сразу в catch.' },
                { kind: 'match', topic: 'errors', prompt: 'Какая ошибка возникнет?', pairs: [['undefinedVariable + 1', 'ReferenceError'], ['null.length', 'TypeError'], ['JSON.parse("{")', 'SyntaxError'], ['new Array(-1)', 'RangeError']] },
                { kind: 'code', topic: 'errors', lang: 'js', prompt: 'Напиши функцию `parseAge(str)`: возвращает число, если строка — целое от 0 до 150; иначе **бросает** ошибку `Error` с сообщением `"Некорректный возраст"`.', starter: 'function parseAge(str) {\n  \n}\n', tests: [{ expr: 'parseAge("25")', expected: '25' }, { expr: '(() => { try { parseAge("abc"); return "нет ошибки"; } catch (e) { return e.message; } })()', expected: '"Некорректный возраст"' }, { expr: '(() => { try { parseAge("200"); return "нет ошибки"; } catch (e) { return e.message; } })()', expected: '"Некорректный возраст"' }], hints: ['`const n = Number(str);`', 'Проверка: `Number.isInteger(n) && n >= 0 && n <= 150`.', 'Иначе `throw new Error("Некорректный возраст")`.'], solution: 'function parseAge(str) {\n  const n = Number(str);\n  if (!Number.isInteger(n) || n < 0 || n > 150) {\n    throw new Error("Некорректный возраст");\n  }\n  return n;\n}' },
              ],
            },
          ],
        },
        {
          id: 'js-adv-2',
          title: 'Асинхронность',
          lessons: [
            {
              id: 'js-async',
              title: 'setTimeout, Promise, async/await',
              minutes: 14,
              steps: [
                {
                  kind: 'theory',
                  topic: 'async',
                  title: 'Код, который ждёт',
                  md: `Многие операции занимают время: запрос к серверу, чтение файла, таймер. JavaScript не «замирает» в ожидании — он продолжает выполнять другой код, а результат обрабатывает потом. Это **асинхронность**.

**setTimeout** — выполнить функцию через N миллисекунд:
\`\`\`js
console.log("1");
setTimeout(() => console.log("2"), 1000);
console.log("3");
// Вывод: 1, 3, 2
\`\`\`

**Event loop (цикл событий):** сначала выполняется весь синхронный код, потом — колбэки из очереди (таймеры, ответы сети).

**Promise (обещание)** — объект «результат будет позже». Состояния: pending → fulfilled (успех) или rejected (ошибка).

\`\`\`js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
wait(500).then(() => console.log("прошло 0.5 с"));
\`\`\`

**async/await** — писать асинхронный код как обычный:
\`\`\`js
async function loadUser() {
  try {
    const res = await fetch("https://api.example.com/user/1");
    const user = await res.json();
    console.log(user.name);
  } catch (e) {
    console.log("Ошибка сети", e);
  }
}
\`\`\`

\`await\` ставит функцию «на паузу» до выполнения промиса, не блокируя остальную программу. **Promise.all([...])** ждёт несколько промисов параллельно.`,
                },
                { kind: 'animation', topic: 'async', title: 'Event loop', anim: { lang: 'js', code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");', width: 520, height: 200, frames: [
                  { caption: 'Выполняется console.log("A") — сразу выводит A.', line: 1, boxes: [{ id: 'stack', label: 'Стек вызовов', value: 'log("A")', x: 20, y: 30, w: 150, color: 'purple', highlight: true }, { id: 'queue', label: 'Очередь задач', value: '—', x: 190, y: 30, w: 150, color: 'gray' }, { id: 'out', label: 'Вывод', value: 'A', x: 360, y: 30, w: 140, color: 'green' }] },
                  { caption: 'setTimeout регистрирует колбэк. Даже с задержкой 0 он попадает в ОЧЕРЕДЬ, а не выполняется сразу.', line: 2, boxes: [{ id: 'stack', label: 'Стек вызовов', value: 'setTimeout', x: 20, y: 30, w: 150, color: 'purple' }, { id: 'queue', label: 'Очередь задач', value: '() => log("B")', x: 190, y: 30, w: 150, color: 'yellow', highlight: true }, { id: 'out', label: 'Вывод', value: 'A', x: 360, y: 30, w: 140, color: 'green' }], arrows: [{ from: 'stack', to: 'queue' }] },
                  { caption: 'Синхронный код продолжается: выводится C.', line: 3, boxes: [{ id: 'stack', label: 'Стек вызовов', value: 'log("C")', x: 20, y: 30, w: 150, color: 'purple', highlight: true }, { id: 'queue', label: 'Очередь задач', value: '() => log("B")', x: 190, y: 30, w: 150, color: 'yellow' }, { id: 'out', label: 'Вывод', value: 'A C', x: 360, y: 30, w: 140, color: 'green' }] },
                  { caption: 'Стек пуст → event loop берёт задачу из очереди. Выводится B. Итог: A C B.', line: 2, boxes: [{ id: 'stack', label: 'Стек вызовов', value: 'log("B")', x: 20, y: 30, w: 150, color: 'purple', highlight: true }, { id: 'queue', label: 'Очередь задач', value: '—', x: 190, y: 30, w: 150, color: 'gray' }, { id: 'out', label: 'Вывод', value: 'A C B', x: 360, y: 30, w: 140, color: 'green', highlight: true }], arrows: [{ from: 'queue', to: 'stack', label: 'event loop' }] },
                ] } },
                { kind: 'predict', topic: 'async', lang: 'js', code: 'console.log("старт");\nsetTimeout(() => console.log("таймер"), 0);\nPromise.resolve().then(() => console.log("промис"));\nconsole.log("конец");', answer: 'старт\nконец\nпромис\nтаймер', explain: 'Сначала синхронный код. Затем микрозадачи (промисы) — они приоритетнее макрозадач (таймеров).' },
                { kind: 'example', topic: 'async', lang: 'js', code: 'const wait = (ms) => new Promise((r) => setTimeout(r, ms));\n\nasync function race() {\n  console.log("На старт…");\n  await wait(300);\n  console.log("Внимание…");\n  await wait(300);\n  console.log("Марш! 🏁");\n  const results = await Promise.all([wait(100).then(() => "🐢"), wait(50).then(() => "🐇")]);\n  console.log("Финишировали:", results.join(" "));\n}\n\nrace();' },
                { kind: 'quiz', topic: 'async', question: 'Что делает `await`?', options: ['Ждёт завершения промиса внутри async-функции, не блокируя программу', 'Останавливает весь браузер', 'Создаёт новый поток', 'Повторяет запрос'], answer: 0, explain: 'await приостанавливает только текущую async-функцию.' },
                { kind: 'code', topic: 'async', lang: 'js', prompt: 'Напиши async-функцию `delayedSum(a, b, ms)`, которая через `ms` миллисекунд возвращает `a + b`. Затем вызови `delayedSum(2, 3, 100)` и выведи результат через `console.log`.', starter: 'const wait = (ms) => new Promise((r) => setTimeout(r, ms));\n\nasync function delayedSum(a, b, ms) {\n  \n}\n', tests: [{ expected: '5' }], hints: ['Внутри: `await wait(ms); return a + b;`', 'Вызов: `delayedSum(2, 3, 100).then(console.log)` или `console.log(await delayedSum(2, 3, 100))`.'], solution: 'const wait = (ms) => new Promise((r) => setTimeout(r, ms));\n\nasync function delayedSum(a, b, ms) {\n  await wait(ms);\n  return a + b;\n}\n\nconsole.log(await delayedSum(2, 3, 100));' },
              ],
            },
          ],
        },
        {
          id: 'js-adv-3',
          title: 'Веб-страницы: HTML, CSS, DOM',
          lessons: [
            {
              id: 'js-dom',
              title: 'HTML, CSS и DOM: оживляем страницу',
              minutes: 14,
              steps: [
                {
                  kind: 'theory',
                  topic: 'dom',
                  title: 'Три кита веба',
                  md: `Любой сайт состоит из трёх частей:
- **HTML** — структура (заголовки, абзацы, кнопки, картинки);
- **CSS** — оформление (цвета, шрифты, расположение, анимации);
- **JavaScript** — поведение (реакция на клики, данные с сервера).

\`\`\`html
<!doctype html>
<html>
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1 id="title">Счётчик</h1>
  <button class="btn">Нажми</button>
  <p id="out">0</p>
  <script src="script.js"></script>
</body>
</html>
\`\`\`

\`\`\`css
.btn { background: #7c5cff; color: white; padding: 8px 16px; border-radius: 8px; }
\`\`\`

**DOM** (Document Object Model) — браузер превращает HTML в дерево объектов, которым JS может управлять:

\`\`\`js
const btn = document.querySelector(".btn");    // найти элемент
const out = document.getElementById("out");
let count = 0;

btn.addEventListener("click", () => {          // подписаться на событие
  count++;
  out.textContent = count;                       // изменить текст
  out.style.color = count > 5 ? "red" : "black"; // изменить стиль
});

const li = document.createElement("li");       // создать элемент
li.textContent = "Новый пункт";
document.body.append(li);                      // добавить на страницу
\`\`\`

**События:** \`click\`, \`input\`, \`submit\`, \`keydown\`, \`mouseover\`, \`load\`…

> 💡 Попробуй в [IDE](#/ide?file=/home/student/projects/site/index.html): открой \`projects/site/index.html\` и нажми «Предпросмотр» — там готовый сайт с кнопкой.`,
                },
                { kind: 'match', topic: 'dom', prompt: 'Что за что отвечает?', pairs: [['HTML', 'Структура страницы'], ['CSS', 'Внешний вид'], ['JavaScript', 'Поведение и логика'], ['DOM', 'Дерево объектов страницы для JS']] },
                { kind: 'order', topic: 'dom', lang: 'js', prompt: 'Собери обработчик: при клике на кнопку #hello выводится приветствие в абзац #msg', lines: ['const btn = document.querySelector("#hello");', 'const msg = document.querySelector("#msg");', 'btn.addEventListener("click", () => {', '  msg.textContent = "Привет!";', '});'] },
                { kind: 'quiz', topic: 'dom', question: 'Как найти первый элемент с классом `card`?', options: ['document.querySelector(".card")', 'document.getElementById("card")', 'document.find("card")', 'document.querySelector("card")'], answer: 0, explain: 'Точка перед именем — CSS-селектор класса. `#` — для id.' },
                { kind: 'quiz', topic: 'dom', question: 'Чем `textContent` безопаснее `innerHTML` при выводе текста от пользователя?', options: ['textContent не выполняет HTML/скрипты из строки', 'textContent быстрее печатает', 'innerHTML не существует', 'Разницы нет'], answer: 0, explain: 'innerHTML с данными пользователя открывает дыру XSS — злоумышленник может внедрить скрипт.' },
                { kind: 'fill', topic: 'dom', lang: 'js', prompt: 'Допиши код: при вводе текста в поле `#name` он сразу показывается в `#preview`', template: 'const input = document.querySelector("#name");\nconst preview = document.querySelector("#preview");\ninput.addEventListener("___", () => {\n  preview.___ = input.value;\n});', answers: [['input'], ['textContent', 'innerText']] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'js-eco',
      title: 'Экосистема JavaScript (дорожная карта)',
      chapters: [
        { id: 'js-ts', title: 'TypeScript', lessons: [], planned: ['Зачем типы', 'Базовые типы и интерфейсы', 'Generics', 'Типизация функций и объектов', 'Настройка tsconfig'] },
        { id: 'js-tools', title: 'npm, Vite, Bun', lessons: [], planned: ['package.json и зависимости', 'Модули ES (import/export)', 'Сборщик Vite', 'Bun — быстрая среда выполнения', 'Линтеры и форматирование'] },
        { id: 'js-canvas', title: 'Canvas, WebGL и Three.js', lessons: [], planned: ['Рисование на Canvas', 'Игровой цикл requestAnimationFrame', 'Столкновения и физика', 'WebGL: основы шейдеров', 'Three.js: 3D-сцены', 'Проект: 3D-галерея'] },
        { id: 'js-react', title: 'React', lessons: [], planned: ['Компоненты и JSX', 'Props и state', 'Хуки useState, useEffect', 'Списки и формы', 'Маршрутизация', 'Управление состоянием', 'Проект: менеджер задач'] },
        { id: 'js-next', title: 'Next.js', lessons: [], planned: ['Файловая маршрутизация', 'SSR и SSG', 'Server Components', 'API-маршруты', 'Деплой на Vercel'] },
        { id: 'js-node', title: 'Node.js и Express', lessons: [], planned: ['Модули Node, fs, path', 'HTTP-сервер', 'Express: маршруты и middleware', 'REST API', 'Работа с базой данных', 'Проект: API блога'] },
        { id: 'js-realtime', title: 'WebSocket и WebRTC', lessons: [], planned: ['WebSocket: чат в реальном времени', 'Socket.IO', 'WebRTC: видеозвонки peer-to-peer'] },
        { id: 'js-auth', title: 'Безопасность: JWT и OAuth', lessons: [], planned: ['Хеширование паролей', 'Сессии и cookies', 'JWT', 'OAuth 2.0 и «Войти через GitHub»', 'Основы безопасности веба (XSS, CSRF)'] },
        { id: 'js-api', title: 'REST и GraphQL', lessons: [], planned: ['Проектирование REST API', 'fetch и обработка ошибок', 'GraphQL: схемы и запросы', 'Apollo Client'] },
        { id: 'js-pwa', title: 'PWA, Service Workers, IndexedDB', lessons: [], planned: ['Service Worker и офлайн-режим', 'Манифест и установка приложения', 'IndexedDB', 'Push-уведомления'] },
        { id: 'js-desktop', title: 'Electron', lessons: [], planned: ['Главный и рендер-процессы', 'Окна и меню', 'Доступ к файловой системе', 'Сборка под Windows, macOS, Linux'] },
        { id: 'js-devops', title: 'Docker и CI/CD', lessons: [], planned: ['Контейнеры и образы', 'Dockerfile для Node-приложения', 'docker-compose', 'GitHub Actions: тесты и деплой'] },
      ],
    },
  ],
};
