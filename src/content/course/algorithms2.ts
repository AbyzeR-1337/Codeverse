// Курс «Алгоритмы»: приёмы решения задач, деревья и графы, динамическое программирование.
import type { AnimFrame, Module } from '../types';

const py = String.raw;

/** Кадры анимации «два указателя»: ищем пару с суммой 10. */
function twoPointerFrames(): AnimFrame[] {
  const arr = [1, 3, 4, 6, 8, 11];
  const steps: [number, number, string][] = [
    [0, 5, '1 + 11 = 12 > 10 → сумма велика, двигаем правый указатель влево.'],
    [0, 4, '1 + 8 = 9 < 10 → сумма мала, двигаем левый указатель вправо.'],
    [1, 4, '3 + 8 = 11 > 10 → двигаем правый.'],
    [1, 3, '3 + 6 = 9 < 10 → двигаем левый.'],
    [2, 3, '4 + 6 = 10 — нашли! Всего 5 шагов вместо 15 проверок всех пар.'],
  ];
  return [
    { caption: 'Массив отсортирован. Левый указатель — в начале, правый — в конце.', boxes: arr.map((v, i) => ({ id: `e${i}`, value: String(v), x: 20 + i * 95, y: 60, w: 80, h: 56, color: i === 0 || i === 5 ? ('yellow' as const) : ('blue' as const) })) },
    ...steps.map(([l, r, caption], k) => ({
      caption,
      boxes: [
        ...arr.map((v, i) => ({
          id: `e${i}`,
          value: String(v),
          x: 20 + i * 95,
          y: 60,
          w: 80,
          h: 56,
          color: (k === steps.length - 1 && (i === l || i === r) ? 'green' : i === l || i === r ? 'yellow' : i < l || i > r ? 'gray' : 'blue') as 'blue',
          highlight: i === l || i === r,
        })),
        { id: 'L', label: 'L', x: 20 + l * 95 + 20, y: 140, w: 40, h: 36, shape: 'round' as const, color: 'purple' as const },
        { id: 'R', label: 'R', x: 20 + r * 95 + 20, y: 140, w: 40, h: 36, shape: 'round' as const, color: 'purple' as const },
      ],
    })),
  ];
}

