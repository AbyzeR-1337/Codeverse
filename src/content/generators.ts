// Процедурные генераторы заданий: бесконечная тренировка, Quick Time Events и мини-игры.
// Каждый вызов создаёт новое задание со случайными числами, поэтому выучить ответы наизусть нельзя.
import type { Lang } from './types';

export interface GenQuestion {
  question: string;
  code?: string;
  lang?: Lang;
  options: string[];
  answer: number;
  seconds: number;
  topic: string;
  explain: string;
}

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
function shuffleOptions(correct: string, wrong: string[]): { options: string[]; answer: number } {
  const uniq = [...new Set(wrong.filter((w) => w !== correct))].slice(0, 3);
  const options = [...uniq, correct].sort(() => Math.random() - 0.5);
  return { options, answer: options.indexOf(correct) };
}
const near = (n: number) => [n + 1, n - 1, n + 2, n * 2, n - 2].map(String);

type Gen = (lang: Lang) => GenQuestion;

const genArithmetic: Gen = (lang) => {
  const a = rnd(2, 9);
  const b = rnd(2, 9);
  const c = rnd(1, 9);
  const forms: [string, number][] = [
    [`${a} + ${b} * ${c}`, a + b * c],
    [`(${a} + ${b}) * ${c}`, (a + b) * c],
    [`${a * b} / ${b} - ${c}`, a - c],
    [`${a} * ${b} % ${c + 1}`, (a * b) % (c + 1)],
    [`${a} ** 2 - ${b}`, a ** 2 - b],
  ];
  const [expr, val] = pick(forms);
  const shown = lang === 'python' && expr.includes('/') ? `${val}.0` : String(val);
  const code = lang === 'js' ? `console.log(${expr});` : `print(${expr})`;
  return { question: 'Какой будет вывод программы?', code, lang, ...shuffleOptions(shown, near(val).concat(String(a + b + c))), seconds: 10, topic: 'math', explain: `Сначала **, затем * / %, потом + -. Скобки меняют порядок. Ответ: ${shown}` };
};

const genLoopCount: Gen = (lang) => {
  const start = rnd(0, 3);
  const end = rnd(start + 2, start + 7);
  const step = pick([1, 1, 2]);
  const count = Math.ceil((end - start) / step);
  const code = lang === 'js' ? `let count = 0;\nfor (let i = ${start}; i < ${end}; i += ${step}) {\n  count++;\n}\nconsole.log(count);` : `count = 0\nfor i in range(${start}, ${end}${step !== 1 ? `, ${step}` : ''}):\n    count += 1\nprint(count)`;
  return { question: 'Сколько раз выполнится тело цикла? Что выведется?', code, lang, ...shuffleOptions(String(count), near(count)), seconds: 12, topic: 'loops', explain: `i принимает значения от ${start} до ${end - 1} с шагом ${step}: всего ${count}.` };
};

const genStringIndex: Gen = (lang) => {
  const word = pick(['python', 'coding', 'banana', 'kotlin', 'matrix', 'planet']);
  const i = rnd(0, word.length - 1);
  const code = lang === 'js' ? `const s = "${word}";\nconsole.log(s[${i}]);` : `s = "${word}"\nprint(s[${i}])`;
  const wrong = [word[i + 1], word[i - 1], word[Math.max(0, i - 2)], word[0]].filter(Boolean) as string[];
  return { question: 'Индексы начинаются с 0. Что выведет код?', code, lang, ...shuffleOptions(word[i], wrong), seconds: 9, topic: 'strings', explain: `s[${i}] — это ${i + 1}-й символ: «${word[i]}».` };
};

const genCondition: Gen = (lang) => {
  const x = rnd(1, 20);
  const t = rnd(5, 15);
  const code = lang === 'js'
    ? `const x = ${x};\nif (x > ${t}) {\n  console.log("A");\n} else if (x === ${t}) {\n  console.log("B");\n} else {\n  console.log("C");\n}`
    : `x = ${x}\nif x > ${t}:\n    print("A")\nelif x == ${t}:\n    print("B")\nelse:\n    print("C")`;
  const ans = x > t ? 'A' : x === t ? 'B' : 'C';
  return { question: 'Какая ветка выполнится?', code, lang, ...shuffleOptions(ans, ['A', 'B', 'C', 'Ничего']), seconds: 8, topic: 'conditions', explain: `${x} ${x > t ? '>' : x === t ? '=' : '<'} ${t}, поэтому выводится ${ans}.` };
};

