// Курс Python, углублённые главы: встраиваются в модули основной программы (см. course/index.ts).
import type { Chapter } from '../types';

const py = String.raw;

/** Дополнительные главы по id модуля, в который их нужно добавить. */
export const pythonExtraChapters: Record<string, Chapter[]> = {
  'py-start': [
    {
      id: 'py-start-2',
      title: 'Строки и вывод глубже',
      description: 'Коды символов, проверки строк, шифр Цезаря и красивое форматирование вывода.',
      lessons: [
        {
          id: 'py-strings-methods',
          title: 'Символы, коды и шифры',
          minutes: 12,
          steps: [
            {
              kind: 'theory',
              topic: 'strings',
              title: 'Каждый символ — это число',
              md: `Компьютер хранит символы как числа (коды Unicode). В Python есть две функции-переводчика:

\`\`\`python
ord("A")    # 65  — код символа
chr(66)     # "B" — символ по коду
\`\`\`

Буквы латиницы идут подряд: \`a\` = 97, \`b\` = 98, … \`z\` = 122. Поэтому «сдвинуть букву на 3» — это \`chr(ord(ch) + 3)\`.

**Проверки строк** возвращают True или False:

| Метод | True, если строка… | Пример |
|---|---|---|
| \`isdigit()\` | состоит из цифр | \`"2024".isdigit()\` |
| \`isalpha()\` | состоит из букв | \`"Привет".isalpha()\` |
| \`isalnum()\` | из букв и цифр | \`"abc123".isalnum()\` |
| \`isspace()\` | из пробельных символов | \`"  ".isspace()\` |
| \`isupper()\` / \`islower()\` | вся в верхнем / нижнем регистре | \`"ОК".isupper()\` |

**Собирать строку по частям** лучше через список и \`"".join(...)\`: строки неизменяемы, и \`s += ch\` в длинном цикле каждый раз создаёт новую строку.

\`\`\`python
parts = []
for ch in "hello":
    parts.append(ch.upper())
print("".join(parts))   # HELLO
\`\`\``,
            },
            {
              kind: 'example',
              topic: 'strings',
              lang: 'python',
              title: 'Шифр Цезаря для одного слова',
              code: py`word = "hello"
shift = 3
result = []
for ch in word:
    code = ord(ch) - ord("a")          # позиция буквы: 0..25
    code = (code + shift) % 26          # сдвиг по кругу
    result.append(chr(code + ord("a")))
print("".join(result))`,
              note: 'Остаток от деления `% 26` заворачивает алфавит по кругу: после `z` снова идёт `a`. Попробуй сдвиг 23 — это расшифровка.',
            },
            { kind: 'predict', topic: 'strings', lang: 'python', code: py`print(ord("A"), chr(66))
print("abc123".isdigit(), "123".isdigit())`, answer: '65 B\nFalse True', explain: 'ord("A") = 65, chr(66) = "B". В "abc123" есть буквы, поэтому isdigit() возвращает False.' },
            { kind: 'match', topic: 'strings', prompt: 'Сопоставь выражение и результат', pairs: [['"Hello".swapcase()', '"hELLO"'], ['"a,b".split(",")', "['a', 'b']"], ['"ab".center(6, "*")', '"**ab**"'], ['"7".zfill(3)', '"007"']] },
            { kind: 'quiz', topic: 'strings', question: 'Почему для склейки большого числа кусков лучше `"".join(parts)`, а не `s += part` в цикле?', options: ['Строки неизменяемы: += каждый раз создаёт новую строку, join собирает результат один раз', 'join работает только с числами', '+= запрещён для строк', 'Разницы нет'], answer: 0, explain: 'На тысячах кусков разница в скорости огромная.' },
            {
              kind: 'code',
              topic: 'strings',
              lang: 'python',
              prompt: 'Напиши функцию `count_types(s)`, которая возвращает список из трёх чисел: **[буквы, цифры, пробелы]** в строке.',
              starter: 'def count_types(s):\n    pass\n',
              tests: [{ expr: 'count_types("Hi 2 you 42")', expected: '[5, 3, 3]' }, { expr: 'count_types("")', expected: '[0, 0, 0]' }, { expr: 'count_types("Привет, мир 2025!")', expected: '[9, 4, 2]' }],
              hints: ['Заведи три счётчика и перебери символы циклом.', 'Используй `ch.isalpha()`, `ch.isdigit()`, `ch.isspace()`.'],
              solution: py`def count_types(s):
    letters = digits = spaces = 0
    for ch in s:
        if ch.isalpha():
            letters += 1
        elif ch.isdigit():
            digits += 1
        elif ch.isspace():
            spaces += 1
    return [letters, digits, spaces]`,
            },
            {
              kind: 'code',
              topic: 'strings',
              lang: 'python',
              prompt: 'Напиши `caesar(text, shift)` — шифр Цезаря для **латинских** букв: строчные остаются строчными, заглавные — заглавными, остальные символы не меняются. Сдвиг может быть отрицательным.',
              starter: 'def caesar(text, shift):\n    pass\n',
              tests: [{ expr: 'caesar("abc xyz", 1)', expected: '"bcd yza"' }, { expr: 'caesar("Hello, World!", 3)', expected: '"Khoor, Zruog!"' }, { expr: 'caesar("abc", -1)', expected: '"zab"' }, { expr: 'caesar(caesar("Python 3", 13), 13)', expected: '"Python 3"', hidden: true }],
              hints: ['Для заглавной буквы точка отсчёта — `ord("A")`, для строчной — `ord("a")`.', 'Новая позиция: `(ord(ch) - base + shift) % 26`.', 'Проверка «латинская буква»: `ch.isascii() and ch.isalpha()`.'],
              solution: py`def caesar(text, shift):
    result = []
    for ch in text:
        if ch.isascii() and ch.isalpha():
            base = ord("A") if ch.isupper() else ord("a")
            result.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            result.append(ch)
    return "".join(result)`,
            },
          ],
        },
        {
          id: 'py-string-format',
          title: 'Форматирование вывода',
          minutes: 10,
          steps: [
            {
              kind: 'theory',
              topic: 'output',
              title: 'Красивые таблицы и числа',
              md: `Внутри f-строки после двоеточия можно указать **формат**: \`f"{значение:формат}"\`.

| Формат | Пример | Результат |
|---|---|---|
| \`.2f\` — 2 знака после точки | \`f"{3.14159:.2f}"\` | \`3.14\` |
| \`05d\` — дополнить нулями | \`f"{42:05d}"\` | \`00042\` |
| \`,\` — разделитель тысяч | \`f"{1234567:,}"\` | \`1,234,567\` |
| \`.0%\` — проценты | \`f"{0.256:.0%}"\` | \`26%\` |
| \`<10\` — влево, ширина 10 | \`f"{'кот':<10}|"\` | \`кот       |\` |
| \`>10\` — вправо | \`f"{'кот':>10}|"\` | \`       кот|\` |
| \`^10\` — по центру | \`f"{'кот':^10}|"\` | \`   кот    |\` |
| \`>8.2f\` — вправо и 2 знака | \`f"{45.5:>8.2f}"\` | \`   45.50\` |

**Параметры print:**
- \`sep\` — что ставить между значениями (по умолчанию пробел): \`print(1, 2, 3, sep=", ")\` → \`1, 2, 3\`
- \`end\` — чем закончить строку (по умолчанию перевод строки): \`print("a", end="")\`

> 💡 Ширина и выравнивание делают из вывода аккуратную таблицу — так оформляют чеки, отчёты и консольные программы.`,
            },
            {
              kind: 'example',
              topic: 'output',
              lang: 'python',
              title: 'Таблица результатов',
              code: py`players = [("Аня", 1520, 0.71), ("Борис", 980, 0.48), ("Вика", 1210, 0.63)]
print(f"{'Игрок':<8}{'Очки':>8}{'Победы':>9}")
print("-" * 25)
for name, score, rate in players:
    print(f"{name:<8}{score:>8,}{rate:>9.0%}")`,
            },
            { kind: 'predict', topic: 'output', lang: 'python', code: py`print(f"{3.14159:.2f}")
print(f"{42:05d}")
print(f"{1234567:,}")`, answer: '3.14\n00042\n1,234,567', explain: '.2f — два знака, 05d — ширина 5 с нулями, запятая — разделитель тысяч.' },
            { kind: 'quiz', topic: 'output', question: 'Что выведет `print("a", "b", sep="-", end="!")`?', options: ['a-b!', 'a b!', 'a-b', 'a-b\\n!'], answer: 0, explain: 'sep ставится между значениями, end — в конце вместо перевода строки.' },
            { kind: 'fill', topic: 'output', lang: 'python', prompt: 'Выведи цену с двумя знаками после точки, выровненную по правому краю в поле шириной 10', template: 'price = 7.5\nprint(f"{price:___}")', answers: [['>10.2f']] },
            {
              kind: 'code',
              topic: 'output',
              lang: 'python',
              prompt: 'Выведи чек. Каждая строка товара: название, выровненное **влево** в поле 10 символов, затем цена **вправо** в поле 8 с двумя знаками (`f"{name:<10}{price:>8.2f}"`). Последняя строка — так же для слова `Итого` и суммы.',
              starter: 'items = [("Хлеб", 45.5), ("Молоко", 89.9), ("Сыр", 320)]\n',
              tests: [{ expected: 'Хлеб         45.50\nМолоко       89.90\nСыр         320.00\nИтого       455.40' }],
              hints: ['Перебери товары циклом `for name, price in items:`.', 'Сумму посчитай через `sum(p for _, p in items)` или накопителем.'],
              solution: py`items = [("Хлеб", 45.5), ("Молоко", 89.9), ("Сыр", 320)]
for name, price in items:
    print(f"{name:<10}{price:>8.2f}")
total = sum(price for _, price in items)
print(f"{'Итого':<10}{total:>8.2f}")`,
            },
          ],
        },
      ],
    },
  ],
  'py-flow': [
    {
      id: 'py-flow-3',
      title: 'Практика циклов',
      description: 'Вложенные циклы, шаблоны «счётчик», «поиск максимума», «флаг» и for…else.',
      lessons: [
        {
          id: 'py-nested-loops',
          title: 'Вложенные циклы',
          minutes: 12,
          steps: [
            {
              kind: 'theory',
              topic: 'loops',
              title: 'Цикл внутри цикла',
              md: `Внутри тела цикла может быть другой цикл. **Внутренний цикл проходит целиком на каждом шаге внешнего.**

\`\`\`python
for row in range(1, 4):          # 3 раза
    for col in range(1, 5):      # 4 раза на каждый row
        print(row * col, end="\\t")
    print()                      # перевод строки после ряда
\`\`\`

Тело внутреннего цикла выполнится 3 × 4 = **12** раз.

Где нужны вложенные циклы:
- таблицы и сетки (строки × столбцы);
- рисование узоров из символов;
- перебор **всех пар** элементов: \`for i in range(n): for j in range(i + 1, n):\` — каждая пара ровно один раз;
- двумерные списки (матрицы).

> ⚠️ Вложенные циклы по n элементов — это n² шагов. Для 10 000 элементов это уже 100 миллионов операций. Позже научимся решать такие задачи быстрее.`,
            },
            { kind: 'example', topic: 'loops', lang: 'python', title: 'Узоры из символов', code: py`n = 5
for i in range(1, n + 1):
    print("*" * i)

for i in range(n, 0, -1):
    print(" " * (n - i) + "#" * i)` },
            { kind: 'predict', topic: 'loops', lang: 'python', code: py`for i in range(3):
    for j in range(i):
        print(i, j)`, answer: '1 0\n2 0\n2 1', explain: 'При i = 0 внутренний цикл не выполняется ни разу (range(0) пуст). При i = 1 — один раз, при i = 2 — два раза.' },
            { kind: 'quiz', topic: 'loops', question: 'Сколько раз выполнится `print`?', code: py`for i in range(4):
    for j in range(5):
        print(i, j)`, lang: 'python', options: ['20', '9', '5', '4'], answer: 0, explain: '4 итерации внешнего цикла × 5 итераций внутреннего = 20.' },
            { kind: 'order', topic: 'loops', lang: 'python', prompt: 'Собери программу, печатающую все пары (i, j), где i < j, из чисел 0..3', lines: ['n = 4', 'for i in range(n):', '    for j in range(i + 1, n):', '        print(i, j)'] },
            {
              kind: 'code',
              topic: 'loops',
              lang: 'python',
              prompt: 'Прочитай число n и выведи «лесенку» из чисел. Для n = 4:\n```\n1\n1 2\n1 2 3\n1 2 3 4\n```',
              starter: 'n = int(input())\n',
              tests: [{ stdin: ['4'], expected: '1\n1 2\n1 2 3\n1 2 3 4' }, { stdin: ['1'], expected: '1' }, { stdin: ['6'], expected: '1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5\n1 2 3 4 5 6', hidden: true }],
              hints: ['Внешний цикл по номеру строки `i` от 1 до n.', 'Во внутреннем цикле печатай числа от 1 до i через `end=" "`, или собери строку через `" ".join(...)`.'],
              solution: py`n = int(input())
for i in range(1, n + 1):
    print(" ".join(str(k) for k in range(1, i + 1)))`,
            },
            {
              kind: 'code',
              topic: 'loops',
              lang: 'python',
              prompt: 'Напиши `count_pairs(nums, target)` — сколько существует пар **разных позиций** i < j, для которых `nums[i] + nums[j] == target`. Используй вложенные циклы.',
              starter: 'def count_pairs(nums, target):\n    pass\n',
              tests: [{ expr: 'count_pairs([1, 2, 3, 4, 5], 5)', expected: '2' }, { expr: 'count_pairs([1, 1, 1], 2)', expected: '3' }, { expr: 'count_pairs([], 1)', expected: '0' }, { expr: 'count_pairs([3, 3, 3, 3], 6)', expected: '6', hidden: true }],
              hints: ['Внешний цикл: `for i in range(len(nums)):`', 'Внутренний начинается с `i + 1`, чтобы не считать пару дважды.'],
              solution: py`def count_pairs(nums, target):
    count = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                count += 1
    return count`,
            },
          ],
        },
        {
          id: 'py-loop-patterns',
          title: 'Шаблоны циклов: счётчик, максимум, флаг',
          minutes: 13,
          steps: [
            {
              kind: 'theory',
              topic: 'loops',
              title: 'Четыре приёма, которые встречаются везде',
              md: `Большинство циклов в реальных программах — вариации нескольких шаблонов.

**1. Накопитель (сумма, произведение, строка)**
\`\`\`python
total = 0
for x in numbers:
    total += x
\`\`\`

**2. Счётчик**
\`\`\`python
count = 0
for x in numbers:
    if x > 0:
        count += 1
\`\`\`

**3. Поиск максимума / минимума** — начинаем с **первого элемента**, а не с нуля (иначе сломается на отрицательных числах):
\`\`\`python
best = numbers[0]
for x in numbers:
    if x > best:
        best = x
\`\`\`

**4. Флаг** — «нашли или нет»:
\`\`\`python
found = False
for x in numbers:
    if x < 0:
        found = True
        break          # дальше искать не нужно
\`\`\`

**for … else** — блок \`else\` у цикла выполняется, если цикл **не был прерван** через break. Удобно вместо флага:
\`\`\`python
for x in numbers:
    if x < 0:
        print("Есть отрицательное")
        break
else:
    print("Все неотрицательные")
\`\`\``,
            },
            { kind: 'predict', topic: 'loops', lang: 'python', code: py`for n in [3, 7, 9]:
    if n % 2 == 0:
        print("чётное", n)
        break
else:
    print("все нечётные")`, answer: 'все нечётные', explain: 'Цикл дошёл до конца без break, поэтому выполнился else.' },
            { kind: 'findline', topic: 'loops', lang: 'python', prompt: 'Функция возвращает 0 для списка `[-5, -2, -9]`, хотя максимум равен -2. Какая строка виновата?', code: py`def find_max(nums):
    best = 0
    for n in nums:
        if n > best:
            best = n
    return best`, answer: 2, explain: 'Начальное значение 0 больше всех отрицательных чисел. Нужно начинать с первого элемента: `best = nums[0]`.' },
            { kind: 'order', topic: 'loops', lang: 'python', prompt: 'Собери функцию проверки числа на простоту', lines: ['def is_prime(n):', '    if n < 2:', '        return False', '    for d in range(2, int(n ** 0.5) + 1):', '        if n % d == 0:', '            return False', '    return True'], explain: 'Делители достаточно проверять до корня из n: если n = a·b, то один из множителей не больше √n.' },
            {
              kind: 'code',
              topic: 'loops',
              lang: 'python',
              prompt: 'Напиши `is_prime(n)` — True, если n простое (делится только на 1 и себя), иначе False. Числа меньше 2 не простые.',
              starter: 'def is_prime(n):\n    pass\n',
              tests: [{ expr: 'is_prime(2)', expected: 'true' }, { expr: 'is_prime(1)', expected: 'false' }, { expr: 'is_prime(17)', expected: 'true' }, { expr: 'is_prime(21)', expected: 'false' }, { expr: '[n for n in range(30) if is_prime(n)]', expected: '[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]', hidden: true }],
              hints: ['Перебирай возможные делители от 2.', 'Как только нашёл делитель — сразу `return False`.', 'Достаточно проверять до `int(n ** 0.5) + 1`.'],
              solution: py`def is_prime(n):
    if n < 2:
        return False
    for d in range(2, int(n ** 0.5) + 1):
        if n % d == 0:
            return False
    return True`,
            },
            {
              kind: 'code',
              topic: 'loops',
              lang: 'python',
              prompt: 'Читай целые числа, пока не введут `0`. Затем выведи три строки: **количество** чисел, **максимум** и **минимум**. Если чисел не было — выведи `Нет чисел`.',
              starter: '',
              tests: [{ stdin: ['5', '-3', '8', '0'], expected: '3\n8\n-3' }, { stdin: ['0'], expected: 'Нет чисел' }, { stdin: ['-7', '-2', '0'], expected: '2\n-2\n-7' }],
              hints: ['Используй `while True` и `break` на нуле.', 'Максимум и минимум удобно начать с `None` и обновлять: `if best is None or x > best`.'],
              solution: py`count = 0
best = worst = None
while True:
    x = int(input())
    if x == 0:
        break
    count += 1
    if best is None or x > best:
        best = x
    if worst is None or x < worst:
        worst = x
if count == 0:
    print("Нет чисел")
else:
    print(count)
    print(best)
    print(worst)`,
            },
          ],
        },
      ],
    },
  ],
  'py-collections': [
    {
      id: 'py-coll-3',
      title: 'Алгоритмы со списками и матрицы',
      description: 'Работаем со списками «вручную», двумерные списки и продвинутые словари.',
      lessons: [
        {
          id: 'py-list-algorithms',
          title: 'Алгоритмы со списками',
          minutes: 13,
          steps: [
            {
              kind: 'theory',
              topic: 'lists',
              title: 'Индексы, обмен и новые списки',
              md: `Встроенные функции (\`sorted\`, \`reversed\`, \`set\`) удобны, но программист должен уметь сделать то же самое сам — это тренирует мышление и встречается на собеседованиях.

**Обмен двух элементов** — одной строкой:
\`\`\`python
a[i], a[j] = a[j], a[i]
\`\`\`

**Два индекса навстречу друг другу** — классика для разворота:
\`\`\`python
left, right = 0, len(a) - 1
while left < right:
    a[left], a[right] = a[right], a[left]
    left += 1
    right -= 1
\`\`\`

**Изменить на месте или создать новый список?**
- на месте (\`a.sort()\`, \`a.reverse()\`, обмены) — экономит память, но меняет исходные данные;
- новый список (\`sorted(a)\`, срезы, генераторы) — безопаснее.

**Срез создаёт копию:** \`b = a[:]\`. А \`b = a\` — это та же самая коробка с двумя именами.

> ⚠️ Нельзя удалять элементы из списка, по которому идёт цикл \`for\` — индексы «съезжают». Собирай новый список или иди по копии.`,
            },
            { kind: 'predict', topic: 'lists', lang: 'python', code: py`a = [1, 2, 3, 4]
a[0], a[-1] = a[-1], a[0]
print(a)`, answer: '[4, 2, 3, 1]', explain: 'Первый и последний элементы поменялись местами.' },
            { kind: 'quiz', topic: 'lists', question: 'Что выведет код?', code: py`a = [1, 2, 3]
b = a[:]
b.append(4)
print(a)`, lang: 'python', options: ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Ошибка'], answer: 0, explain: '`a[:]` — это копия, поэтому изменения b не влияют на a.' },
            {
              kind: 'code',
              topic: 'lists',
              lang: 'python',
              prompt: 'Напиши `reverse_in_place(lst)` — разверни список **на месте** двумя индексами, без `reverse()`, `reversed` и срезов. Верни этот же список.',
              starter: 'def reverse_in_place(lst):\n    pass\n',
              tests: [{ expr: 'reverse_in_place([1, 2, 3, 4, 5])', expected: '[5, 4, 3, 2, 1]' }, { expr: 'reverse_in_place([])', expected: '[]' }, { expr: '(lambda a: reverse_in_place(a) is a)([1, 2])', expected: 'true', name: 'Это тот же список' }],
              hints: ['Начни с `left, right = 0, len(lst) - 1`.', 'Пока `left < right` — меняй элементы местами и сдвигай индексы навстречу.'],
              solution: py`def reverse_in_place(lst):
    left, right = 0, len(lst) - 1
    while left < right:
        lst[left], lst[right] = lst[right], lst[left]
        left += 1
        right -= 1
    return lst`,
            },
            {
              kind: 'code',
              topic: 'lists',
              lang: 'python',
              prompt: 'Напиши `remove_duplicates(lst)` — новый список без повторов, **сохраняя порядок первого появления**.',
              starter: 'def remove_duplicates(lst):\n    pass\n',
              tests: [{ expr: 'remove_duplicates([3, 1, 3, 2, 1])', expected: '[3, 1, 2]' }, { expr: 'remove_duplicates(["a", "a"])', expected: '["a"]' }, { expr: 'remove_duplicates([])', expected: '[]' }],
              hints: ['`set(lst)` теряет порядок — используй множество только для проверки «уже видели».', 'Заведи `seen = set()` и `result = []`.'],
              solution: py`def remove_duplicates(lst):
    seen = set()
    result = []
    for x in lst:
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result`,
            },
            {
              kind: 'code',
              topic: 'lists',
              lang: 'python',
              prompt: 'Напиши `chunk(lst, size)` — разбей список на части длиной `size` (последняя может быть короче).',
              starter: 'def chunk(lst, size):\n    pass\n',
              tests: [{ expr: 'chunk([1, 2, 3, 4, 5], 2)', expected: '[[1, 2], [3, 4], [5]]' }, { expr: 'chunk([1, 2, 3], 3)', expected: '[[1, 2, 3]]' }, { expr: 'chunk([], 4)', expected: '[]' }],
              hints: ['`range(0, len(lst), size)` даёт начала частей: 0, size, 2·size…', 'Каждая часть — срез `lst[i:i + size]`.'],
              solution: py`def chunk(lst, size):
    return [lst[i:i + size] for i in range(0, len(lst), size)]`,
            },
          ],
        },
        {
          id: 'py-matrix',
          title: 'Двумерные списки (матрицы)',
          minutes: 13,
          steps: [
            {
              kind: 'theory',
              topic: 'lists',
              title: 'Список списков',
              md: `Таблицу, игровое поле или картинку хранят как **список строк**, где каждая строка — тоже список:

\`\`\`python
grid = [
    [1, 2, 3],
    [4, 5, 6],
]
grid[0][2]     # 3 — строка 0, столбец 2
len(grid)      # 2 строки
len(grid[0])   # 3 столбца
\`\`\`

**Перебор:**
\`\`\`python
for row in grid:
    for value in row:
        print(value, end=" ")
    print()
\`\`\`

**Создание пустой матрицы — осторожно!**
\`\`\`python
good = [[0] * 3 for _ in range(2)]   # ✅ две независимые строки
bad = [[0] * 3] * 2                  # ❌ два раза ОДНА И ТА ЖЕ строка
\`\`\`

**Транспонирование** (строки ↔ столбцы): \`[list(col) for col in zip(*grid)]\`.

| Задача | Как |
|---|---|
| Сумма всех элементов | \`sum(sum(row) for row in grid)\` |
| Столбец j | \`[row[j] for row in grid]\` |
| Главная диагональ | \`[grid[i][i] for i in range(n)]\` |
| Побочная диагональ | \`[grid[i][n - 1 - i] for i in range(n)]\` |`,
            },
            { kind: 'predict', topic: 'lists', lang: 'python', code: py`grid = [[0] * 3] * 2
grid[0][0] = 1
print(grid)`, answer: '[[1, 0, 0], [1, 0, 0]]', explain: '`[[0] * 3] * 2` кладёт в список ДВЕ ССЫЛКИ на одну строку. Меняем одну — меняются «обе». Посмотри это в отладчике на вкладке «Память».' },
            { kind: 'match', topic: 'lists', prompt: 'Для m = [[1, 2], [3, 4]] сопоставь выражение и результат', pairs: [['m[1][0]', '3'], ['[row[1] for row in m]', '[2, 4]'], ['sum(sum(r) for r in m)', '10'], ['[list(c) for c in zip(*m)]', '[[1, 3], [2, 4]]']] },
            {
              kind: 'code',
              topic: 'lists',
              lang: 'python',
              prompt: 'Напиши `transpose(m)` — верни новую матрицу, где строки стали столбцами.',
              starter: 'def transpose(m):\n    pass\n',
              tests: [{ expr: 'transpose([[1, 2, 3], [4, 5, 6]])', expected: '[[1, 4], [2, 5], [3, 6]]' }, { expr: 'transpose([[7]])', expected: '[[7]]' }],
              hints: ['Новая матрица имеет `len(m[0])` строк и `len(m)` столбцов.', 'Элемент `[j][i]` новой = элемент `[i][j]` старой. Или используй `zip(*m)`.'],
              solution: py`def transpose(m):
    return [[m[i][j] for i in range(len(m))] for j in range(len(m[0]))]`,
            },
            {
              kind: 'code',
              topic: 'lists',
              lang: 'python',
              prompt: 'Напиши `diagonal_sum(m)` для квадратной матрицы: сумма главной и побочной диагоналей. Центральный элемент (если n нечётное) считать **один раз**.',
              starter: 'def diagonal_sum(m):\n    pass\n',
              tests: [{ expr: 'diagonal_sum([[1, 2, 3], [4, 5, 6], [7, 8, 9]])', expected: '25' }, { expr: 'diagonal_sum([[5]])', expected: '5' }, { expr: 'diagonal_sum([[1, 2], [3, 4]])', expected: '10' }],
              hints: ['Главная диагональ: `m[i][i]`, побочная: `m[i][n - 1 - i]`.', 'Если `i == n - 1 - i`, это один и тот же элемент.'],
              solution: py`def diagonal_sum(m):
    n = len(m)
    total = 0
    for i in range(n):
        total += m[i][i]
        if i != n - 1 - i:
            total += m[i][n - 1 - i]
    return total`,
            },
            {
              kind: 'code',
              topic: 'lists',
              lang: 'python',
              prompt: 'Крестики-нолики! Напиши `winner(board)`: доска — список из 3 строк по 3 символа (`"X"`, `"O"` или пробел). Верни `"X"` или `"O"`, если кто-то собрал линию (строка, столбец или диагональ), иначе пустую строку `""`.',
              starter: 'def winner(board):\n    pass\n',
              tests: [{ expr: 'winner(["XXX", "OO ", "   "])', expected: '"X"' }, { expr: 'winner(["XO ", "XO ", "X  "])', expected: '"X"' }, { expr: 'winner(["OXX", "XOX", "XXO"])', expected: '"O"' }, { expr: 'winner(["XOX", "OXO", "OXO"])', expected: '""' }, { expr: 'winner(["   ", "   ", "   "])', expected: '""', hidden: true }],
              hints: ['Собери все 8 линий: 3 строки, 3 столбца, 2 диагонали — каждая как строка из 3 символов.', 'Линия выигрышная, если она равна `"XXX"` или `"OOO"`.'],
              solution: py`def winner(board):
    lines = list(board)
    lines += ["".join(board[r][c] for r in range(3)) for c in range(3)]
    lines.append("".join(board[i][i] for i in range(3)))
    lines.append("".join(board[i][2 - i] for i in range(3)))
    for line in lines:
        if line in ("XXX", "OOO"):
            return line[0]
    return ""`,
            },
          ],
        },
        {
          id: 'py-dict-advanced',
          title: 'Словари глубже: группировка и подсчёт',
          minutes: 14,
          steps: [
            {
              kind: 'theory',
              topic: 'dicts',
              title: 'Словари — главный инструмент обработки данных',
              md: `**Группировка** — разложить элементы по «корзинам»:
\`\`\`python
groups = {}
for word in ["кот", "слон", "пёс", "жираф"]:
    groups.setdefault(len(word), []).append(word)
# {3: ['кот', 'пёс'], 4: ['слон'], 5: ['жираф']}
\`\`\`

\`setdefault(ключ, значение)\` возвращает значение по ключу, а если ключа нет — сначала кладёт туда значение по умолчанию.

**defaultdict** делает то же автоматически:
\`\`\`python
from collections import defaultdict
groups = defaultdict(list)
groups[3].append("кот")
\`\`\`

**Counter** — словарь-счётчик:
\`\`\`python
from collections import Counter
c = Counter("abracadabra")
c["a"]              # 5
c.most_common(2)    # [('a', 5), ('b', 2)]
\`\`\`

**Сортировка словаря:**
\`\`\`python
prices = {"чай": 150, "сыр": 400, "хлеб": 50}
sorted(prices, key=prices.get)                       # ключи по возрастанию значения
sorted(prices.items(), key=lambda kv: -kv[1])        # пары по убыванию
\`\`\`

**Вложенные структуры** — словари внутри словарей, списки внутри словарей. Так устроен JSON из любого API:
\`\`\`python
students = {"Аня": {"math": 5, "art": 4}, "Боря": {"math": 3, "art": 5}}
students["Аня"]["math"]   # 5
\`\`\``,
            },
            { kind: 'example', topic: 'dicts', lang: 'python', title: 'Анализ оценок', code: py`from collections import defaultdict

grades = [("Аня", 5), ("Боря", 3), ("Аня", 4), ("Вика", 5), ("Боря", 4)]
by_student = defaultdict(list)
for name, g in grades:
    by_student[name].append(g)

for name, gs in sorted(by_student.items()):
    print(f"{name}: {gs}, среднее {sum(gs) / len(gs):.1f}")` },
            { kind: 'predict', topic: 'dicts', lang: 'python', code: py`from collections import Counter
c = Counter("abracadabra")
print(c.most_common(2))`, answer: "[('a', 5), ('b', 2)]", explain: 'a встречается 5 раз. b и r — по 2 раза; при равенстве most_common сохраняет порядок первого появления, а b встретилась раньше.' },
            { kind: 'predict', topic: 'dicts', lang: 'python', code: py`d = {"b": 2, "a": 3, "c": 1}
print(sorted(d, key=d.get))`, answer: "['c', 'b', 'a']", explain: 'Ключи отсортированы по значениям: 1, 2, 3.' },
            {
              kind: 'code',
              topic: 'dicts',
              lang: 'python',
              prompt: 'Напиши `group_by_length(words)` — словарь «длина слова → список слов этой длины» (в порядке появления).',
              starter: 'def group_by_length(words):\n    pass\n',
              tests: [{ expr: 'group_by_length(["кот", "слон", "пёс", "жираф"])', expected: '{"3": ["кот", "пёс"], "4": ["слон"], "5": ["жираф"]}' }, { expr: 'group_by_length([])', expected: '{}' }],
              hints: ['Используй `setdefault(len(w), []).append(w)` или `defaultdict(list)`.', 'Тест сравнивает JSON, поэтому числовые ключи там записаны строками — это нормально.'],
              solution: py`def group_by_length(words):
    groups = {}
    for w in words:
        groups.setdefault(len(w), []).append(w)
    return groups`,
            },
            {
              kind: 'code',
              topic: 'dicts',
              lang: 'python',
              prompt: 'Напиши `top_words(text, n)` — список из n самых частых слов текста (в нижнем регистре). При равной частоте — то, что встретилось раньше.',
              starter: 'from collections import Counter\n\ndef top_words(text, n):\n    pass\n',
              tests: [{ expr: 'top_words("Кот и пёс и кот и мышь", 2)', expected: '["и", "кот"]' }, { expr: 'top_words("a b c", 2)', expected: '["a", "b"]' }],
              hints: ['`Counter(text.lower().split())`', '`most_common(n)` возвращает пары (слово, количество) — возьми только слова.'],
              solution: py`from collections import Counter

def top_words(text, n):
    counts = Counter(text.lower().split())
    return [word for word, _ in counts.most_common(n)]`,
            },
            {
              kind: 'code',
              topic: 'dicts',
              lang: 'python',
              prompt: 'Дан словарь учеников: имя → словарь «предмет → оценка». Напиши `best_in(students, subject)` — имя ученика с наибольшей оценкой по предмету (у кого предмета нет — не участвует). Если никто не изучает предмет — верни `None`.',
              starter: 'def best_in(students, subject):\n    pass\n',
              tests: [{ expr: 'best_in({"Аня": {"math": 5, "art": 4}, "Боря": {"math": 3, "art": 5}}, "art")', expected: '"Боря"' }, { expr: 'best_in({"Аня": {"math": 4}, "Вика": {"math": 5}}, "math")', expected: '"Вика"' }, { expr: 'best_in({"Аня": {"math": 4}}, "music")', expected: 'null' }],
              hints: ['Отбери пары (имя, оценка) только для тех, у кого есть предмет: `if subject in marks`.', 'Затем найди максимум по оценке.'],
              solution: py`def best_in(students, subject):
    best_name, best_mark = None, None
    for name, marks in students.items():
        if subject in marks and (best_mark is None or marks[subject] > best_mark):
            best_name, best_mark = name, marks[subject]
    return best_name`,
            },
          ],
        },
      ],
    },
  ],
};
