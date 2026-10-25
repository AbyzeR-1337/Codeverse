// Локальный «ИИ-помощник»: объясняет ошибки простыми словами и находит типичные проблемы в коде.
// Работает без интернета. Если в настройках указан ключ Claude, помощник дополнительно отвечает через API.
import type { Lang } from '../content/types';

export interface Explanation {
  title: string;
  simple: string;
  fix: string[];
  topic: string;
}

interface Rule {
  re: RegExp;
  lang?: Lang;
  make: (m: RegExpMatchArray) => Explanation;
}

const RULES: Rule[] = [
  // ─── Python ───
  { re: /NameError: name '(\w+)' is not defined/, lang: 'python', make: (m) => ({ title: `Python не знает, что такое «${m[1]}»`, simple: `Ты используешь имя «${m[1]}», но оно нигде не было создано до этой строки. Python читает программу сверху вниз и знает только то, что уже определено.`, fix: [`Проверь опечатку: может быть, переменная называется чуть иначе (регистр букв важен: Name ≠ name).`, `Убедись, что переменная «${m[1]}» получает значение выше по коду.`, `Если это текст, возьми его в кавычки: "${m[1]}".`, `Если это функция из модуля — добавь import.`], topic: 'variables' }) },
  { re: /IndentationError: (expected an indented block|unexpected indent|unindent does not match)/, lang: 'python', make: (m) => ({ title: 'Ошибка отступов', simple: m[1].startsWith('expected') ? 'После строки с двоеточием (if, for, def, while…) Python ждёт блок кода с отступом — а его нет.' : 'Отступы в Python — это часть синтаксиса. Здесь отступ стоит там, где его быть не должно, или не совпадает с соседними строками.', fix: ['Используй 4 пробела на каждый уровень вложенности.', 'Не смешивай пробелы и табуляцию.', 'Все строки одного блока должны начинаться с одинакового отступа.'], topic: 'syntax' }) },
  { re: /TabError/, lang: 'python', make: () => ({ title: 'Смешаны пробелы и табы', simple: 'В одном блоке отступы сделаны то пробелами, то табуляцией. Python так не умеет.', fix: ['Замени все табы на 4 пробела (кнопка «Форматировать» сделает это).'], topic: 'syntax' }) },
  { re: /SyntaxError: (?:invalid syntax|expected ':')/, lang: 'python', make: () => ({ title: 'Синтаксическая ошибка', simple: 'Python не смог разобрать строку: в ней нарушены правила языка. Чаще всего забыто двоеточие, скобка или кавычка.', fix: ['После if/for/while/def/class нужно двоеточие «:».', 'Проверь, что все скобки ( ) [ ] { } закрыты.', 'Для сравнения используй ==, а не =.'], topic: 'syntax' }) },
  { re: /SyntaxError: unterminated string literal|EOL while scanning string/, lang: 'python', make: () => ({ title: 'Строка не закрыта', simple: 'Ты открыл кавычку, но не закрыл её. Python думает, что текст продолжается до конца строки.', fix: ['Поставь закрывающую кавычку того же типа: "текст" или \'текст\'.'], topic: 'strings' }) },
  { re: /SyntaxError: '\(' was never closed|unexpected EOF while parsing/, lang: 'python', make: () => ({ title: 'Скобка не закрыта', simple: 'Где-то открыта скобка, но не закрыта. Python дошёл до конца кода и не нашёл пару.', fix: ['Посчитай открывающие и закрывающие скобки в строке с ошибкой и выше.'], topic: 'syntax' }) },
  { re: /TypeError: can only concatenate str \(not "(\w+)"\) to str/, lang: 'python', make: (m) => ({ title: 'Нельзя сложить текст и число', simple: `Ты пытаешься «склеить» строку и значение типа ${m[1]}. Python не угадывает, хочешь ли ты сложить числа или склеить текст.`, fix: ['Преврати число в строку: "Возраст: " + str(age)', 'Или используй f-строку: f"Возраст: {age}"'], topic: 'types' }) },
  { re: /TypeError: unsupported operand type\(s\) for ([^:]+): '(\w+)' and '(\w+)'/, lang: 'python', make: (m) => ({ title: `Операция «${m[1].trim()}» не работает для ${m[2]} и ${m[3]}`, simple: `Типы ${m[2]} и ${m[3]} нельзя использовать вместе в этой операции. Часто это значит, что input() вернул строку, а ты ждал число.`, fix: ['input() всегда возвращает строку — оберни в int() или float().', 'Проверь тип: print(type(x)).'], topic: 'types' }) },
  { re: /TypeError: '(\w+)' object is not callable/, lang: 'python', make: (m) => ({ title: `Объект типа ${m[1]} нельзя вызвать как функцию`, simple: 'Ты поставил круглые скобки после значения, которое не является функцией. Возможно, переменная перезаписала имя встроенной функции (например, list = [1,2], а потом list(...)).', fix: ['Не называй переменные именами встроенных функций: list, str, sum, max, input.', 'Проверь, нет ли лишних скобок.'], topic: 'functions' }) },
  { re: /TypeError: (\w+)\(\) (?:missing (\d+) required positional argument|takes (\d+) positional arguments? but (\d+) (?:was|were) given)/, lang: 'python', make: (m) => ({ title: `Неверное число аргументов у ${m[1]}()`, simple: 'Функция ожидает одно количество аргументов, а ты передал другое.', fix: [`Посмотри определение def ${m[1]}(...) и передай столько же значений.`, 'Для методов класса не забудь self в определении.'], topic: 'functions' }) },
  { re: /IndexError: (list|string|tuple) index out of range/, lang: 'python', make: (m) => ({ title: 'Выход за границы', simple: `Ты обращаешься к элементу ${m[1] === 'list' ? 'списка' : m[1] === 'string' ? 'строки' : 'кортежа'} по индексу, которого нет. Индексы начинаются с 0, поэтому последний элемент — len(x) - 1.`, fix: ['Проверь условие цикла: range(len(x)), а не range(len(x) + 1).', 'Перед обращением проверь, что список не пуст.', 'Последний элемент удобно брать как x[-1].'], topic: 'lists' }) },
  { re: /KeyError: (.+)/, lang: 'python', make: (m) => ({ title: `Ключа ${m[1]} нет в словаре`, simple: 'Ты запросил из словаря ключ, которого в нём нет.', fix: ['Используй d.get(key, значение_по_умолчанию).', 'Проверь наличие: if key in d.', 'Проверь регистр и тип ключа ("1" и 1 — разные ключи).'], topic: 'dicts' }) },
  { re: /ValueError: invalid literal for int\(\) with base 10: '(.*)'/, lang: 'python', make: (m) => ({ title: `«${m[1]}» — не целое число`, simple: 'int() умеет превращать в число только строки из цифр. Пробелы, буквы или точка мешают.', fix: ['Для дробных чисел используй float().', 'Убери пробелы: int(s.strip()).', 'Проверь ввод: s.isdigit().'], topic: 'types' }) },
  { re: /ZeroDivisionError/, make: () => ({ title: 'Деление на ноль', simple: 'На ноль делить нельзя ни в математике, ни в программировании.', fix: ['Перед делением проверь, что делитель не равен 0.', 'Если считаешь среднее — проверь, что список не пуст.'], topic: 'math' }) },
  { re: /AttributeError: '(\w+)' object has no attribute '(\w+)'/, lang: 'python', make: (m) => ({ title: `У ${m[1]} нет «${m[2]}»`, simple: `Ты вызываешь метод или свойство «${m[2]}», которого у значения типа ${m[1]} не существует.`, fix: [`Проверь, какой тип у переменной (print(type(x))) — возможно, это не то, что ты ожидаешь.`, 'Проверь написание метода: append, а не push (это из JavaScript).', 'Если NoneType — функция вернула None (забыт return?).'], topic: 'objects' }) },
  { re: /RecursionError/, make: () => ({ title: 'Бесконечная рекурсия', simple: 'Функция вызывает сама себя слишком много раз и никак не может остановиться.', fix: ['Добавь базовый случай — условие, при котором функция возвращает результат без нового вызова.', 'Убедись, что каждый вызов приближает к базовому случаю (n - 1, а не n).'], topic: 'recursion' }) },
  { re: /UnboundLocalError: (?:local variable|cannot access local variable) '(\w+)'/, lang: 'python', make: (m) => ({ title: `Локальная «${m[1]}» используется до присваивания`, simple: 'Внутри функции ты меняешь переменную с таким же именем, как глобальная. Python считает её локальной, но значения у неё ещё нет.', fix: ['Передай значение параметром и верни результат через return.', 'Или (реже) объяви global имя в начале функции.'], topic: 'functions' }) },
  { re: /ModuleNotFoundError: No module named '(\w+)'/, lang: 'python', make: (m) => ({ title: `Модуль ${m[1]} не найден`, simple: 'Такой библиотеки нет в песочнице или в названии ошибка.', fix: [`В консоли выполни: pip install ${m[1]}`, 'Проверь написание имени модуля.'], topic: 'modules' }) },
  { re: /EOFError/, lang: 'python', make: () => ({ title: 'Нет входных данных', simple: 'Программа вызывает input(), но ввод закончился.', fix: ['Заполни поле «Ввод (stdin)» — каждая строка будет отдельным вводом.'], topic: 'io' }) },
  // ─── JavaScript ───
  { re: /ReferenceError: (\w+) is not defined/, lang: 'js', make: (m) => ({ title: `JavaScript не знает «${m[1]}»`, simple: `Переменная или функция «${m[1]}» не объявлена. Возможно, опечатка или забыто let/const.`, fix: [`Объяви: let ${m[1]} = ...`, 'Проверь регистр букв: myVar ≠ myvar.', m[1] === 'print' ? 'В JavaScript вывод — это console.log(), а не print().' : m[1] === 'document' || m[1] === 'window' ? 'document доступен только в веб-странице: создай .html файл и открой предпросмотр.' : 'Если это строка, возьми её в кавычки.'], topic: 'variables' }) },
  { re: /ReferenceError: Cannot access '(\w+)' before initialization/, lang: 'js', make: (m) => ({ title: `«${m[1]}» используется до объявления`, simple: 'Переменные let и const нельзя использовать выше строки, где они объявлены (это «временная мёртвая зона»).', fix: ['Перенеси объявление выше места использования.'], topic: 'variables' }) },
  { re: /TypeError: Assignment to constant variable/, lang: 'js', make: () => ({ title: 'Попытка изменить константу', simple: 'Переменную, объявленную через const, нельзя переприсвоить.', fix: ['Если значение должно меняться — используй let.'], topic: 'variables' }) },
  { re: /TypeError: Cannot read propert(?:y|ies) of (undefined|null)(?: \(reading '(\w+)'\))?/, lang: 'js', make: (m) => ({ title: `Обращение к свойству у ${m[1]}`, simple: `Ты пытаешься прочитать${m[2] ? ` «${m[2]}»` : ' свойство'} у значения ${m[1]} — то есть у «ничего». Скорее всего, объект ещё не создан или индекс массива вне границ.`, fix: ['Проверь, что переменная действительно содержит объект.', 'Используй опциональную цепочку: obj?.prop', 'Проверь индекс массива: arr[i] при i >= arr.length даёт undefined.'], topic: 'objects' }) },
  { re: /TypeError: (\S+) is not a function/, lang: 'js', make: (m) => ({ title: `${m[1]} — не функция`, simple: 'Ты вызываешь со скобками то, что функцией не является. Часто это опечатка в имени метода.', fix: ['Проверь название метода (например, toUpperCase, а не toUppercase).', 'Метод push есть у массивов, а не у строк или объектов.'], topic: 'functions' }) },
  { re: /SyntaxError: Unexpected token '?(.+?)'?$/, lang: 'js', make: (m) => ({ title: `Неожиданный символ ${m[1]}`, simple: 'JavaScript встретил символ там, где его не ожидал. Скорее всего, лишняя или пропущенная скобка, запятая или кавычка.', fix: ['Проверь парность скобок () {} [].', 'Проверь запятые между элементами массива/объекта.'], topic: 'syntax' }) },
  { re: /SyntaxError: (Unexpected end of input|Unterminated)/, lang: 'js', make: () => ({ title: 'Код оборвался', simple: 'Не хватает закрывающей скобки или кавычки — JavaScript дошёл до конца и не нашёл пару.', fix: ['Найди открывающую { или ( без пары.'], topic: 'syntax' }) },
  { re: /RangeError: Maximum call stack size exceeded/, lang: 'js', make: () => ({ title: 'Переполнение стека вызовов', simple: 'Функция бесконечно вызывает сама себя.', fix: ['Добавь базовый случай рекурсии.', 'Проверь, что аргумент меняется при каждом вызове.'], topic: 'recursion' }) },
  { re: /RangeError: Invalid array length/, lang: 'js', make: () => ({ title: 'Неверная длина массива', simple: 'Ты создаёшь массив отрицательной или слишком большой длины.', fix: ['Проверь число, переданное в new Array(n).'], topic: 'arrays' }) },
  { re: /TimeoutError|бесконечный цикл|лимит шагов/i, make: () => ({ title: 'Программа не завершилась', simple: 'Код работал слишком долго. Почти всегда это бесконечный цикл: условие выхода никогда не становится ложным.', fix: ['Проверь, что переменная цикла меняется (i++ / i += 1).', 'Проверь условие: возможно, перепутаны < и >.', 'Запусти пошаговый отладчик, чтобы увидеть, как меняются переменные.'], topic: 'loops' }) },
];