const genListOps: Gen = (lang) => {
  const arr = Array.from({ length: rnd(3, 5) }, () => rnd(1, 9));
  const v = rnd(1, 9);
  const variants = lang === 'js'
    ? [
        [`const a = [${arr}];\na.push(${v});\nconsole.log(a.length);`, String(arr.length + 1)],
        [`const a = [${arr}];\nconsole.log(a[a.length - 1]);`, String(arr.at(-1))],
        [`const a = [${arr}];\nconsole.log(a.indexOf(${arr[1]}));`, String(arr.indexOf(arr[1]))],
        [`const a = [${arr}];\na.pop();\nconsole.log(a.length);`, String(arr.length - 1)],
      ]
    : [
        [`a = [${arr.join(', ')}]\na.append(${v})\nprint(len(a))`, String(arr.length + 1)],
        [`a = [${arr.join(', ')}]\nprint(a[-1])`, String(arr.at(-1))],
        [`a = [${arr.join(', ')}]\nprint(sum(a))`, String(arr.reduce((x, y) => x + y, 0))],
        [`a = [${arr.join(', ')}]\nprint(max(a) - min(a))`, String(Math.max(...arr) - Math.min(...arr))],
      ];
  const [code, ans] = pick(variants);
  return { question: 'Что выведет программа?', code, lang, ...shuffleOptions(ans, near(Number(ans))), seconds: 10, topic: lang === 'js' ? 'arrays' : 'lists', explain: `Правильный ответ: ${ans}.` };
};

const genTypes: Gen = (lang) => {
  const items = lang === 'js'
    ? [
        ['typeof 42', 'number'], ['typeof "42"', 'string'], ['typeof true', 'boolean'], ['typeof undefined', 'undefined'],
        ['typeof null', 'object'], ['typeof []', 'object'], ['typeof {}', 'object'], ['typeof function(){}', 'function'],
        ['"5" + 3', '53'], ['"5" - 3', '2'], ['5 + 3 + "1"', '81'], ['"1" + 5 + 3', '153'], ['true + 1', '2'], ['[] + []', '""'],
      ]
    : [
        ['type(42).__name__', 'int'], ['type(4.2).__name__', 'float'], ['type("42").__name__', 'str'], ['type([]).__name__', 'list'],
        ['type({}).__name__', 'dict'], ['type(()).__name__', 'tuple'], ['type(True).__name__', 'bool'], ['type(None).__name__', 'NoneType'],
        ['"5" * 3', '555'], ['7 // 2', '3'], ['7 / 2', '3.5'], ['-7 // 2', '-4'], ['int("12") + 3', '15'], ['len("hello")', '5'],
      ];
  const [expr, ans] = pick(items);
  const all = items.map((x) => x[1]);
  return { question: 'Что получится?', code: lang === 'js' ? `console.log(${expr});` : `print(${expr})`, lang, ...shuffleOptions(ans, [...all].sort(() => Math.random() - 0.5)), seconds: 8, topic: 'types', explain: `${expr} → ${ans}` };
};

const genBuggyLine: Gen = (lang) => {
  const bugs = lang === 'js'
    ? [
        { code: ['const name = "Аня";', 'name = "Оля";', 'console.log(name);'], line: 2, why: 'Константу (const) нельзя переприсвоить.' },
        { code: ['const nums = [1, 2, 3];', 'for (let i = 0; i <= nums.length; i++) {', '  console.log(nums[i] * 2);', '}'], line: 2, why: '<= выходит за границу массива: нужно <.' },
        { code: ['function square(x) {', '  x * x;', '}', 'console.log(square(4));'], line: 2, why: 'Нет return — функция вернёт undefined.' },
        { code: ['let total = 0;', 'for (const n of [1, 2, 3]) {', '  total + n;', '}'], line: 3, why: 'Результат не сохраняется: нужно total += n.' },
        { code: ['const user = { name: "Ivan" };', 'console.log(user.Name.length);'], line: 2, why: 'Свойство называется name, а не Name → undefined.length — ошибка.' },
      ]
    : [
        { code: ['age = input("Возраст: ")', 'print(age + 1)'], line: 2, why: 'input() возвращает строку — нужно int(age).' },
        { code: ['nums = [1, 2, 3]', 'for i in range(len(nums) + 1):', '    print(nums[i])'], line: 2, why: 'range(len + 1) выходит за границу списка.' },
        { code: ['def greet(name)', '    print("Привет,", name)', 'greet("Оля")'], line: 1, why: 'После def нужно двоеточие.' },
        { code: ['x = 10', 'if x = 10:', '    print("десять")'], line: 2, why: 'Для сравнения нужно ==, а не =.' },
        { code: ['items = []', 'items.push(5)', 'print(items)'], line: 2, why: 'У списков Python метод append, а не push.' },
      ];
  const b = pick(bugs);
  return {
    question: 'Какая строка вызовет ошибку или баг?',
    code: b.code.map((l, i) => `${i + 1}  ${l}`).join('\n'),
    lang,
    ...shuffleOptions(`Строка ${b.line}`, b.code.map((_, i) => `Строка ${i + 1}`)),
    seconds: 8,
    topic: 'syntax',
    explain: b.why,
  };
};

