// Трек Python, часть 1: первые шаги, управление потоком, коллекции.
import type { Module } from '../types';

export const pythonModules1: Module[] = [
  {
    id: 'py-start',
    title: 'Первые шаги',
    chapters: [
      {
        id: 'py-start-1',
        title: 'Вывод, переменные, типы',
        description: 'print(), переменные, числа, строки и арифметика.',
        lessons: [
          {
            id: 'py-print',
            title: 'print() — первая команда',
            minutes: 6,
            steps: [
              {
                kind: 'theory',
                topic: 'output',
                title: 'Говорим компьютеру «выведи»',
                md: `Функция \`print()\` выводит на экран то, что ты положишь в скобки.

\`\`\`python
print("Привет, мир!")
print(42)
print(2 + 3)
\`\`\`

- Текст (**строку**) пишут в кавычках: \`"..."\` или \`'...'\`.
- Числа пишут без кавычек — тогда Python может с ними считать.
- В \`print\` можно передать несколько значений через запятую — они выведутся через пробел: \`print("Мне", 15, "лет")\` → \`Мне 15 лет\`.
- Каждый \`print\` начинает вывод с новой строки.

**Комментарии** начинаются с \`#\`. Python их игнорирует — они для людей:

\`\`\`python
# Это комментарий
print("А это код")  # комментарий в конце строки
\`\`\`

> ⚠️ Регистр важен: \`Print\` или \`PRINT\` — ошибка. Только \`print\`.`,
              },
              { kind: 'example', topic: 'output', lang: 'python', code: 'print("Привет, мир!")\nprint("Мне", 15, "лет")\nprint(10 + 5)\nprint("10 + 5")  # в кавычках — это просто текст', note: 'Заметь разницу: `10 + 5` вычисляется, а `"10 + 5"` выводится как текст.' },
              { kind: 'predict', topic: 'output', lang: 'python', code: 'print("2 + 2")\nprint(2 + 2)', answer: '2 + 2\n4', explain: 'В кавычках — строка, она выводится как есть. Без кавычек — выражение, Python его вычисляет.' },
              { kind: 'quiz', topic: 'output', question: 'Что выведет `print("Кот", "Пёс", 3)`?', options: ['Кот Пёс 3', 'КотПёс3', 'Кот, Пёс, 3', 'Ошибка'], answer: 0, explain: 'Значения, переданные через запятую, выводятся через пробел.' },
              { kind: 'findline', topic: 'syntax', lang: 'python', prompt: 'В какой строке ошибка?', code: 'print("Начало")\nPrint("Середина")\nprint("Конец")', answer: 2, explain: '`Print` с большой буквы — Python не знает такой функции. Нужно `print`.' },
              { kind: 'code', topic: 'output', lang: 'python', prompt: 'Выведи на экран две строки: `Привет, CodeVerse!` и `Я начинаю учиться`.', starter: '# Напиши код здесь\n', tests: [{ expected: 'Привет, CodeVerse!\nЯ начинаю учиться' }], hints: ['Используй два вызова `print()`.', 'Текст обязательно бери в кавычки: `print("Привет, CodeVerse!")`.'], solution: 'print("Привет, CodeVerse!")\nprint("Я начинаю учиться")' },
            ],
          },
          {
            id: 'py-variables',
            title: 'Переменные',
            minutes: 8,
            steps: [
              {
                kind: 'theory',
                topic: 'variables',
                title: 'Переменная — подписанная коробка',
                md: `**Переменная** хранит значение под именем. Создаётся знаком \`=\` (это **присваивание**, а не «равно» из математики):

\`\`\`python
name = "Аня"
age = 15
print(name, age)
\`\`\`

Читай \`age = 15\` как «положи 15 в коробку age».

**Значение можно менять:**

\`\`\`python
score = 0
score = score + 10   # взять старое значение, прибавить 10, положить обратно
score += 5           # то же самое короче
print(score)         # 15
\`\`\`

**Правила имён:**
- буквы, цифры, \`_\`; нельзя начинать с цифры: \`player1\` ✅, \`1player\` ❌;
- без пробелов: \`max_score\` ✅, \`max score\` ❌;
- регистр важен: \`Age\` и \`age\` — разные переменные;
- нельзя использовать слова языка: \`if\`, \`for\`, \`class\`…

> 💡 Давай понятные имена: \`price\`, \`user_name\`, \`total_score\` вместо \`a\`, \`x2\`, \`qq\`. Код читают чаще, чем пишут.`,
              },
              { kind: 'animation', topic: 'variables', title: 'Как работает присваивание', anim: { lang: 'python', code: 'a = 5\nb = a\na = 10\nprint(a, b)', width: 380, height: 180, frames: [
                { caption: 'a = 5 — создаём коробку a со значением 5.', line: 1, boxes: [{ id: 'a', label: 'a', value: '5', x: 40, y: 50, color: 'green', highlight: true }] },
                { caption: 'b = a — копируем ТЕКУЩЕЕ значение a в коробку b.', line: 2, boxes: [{ id: 'a', label: 'a', value: '5', x: 40, y: 50, color: 'green' }, { id: 'b', label: 'b', value: '5', x: 220, y: 50, color: 'blue', highlight: true }], arrows: [{ from: 'a', to: 'b', label: 'копия' }] },
                { caption: 'a = 10 — меняем только a. b по-прежнему 5!', line: 3, boxes: [{ id: 'a', label: 'a', value: '10', x: 40, y: 50, color: 'green', highlight: true }, { id: 'b', label: 'b', value: '5', x: 220, y: 50, color: 'blue' }] },
                { caption: 'print(a, b) выведет: 10 5', line: 4, boxes: [{ id: 'a', label: 'a', value: '10', x: 40, y: 50, color: 'green' }, { id: 'b', label: 'b', value: '5', x: 220, y: 50, color: 'blue' }] },
              ] } },
              { kind: 'predict', topic: 'variables', lang: 'python', code: 'coins = 3\ncoins = coins + 2\ncoins += 10\nprint(coins)', answer: '15', explain: '3 → 3 + 2 = 5 → 5 + 10 = 15.' },
              { kind: 'quiz', topic: 'variables', question: 'Какое имя переменной **недопустимо**?', options: ['2nd_place', 'second_place', '_hidden', 'placeTwo'], answer: 0, explain: 'Имя не может начинаться с цифры.' },
              { kind: 'predict', topic: 'variables', lang: 'python', code: 'x = 1\ny = x\nx = 7\nprint(y)', answer: '1', explain: 'y получил копию значения x в момент присваивания (1). Последующее изменение x не влияет на y.' },
              { kind: 'fill', topic: 'variables', lang: 'python', prompt: 'Допиши код: создай переменную `lives` со значением 3, затем уменьши её на 1', template: '___ = 3\nlives ___ 1\nprint(lives)', answers: [['lives'], ['-=']] },
              { kind: 'fixbug', topic: 'variables', lang: 'python', prompt: 'Программа должна вывести `Игрок: Макс, очки: 120`. Найди и исправь ошибку.', code: 'player = "Макс"\npoints = 120\nprint("Игрок:", Player + ",", "очки:", points)', tests: [{ expected: 'Игрок: Макс, очки: 120' }], hints: ['Сравни, как названа переменная при создании и при использовании.', 'Регистр букв важен: `player` ≠ `Player`.'], solution: 'player = "Макс"\npoints = 120\nprint("Игрок:", player + ",", "очки:", points)' },
              { kind: 'code', topic: 'variables', lang: 'python', prompt: 'Создай переменную `apples` = 12. Ты съел 3 яблока, а потом купил ещё 5. Измени переменную двумя командами и выведи результат (должно быть `14`).', starter: 'apples = 12\n', tests: [{ expected: '14' }], hints: ['Съесть 3: `apples -= 3`', 'Купить 5: `apples += 5`', 'Не забудь `print(apples)`'], solution: 'apples = 12\napples -= 3\napples += 5\nprint(apples)' },
            ],
          },
          {
            id: 'py-types-math',
            title: 'Типы данных и арифметика',
            minutes: 10,
            steps: [
              {
                kind: 'theory',
                topic: 'types',
                title: 'Числа, строки, логические значения',
                md: `У каждого значения есть **тип**:

| Тип | Пример | Что это |
|---|---|---|
| \`int\` | \`42\`, \`-7\` | целое число |
| \`float\` | \`3.14\`, \`2.0\` | дробное число (через **точку**!) |
| \`str\` | \`"привет"\` | строка (текст) |
| \`bool\` | \`True\`, \`False\` | логическое: истина/ложь |
| \`NoneType\` | \`None\` | «ничего», пустота |

Узнать тип: \`type(42)\` → \`<class 'int'>\`.

**Арифметика:**

| Операция | Пример | Результат |
|---|---|---|
| \`+\` \`-\` \`*\` | \`7 * 3\` | \`21\` |
| \`/\` деление | \`7 / 2\` | \`3.5\` (всегда float!) |
| \`//\` целочисленное деление | \`7 // 2\` | \`3\` |
| \`%\` остаток | \`7 % 2\` | \`1\` |
| \`**\` степень | \`2 ** 10\` | \`1024\` |

Порядок как в математике: сначала \`**\`, потом \`* / // %\`, потом \`+ -\`. Скобки меняют порядок.

**Строки тоже можно «складывать» и «умножать»:**
\`"ко" + "т"\` → \`"кот"\`, \`"ха" * 3\` → \`"хахаха"\`.

**Преобразование типов:** \`int("42")\` → 42, \`str(42)\` → "42", \`float("2.5")\` → 2.5.

> ⚠️ \`"5" + 3\` — ошибка: нельзя сложить строку и число. Нужно \`int("5") + 3\` или \`"5" + str(3)\`.`,
              },
              { kind: 'example', topic: 'math', lang: 'python', code: 'print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(2 ** 8)\nprint(type(3.0), type("3"), type(True))\nprint("=" * 20)' },
              { kind: 'match', topic: 'math', prompt: 'Сопоставь выражение и результат', pairs: [['17 // 5', '3'], ['17 % 5', '2'], ['17 / 5', '3.4'], ['2 ** 5', '32']] },
              { kind: 'predict', topic: 'math', lang: 'python', code: 'print(2 + 3 * 4)\nprint((2 + 3) * 4)', answer: '14\n20', explain: 'Умножение выполняется раньше сложения, скобки меняют порядок.' },
              { kind: 'quiz', topic: 'types', question: 'Какой тип у значения `"123"`?', options: ['str', 'int', 'float', 'bool'], answer: 0, explain: 'Всё в кавычках — строка, даже если внутри цифры.' },
              { kind: 'quiz', topic: 'math', question: 'Как проверить, что число n чётное?', options: ['n % 2 == 0', 'n / 2 == 0', 'n // 2 == 1', 'n ** 2 == 0'], answer: 0, explain: 'Чётное число делится на 2 без остатка: остаток `n % 2` равен 0.' },
              { kind: 'code', topic: 'math', lang: 'python', prompt: 'В переменной `seconds` — количество секунд (3725). Выведи, сколько это **полных часов, минут и секунд** — три числа через пробел: `1 2 5`.', starter: 'seconds = 3725\n', tests: [{ expected: '1 2 5' }], hints: ['Часы: `seconds // 3600`.', 'Остаток после часов: `seconds % 3600`, из него минуты — `// 60`.', 'Секунды: `seconds % 60`.'], solution: 'seconds = 3725\nhours = seconds // 3600\nminutes = seconds % 3600 // 60\nsecs = seconds % 60\nprint(hours, minutes, secs)' },
            ],
          },
          {
            id: 'py-input',
            title: 'Ввод данных и f-строки',
            minutes: 9,
            steps: [
              {
                kind: 'theory',
                topic: 'io',
                title: 'Программа спрашивает пользователя',
                md: `\`input()\` ждёт, пока пользователь что-то введёт, и **возвращает строку**:

\`\`\`python
name = input("Как тебя зовут? ")
print("Привет,", name)
\`\`\`

> ⚠️ \`input()\` **всегда** возвращает строку. Даже если ввели \`25\`, это \`"25"\`. Чтобы считать — преобразуй: \`age = int(input())\`.

**f-строки** — удобный способ вставлять значения в текст. Перед кавычкой ставят \`f\`, а переменные пишут в фигурных скобках:

\`\`\`python
name = "Аня"
age = 15
print(f"Меня зовут {name}, через год мне будет {age + 1}")
\`\`\`

Внутри \`{}\` можно писать любые выражения. Форматирование чисел: \`f"{3.14159:.2f}"\` → \`3.14\`.

> 💡 В CodeVerse ввод для программы задаётся в поле **stdin** — каждая строка будет ответом на очередной \`input()\`.`,
              },
              { kind: 'example', topic: 'io', lang: 'python', code: 'name = input("Как тебя зовут? ")\nage = int(input("Сколько тебе лет? "))\nprint(f"{name}, через 10 лет тебе будет {age + 10}!")', note: 'В примерах вводятся значения «Алиса» и «25».' },
              { kind: 'predict', topic: 'strings', lang: 'python', code: 'price = 250\ncount = 3\nprint(f"Итого: {price * count} руб.")', answer: 'Итого: 750 руб.', explain: 'Выражение в фигурных скобках вычисляется: 250 * 3 = 750.' },
              { kind: 'quiz', topic: 'io', question: 'Пользователь ввёл `5`. Что выведет `x = input()` и затем `print(x * 2)`?', options: ['55', '10', 'Ошибка', '5 5'], answer: 0, explain: 'x — строка "5", а строка, умноженная на 2, повторяется: "55". Чтобы получить 10, нужно int(x).' },
              { kind: 'fixbug', topic: 'types', lang: 'python', prompt: 'Программа читает два числа и выводит их сумму, но работает неправильно. Исправь.', code: 'a = input()\nb = input()\nprint(a + b)', tests: [{ stdin: ['3', '4'], expected: '7' }, { stdin: ['10', '25'], expected: '35' }], hints: ['input() возвращает строки, а строки при «сложении» склеиваются.', 'Преобразуй: `int(input())`.'], solution: 'a = int(input())\nb = int(input())\nprint(a + b)' },
              { kind: 'code', topic: 'io', lang: 'python', prompt: 'Прочитай имя и год рождения. Выведи: `Имя, в 2030 году тебе будет N лет` (через f-строку). Например, для `Лиза` и `2010`: `Лиза, в 2030 году тебе будет 20 лет`.', starter: 'name = input()\n', tests: [{ stdin: ['Лиза', '2010'], expected: 'Лиза, в 2030 году тебе будет 20 лет' }, { stdin: ['Пётр', '1999'], expected: 'Пётр, в 2030 году тебе будет 31 лет' }], hints: ['Год рождения прочитай с `int(input())`.', 'Возраст = 2030 − год.', 'Шаблон: `f"{name}, в 2030 году тебе будет {age} лет"`'], solution: 'name = input()\nyear = int(input())\nage = 2030 - year\nprint(f"{name}, в 2030 году тебе будет {age} лет")' },
            ],
          },
          {
            id: 'py-strings',
            title: 'Строки: индексы, срезы, методы',
            minutes: 12,
            steps: [
              {
                kind: 'theory',
                topic: 'strings',
                title: 'Строка — это последовательность символов',
                md: `У каждого символа строки есть **индекс** — номер позиции. Нумерация начинается с **нуля**!

\`\`\`text
 строка:   P  y  t  h  o  n
 индекс:   0  1  2  3  4  5
 с конца: -6 -5 -4 -3 -2 -1
\`\`\`

\`\`\`python
s = "Python"
print(s[0])     # P
print(s[-1])    # n — последний
print(len(s))   # 6 — длина
\`\`\`

**Срезы** \`s[начало:конец]\` — кусок строки (конец не включается):
- \`s[0:3]\` → \`"Pyt"\`
- \`s[2:]\` → \`"thon"\` (до конца)
- \`s[:2]\` → \`"Py"\` (с начала)
- \`s[::-1]\` → \`"nohtyP"\` (развернуть!)

**Полезные методы:**

| Метод | Пример | Результат |
|---|---|---|
| \`upper()\` / \`lower()\` | \`"Hi".upper()\` | \`"HI"\` |
| \`strip()\` | \`"  hi  ".strip()\` | \`"hi"\` |
| \`replace(a, b)\` | \`"кот".replace("к", "р")\` | \`"рот"\` |
| \`split()\` | \`"a b c".split()\` | \`["a", "b", "c"]\` |
| \`join()\` | \`"-".join(["a","b"])\` | \`"a-b"\` |
| \`count(x)\` | \`"банан".count("а")\` | \`2\` |
| \`find(x)\` | \`"банан".find("н")\` | \`2\` |
| \`startswith(x)\` | \`"file.py".endswith(".py")\` | \`True\` |
| \`in\` | \`"ан" in "банан"\` | \`True\` |

> 🧠 Строки **неизменяемы**: методы не меняют строку, а возвращают новую. \`s.upper()\` сам по себе ничего не делает — нужно \`s = s.upper()\`.`,
              },
              { kind: 'example', topic: 'strings', lang: 'python', code: 's = "Программирование"\nprint(s[0], s[-1], len(s))\nprint(s[:9])\nprint(s[::-1])\nprint(s.upper())\nprint(s.count("а"))\nprint("грамм" in s)' },
              { kind: 'predict', topic: 'strings', lang: 'python', code: 'word = "колобок"\nprint(word[1:4])\nprint(word[-2:])', answer: 'оло\nок', explain: 'word[1:4] — символы с индексами 1, 2, 3: «оло». word[-2:] — два последних символа: «ок».' },
              { kind: 'quiz', topic: 'strings', question: 'Что выведет `print("Hello".lower().replace("l", "L"))`?', options: ['heLLo', 'HeLLo', 'hello', 'HELLO'], answer: 0, explain: 'Методы применяются по цепочке: "Hello" → "hello" → "heLLo".' },
              { kind: 'match', topic: 'strings', prompt: 'Сопоставь выражение и результат (s = "abcdef")', pairs: [['s[2]', 'c'], ['s[-1]', 'f'], ['s[1:3]', 'bc'], ['s[::2]', 'ace']] },
              { kind: 'code', topic: 'strings', lang: 'python', prompt: 'Прочитай слово и проверь, является ли оно **палиндромом** (читается одинаково в обе стороны), не учитывая регистр. Выведи `Да` или `Нет`.', starter: 'word = input()\n', tests: [{ stdin: ['Шалаш'], expected: 'Да' }, { stdin: ['Казак'], expected: 'Да' }, { stdin: ['Python'], expected: 'Нет' }, { stdin: ['a'], expected: 'Да', hidden: true }], hints: ['Приведи слово к нижнему регистру: `word.lower()`.', 'Развернуть строку: `w[::-1]`.', 'Сравни строку с её разворотом и выведи ответ через if/else (или тернарный оператор).'], solution: 'word = input().lower()\nif word == word[::-1]:\n    print("Да")\nelse:\n    print("Нет")' },
              { kind: 'code', topic: 'strings', lang: 'python', prompt: 'Прочитай строку с полным именем (например, `иван петров`). Выведи инициалы заглавными буквами с точками: `И.П.`', starter: 'full_name = input()\n', tests: [{ stdin: ['иван петров'], expected: 'И.П.' }, { stdin: ['Анна Каренина'], expected: 'А.К.' }], hints: ['Раздели строку на слова: `full_name.split()`.', 'Первая буква слова: `word[0]`, заглавная: `.upper()`.'], solution: 'first, last = input().split()\nprint(f"{first[0].upper()}.{last[0].upper()}.")' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'py-flow',
    title: 'Управление потоком',
    chapters: [
      {
        id: 'py-flow-1',
        title: 'Условия',
        lessons: [
          {
            id: 'py-if',
            title: 'if, elif, else — программа принимает решения',
            minutes: 10,
            steps: [
              {
                kind: 'theory',
                topic: 'conditions',
                title: 'Если… иначе…',
                md: `До сих пор программы выполняли все строки подряд. **Условие** позволяет выполнить код *только если* что-то верно.

\`\`\`python
age = int(input())
if age >= 18:
    print("Доступ разрешён")
else:
    print("Доступ запрещён")
\`\`\`

Важно:
- после условия — **двоеточие** \`:\`;
- код внутри — с **отступом** 4 пробела. Отступ показывает, что строки «принадлежат» if;
- \`else\` — «во всех остальных случаях».

**Несколько вариантов** — \`elif\` (else if):

\`\`\`python
if score >= 90:
    grade = "A"
elif score >= 70:
    grade = "B"
elif score >= 50:
    grade = "C"
else:
    grade = "F"
\`\`\`

Python проверяет условия **сверху вниз** и выполняет **первую** подходящую ветку.

**Операторы сравнения:** \`==\` равно, \`!=\` не равно, \`>\`, \`<\`, \`>=\`, \`<=\`.

> ⚠️ \`=\` — присваивание, \`==\` — сравнение. \`if x = 5:\` — ошибка.`,
              },
              { kind: 'animation', topic: 'conditions', title: 'Как выполняется if/elif/else', anim: { lang: 'python', code: 'temp = 15\nif temp > 25:\n    print("Жарко")\nelif temp > 10:\n    print("Тепло")\nelse:\n    print("Холодно")', width: 360, height: 200, frames: [
                { caption: 'temp = 15', line: 1, boxes: [{ id: 't', label: 'temp', value: '15', x: 30, y: 60, color: 'blue', highlight: true }] },
                { caption: 'Проверяем 15 > 25? Нет (False) — пропускаем эту ветку.', line: 2, boxes: [{ id: 't', label: 'temp', value: '15', x: 30, y: 60, color: 'blue' }, { id: 'c', label: '15 > 25', value: 'False', x: 190, y: 60, color: 'red', highlight: true, w: 130 }] },
                { caption: 'Проверяем 15 > 10? Да (True) — выполняем эту ветку.', line: 4, boxes: [{ id: 't', label: 'temp', value: '15', x: 30, y: 60, color: 'blue' }, { id: 'c', label: '15 > 10', value: 'True', x: 190, y: 60, color: 'green', highlight: true, w: 130 }] },
                { caption: 'Выводим «Тепло». Остальные ветки (else) уже не проверяются.', line: 5, boxes: [{ id: 't', label: 'temp', value: '15', x: 30, y: 60, color: 'blue' }, { id: 'c', label: 'вывод', value: 'Тепло', x: 190, y: 60, color: 'yellow', highlight: true, w: 130 }] },
              ] } },
              { kind: 'predict', topic: 'conditions', lang: 'python', code: 'x = 7\nif x % 2 == 0:\n    print("чётное")\nelse:\n    print("нечётное")\nprint("готово")', answer: 'нечётное\nготово', explain: '7 % 2 = 1, условие ложно — выполняется else. Последняя строка без отступа выполняется всегда.' },
              { kind: 'quiz', topic: 'conditions', question: 'score = 75. Какая оценка получится в примере из теории?', options: ['B', 'A', 'C', 'F'], answer: 0, explain: '75 >= 90 — нет, 75 >= 70 — да → "B". Дальше условия не проверяются.' },
              { kind: 'findline', topic: 'syntax', lang: 'python', prompt: 'Найди строку с ошибкой', code: 'password = input()\nif password == "qwerty"\n    print("Слабый пароль")\nelse:\n    print("Принято")', answer: 2, explain: 'После условия `if` забыто двоеточие `:`.' },
              { kind: 'order', topic: 'conditions', lang: 'python', prompt: 'Собери программу, которая выводит «плюс», «минус» или «ноль»', lines: ['n = int(input())', 'if n > 0:', '    print("плюс")', 'elif n < 0:', '    print("минус")', 'else:', '    print("ноль")'] },
              { kind: 'code', topic: 'conditions', lang: 'python', prompt: 'Напиши программу «Светофор»: прочитай цвет (`красный`, `жёлтый`, `зелёный`) и выведи `Стой`, `Жди` или `Иди`. Для любого другого слова выведи `Неизвестный сигнал`.', starter: 'color = input()\n', tests: [{ stdin: ['красный'], expected: 'Стой' }, { stdin: ['жёлтый'], expected: 'Жди' }, { stdin: ['зелёный'], expected: 'Иди' }, { stdin: ['синий'], expected: 'Неизвестный сигнал' }], hints: ['Сравнивай строки через `==`: `if color == "красный":`', 'Для остальных вариантов используй `elif`, для неизвестного — `else`.'], solution: 'color = input()\nif color == "красный":\n    print("Стой")\nelif color == "жёлтый":\n    print("Жди")\nelif color == "зелёный":\n    print("Иди")\nelse:\n    print("Неизвестный сигнал")' },
            ],
          },
          {
            id: 'py-logic',
            title: 'Логика: and, or, not',
            minutes: 8,
            steps: [
              {
                kind: 'theory',
                topic: 'logic',
                title: 'Сложные условия',
                md: `Условия можно комбинировать:

| Оператор | Значение | Пример |
|---|---|---|
| \`and\` | И — оба верны | \`age >= 7 and age <= 17\` |
| \`or\` | ИЛИ — хотя бы одно верно | \`day == "сб" or day == "вс"\` |
| \`not\` | НЕ — переворачивает | \`not is_banned\` |

**Таблица истинности:**

| A | B | A and B | A or B |
|---|---|---|---|
| True | True | True | True |
| True | False | False | True |
| False | True | False | True |
| False | False | False | False |

Приоритет: сначала \`not\`, потом \`and\`, потом \`or\`. Скобки помогают читать.

Python позволяет **цепочки сравнений**: \`7 <= age <= 17\` — то же, что \`age >= 7 and age <= 17\`.

**Истинность значений:** в условиях \`0\`, \`""\`, \`[]\`, \`None\` считаются ложью, всё остальное — истиной: \`if name:\` — «если имя не пустое».`,
              },
              { kind: 'match', topic: 'logic', prompt: 'Вычисли выражения', pairs: [['True and False', 'False'], ['True or False', 'True'], ['not True', 'False'], ['not (False or False)', 'True']] },
              { kind: 'predict', topic: 'logic', lang: 'python', code: 'age = 20\nhas_ticket = False\nprint(age >= 18 and has_ticket)\nprint(age >= 18 or has_ticket)\nprint(not has_ticket)', answer: 'False\nTrue\nTrue', explain: 'and требует оба условия, or — хотя бы одно, not переворачивает значение.' },
              { kind: 'quiz', topic: 'logic', question: 'Как проверить, что число n лежит в диапазоне от 1 до 100 включительно?', options: ['1 <= n <= 100', 'n >= 1 or n <= 100', 'n > 1 and n < 100', 'not n > 100'], answer: 0, explain: 'Цепочка сравнений. Вариант с or истинен почти для любых чисел.' },
              { kind: 'code', topic: 'logic', lang: 'python', prompt: 'Год **високосный**, если он делится на 4, но не делится на 100, **или** делится на 400. Прочитай год и выведи `Високосный` или `Обычный`.', starter: 'year = int(input())\n', tests: [{ stdin: ['2024'], expected: 'Високосный' }, { stdin: ['1900'], expected: 'Обычный' }, { stdin: ['2000'], expected: 'Високосный' }, { stdin: ['2023'], expected: 'Обычный' }], hints: ['«Делится на 4» — `year % 4 == 0`.', 'Условие: `(year % 4 == 0 and year % 100 != 0) or year % 400 == 0`.'], solution: 'year = int(input())\nif (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:\n    print("Високосный")\nelse:\n    print("Обычный")' },
            ],
          },
        ],
      },
      {
        id: 'py-flow-2',
        title: 'Циклы',
        lessons: [
          {
            id: 'py-while',
            title: 'Цикл while',
            minutes: 10,
            steps: [
              {
                kind: 'theory',
                topic: 'loops',
                title: 'Повторяй, пока условие верно',
                md: `**Цикл** повторяет код много раз. \`while\` («пока») выполняет тело, пока условие истинно:

\`\`\`python
count = 1
while count <= 5:
    print("Шаг", count)
    count += 1
print("Конец")
\`\`\`

Каждое выполнение тела цикла называется **итерацией**.

> ⚠️ Если условие никогда не станет ложным — получится **бесконечный цикл**, и программа «зависнет». Всегда проверяй, что переменная в условии **меняется** внутри цикла. (CodeVerse остановит такую программу через несколько секунд.)

**break** — немедленно выйти из цикла. **continue** — перейти к следующей итерации.

\`\`\`python
while True:              # «вечный» цикл…
    cmd = input()
    if cmd == "выход":
        break            # …который мы прерываем
    print("Команда:", cmd)
\`\`\``,
              },
              { kind: 'animation', topic: 'loops', title: 'while шаг за шагом', anim: { lang: 'python', code: 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("Старт!")', width: 360, height: 170, frames: [
                { caption: 'n = 3', line: 1, boxes: [{ id: 'n', label: 'n', value: '3', x: 30, y: 50, color: 'blue', highlight: true }, { id: 'o', label: 'вывод', value: '', x: 190, y: 50, color: 'gray', w: 140 }] },
                { caption: '3 > 0 — True, входим в цикл', line: 2, boxes: [{ id: 'n', label: 'n', value: '3', x: 30, y: 50, color: 'green' }, { id: 'o', label: 'вывод', value: '', x: 190, y: 50, color: 'gray', w: 140 }] },
                { caption: 'print(3), затем n становится 2', line: 4, boxes: [{ id: 'n', label: 'n', value: '2', x: 30, y: 50, color: 'blue', highlight: true }, { id: 'o', label: 'вывод', value: '3', x: 190, y: 50, color: 'yellow', w: 140 }] },
                { caption: '2 > 0 — True: print(2), n = 1', line: 4, boxes: [{ id: 'n', label: 'n', value: '1', x: 30, y: 50, color: 'blue', highlight: true }, { id: 'o', label: 'вывод', value: '3 2', x: 190, y: 50, color: 'yellow', w: 140 }] },
                { caption: '1 > 0 — True: print(1), n = 0', line: 4, boxes: [{ id: 'n', label: 'n', value: '0', x: 30, y: 50, color: 'blue', highlight: true }, { id: 'o', label: 'вывод', value: '3 2 1', x: 190, y: 50, color: 'yellow', w: 140 }] },
                { caption: '0 > 0 — False! Выходим из цикла и печатаем «Старт!»', line: 5, boxes: [{ id: 'n', label: 'n', value: '0', x: 30, y: 50, color: 'red' }, { id: 'o', label: 'вывод', value: '3 2 1 Старт!', x: 190, y: 50, color: 'green', w: 140, highlight: true }] },
              ] } },
              { kind: 'predict', topic: 'loops', lang: 'python', code: 'i = 0\ntotal = 0\nwhile i < 4:\n    total += i\n    i += 1\nprint(total)', answer: '6', explain: 'total = 0 + 1 + 2 + 3 = 6. При i = 4 условие ложно.' },
              { kind: 'findline', topic: 'loops', lang: 'python', prompt: '⚠️ Найди строку, из-за которой цикл будет бесконечным', code: 'n = 10\nwhile n > 0:\n    print(n)\n    n += 1', answer: 4, explain: 'n увеличивается, а не уменьшается: условие n > 0 всегда истинно. Нужно n -= 1.' },
              { kind: 'quiz', topic: 'loops', question: 'Что делает `break`?', options: ['Сразу выходит из цикла', 'Пропускает одну итерацию', 'Останавливает всю программу с ошибкой', 'Перезапускает цикл'], answer: 0, explain: 'break прерывает цикл; continue переходит к следующей итерации.' },
              { kind: 'code', topic: 'loops', lang: 'python', prompt: 'Программа «Копилка»: читай числа, пока не введут `0`, и прибавляй их к сумме. После `0` выведи сумму.', starter: 'total = 0\n', tests: [{ stdin: ['5', '10', '3', '0'], expected: '18' }, { stdin: ['0'], expected: '0' }, { stdin: ['100', '-20', '0'], expected: '80' }], hints: ['Используй `while True:` и `break`, когда число равно 0.', 'Внутри: `n = int(input())`, затем проверка, затем `total += n`.'], solution: 'total = 0\nwhile True:\n    n = int(input())\n    if n == 0:\n        break\n    total += n\nprint(total)' },
            ],
          },
          {
            id: 'py-for',
            title: 'Цикл for и range()',
            minutes: 11,
            steps: [
              {
                kind: 'theory',
                topic: 'loops',
                title: 'Перебор последовательностей',
                md: `\`for\` перебирает элементы последовательности по одному:

\`\`\`python
for letter in "кот":
    print(letter)       # к, о, т — по строке

for fruit in ["яблоко", "груша"]:
    print(fruit)        # по списку
\`\`\`

**range()** создаёт последовательность чисел:

| Вызов | Числа |
|---|---|
| \`range(5)\` | 0, 1, 2, 3, 4 |
| \`range(2, 6)\` | 2, 3, 4, 5 |
| \`range(0, 10, 3)\` | 0, 3, 6, 9 |
| \`range(5, 0, -1)\` | 5, 4, 3, 2, 1 |

Конец **не включается**!

\`\`\`python
for i in range(1, 4):
    print(i, "в квадрате =", i ** 2)
\`\`\`

**enumerate** даёт индекс и элемент сразу:
\`\`\`python
for i, name in enumerate(["Аня", "Боря"]):
    print(i, name)   # 0 Аня / 1 Боря
\`\`\`

**Шаблон «накопитель»** — очень частый приём:
\`\`\`python
total = 0
for n in range(1, 101):
    total += n
print(total)  # 5050
\`\`\`

**Вложенные циклы** — цикл внутри цикла (например, таблица умножения).`,
              },
              { kind: 'example', topic: 'loops', lang: 'python', code: 'for i in range(1, 6):\n    print("*" * i)\n\nfor i in range(1, 4):\n    for j in range(1, 4):\n        print(i * j, end="\\t")\n    print()', note: '`end="\\t"` заменяет перевод строки в конце print на табуляцию.' },
              { kind: 'match', topic: 'loops', prompt: 'Сопоставь range и числа', pairs: [['range(3)', '0 1 2'], ['range(1, 4)', '1 2 3'], ['range(0, 7, 3)', '0 3 6'], ['range(3, 0, -1)', '3 2 1']] },
              { kind: 'predict', topic: 'loops', lang: 'python', code: 'result = ""\nfor ch in "abc":\n    result = ch + result\nprint(result)', answer: 'cba', explain: 'Каждый символ добавляется В НАЧАЛО: "a" → "ba" → "cba".' },
              { kind: 'fill', topic: 'loops', lang: 'python', prompt: 'Выведи все чётные числа от 2 до 20 включительно', template: 'for n in range(___, ___, ___):\n    print(n)', answers: [['2'], ['21', '22'], ['2']] },
              { kind: 'code', topic: 'loops', lang: 'python', prompt: 'Прочитай число n и выведи **факториал** n (произведение 1·2·…·n). Факториал 0 равен 1.', starter: 'n = int(input())\n', tests: [{ stdin: ['5'], expected: '120' }, { stdin: ['1'], expected: '1' }, { stdin: ['0'], expected: '1' }, { stdin: ['10'], expected: '3628800' }], hints: ['Начни с `result = 1`.', 'Цикл `for i in range(1, n + 1):` и `result *= i`.'], solution: 'n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result *= i\nprint(result)' },
              { kind: 'code', topic: 'loops', lang: 'python', prompt: '**FizzBuzz**: выведи числа от 1 до 15. Вместо чисел, кратных 3, выводи `Fizz`, кратных 5 — `Buzz`, кратных и 3, и 5 — `FizzBuzz`.', starter: '', tests: [{ expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' }], hints: ['Сначала проверяй кратность 15 (и 3, и 5), иначе до неё не дойдёт очередь.', 'Кратность: `i % 3 == 0`.'], solution: 'for i in range(1, 16):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'py-collections',
    title: 'Коллекции данных',
    chapters: [
      {
        id: 'py-coll-1',
        title: 'Списки',
        lessons: [
          {
            id: 'py-lists',
            title: 'Списки: хранение многих значений',
            minutes: 12,
            steps: [
              {
                kind: 'theory',
                topic: 'lists',
                title: 'Список — упорядоченная коллекция',
                md: `**Список** хранит много значений в одной переменной:

\`\`\`python
scores = [90, 75, 100, 60]
names = ["Аня", "Боря", "Вика"]
mixed = [1, "два", 3.0, True]
empty = []
\`\`\`

Индексы как у строк: \`scores[0]\` → 90, \`scores[-1]\` → 60, срезы \`scores[1:3]\` → [75, 100].

**В отличие от строк, списки можно менять:**

\`\`\`python
scores[1] = 80          # заменить элемент
scores.append(95)       # добавить в конец
scores.insert(0, 50)    # вставить по индексу
scores.remove(100)      # удалить первое значение 100
last = scores.pop()     # удалить и вернуть последний
\`\`\`

| Функция/метод | Что делает |
|---|---|
| \`len(lst)\` | количество элементов |
| \`sum(lst)\`, \`min(lst)\`, \`max(lst)\` | сумма, минимум, максимум |
| \`sorted(lst)\` | новый отсортированный список |
| \`lst.sort()\` | сортирует сам список |
| \`lst.reverse()\` | разворачивает |
| \`x in lst\` | есть ли элемент |
| \`lst.index(x)\` | индекс первого вхождения |
| \`lst.count(x)\` | сколько раз встречается |

> 🧠 **Ссылки!** \`b = a\` для списка не копирует его — обе переменные указывают на ОДИН список. Изменишь через \`b\` — изменится и \`a\`. Копия: \`b = a.copy()\` или \`b = a[:]\`.`,
              },
              { kind: 'animation', topic: 'lists', title: 'Две переменные — один список', anim: { lang: 'python', code: 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)', width: 420, height: 200, frames: [
                { caption: 'a = [1, 2] — список создаётся в памяти, a хранит на него ссылку.', line: 1, boxes: [{ id: 'a', label: 'a', value: '→', x: 20, y: 30, color: 'blue', w: 70 }, { id: 'list', label: 'list @1', value: '[1, 2]', x: 220, y: 70, color: 'green', w: 150, highlight: true }], arrows: [{ from: 'a', to: 'list' }] },
                { caption: 'b = a — копируется ССЫЛКА, а не список. Обе стрелки ведут к одному объекту.', line: 2, boxes: [{ id: 'a', label: 'a', value: '→', x: 20, y: 30, color: 'blue', w: 70 }, { id: 'b', label: 'b', value: '→', x: 20, y: 120, color: 'purple', w: 70, highlight: true }, { id: 'list', label: 'list @1', value: '[1, 2]', x: 220, y: 70, color: 'green', w: 150 }], arrows: [{ from: 'a', to: 'list' }, { from: 'b', to: 'list' }] },
                { caption: 'b.append(3) меняет тот самый общий список.', line: 3, boxes: [{ id: 'a', label: 'a', value: '→', x: 20, y: 30, color: 'blue', w: 70 }, { id: 'b', label: 'b', value: '→', x: 20, y: 120, color: 'purple', w: 70 }, { id: 'list', label: 'list @1', value: '[1, 2, 3]', x: 220, y: 70, color: 'green', w: 150, highlight: true }], arrows: [{ from: 'a', to: 'list' }, { from: 'b', to: 'list' }] },
                { caption: 'print(a) → [1, 2, 3]. Сюрприз для многих новичков! Посмотри это в отладчике на вкладке «Память».', line: 4, boxes: [{ id: 'a', label: 'a', value: '→', x: 20, y: 30, color: 'blue', w: 70, highlight: true }, { id: 'b', label: 'b', value: '→', x: 20, y: 120, color: 'purple', w: 70 }, { id: 'list', label: 'list @1', value: '[1, 2, 3]', x: 220, y: 70, color: 'green', w: 150 }], arrows: [{ from: 'a', to: 'list' }, { from: 'b', to: 'list' }] },
              ] } },
              { kind: 'predict', topic: 'lists', lang: 'python', code: 'nums = [3, 1, 4]\nnums.append(1)\nnums.sort()\nprint(nums)\nprint(len(nums), nums[-1])', answer: '[1, 1, 3, 4]\n4 4', explain: 'После append: [3, 1, 4, 1], после sort: [1, 1, 3, 4]. Длина 4, последний элемент 4.' },
              { kind: 'match', topic: 'lists', prompt: 'Сопоставь метод и действие', pairs: [['append(x)', 'Добавить в конец'], ['pop()', 'Удалить и вернуть последний'], ['insert(i, x)', 'Вставить по индексу'], ['remove(x)', 'Удалить первое вхождение значения']] },
              { kind: 'quiz', topic: 'lists', question: '`a = [1, 2]; b = a; b.append(3)`. Чему равно `a`?', options: ['[1, 2, 3]', '[1, 2]', '[3]', 'Ошибка'], answer: 0, explain: 'a и b ссылаются на один и тот же список.' },
              { kind: 'code', topic: 'lists', lang: 'python', prompt: 'Дан список оценок. Выведи **среднее** (с округлением до 1 знака через `round`), **лучшую** и **худшую** оценки — три строки.', starter: 'grades = [5, 4, 3, 5, 5, 2, 4]\n', tests: [{ expected: '4.0\n5\n2' }], hints: ['Среднее = `sum(grades) / len(grades)`.', 'Округление: `round(x, 1)`.', 'Лучшая — `max`, худшая — `min`.'], solution: 'grades = [5, 4, 3, 5, 5, 2, 4]\nprint(round(sum(grades) / len(grades), 1))\nprint(max(grades))\nprint(min(grades))' },
              { kind: 'code', topic: 'lists', lang: 'python', prompt: 'Прочитай строку чисел через пробел (например, `3 8 1 9 4`). Выведи только числа **больше 3** через пробел, сохраняя порядок.', starter: 'numbers = [int(x) for x in input().split()]\n', tests: [{ stdin: ['3 8 1 9 4'], expected: '8 9 4' }, { stdin: ['10 2 7'], expected: '10 7' }], hints: ['Создай пустой список `result = []` и в цикле добавляй подходящие числа.', 'Вывод через пробел: `print(*result)` или `" ".join(map(str, result))`.'], solution: 'numbers = [int(x) for x in input().split()]\nresult = []\nfor n in numbers:\n    if n > 3:\n        result.append(n)\nprint(*result)' },
            ],
          },
          {
            id: 'py-comprehensions',
            title: 'Генераторы списков (list comprehensions)',
            minutes: 8,
            steps: [
              {
                kind: 'theory',
                topic: 'lists',
                title: 'Список в одну строку',
                md: `Частая задача — создать новый список из старого. Обычный способ:

\`\`\`python
squares = []
for x in range(1, 6):
    squares.append(x ** 2)
\`\`\`

**List comprehension** делает то же в одну строку:

\`\`\`python
squares = [x ** 2 for x in range(1, 6)]          # [1, 4, 9, 16, 25]
evens = [x for x in range(20) if x % 2 == 0]       # с фильтром
words = [w.upper() for w in "мама мыла раму".split()]
\`\`\`

Схема: \`[выражение for элемент in последовательность if условие]\`.

Так же работают словари и множества: \`{x: x**2 for x in range(5)}\`, \`{len(w) for w in words}\`.

> 💡 Если генератор становится длинным и непонятным — лучше обычный цикл. Читаемость важнее краткости.`,
              },
              { kind: 'predict', topic: 'lists', lang: 'python', code: 'print([n * 10 for n in [1, 2, 3]])\nprint([c for c in "hello" if c != "l"])', answer: "[10, 20, 30]\n['h', 'e', 'o']", explain: 'Первый — умножение каждого элемента, второй — фильтр, убирающий «l».' },
              { kind: 'fill', topic: 'lists', lang: 'python', prompt: 'Получи список длин слов', template: 'words = ["кот", "собака", "ёж"]\nlengths = [___ for w in ___]\nprint(lengths)  # [3, 6, 2]', answers: [['len(w)'], ['words']] },
              { kind: 'code', topic: 'lists', lang: 'python', prompt: 'С помощью генератора списков создай список квадратов **нечётных** чисел от 1 до 15 и выведи его.', starter: '', tests: [{ expected: '[1, 9, 25, 49, 81, 121, 169, 225]' }], hints: ['`range(1, 16)` и условие `if x % 2 == 1`.'], solution: 'print([x ** 2 for x in range(1, 16) if x % 2 == 1])' },
            ],
          },
        ],
      },
      {
        id: 'py-coll-2',
        title: 'Словари, кортежи, множества',
        lessons: [
          {
            id: 'py-dicts',
            title: 'Словари: ключ → значение',
            minutes: 12,
            steps: [
              {
                kind: 'theory',
                topic: 'dicts',
                title: 'Словарь как телефонная книга',
                md: `**Словарь** хранит пары **ключ → значение**. По ключу значение находится мгновенно:

\`\`\`python
phone = {"Аня": "+7-900-111", "Боря": "+7-900-222"}
print(phone["Аня"])           # +7-900-111
phone["Вика"] = "+7-900-333"  # добавить
phone["Аня"] = "+7-999-000"   # изменить
del phone["Боря"]             # удалить
\`\`\`

| Операция | Пример |
|---|---|
| Есть ли ключ | \`"Аня" in phone\` |
| Безопасное чтение | \`phone.get("Гоша", "нет")\` |
| Все ключи / значения / пары | \`keys()\`, \`values()\`, \`items()\` |
| Перебор | \`for name, num in phone.items():\` |
| Длина | \`len(phone)\` |

Ключи — неизменяемые значения (строки, числа, кортежи). Значения — что угодно, даже списки и другие словари:

\`\`\`python
user = {
    "name": "Аня",
    "skills": ["Python", "Git"],
    "address": {"city": "Пермь"},
}
print(user["address"]["city"])
\`\`\`

**Частый приём — подсчёт:**
\`\`\`python
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
\`\`\``,
              },
              { kind: 'example', topic: 'dicts', lang: 'python', code: 'text = "кот пёс кот рыба кот пёс"\ncounts = {}\nfor word in text.split():\n    counts[word] = counts.get(word, 0) + 1\nprint(counts)\nfor word, n in counts.items():\n    print(f"{word}: {n}")' },
              { kind: 'predict', topic: 'dicts', lang: 'python', code: 'stock = {"яблоки": 5, "груши": 2}\nstock["яблоки"] -= 1\nstock["сливы"] = 7\nprint(len(stock), stock["яблоки"])', answer: '3 4', explain: 'Добавилась «сливы» → 3 ключа. Яблок стало 5 − 1 = 4.' },
              { kind: 'quiz', topic: 'dicts', question: 'Что вернёт `d.get("x", 0)`, если ключа "x" нет?', options: ['0', 'None', 'KeyError', '"x"'], answer: 0, explain: 'get возвращает значение по умолчанию (второй аргумент), если ключа нет.' },
              { kind: 'fixbug', topic: 'dicts', lang: 'python', prompt: 'Программа должна выводить цену товара или `Нет в наличии`, но падает с ошибкой для неизвестных товаров. Исправь.', code: 'prices = {"хлеб": 50, "молоко": 90}\nitem = input()\nprint(prices[item])', tests: [{ stdin: ['хлеб'], expected: '50' }, { stdin: ['сыр'], expected: 'Нет в наличии' }], hints: ['Обращение `prices[item]` к несуществующему ключу вызывает KeyError.', 'Используй `prices.get(item, "Нет в наличии")` или проверку `if item in prices`.'], solution: 'prices = {"хлеб": 50, "молоко": 90}\nitem = input()\nprint(prices.get(item, "Нет в наличии"))' },
              { kind: 'code', topic: 'dicts', lang: 'python', prompt: 'Прочитай строку текста и выведи самую частую **букву** (без учёта пробелов, в нижнем регистре). Если таких несколько — ту, что встретилась раньше.', starter: 'text = input().lower()\n', tests: [{ stdin: ['Мама мыла раму'], expected: 'м' }, { stdin: ['hello world'], expected: 'l' }, { stdin: ['abc'], expected: 'a', hidden: true }], hints: ['Посчитай буквы словарём, пропуская пробелы.', 'Найди максимум: `max(counts, key=counts.get)` — при равенстве вернёт первый добавленный ключ.'], solution: 'text = input().lower()\ncounts = {}\nfor ch in text:\n    if ch != " ":\n        counts[ch] = counts.get(ch, 0) + 1\nprint(max(counts, key=counts.get))' },
            ],
          },
          {
            id: 'py-tuples-sets',
            title: 'Кортежи и множества',
            minutes: 9,
            steps: [
              {
                kind: 'theory',
                topic: 'lists',
                title: 'Ещё две коллекции',
                md: `**Кортеж (tuple)** — как список, но **неизменяемый**. Пишется в круглых скобках:

\`\`\`python
point = (3, 5)
x, y = point          # распаковка
print(x + y)          # 8
# point[0] = 10       # ошибка: кортеж нельзя изменить
\`\`\`

Кортежи используют для данных, которые не должны меняться (координаты, RGB-цвет), и чтобы вернуть из функции несколько значений.

**Трюк — обмен значений:** \`a, b = b, a\`.

**Множество (set)** — коллекция **уникальных** элементов без порядка:

\`\`\`python
tags = {"python", "игры", "python"}
print(tags)              # {'python', 'игры'} — дубликаты исчезли
tags.add("веб")
print("игры" in tags)    # очень быстро!
\`\`\`

Операции над множествами:

| Операция | Смысл |
|---|---|
| \`a | b\` | объединение |
| \`a & b\` | пересечение (общие) |
| \`a - b\` | разность |
| \`set(lst)\` | убрать дубликаты из списка |

| Коллекция | Порядок | Изменяемая | Дубликаты |
|---|---|---|---|
| list \`[ ]\` | да | да | да |
| tuple \`( )\` | да | нет | да |
| set \`{ }\` | нет | да | нет |
| dict \`{k: v}\` | да (по вставке) | да | ключи уникальны |`,
              },
              { kind: 'predict', topic: 'lists', lang: 'python', code: 'a = {1, 2, 3, 4}\nb = {3, 4, 5}\nprint(sorted(a & b))\nprint(len(a | b))', answer: '[3, 4]\n5', explain: 'Пересечение — {3, 4}. Объединение — {1, 2, 3, 4, 5}: 5 элементов.' },
              { kind: 'predict', topic: 'variables', lang: 'python', code: 'a = 1\nb = 2\na, b = b, a\nprint(a, b)', answer: '2 1', explain: 'Распаковка кортежа меняет значения местами за одну операцию.' },
              { kind: 'match', topic: 'lists', prompt: 'Какую коллекцию выбрать?', pairs: [['Уникальные посетители сайта', 'set'], ['Координаты точки (x, y)', 'tuple'], ['Список задач, который будет меняться', 'list'], ['Логин → пароль', 'dict']] },
              { kind: 'code', topic: 'lists', lang: 'python', prompt: 'Прочитай две строки со словами. Выведи слова, которые есть в **обеих** строках, в алфавитном порядке через пробел.', starter: 'first = input().split()\nsecond = input().split()\n', tests: [{ stdin: ['кот пёс рыба', 'рыба птица кот'], expected: 'кот рыба' }, { stdin: ['a b c', 'c d b'], expected: 'b c' }], hints: ['Преврати списки во множества: `set(first)`.', 'Пересечение — `&`, сортировка — `sorted()`.'], solution: 'first = input().split()\nsecond = input().split()\nprint(*sorted(set(first) & set(second)))' },
            ],
          },
        ],
      },
    ],
  },
];