export const algoExtraModules: Module[] = [
  {
    id: 'algo-patterns',
    title: 'Приёмы решения задач',
    chapters: [
      {
        id: 'algo-p-1',
        title: 'Два указателя, окно и префиксные суммы',
        lessons: [
          {
            id: 'algo-two-pointers',
            title: 'Два указателя',
            minutes: 13,
            steps: [
              {
                kind: 'theory',
                topic: 'algorithms',
                title: 'Два индекса вместо двух циклов',
                md: `Многие задачи «наивно» решаются двумя вложенными циклами за O(n²). Приём **двух указателей** часто даёт O(n).

**Вариант 1 — навстречу друг другу** (отсортированный массив, палиндромы, разворот):
\`\`\`python
left, right = 0, len(a) - 1
while left < right:
    s = a[left] + a[right]
    if s == target: return [left, right]
    if s < target: left += 1      # нужна сумма больше — берём число побольше
    else: right -= 1              # сумма велика — берём число поменьше
\`\`\`
Работает, потому что массив **отсортирован**: каждый шаг отбрасывает один элемент, который точно не войдёт в ответ.

**Вариант 2 — в одну сторону** («медленный» и «быстрый»): удалить дубликаты на месте, переместить нули в конец, слить два отсортированных массива.
\`\`\`python
write = 0
for read in range(len(a)):
    if a[read] != 0:
        a[write] = a[read]
        write += 1
\`\`\``,
              },
              { kind: 'animation', topic: 'algorithms', title: 'Пара с суммой 10', anim: { width: 600, height: 200, frames: twoPointerFrames() } },
              { kind: 'quiz', topic: 'complexity', question: 'Почему два указателя ищут пару с нужной суммой в **отсортированном** массиве за O(n)?', options: ['Каждый шаг сдвигает один указатель и навсегда отбрасывает один элемент', 'Потому что используется хеш-таблица', 'Потому что массив короткий', 'Это O(n²)'], answer: 0, explain: 'Указатели сдвигаются не больше n раз в сумме.' },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `pair_sum_sorted(nums, target)` — индексы `[i, j]` двух чисел отсортированного массива с суммой target (i < j), или `[]`. Решение за O(n) двумя указателями.',
                starter: 'def pair_sum_sorted(nums, target):\n    pass\n',
                tests: [{ expr: 'pair_sum_sorted([1, 3, 4, 6, 8, 11], 10)', expected: '[2, 3]' }, { expr: 'pair_sum_sorted([1, 2], 5)', expected: '[]' }, { expr: 'pair_sum_sorted([-3, 0, 2, 5], 2)', expected: '[0, 3]' }, { expr: 'pair_sum_sorted(list(range(200000)), 399997)', expected: '[199998, 199999]', hidden: true }],
                hints: ['Начни с `left, right = 0, len(nums) - 1`.', 'Сумма меньше нужной — `left += 1`, больше — `right -= 1`.'],
                solution: py`def pair_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return [left, right]
        if s < target:
            left += 1
        else:
            right -= 1
    return []`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `move_zeros(nums)` — перенеси все нули в конец **на месте**, сохранив порядок остальных элементов. Верни этот же список.',
                starter: 'def move_zeros(nums):\n    pass\n',
                tests: [{ expr: 'move_zeros([0, 1, 0, 3, 12])', expected: '[1, 3, 12, 0, 0]' }, { expr: 'move_zeros([0, 0])', expected: '[0, 0]' }, { expr: '(lambda a: move_zeros(a) is a)([1, 0])', expected: 'true', name: 'Изменяется тот же список' }],
                hints: ['Указатель `write` — куда записать следующий ненулевой элемент.', 'После прохода заполни нулями хвост от `write` до конца.'],
                solution: py`def move_zeros(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    for i in range(write, len(nums)):
        nums[i] = 0
    return nums`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `is_clean_palindrome(s)` двумя указателями: игнорируй всё, кроме букв и цифр, регистр не важен. Не создавай очищенную копию строки.',
                starter: 'def is_clean_palindrome(s):\n    pass\n',
                tests: [{ expr: 'is_clean_palindrome("А роза упала на лапу Азора")', expected: 'true' }, { expr: 'is_clean_palindrome("race a car")', expected: 'false' }, { expr: 'is_clean_palindrome(".,!")', expected: 'true' }],
                hints: ['Пропускай неподходящие символы: `while left < right and not s[left].isalnum(): left += 1`.', 'Сравнивай `s[left].lower()` и `s[right].lower()`.'],
                solution: py`def is_clean_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if not s[left].isalnum():
            left += 1
        elif not s[right].isalnum():
            right -= 1
        elif s[left].lower() != s[right].lower():
            return False
        else:
            left += 1
            right -= 1
    return True`,
              },
            ],
          },
          {
            id: 'algo-sliding-window',
            title: 'Скользящее окно и префиксные суммы',
            minutes: 14,
            steps: [
              {
                kind: 'theory',
                topic: 'algorithms',
                title: 'Не пересчитывай то, что уже посчитал',
                md: `**Скользящее окно** — отрезок массива, который двигается по нему. Когда окно сдвигается на 1, не нужно пересчитывать всё заново: один элемент **уходит**, один **приходит**.

**Окно фиксированного размера k** — максимальная сумма k подряд идущих чисел за O(n):
\`\`\`python
window = sum(nums[:k])
best = window
for i in range(k, len(nums)):
    window += nums[i] - nums[i - k]     # пришёл nums[i], ушёл nums[i-k]
    best = max(best, window)
\`\`\`

**Окно переменного размера** — расширяем правую границу, а когда условие нарушено, сжимаем левую:
\`\`\`python
left = 0
for right in range(len(nums)):
    добавить nums[right] в окно
    while окно плохое:
        убрать nums[left]; left += 1
    обновить ответ
\`\`\`

**Префиксные суммы** — сумма любого отрезка за O(1) после подготовки за O(n):
\`\`\`python
prefix = [0]
for x in nums:
    prefix.append(prefix[-1] + x)
# сумма nums[l..r] включительно:
prefix[r + 1] - prefix[l]
\`\`\``,
              },
              { kind: 'predict', topic: 'algorithms', lang: 'python', code: py`nums = [3, 1, 4, 1, 5]
prefix = [0]
for x in nums:
    prefix.append(prefix[-1] + x)
print(prefix)
print(prefix[4] - prefix[1])`, answer: '[0, 3, 4, 8, 9, 14]\n6', explain: 'prefix[i] — сумма первых i элементов. prefix[4] − prefix[1] = сумма nums[1..3] = 1 + 4 + 1 = 6.' },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `max_window_sum(nums, k)` — максимальная сумма k подряд идущих элементов за O(n).',
                starter: 'def max_window_sum(nums, k):\n    pass\n',
                tests: [{ expr: 'max_window_sum([1, 4, 2, 10, 2, 3, 1, 0, 20], 4)', expected: '24' }, { expr: 'max_window_sum([5], 1)', expected: '5' }, { expr: 'max_window_sum([-1, -2, -3], 2)', expected: '-3' }],
                hints: ['Посчитай сумму первого окна.', 'Сдвигая окно: `window += nums[i] - nums[i - k]`.'],
                solution: py`def max_window_sum(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `min_subarray_len(target, nums)` — длина самого короткого непрерывного подмассива положительных чисел с суммой ≥ target, или 0, если такого нет. Окно переменного размера, O(n).',
                starter: 'def min_subarray_len(target, nums):\n    pass\n',
                tests: [{ expr: 'min_subarray_len(7, [2, 3, 1, 2, 4, 3])', expected: '2' }, { expr: 'min_subarray_len(4, [1, 4, 4])', expected: '1' }, { expr: 'min_subarray_len(11, [1, 1, 1])', expected: '0' }],
                hints: ['Расширяй окно вправо, добавляя `nums[right]` к сумме.', 'Пока сумма ≥ target — обнови ответ и сжимай окно слева.'],
                solution: py`def min_subarray_len(target, nums):
    best = float("inf")
    total = left = 0
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `range_sums(nums, queries)` — для каждого запроса `[l, r]` верни сумму `nums[l..r]` включительно. Используй префиксные суммы: каждый запрос — O(1).',
                starter: 'def range_sums(nums, queries):\n    pass\n',
                tests: [{ expr: 'range_sums([3, 1, 4, 1, 5], [[0, 4], [1, 3], [2, 2]])', expected: '[14, 6, 4]' }, { expr: 'range_sums([1] * 100000, [[0, 99999]] * 1000)[0]', expected: '100000', hidden: true }],
                hints: ['Построй `prefix` длины n + 1.', 'Ответ на запрос: `prefix[r + 1] - prefix[l]`.'],
                solution: py`def range_sums(nums, queries):
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)
    return [prefix[r + 1] - prefix[l] for l, r in queries]`,
              },
            ],
          },
        ],
      },
      {
        id: 'algo-p-2',
        title: 'Быстрая сортировка и перебор с возвратом',
        lessons: [
          {
            id: 'algo-quicksort',
            title: 'Быстрая сортировка и quickselect',
            minutes: 13,
            steps: [
              {
                kind: 'theory',
                topic: 'sorting',
                title: 'Разделяй относительно опорного элемента',
                md: `**Быстрая сортировка (quicksort):**
1. Выбираем **опорный элемент** (pivot).
2. Делим массив на три части: меньше pivot, равные, больше.
3. Рекурсивно сортируем левую и правую части и склеиваем.

\`\`\`python
def quicksort(a):
    if len(a) <= 1:
        return a
    pivot = a[len(a) // 2]
    left = [x for x in a if x < pivot]
    mid = [x for x in a if x == pivot]
    right = [x for x in a if x > pivot]
    return quicksort(left) + mid + quicksort(right)
\`\`\`

- В среднем **O(n log n)** — на практике одна из самых быстрых сортировок.
- В худшем случае (pivot всегда минимальный) — **O(n²)**. Защита — случайный pivot.

**Quickselect** — найти k-й по величине элемент в среднем за **O(n)**: делим как в quicksort, но рекурсивно идём только в ту часть, где лежит ответ.`,
              },
              { kind: 'predict', topic: 'sorting', lang: 'python', code: py`a = [5, 3, 8, 1, 9, 2, 5]
pivot = 5
print([x for x in a if x < pivot], [x for x in a if x == pivot], [x for x in a if x > pivot])`, answer: '[3, 1, 2] [5, 5] [8, 9]', explain: 'Это один шаг разбиения quicksort: меньше, равные и больше опорного.' },
              { kind: 'quiz', topic: 'sorting', question: 'Когда quicksort работает за O(n²)?', options: ['Когда опорный элемент каждый раз оказывается минимальным или максимальным', 'Всегда', 'Когда в массиве есть отрицательные числа', 'Когда массив короткий'], answer: 0, explain: 'Тогда разбиение «одна часть пустая, другая — всё остальное», и глубина рекурсии n.' },
              {
                kind: 'code',
                topic: 'sorting',
                lang: 'python',
                prompt: 'Реализуй `quicksort(a)` — верни новый отсортированный список (без `sorted` и `sort`).',
                starter: 'def quicksort(a):\n    pass\n',
                tests: [{ expr: 'quicksort([5, 3, 8, 1, 9, 2, 5])', expected: '[1, 2, 3, 5, 5, 8, 9]' }, { expr: 'quicksort([])', expected: '[]' }, { expr: 'quicksort(list(range(3000, 0, -1)))[:3]', expected: '[1, 2, 3]', hidden: true }],
                hints: ['Базовый случай: длина ≤ 1.', 'Pivot — средний элемент, три списка через генераторы списков.'],
                solution: py`def quicksort(a):
    if len(a) <= 1:
        return a
    pivot = a[len(a) // 2]
    left = [x for x in a if x < pivot]
    mid = [x for x in a if x == pivot]
    right = [x for x in a if x > pivot]
    return quicksort(left) + mid + quicksort(right)`,
              },
              {
                kind: 'code',
                topic: 'sorting',
                lang: 'python',
                prompt: 'Напиши `kth_smallest(a, k)` — k-й наименьший элемент (k с 1) методом quickselect, без полной сортировки.',
                starter: 'import random\n\ndef kth_smallest(a, k):\n    pass\n',
                tests: [{ expr: 'kth_smallest([7, 10, 4, 3, 20, 15], 3)', expected: '7' }, { expr: 'kth_smallest([1], 1)', expected: '1' }, { expr: 'kth_smallest([5, 5, 5, 1], 2)', expected: '5' }],
                hints: ['Раздели на left / mid / right как в quicksort.', 'Если k ≤ len(left) — ищи в left; если k ≤ len(left) + len(mid) — ответ pivot; иначе ищи в right с k − len(left) − len(mid).'],
                solution: py`import random

def kth_smallest(a, k):
    pivot = random.choice(a)
    left = [x for x in a if x < pivot]
    mid = [x for x in a if x == pivot]
    right = [x for x in a if x > pivot]
    if k <= len(left):
        return kth_smallest(left, k)
    if k <= len(left) + len(mid):
        return pivot
    return kth_smallest(right, k - len(left) - len(mid))`,
              },
            ],
          },
          {
            id: 'algo-backtracking',
            title: 'Перебор с возвратом (backtracking)',
            minutes: 15,
            steps: [
              {
                kind: 'theory',
                topic: 'recursion',
                title: 'Пробуем, углубляемся, откатываемся',
                md: `**Backtracking** — систематический перебор вариантов рекурсией. Шаблон «выбери → исследуй → отмени»:

\`\`\`python
def backtrack(path, choices):
    if решение готово:
        result.append(path.copy())
        return
    for choice in choices:
        if choice подходит:
            path.append(choice)        # выбрать
            backtrack(path, ...)       # исследовать
            path.pop()                 # отменить выбор (откат)
\`\`\`

Классические задачи:
- все **подмножества** (2ⁿ вариантов);
- все **перестановки** (n! вариантов);
- **сочетания** с ограничениями (сумма, размер);
- **N ферзей**, судоку, лабиринты.

**Отсечение (pruning)** — если частичное решение уже не может привести к ответу, не углубляемся. Это превращает «невозможно долго» в «быстро».

> ⚠️ Перебор экспоненциальный — подходит для небольших n (обычно до 10–20).`,
              },
              { kind: 'predict', topic: 'recursion', lang: 'python', code: py`result = []
def subsets(nums, i=0, path=[]):
    if i == len(nums):
        result.append(path[:])
        return
    subsets(nums, i + 1, path)          # не берём nums[i]
    path.append(nums[i])
    subsets(nums, i + 1, path)          # берём nums[i]
    path.pop()

subsets([1, 2])
print(result)`, answer: '[[], [2], [1], [1, 2]]', explain: 'Для каждого элемента два варианта — не брать или брать. Порядок задаётся порядком рекурсивных вызовов.' },
              { kind: 'quiz', topic: 'recursion', question: 'Сколько перестановок у 8 различных элементов?', options: ['40 320', '256', '64', '8'], answer: 0, explain: '8! = 40 320. Для 12 элементов уже почти 480 миллионов — вот почему нужен отсечение.' },
              {
                kind: 'code',
                topic: 'recursion',
                lang: 'python',
                prompt: 'Напиши `subsets(nums)` — список всех подмножеств (порядок не важен, тест сортирует результат).',
                starter: 'def subsets(nums):\n    pass\n',
                tests: [{ expr: 'sorted(sorted(s) for s in subsets([1, 2, 3]))', expected: '[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]' }, { expr: 'subsets([])', expected: '[[]]' }],
                hints: ['Рекурсия по индексу: для nums[i] — вариант «не брать» и вариант «взять».', 'Добавляй в результат копию `path[:]`.'],
                solution: py`def subsets(nums):
    result = []
    path = []
    def go(i):
        if i == len(nums):
            result.append(path[:])
            return
        go(i + 1)
        path.append(nums[i])
        go(i + 1)
        path.pop()
    go(0)
    return result`,
              },
              {
                kind: 'code',
                topic: 'recursion',
                lang: 'python',
                prompt: 'Напиши `permutations(s)` — все перестановки символов строки (без itertools). Порядок не важен.',
                starter: 'def permutations(s):\n    pass\n',
                tests: [{ expr: 'sorted(permutations("abc"))', expected: '["abc", "acb", "bac", "bca", "cab", "cba"]' }, { expr: 'permutations("x")', expected: '["x"]' }, { expr: 'len(permutations("abcdef"))', expected: '720' }],
                hints: ['Базовый случай: строка из одного символа.', 'Для каждого символа: он первый + все перестановки остальных `s[:i] + s[i+1:]`.'],
                solution: py`def permutations(s):
    if len(s) <= 1:
        return [s]
    result = []
    for i, ch in enumerate(s):
        for rest in permutations(s[:i] + s[i + 1:]):
            result.append(ch + rest)
    return result`,
              },
              {
                kind: 'code',
                topic: 'recursion',
                lang: 'python',
                prompt: 'Задача о N ферзях: сколькими способами можно расставить n ферзей на доске n×n, чтобы никакие два не били друг друга? Напиши `n_queens(n)`.',
                starter: 'def n_queens(n):\n    pass\n',
                tests: [{ expr: 'n_queens(4)', expected: '2' }, { expr: 'n_queens(1)', expected: '1' }, { expr: 'n_queens(6)', expected: '4' }, { expr: 'n_queens(8)', expected: '92', hidden: true }],
                hints: ['Ставь по одному ферзю в каждую строку.', 'Храни занятые столбцы и диагонали в множествах: `cols`, `r - c`, `r + c`.', 'Если клетка свободна — ставь, рекурсия на следующую строку, затем убери ферзя.'],
                solution: py`def n_queens(n):
    cols, diag1, diag2 = set(), set(), set()
    def place(r):
        if r == n:
            return 1
        count = 0
        for c in range(n):
            if c in cols or r - c in diag1 or r + c in diag2:
                continue
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            count += place(r + 1)
            cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)
        return count
    return place(0)`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'algo-structures',
    title: 'Деревья, кучи и графы',
    chapters: [
      {
        id: 'algo-s-1',
        title: 'Деревья и кучи',
        lessons: [
          {
            id: 'algo-trees',
            title: 'Бинарные деревья поиска',
            minutes: 15,
            steps: [
              {
                kind: 'theory',
                topic: 'algorithms',
                title: 'Иерархия данных',
                md: `**Дерево** — узлы, связанные «родитель → дети». Верхний узел — **корень**, узлы без детей — **листья**. Деревья повсюду: папки, DOM страницы, комментарии с ответами, организационная структура.

**Бинарное дерево** — у каждого узла не больше двух детей: левый и правый.
\`\`\`python
class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
\`\`\`

**Бинарное дерево поиска (BST):** в левом поддереве всё **меньше** узла, в правом — **больше**. Поиск, вставка и удаление — O(высота дерева): для сбалансированного дерева это **O(log n)**.

**Обходы (рекурсией):**
| Обход | Порядок | Для BST даёт |
|---|---|---|
| in-order | левое → узел → правое | значения **по возрастанию** |
| pre-order | узел → левое → правое | копирование дерева |
| post-order | левое → правое → узел | удаление, подсчёт размеров |

**Высота** дерева: \`0\` для пустого, иначе \`1 + max(высота левого, высота правого)\`.

Почти любая задача на деревья решается одной идеей: **«ответ для узла = комбинация ответов для детей»**.`,
              },
              {
                kind: 'animation',
                topic: 'algorithms',
                title: 'Вставка 5, 3, 8, 1, 4 в BST',
                anim: {
                  width: 560,
                  height: 260,
                  frames: [
                    { caption: 'Вставляем 5 — дерево пустое, 5 становится корнем.', boxes: [{ id: 'n5', value: '5', x: 250, y: 20, w: 60, h: 50, shape: 'circle', color: 'green', highlight: true }] },
                    { caption: '3 < 5 → идём влево. Место свободно — вставляем.', boxes: [{ id: 'n5', value: '5', x: 250, y: 20, w: 60, h: 50, shape: 'circle', color: 'blue' }, { id: 'n3', value: '3', x: 130, y: 110, w: 60, h: 50, shape: 'circle', color: 'green', highlight: true }], arrows: [{ from: 'n5', to: 'n3' }] },
                    { caption: '8 > 5 → вправо.', boxes: [{ id: 'n5', value: '5', x: 250, y: 20, w: 60, h: 50, shape: 'circle', color: 'blue' }, { id: 'n3', value: '3', x: 130, y: 110, w: 60, h: 50, shape: 'circle', color: 'blue' }, { id: 'n8', value: '8', x: 370, y: 110, w: 60, h: 50, shape: 'circle', color: 'green', highlight: true }], arrows: [{ from: 'n5', to: 'n3' }, { from: 'n5', to: 'n8' }] },
                    { caption: '1 < 5 → влево, 1 < 3 → влево.', boxes: [{ id: 'n5', value: '5', x: 250, y: 20, w: 60, h: 50, shape: 'circle', color: 'blue' }, { id: 'n3', value: '3', x: 130, y: 110, w: 60, h: 50, shape: 'circle', color: 'yellow' }, { id: 'n8', value: '8', x: 370, y: 110, w: 60, h: 50, shape: 'circle', color: 'blue' }, { id: 'n1', value: '1', x: 60, y: 200, w: 60, h: 50, shape: 'circle', color: 'green', highlight: true }], arrows: [{ from: 'n5', to: 'n3' }, { from: 'n5', to: 'n8' }, { from: 'n3', to: 'n1' }] },
                    { caption: '4 < 5 → влево, 4 > 3 → вправо. In-order обход даст 1, 3, 4, 5, 8 — по возрастанию!', boxes: [{ id: 'n5', value: '5', x: 250, y: 20, w: 60, h: 50, shape: 'circle', color: 'blue' }, { id: 'n3', value: '3', x: 130, y: 110, w: 60, h: 50, shape: 'circle', color: 'yellow' }, { id: 'n8', value: '8', x: 370, y: 110, w: 60, h: 50, shape: 'circle', color: 'blue' }, { id: 'n1', value: '1', x: 60, y: 200, w: 60, h: 50, shape: 'circle', color: 'blue' }, { id: 'n4', value: '4', x: 200, y: 200, w: 60, h: 50, shape: 'circle', color: 'green', highlight: true }], arrows: [{ from: 'n5', to: 'n3' }, { from: 'n5', to: 'n8' }, { from: 'n3', to: 'n1' }, { from: 'n3', to: 'n4' }] },
                  ],
                },
              },
              { kind: 'quiz', topic: 'algorithms', question: 'Какой обход BST выдаёт значения в порядке возрастания?', options: ['in-order (левое → узел → правое)', 'pre-order', 'post-order', 'обход в ширину'], answer: 0, explain: 'Всё левое меньше узла, всё правое больше — in-order проходит их по порядку.' },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Допиши функции для BST: `insert(root, val)` — вставить значение и вернуть корень (дубликаты не вставлять), и `inorder(root)` — список значений по возрастанию. Функция `build` уже написана и использует твой insert.',
                starter: py`class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    pass

def inorder(root):
    pass

def build(values):
    root = None
    for v in values:
        root = insert(root, v)
    return root
`,
                tests: [{ expr: 'inorder(build([5, 3, 8, 1, 4, 9]))', expected: '[1, 3, 4, 5, 8, 9]' }, { expr: 'inorder(build([2, 2, 1]))', expected: '[1, 2]' }, { expr: 'inorder(None)', expected: '[]' }],
                hints: ['insert: если root is None — верни Node(val). Иначе иди влево или вправо рекурсивно: `root.left = insert(root.left, val)`.', 'inorder: `inorder(root.left) + [root.val] + inorder(root.right)`, для None — `[]`.'],
                solution: py`class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    return root

def inorder(root):
    if root is None:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def build(values):
    root = None
    for v in values:
        root = insert(root, v)
    return root`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `height(root)` — высота дерева (пустое — 0, один узел — 1) и `contains(root, val)` — есть ли значение в BST за O(высота).',
                starter: py`class Node:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def height(root):
    pass

def contains(root, val):
    pass

tree = Node(5, Node(3, Node(1), Node(4)), Node(8, None, Node(9, None, Node(12))))
`,
                tests: [{ expr: 'height(tree)', expected: '4' }, { expr: 'height(None)', expected: '0' }, { expr: '[contains(tree, x) for x in [4, 12, 7]]', expected: '[true, true, false]' }],
                hints: ['height: `1 + max(height(root.left), height(root.right))`.', 'contains: сравни val с root.val и иди только в одну сторону.'],
                solution: py`class Node:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def height(root):
    if root is None:
        return 0
    return 1 + max(height(root.left), height(root.right))

def contains(root, val):
    while root is not None:
        if val == root.val:
            return True
        root = root.left if val < root.val else root.right
    return False

tree = Node(5, Node(3, Node(1), Node(4)), Node(8, None, Node(9, None, Node(12))))`,
              },
            ],
          },
          {
            id: 'algo-heap',
            title: 'Кучи и очереди с приоритетом',
            minutes: 12,
            steps: [
              {
                kind: 'theory',
                topic: 'algorithms',
                title: 'Всегда знаем минимум',
                md: `**Куча (heap)** — структура, которая быстро отдаёт **минимальный** элемент:
| Операция | Сложность |
|---|---|
| посмотреть минимум | O(1) |
| добавить элемент | O(log n) |
| извлечь минимум | O(log n) |
| построить из списка | O(n) |

В Python — модуль \`heapq\` (куча хранится в обычном списке):
\`\`\`python
import heapq
h = []
heapq.heappush(h, 5)
heapq.heappush(h, 1)
heapq.heappush(h, 3)
heapq.heappop(h)          # 1 — минимум
heapq.heapify(nums)       # превратить список в кучу на месте
heapq.nlargest(3, nums)   # три самых больших
\`\`\`

**Максимальная куча** — кладём числа со знаком минус: \`heappush(h, -x)\`.
**Приоритеты** — кладём кортежи \`(приоритет, задача)\`: сравнение идёт по первому элементу.

Где применяются: планировщики задач, алгоритм Дейкстры, «топ-k» элементов, слияние k отсортированных списков, медиана потока данных.`,
              },
              { kind: 'predict', topic: 'algorithms', lang: 'python', code: py`import heapq
h = []
for x in [5, 1, 8, 3]:
    heapq.heappush(h, x)
print(heapq.heappop(h), heapq.heappop(h))
tasks = [(2, "почта"), (1, "пожар"), (3, "обед")]
heapq.heapify(tasks)
print(heapq.heappop(tasks)[1])`, answer: '1 3\nпожар', explain: 'heappop каждый раз забирает минимум; кортежи сравниваются по приоритету.' },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `top_k(nums, k)` — k самых больших чисел по убыванию, используя кучу размера k (O(n log k)).',
                starter: 'import heapq\n\ndef top_k(nums, k):\n    pass\n',
                tests: [{ expr: 'top_k([3, 1, 5, 12, 2, 11], 3)', expected: '[12, 11, 5]' }, { expr: 'top_k([1], 1)', expected: '[1]' }],
                hints: ['Держи мин-кучу из k элементов: добавляй число, а если размер > k — `heappop` (выбрасываем минимальное).', 'В конце отсортируй кучу по убыванию.'],
                solution: py`import heapq

def top_k(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)
    return sorted(h, reverse=True)`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `merge_sorted(lists)` — слить k отсортированных списков в один отсортированный за O(N log k) с помощью кучи.',
                starter: 'import heapq\n\ndef merge_sorted(lists):\n    pass\n',
                tests: [{ expr: 'merge_sorted([[1, 4, 7], [2, 5], [0, 9]])', expected: '[0, 1, 2, 4, 5, 7, 9]' }, { expr: 'merge_sorted([[], [1]])', expected: '[1]' }],
                hints: ['Положи в кучу первые элементы всех списков как `(значение, номер_списка, индекс)`.', 'Извлёк минимум — добавь в ответ и положи в кучу следующий элемент того же списка.'],
                solution: py`import heapq

def merge_sorted(lists):
    h = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(h)
    result = []
    while h:
        val, i, j = heapq.heappop(h)
        result.append(val)
        if j + 1 < len(lists[i]):
            heapq.heappush(h, (lists[i][j + 1], i, j + 1))
    return result`,
              },
            ],
          },
        ],
      },
      {
        id: 'algo-s-2',
        title: 'Графы',
        lessons: [
          {
            id: 'algo-bfs',
            title: 'Графы и обход в ширину (BFS)',
            minutes: 15,
            steps: [
              {
                kind: 'theory',
                topic: 'algorithms',
                title: 'Вершины и рёбра',
                md: `**Граф** — вершины, соединённые рёбрами. Это карты дорог, друзья в соцсети, ссылки между страницами, зависимости задач.

**Список смежности** — самый удобный способ хранения:
\`\`\`python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}
\`\`\`

**Обход в ширину (BFS)** идёт «волнами»: сначала все соседи старта, потом соседи соседей… Поэтому BFS находит **кратчайший путь по числу рёбер**.

\`\`\`python
from collections import deque

def bfs(graph, start):
    dist = {start: 0}
    queue = deque([start])
    while queue:
        v = queue.popleft()
        for u in graph[v]:
            if u not in dist:          # ещё не посещали
                dist[u] = dist[v] + 1
                queue.append(u)
    return dist
\`\`\`

Сложность — **O(V + E)**: каждая вершина и каждое ребро обрабатываются один раз.

**Сетка как граф:** клетка — вершина, соседи — клетки сверху, снизу, слева, справа. Так ищут путь в лабиринте.`,
              },
              {
                kind: 'animation',
                topic: 'algorithms',
                title: 'BFS расходится волнами',
                anim: {
                  width: 560,
                  height: 240,
                  frames: (() => {
                    const pos: Record<string, [number, number]> = { A: [30, 90], B: [170, 20], C: [170, 160], D: [310, 90], E: [450, 20], F: [450, 160] };
                    const edges: [string, string][] = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E'], ['D', 'F']];
                    const waves = [['A'], ['B', 'C'], ['D'], ['E', 'F']];
                    const caps = ['Старт в A — расстояние 0.', 'Волна 1: соседи A — B и C (расстояние 1).', 'Волна 2: D (расстояние 2). Через B и через C — D посещаем один раз.', 'Волна 3: E и F (расстояние 3). Все вершины найдены кратчайшими путями.'];
                    return waves.map((_, w) => ({
                      caption: caps[w],
                      boxes: Object.entries(pos).map(([id, [x, y]]) => {
                        const level = waves.findIndex((wv) => wv.includes(id));
                        return { id, label: id, value: level <= w ? String(level) : '?', x, y, w: 64, h: 54, shape: 'circle' as const, color: (level < w ? 'blue' : level === w ? 'green' : 'gray') as 'blue', highlight: level === w };
                      }),
                      arrows: edges.map(([from, to]) => ({ from, to })),
                    }));
                  })(),
                },
              },
              { kind: 'predict', topic: 'algorithms', lang: 'python', code: py`from collections import deque
graph = {1: [2, 3], 2: [4], 3: [4, 5], 4: [6], 5: [6], 6: []}
order, seen, q = [], {1}, deque([1])
while q:
    v = q.popleft()
    order.append(v)
    for u in graph[v]:
        if u not in seen:
            seen.add(u)
            q.append(u)
print(order)`, answer: '[1, 2, 3, 4, 5, 6]', explain: 'Сначала 1, затем его соседи 2 и 3, затем их новые соседи 4 и 5, затем 6.' },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `shortest_path(graph, start, goal)` — минимальное число рёбер от start до goal, или -1, если пути нет.',
                starter: 'from collections import deque\n\ndef shortest_path(graph, start, goal):\n    pass\n',
                tests: [{ expr: 'shortest_path({"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": ["E"], "E": []}, "A", "E")', expected: '3' }, { expr: 'shortest_path({"A": ["B"], "B": [], "C": []}, "A", "C")', expected: '-1' }, { expr: 'shortest_path({"A": []}, "A", "A")', expected: '0' }],
                hints: ['BFS с словарём расстояний `dist = {start: 0}`.', 'Как только достали goal из очереди — верни `dist[goal]`.'],
                solution: py`from collections import deque

def shortest_path(graph, start, goal):
    dist = {start: 0}
    q = deque([start])
    while q:
        v = q.popleft()
        if v == goal:
            return dist[v]
        for u in graph.get(v, []):
            if u not in dist:
                dist[u] = dist[v] + 1
                q.append(u)
    return -1`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Лабиринт: список строк, `#` — стена, `.` — проход, `S` — старт, `E` — выход. Ходить можно вверх/вниз/влево/вправо. Напиши `maze_steps(maze)` — минимальное число шагов от S до E или -1.',
                starter: 'from collections import deque\n\ndef maze_steps(maze):\n    pass\n',
                tests: [{ expr: 'maze_steps(["S.#", "..#", "#.E"])', expected: '4' }, { expr: 'maze_steps(["S#E"])', expected: '-1' }, { expr: 'maze_steps(["S....", "####.", "E...."])', expected: '10' }],
                hints: ['Найди координаты S и E.', 'BFS по клеткам (r, c); соседи — 4 направления; не выходи за границы и не заходи в `#`.'],
                solution: py`from collections import deque

def maze_steps(maze):
    rows, cols = len(maze), len(maze[0])
    for r in range(rows):
        for c in range(cols):
            if maze[r][c] == "S":
                start = (r, c)
    dist = {start: 0}
    q = deque([start])
    while q:
        r, c = q.popleft()
        if maze[r][c] == "E":
            return dist[(r, c)]
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] != "#" and (nr, nc) not in dist:
                dist[(nr, nc)] = dist[(r, c)] + 1
                q.append((nr, nc))
    return -1`,
              },
            ],
          },
          {
            id: 'algo-dfs',
            title: 'Обход в глубину (DFS), компоненты и циклы',
            minutes: 15,
            steps: [
              {
                kind: 'theory',
                topic: 'algorithms',
                title: 'Идём до упора, потом возвращаемся',
                md: `**Обход в глубину (DFS)** уходит по одному пути как можно дальше, а упёршись — возвращается и пробует другой. Удобно писать рекурсией:

\`\`\`python
def dfs(graph, v, seen):
    seen.add(v)
    for u in graph[v]:
        if u not in seen:
            dfs(graph, u, seen)
\`\`\`

Или со своим стеком (для очень глубоких графов, где рекурсия упрётся в лимит):
\`\`\`python
stack = [start]
while stack:
    v = stack.pop()
    ...
\`\`\`

**Что решают через DFS:**
- **компоненты связности** — запускаем DFS из каждой непосещённой вершины, считаем запуски;
- **есть ли путь** между вершинами;
- **поиск цикла** в ориентированном графе — три цвета: белый (не были), серый (в текущем пути), чёрный (полностью обработана). Ребро в серую вершину = цикл;
- **топологическая сортировка** — порядок выполнения задач с зависимостями.

BFS — когда нужен **кратчайший** путь. DFS — когда нужно **исследовать всё** или найти структуру (компоненты, циклы).`,
              },
              { kind: 'predict', topic: 'algorithms', lang: 'python', code: py`graph = {1: [2, 3], 2: [4], 3: [], 4: []}
order = []
def dfs(v):
    order.append(v)
    for u in graph[v]:
        dfs(u)
dfs(1)
print(order)`, answer: '[1, 2, 4, 3]', explain: 'DFS идёт вглубь: из 1 в 2, из 2 в 4, затем возвращается и идёт в 3.' },
              { kind: 'match', topic: 'algorithms', prompt: 'Какой обход выбрать?', pairs: [['Кратчайший путь в лабиринте', 'BFS'], ['Число островов на карте', 'DFS или BFS'], ['Найти цикл зависимостей', 'DFS'], ['Друзья на расстоянии ≤ 2', 'BFS']] },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Неориентированный граф из n вершин (0..n−1) задан списком рёбер. Напиши `count_components(n, edges)` — число компонент связности.',
                starter: 'def count_components(n, edges):\n    pass\n',
                tests: [{ expr: 'count_components(5, [[0, 1], [1, 2], [3, 4]])', expected: '2' }, { expr: 'count_components(4, [])', expected: '4' }, { expr: 'count_components(3, [[0, 1], [1, 2], [2, 0]])', expected: '1' }],
                hints: ['Построй список смежности: каждое ребро добавляй в обе стороны.', 'Для каждой непосещённой вершины запусти DFS и увеличь счётчик.'],
                solution: py`def count_components(n, edges):
    graph = {v: [] for v in range(n)}
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    seen = set()
    def dfs(v):
        seen.add(v)
        for u in graph[v]:
            if u not in seen:
                dfs(u)
    count = 0
    for v in range(n):
        if v not in seen:
            dfs(v)
            count += 1
    return count`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Курсы с зависимостями: пара `[a, b]` значит «чтобы пройти курс a, нужно сначала пройти b». Напиши `can_finish(n, prereqs)` — можно ли пройти все n курсов (то есть нет циклической зависимости).',
                starter: 'def can_finish(n, prereqs):\n    pass\n',
                tests: [{ expr: 'can_finish(2, [[1, 0]])', expected: 'true' }, { expr: 'can_finish(2, [[1, 0], [0, 1]])', expected: 'false' }, { expr: 'can_finish(4, [[1, 0], [2, 1], [3, 2], [1, 3]])', expected: 'false' }, { expr: 'can_finish(3, [])', expected: 'true' }],
                hints: ['Построй граф b → a.', 'DFS с тремя состояниями: 0 — не были, 1 — в текущем пути, 2 — готово.', 'Если пришли в вершину с состоянием 1 — найден цикл.'],
                solution: py`def can_finish(n, prereqs):
    graph = {v: [] for v in range(n)}
    for a, b in prereqs:
        graph[b].append(a)
    state = [0] * n
    def has_cycle(v):
        state[v] = 1
        for u in graph[v]:
            if state[u] == 1 or (state[u] == 0 and has_cycle(u)):
                return True
        state[v] = 2
        return False
    return not any(state[v] == 0 and has_cycle(v) for v in range(n))`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'algo-dynamic',
    title: 'Динамическое программирование и жадные алгоритмы',
    chapters: [
      {
        id: 'algo-d-1',
        title: 'Динамическое программирование',
        lessons: [
          {
            id: 'algo-dp-intro',
            title: 'Введение в динамическое программирование',
            minutes: 15,
            steps: [
              {
                kind: 'theory',
                topic: 'algorithms',
                title: 'Запоминаем ответы на подзадачи',
                md: `**Динамическое программирование (ДП)** — решаем задачу через ответы на **меньшие подзадачи**, и каждую подзадачу считаем **один раз**.

Пример — лестница: сколькими способами подняться на n ступенек, шагая через 1 или 2? На ступеньку n можно попасть с n−1 или с n−2, поэтому:
\`\`\`text
ways(n) = ways(n - 1) + ways(n - 2),  ways(0) = 1, ways(1) = 1
\`\`\`

Наивная рекурсия пересчитывает одно и то же экспоненциально много раз. Два способа это исправить:

**1. Мемоизация (сверху вниз)** — рекурсия + кеш:
\`\`\`python
from functools import cache

@cache
def ways(n):
    return 1 if n <= 1 else ways(n - 1) + ways(n - 2)
\`\`\`

**2. Табуляция (снизу вверх)** — заполняем таблицу от маленьких задач к большим:
\`\`\`python
dp = [1, 1] + [0] * (n - 1)
for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]
\`\`\`

**Как придумать ДП-решение:**
1. Что означает \`dp[i]\`? (сформулируй словами!)
2. Как \`dp[i]\` выражается через предыдущие значения? (переход)
3. Базовые случаи.
4. Где ответ: \`dp[n]\`, максимум по таблице…`,
              },
              { kind: 'predict', topic: 'algorithms', lang: 'python', code: py`n = 6
dp = [1, 1] + [0] * (n - 1)
for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]
print(dp)`, answer: '[1, 1, 2, 3, 5, 8, 13]', explain: 'Число способов подняться по лестнице — это числа Фибоначчи.' },
              { kind: 'quiz', topic: 'algorithms', question: 'Какое свойство задачи делает ДП эффективным?', options: ['Одни и те же подзадачи встречаются много раз', 'Задача про числа', 'Входные данные отсортированы', 'Ответ — строка'], answer: 0, explain: 'Перекрывающиеся подзадачи + оптимальная подструктура — признаки ДП.' },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Лестница со стоимостью: `cost[i]` — плата за ступеньку i. Можно шагать на 1 или 2 ступеньки и начать с 0-й или 1-й. Напиши `min_cost_climb(cost)` — минимальная плата, чтобы подняться **выше** последней ступеньки.',
                starter: 'def min_cost_climb(cost):\n    pass\n',
                tests: [{ expr: 'min_cost_climb([10, 15, 20])', expected: '15' }, { expr: 'min_cost_climb([1, 100, 1, 1, 1, 100, 1, 1, 100, 1])', expected: '6' }],
                hints: ['`dp[i]` — минимальная плата, чтобы встать на ступеньку i (уже заплатив за неё).', '`dp[i] = cost[i] + min(dp[i - 1], dp[i - 2])`.', 'Ответ: `min(dp[-1], dp[-2])`.'],
                solution: py`def min_cost_climb(cost):
    dp = cost[:2]
    for i in range(2, len(cost)):
        dp.append(cost[i] + min(dp[i - 1], dp[i - 2]))
    return min(dp[-1], dp[-2])`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Грабитель и дома: `nums[i]` — деньги в доме i. Нельзя грабить два соседних дома. Напиши `rob(nums)` — максимальная сумма.',
                starter: 'def rob(nums):\n    pass\n',
                tests: [{ expr: 'rob([1, 2, 3, 1])', expected: '4' }, { expr: 'rob([2, 7, 9, 3, 1])', expected: '12' }, { expr: 'rob([])', expected: '0' }],
                hints: ['`dp[i]` — максимум с первых i домов.', 'Для дома i: либо не грабим (`dp[i-1]`), либо грабим (`dp[i-2] + nums[i]`).', 'Хватит двух переменных вместо массива.'],
                solution: py`def rob(nums):
    prev, cur = 0, 0
    for x in nums:
        prev, cur = cur, max(cur, prev + x)
    return cur`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Сетка n×m, робот идёт только вправо и вниз из левого верхнего угла в правый нижний. `grid[r][c]` — стоимость клетки. Напиши `min_path_sum(grid)` — минимальная сумма пути (включая обе крайние клетки).',
                starter: 'def min_path_sum(grid):\n    pass\n',
                tests: [{ expr: 'min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])', expected: '7' }, { expr: 'min_path_sum([[5]])', expected: '5' }, { expr: 'min_path_sum([[1, 2, 3], [4, 5, 6]])', expected: '12' }],
                hints: ['`dp[r][c]` = стоимость клетки + min(dp сверху, dp слева).', 'Первая строка и первый столбец — накопленные суммы.'],
                solution: py`def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[r][c]
            elif r == 0:
                dp[r][c] = dp[r][c - 1] + grid[r][c]
            elif c == 0:
                dp[r][c] = dp[r - 1][c] + grid[r][c]
            else:
                dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1])
    return dp[-1][-1]`,
              },
            ],
          },
          {
            id: 'algo-dp-classic',
            title: 'Классические задачи ДП: рюкзак и подпоследовательности',
            minutes: 16,
            steps: [
              {
                kind: 'theory',
                topic: 'algorithms',
                title: 'Двумерные таблицы',
                md: `**Рюкзак 0/1.** Есть предметы с весом и ценностью, рюкзак вместимостью W. Каждый предмет можно взять один раз. Максимизируем ценность.

\`dp[w]\` — максимальная ценность при вместимости w. Для каждого предмета идём по w **сверху вниз** (чтобы не взять предмет дважды):
\`\`\`python
dp = [0] * (W + 1)
for weight, value in items:
    for w in range(W, weight - 1, -1):
        dp[w] = max(dp[w], dp[w - weight] + value)
\`\`\`

**Наибольшая общая подпоследовательность (LCS)** двух строк — сколько символов можно оставить в обеих, сохранив порядок. \`dp[i][j]\` — LCS префиксов \`a[:i]\` и \`b[:j]\`:
\`\`\`text
если a[i-1] == b[j-1]:  dp[i][j] = dp[i-1][j-1] + 1
иначе:                  dp[i][j] = max(dp[i-1][j], dp[i][j-1])
\`\`\`
LCS лежит в основе \`git diff\` и сравнения текстов.

**Количество способов размена** (сколько комбинаций монет дают сумму):
\`\`\`python
ways = [1] + [0] * amount
for coin in coins:
    for s in range(coin, amount + 1):
        ways[s] += ways[s - coin]
\`\`\`
Внешний цикл по монетам гарантирует, что 1+2 и 2+1 считаются одной комбинацией.`,
              },
              { kind: 'quiz', topic: 'algorithms', question: 'Почему в рюкзаке 0/1 внутренний цикл по весу идёт **от большего к меньшему**?', options: ['Чтобы каждый предмет использовался не больше одного раза', 'Так быстрее', 'Иначе будет ошибка индекса', 'Без разницы'], answer: 0, explain: 'Идя вверх, мы бы использовали уже обновлённые значения — то есть взяли бы тот же предмет повторно.' },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `knapsack(weights, values, capacity)` — максимальная суммарная ценность предметов, вес которых не превышает capacity (каждый предмет — не более одного раза).',
                starter: 'def knapsack(weights, values, capacity):\n    pass\n',
                tests: [{ expr: 'knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)', expected: '9' }, { expr: 'knapsack([5], [10], 4)', expected: '0' }, { expr: 'knapsack([2, 2, 2], [3, 3, 3], 6)', expected: '9' }],
                hints: ['Одномерный массив `dp` длины capacity + 1.', 'Для каждого предмета: `for w in range(capacity, weight - 1, -1)`.'],
                solution: py`def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in zip(weights, values):
        for w in range(capacity, weight - 1, -1):
            dp[w] = max(dp[w], dp[w - weight] + value)
    return dp[capacity]`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `lcs(a, b)` — длина наибольшей общей подпоследовательности двух строк.',
                starter: 'def lcs(a, b):\n    pass\n',
                tests: [{ expr: 'lcs("abcde", "ace")', expected: '3' }, { expr: 'lcs("abc", "def")', expected: '0' }, { expr: 'lcs("программа", "грамматика")', expected: '6' }],
                hints: ['Таблица `(len(a) + 1) × (len(b) + 1)` из нулей.', 'Если символы равны — диагональ + 1, иначе максимум из верхней и левой клетки.'],
                solution: py`def lcs(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[-1][-1]`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `count_change(coins, amount)` — количество **различных комбинаций** монет (каждого номинала сколько угодно), дающих сумму amount. Порядок монет не важен.',
                starter: 'def count_change(coins, amount):\n    pass\n',
                tests: [{ expr: 'count_change([1, 2, 5], 5)', expected: '4' }, { expr: 'count_change([2], 3)', expected: '0' }, { expr: 'count_change([10], 0)', expected: '1' }, { expr: 'count_change([1, 5, 10, 25, 50], 100)', expected: '292', hidden: true }],
                hints: ['`ways[0] = 1` — пустая комбинация.', 'Внешний цикл по монетам, внутренний — по сумме от coin до amount.'],
                solution: py`def count_change(coins, amount):
    ways = [1] + [0] * amount
    for coin in coins:
        for s in range(coin, amount + 1):
            ways[s] += ways[s - coin]
    return ways[amount]`,
              },
            ],
          },
          {
            id: 'algo-greedy',
            title: 'Жадные алгоритмы',
            minutes: 12,
            steps: [
              {
                kind: 'theory',
                topic: 'algorithms',
                title: 'Лучший выбор на каждом шаге',
                md: `**Жадный алгоритм** на каждом шаге делает **локально лучший** выбор и никогда его не пересматривает. Когда это работает, решение получается простым и быстрым (часто сортировка + один проход).

**Задача о встречах:** выбрать максимум непересекающихся встреч. Жадно берём встречу, которая **заканчивается раньше всех** — она оставляет больше времени для остальных:
\`\`\`python
meetings.sort(key=lambda m: m[1])     # по времени окончания
count, end = 0, float("-inf")
for s, e in meetings:
    if s >= end:
        count += 1
        end = e
\`\`\`

**Когда жадность ошибается.** Сдача монетами 1, 3, 4 на сумму 6: жадно берём самую крупную — 4 + 1 + 1 (3 монеты), а оптимально 3 + 3 (2 монеты). Здесь нужно ДП.

> 🧠 Жадный алгоритм нужно **доказать** (или хотя бы проверить на контрпримерах). Если не получается — скорее всего, задача на ДП.

Примеры, где жадность работает: встречи/интервалы, код Хаффмана, алгоритм Дейкстры, минимальное остовное дерево (Прим, Краскал), сдача в «канонических» монетах (1, 2, 5, 10…).`,
              },
              { kind: 'quiz', topic: 'algorithms', question: 'Монеты 1, 3, 4. Сколько монет даст жадный алгоритм (всегда самая крупная) для суммы 6 и сколько — оптимальный?', options: ['3 и 2', '2 и 2', '3 и 3', '2 и 1'], answer: 0, explain: 'Жадно: 4 + 1 + 1. Оптимально: 3 + 3.' },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Напиши `max_meetings(meetings)` — максимальное число непересекающихся встреч (встреча `[начало, конец]`; встреча может начаться ровно в момент окончания предыдущей).',
                starter: 'def max_meetings(meetings):\n    pass\n',
                tests: [{ expr: 'max_meetings([[1, 3], [2, 4], [3, 5], [6, 7]])', expected: '3' }, { expr: 'max_meetings([])', expected: '0' }, { expr: 'max_meetings([[1, 10], [2, 3], [4, 5], [6, 7]])', expected: '3' }],
                hints: ['Отсортируй по времени окончания.', 'Бери встречу, если она начинается не раньше окончания последней взятой.'],
                solution: py`def max_meetings(meetings):
    count, end = 0, float("-inf")
    for start, finish in sorted(meetings, key=lambda m: m[1]):
        if start >= end:
            count += 1
            end = finish
    return count`,
              },
              {
                kind: 'code',
                topic: 'algorithms',
                lang: 'python',
                prompt: 'Прыжки: `nums[i]` — максимальная длина прыжка с позиции i. Стартуем с 0. Напиши `can_jump(nums)` — можно ли добраться до последнего индекса. Решение за O(n).',
                starter: 'def can_jump(nums):\n    pass\n',
                tests: [{ expr: 'can_jump([2, 3, 1, 1, 4])', expected: 'true' }, { expr: 'can_jump([3, 2, 1, 0, 4])', expected: 'false' }, { expr: 'can_jump([0])', expected: 'true' }],
                hints: ['Храни `reach` — самую дальнюю позицию, куда точно можно попасть.', 'Если текущий индекс i > reach — дальше пути нет.'],
                solution: py`def can_jump(nums):
    reach = 0
    for i, jump in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + jump)
    return True`,
              },
            ],
          },
        ],
      },
    ],
  },
];