const genCommand: Gen = () => {
  const items: [string, string, string[]][] = [
    ['Создать папку project', 'mkdir project', ['touch project', 'cd project', 'ls project']],
    ['Перейти на уровень выше', 'cd ..', ['cd ~', 'ls ..', 'pwd']],
    ['Показать содержимое файла notes.txt', 'cat notes.txt', ['ls notes.txt', 'touch notes.txt', 'rm notes.txt']],
    ['Сохранить снимок изменений в Git', 'git commit -m "msg"', ['git add .', 'git push', 'git status']],
    ['Добавить все изменения в индекс Git', 'git add .', ['git commit', 'git init', 'git log']],
    ['Создать новую ветку и перейти на неё', 'git checkout -b feature', ['git branch', 'git merge feature', 'git switch main']],
    ['Узнать, в какой папке ты находишься', 'pwd', ['ls', 'cd', 'whoami']],
    ['Установить пакет numpy', 'pip install numpy', ['npm install numpy', 'import numpy', 'git add numpy']],
  ];
  const [task, ans, wrong] = pick(items);
  return { question: `Выбери команду: ${task}`, ...shuffleOptions(ans, wrong), seconds: 8, topic: 'terminal', explain: `${ans} — ${task.toLowerCase()}.` };
};

const genBinary: Gen = () => {
  const n = rnd(1, 31);
  const bin = n.toString(2);
  return { question: `Чему равно число ${bin} из двоичной системы в десятичной?`, ...shuffleOptions(String(n), near(n)), seconds: 12, topic: 'binary', explain: `${bin}₂ = ${bin.split('').reverse().map((d, i) => (d === '1' ? 2 ** i : 0)).filter(Boolean).reverse().join(' + ')} = ${n}` };
};

const genPrecedence: Gen = (lang) => {
  const a = rnd(0, 1) === 1;
  const b = rnd(0, 1) === 1;
  const c = rnd(0, 1) === 1;
  const T = (v: boolean) => (lang === 'js' ? String(v) : v ? 'True' : 'False');
  const expr = lang === 'js' ? `${T(a)} || ${T(b)} && ${T(c)}` : `${T(a)} or ${T(b)} and ${T(c)}`;
  const val = a || (b && c);
  return { question: 'Какой оператор выполнится первым и каков результат?', code: lang === 'js' ? `console.log(${expr});` : `print(${expr})`, lang, ...shuffleOptions(`${T(val)} (сначала ${lang === 'js' ? '&&' : 'and'})`, [`${T(!val)} (сначала ${lang === 'js' ? '&&' : 'and'})`, `${T(val)} (сначала ${lang === 'js' ? '||' : 'or'})`, `${T(!val)} (слева направо)`]), seconds: 12, topic: 'logic', explain: `${lang === 'js' ? '&&' : 'and'} имеет больший приоритет, чем ${lang === 'js' ? '||' : 'or'}.` };
};

export const GENERATORS: Record<string, { title: string; gen: Gen; topics: string[] }> = {
  arithmetic: { title: 'Арифметика и приоритет', gen: genArithmetic, topics: ['math'] },
  loops: { title: 'Циклы', gen: genLoopCount, topics: ['loops'] },
  strings: { title: 'Строки и индексы', gen: genStringIndex, topics: ['strings'] },
  conditions: { title: 'Условия', gen: genCondition, topics: ['conditions'] },
  lists: { title: 'Списки и массивы', gen: genListOps, topics: ['lists', 'arrays'] },
  types: { title: 'Типы данных', gen: genTypes, topics: ['types', 'variables'] },
  bugs: { title: 'Найди ошибку', gen: genBuggyLine, topics: ['syntax', 'functions', 'errors'] },
  terminal: { title: 'Терминал и Git', gen: genCommand, topics: ['terminal', 'git', 'files'] },
  binary: { title: 'Двоичная система', gen: genBinary, topics: ['binary', 'computer', 'memory'] },
  logic: { title: 'Логика', gen: genPrecedence, topics: ['logic'] },
};

export function randomQuestion(lang: Lang, topics?: string[]): GenQuestion {
  const pool = Object.values(GENERATORS).filter((g) => !topics?.length || g.topics.some((t) => topics.includes(t)));
  return pick(pool.length ? pool : Object.values(GENERATORS)).gen(lang);
}

export function generatorForTopic(topic: string) {
  return Object.entries(GENERATORS).find(([, g]) => g.topics.includes(topic))?.[0];
}