export function explainError(message: string, lang: Lang): Explanation {
  for (const r of RULES) {
    if (r.lang && r.lang !== lang) continue;
    const m = message.match(r.re);
    if (m) return r.make(m);
  }
  return {
    title: 'Ошибка выполнения',
    simple: 'Программа остановилась с ошибкой. Прочитай последнюю строку сообщения — там тип ошибки и подсказка.',
    fix: ['Посмотри на номер строки в сообщении.', 'Запусти пошаговую отладку, чтобы увидеть значения переменных перед ошибкой.', 'Спроси ИИ-помощника — он разберёт код подробно.'],
    topic: 'general',
  };
}

export interface CodeIssue {
  line: number;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

/** Эвристический анализ кода: типичные ошибки новичков. */
export function analyzeCode(code: string, lang: Lang): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const lines = code.split('\n');
  lines.forEach((raw, i) => {
    const line = raw.replace(lang === 'js' ? /\/\/.*$/ : /#.*$/, '');
    const n = i + 1;
    if (lang === 'js') {
      if (/\bif\s*\([^=!<>]*[^=!<>]=[^=][^)]*\)/.test(line)) issues.push({ line: n, severity: 'warning', message: 'В условии if стоит «=» (присваивание). Для сравнения используй «===».' });
      if (/[^=!]==[^=]/.test(line)) issues.push({ line: n, severity: 'info', message: '«==» сравнивает с приведением типов (1 == "1" → true). Надёжнее «===».' });
      if (/\bvar\s/.test(line)) issues.push({ line: n, severity: 'info', message: 'var устарел: используй let (если значение меняется) или const.' });
      if (/\bprint\s*\(/.test(line)) issues.push({ line: n, severity: 'error', message: 'В JavaScript нет print(). Используй console.log().' });
      if (/for\s*\(.*<=\s*\w+\.length/.test(line)) issues.push({ line: n, severity: 'warning', message: 'Условие «<= arr.length» выходит за границу массива на 1. Обычно нужно «<».' });
      if (/while\s*\(\s*true\s*\)/.test(line) && !/break|return/.test(code)) issues.push({ line: n, severity: 'warning', message: 'while (true) без break/return — бесконечный цикл.' });
      if (/\.length\(\)/.test(line)) issues.push({ line: n, severity: 'error', message: 'length — это свойство, а не метод: пиши arr.length без скобок.' });
      if (/\belif\b|\bTrue\b|\bFalse\b|\bNone\b/.test(line)) issues.push({ line: n, severity: 'error', message: 'Похоже на Python-синтаксис. В JS: else if, true, false, null.' });
    } else {
      if (/^\s*(if|elif|while|for|def|class|else|try|except|finally|with)\b[^:]*$/.test(line) && line.trim() && !line.trim().endsWith('\\')) issues.push({ line: n, severity: 'error', message: 'В конце этой строки нужно двоеточие «:».' });
      if (/^\s*(if|elif|while)\s.*[^=!<>]=[^=]/.test(line) && !/:=/.test(line)) issues.push({ line: n, severity: 'warning', message: 'В условии стоит «=» (присваивание). Для сравнения используй «==».' });
      if (/console\.log/.test(line)) issues.push({ line: n, severity: 'error', message: 'В Python вывод — это print(), а не console.log().' });
      if (/^\s*print\s+[^(=]/.test(line)) issues.push({ line: n, severity: 'error', message: 'В Python 3 print — функция: print("текст").' });
      if (/\b(true|false|null)\b/.test(line) && !/["']/.test(line)) issues.push({ line: n, severity: 'error', message: 'В Python пишут True, False, None — с большой буквы.' });
      if (/\b(list|str|dict|sum|max|min|input|len)\s*=[^=]/.test(line)) issues.push({ line: n, severity: 'warning', message: 'Эта переменная перекрывает встроенную функцию Python. Лучше выбрать другое имя.' });
      if (/range\(\s*len\([^)]*\)\s*\+\s*1\s*\)/.test(line)) issues.push({ line: n, severity: 'warning', message: 'range(len(x) + 1) выйдет за границы списка.' });
      if (/\.push\(/.test(line)) issues.push({ line: n, severity: 'error', message: 'У списков Python метод append(), а не push().' });
      if (/\t/.test(raw) && / {2}/.test(code)) issues.push({ line: n, severity: 'warning', message: 'Смешаны табы и пробелы в отступах.' });
      if (/while\s+True\s*:/.test(line) && !/break|return/.test(code)) issues.push({ line: n, severity: 'warning', message: 'while True без break/return — бесконечный цикл.' });
    }
  });
  return issues.slice(0, 20);
}

/** Грубая оценка качества решения (для режима собеседования и «сделай код читаемым»). */
export function codeQuality(code: string, lang: Lang) {
  const lines = code.split('\n').filter((l) => l.trim() && !/^\s*(#|\/\/)/.test(l));
  const names = [...code.matchAll(lang === 'js' ? /\b(?:let|const|var|function)\s+([A-Za-z_$][\w$]*)/g : /^\s*(?:def\s+)?([A-Za-z_]\w*)\s*(?:=|\()/gm)].map((m) => m[1]);
  const shortNames = names.filter((n) => n.length === 1 && !['i', 'j', 'k', 'n', 'x', 'y', '_'].includes(n));
  let maxDepth = 0;
  let loops = 0;
  if (lang === 'python') {
    for (const l of lines) maxDepth = Math.max(maxDepth, Math.floor((l.match(/^\s*/)![0].length) / 4));
  } else {
    let d = 0;
    for (const ch of code) {
      if (ch === '{') maxDepth = Math.max(maxDepth, ++d);
      if (ch === '}') d--;
    }
  }
  // Вложенные циклы — оценка сложности.
  const loopLines = lines.map((l) => (/\b(for|while)\b/.test(l) ? l.match(/^\s*/)![0].length : -1)).filter((x) => x >= 0);
  loops = loopLines.length;
  let nested = 1;
  for (let i = 1; i < loopLines.length; i++) if (loopLines[i] > loopLines[i - 1]) nested++;
  const complexity = loops === 0 ? 'O(1) или O(n) через встроенные функции' : nested >= 3 ? 'O(n³) или хуже' : nested === 2 && loops >= 2 ? 'O(n²)' : 'O(n)';
  const score = Math.max(0, 100 - shortNames.length * 8 - Math.max(0, maxDepth - 3) * 10 - Math.max(0, lines.length - 40) * 1);
  const notes: string[] = [];
  if (shortNames.length) notes.push(`Неговорящие имена: ${shortNames.join(', ')}. Имена должны объяснять смысл.`);
  if (maxDepth > 3) notes.push('Глубокая вложенность. Попробуй ранний return или вынеси часть кода в функцию.');
  if (lines.length > 40) notes.push('Длинное решение — возможно, есть более простой путь.');
  if (!notes.length) notes.push('Код аккуратный и читаемый 👍');
  return { score, complexity, notes, lines: lines.length };
}
