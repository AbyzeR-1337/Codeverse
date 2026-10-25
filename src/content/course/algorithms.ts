// Трек «Алгоритмы и структуры данных»: сложность, поиск, сортировки, стек/очередь, хеш-таблицы, рекурсия.
import type { Track } from '../types';

export const algoTrack: Track = {
  id: 'algo',
  title: 'Алгоритмы',
  icon: '🧮',
  color: '#a78bfa',
  description: 'Как думает программист: сложность, поиск, сортировки, структуры данных, рекурсия, графы и динамическое программирование. Ключ к собеседованиям.',
  modules: [
    {
      id: 'algo-basics',
      title: 'Основы алгоритмов',
      chapters: [
        {
          id: 'algo-1',
          title: 'Сложность и поиск',
          lessons: [
            {
              id: 'algo-bigo',
              title: 'Сложность алгоритма: O-нотация',
              minutes: 12,
              steps: [
                {
                  kind: 'theory',
                  topic: 'complexity',
                  title: 'Насколько быстро растёт время работы',
                  md: `**Алгоритм** — точная последовательность шагов для решения задачи. Одну задачу можно решить разными алгоритмами — и одни будут в тысячи раз быстрее других.

**O-нотация (Big O)** описывает, как растёт число операций при росте размера входных данных **n**:

| Сложность | Название | n = 1 000 | Пример |
|---|---|---|---|
| O(1) | константная | 1 | доступ по индексу \`arr[i]\`, ключ в словаре |
| O(log n) | логарифмическая | ~10 | бинарный поиск |
| O(n) | линейная | 1 000 | перебор массива, поиск максимума |
| O(n log n) | «линейно-логарифмическая» | ~10 000 | хорошие сортировки |
| O(n²) | квадратичная | 1 000 000 | два вложенных цикла |
| O(2ⁿ) | экспоненциальная | 10³⁰⁰ 😱 | перебор всех подмножеств |

**Как оценивать:**
- один цикл по n элементам → O(n);
- цикл в цикле → O(n²);
- каждый шаг делит задачу пополам → O(log n);
- константы отбрасываем: O(2n) = O(n), O(n + 100) = O(n);
- берём самую быстрорастущую часть: O(n² + n) = O(n²).

Есть и **сложность по памяти** — сколько дополнительной памяти нужно алгоритму.

> 💡 Компьютер делает ~10⁸ простых операций в секунду. Для n = 100 000 алгоритм O(n²) — это 10¹⁰ операций (~100 секунд), а O(n log n) — около 0.02 секунды.`,
                },
                { kind: 'animation', topic: 'complexity', title: 'Как растут сложности', anim: { width: 600, height: 240, frames: [
                  { caption: 'n = 10: разница почти не видна.', boxes: [{ id: 'o1', label: 'O(1)', value: '1', x: 20, y: 180, w: 100, h: 40, color: 'green' }, { id: 'olog', label: 'O(log n)', value: '3', x: 135, y: 175, w: 100, h: 45, color: 'blue' }, { id: 'on', label: 'O(n)', value: '10', x: 250, y: 165, w: 100, h: 55, color: 'yellow' }, { id: 'on2', label: 'O(n²)', value: '100', x: 365, y: 140, w: 100, h: 80, color: 'red' }, { id: 'o2n', label: 'O(2ⁿ)', value: '1024', x: 480, y: 110, w: 100, h: 110, color: 'purple' }] },
                  { caption: 'n = 1 000: квадратичный алгоритм делает уже миллион операций.', boxes: [{ id: 'o1', label: 'O(1)', value: '1', x: 20, y: 180, w: 100, h: 40, color: 'green' }, { id: 'olog', label: 'O(log n)', value: '10', x: 135, y: 170, w: 100, h: 50, color: 'blue' }, { id: 'on', label: 'O(n)', value: '1 000', x: 250, y: 130, w: 100, h: 90, color: 'yellow' }, { id: 'on2', label: 'O(n²)', value: '1 000 000', x: 365, y: 40, w: 100, h: 180, color: 'red', highlight: true }, { id: 'o2n', label: 'O(2ⁿ)', value: '∞ (не дождёмся)', x: 480, y: 10, w: 110, h: 210, color: 'purple', highlight: true }] },
                  { caption: 'n = 1 000 000: только O(1), O(log n) и O(n) остаются практичными.', boxes: [{ id: 'o1', label: 'O(1)', value: '1', x: 20, y: 180, w: 100, h: 40, color: 'green', highlight: true }, { id: 'olog', label: 'O(log n)', value: '20', x: 135, y: 168, w: 100, h: 52, color: 'blue', highlight: true }, { id: 'on', label: 'O(n)', value: '10⁶', x: 250, y: 100, w: 100, h: 120, color: 'yellow' }, { id: 'on2', label: 'O(n²)', value: '10¹²', x: 365, y: 10, w: 100, h: 210, color: 'red' }, { id: 'o2n', label: 'O(2ⁿ)', value: '—', x: 480, y: 10, w: 110, h: 210, color: 'gray' }] },
                ] } },
                { kind: 'match', topic: 'complexity', prompt: 'Сопоставь операцию и сложность', pairs: [['Получить элемент массива по индексу', 'O(1)'], ['Найти максимум в массиве', 'O(n)'], ['Бинарный поиск', 'O(log n)'], ['Сравнить каждый элемент с каждым', 'O(n²)']] },
                { kind: 'quiz', topic: 'complexity', question: 'Какая сложность у этого кода?', code: 'for i in range(n):\n    for j in range(n):\n        print(i, j)', lang: 'python', options: ['O(n²)', 'O(n)', 'O(2n)', 'O(log n)'], answer: 0, explain: 'Внешний цикл n раз, внутренний — n раз на каждой итерации: n · n.' },
                { kind: 'quiz', topic: 'complexity', question: 'Упрости: O(3n² + 5n + 100)', options: ['O(n²)', 'O(3n²)', 'O(n² + n)', 'O(100)'], answer: 0, explain: 'Отбрасываем константы и младшие слагаемые.' },
                { kind: 'quiz', topic: 'complexity', question: 'Почему поиск в словаре/множестве (`x in my_set`) быстрее, чем в списке?', options: ['Словарь использует хеш-таблицу: в среднем O(1) вместо O(n)', 'Словари хранятся в процессоре', 'Списки всегда отсортированы', 'Это одинаково быстро'], answer: 0, explain: 'Хеш-функция сразу вычисляет «адрес» элемента — не нужно перебирать все элементы.' },
              ],
            },
            {
              id: 'algo-search',
              title: 'Линейный и бинарный поиск',
              minutes: 12,
              steps: [
                {
                  kind: 'theory',
                  topic: 'search',
                  title: 'Как найти элемент',
                  md: `**Линейный поиск** — перебираем элементы по очереди, пока не найдём. Работает на любом массиве. Сложность **O(n)**.

**Бинарный поиск** — работает только на **отсортированном** массиве. Как поиск слова в бумажном словаре: открываем середину, сравниваем, отбрасываем половину.

\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1      # ищем в правой половине
        else:
            right = mid - 1     # ищем в левой половине
    return -1                   # не найдено
\`\`\`

Каждый шаг уменьшает область поиска вдвое: для миллиона элементов нужно максимум **20** сравнений! Сложность **O(log n)**.

> 💡 Игра «угадай число от 1 до 100»: если отвечать «больше/меньше», бинарный поиск угадает максимум за 7 попыток.`,
                },
                { kind: 'animation', topic: 'search', title: 'Бинарный поиск числа 23', anim: { width: 620, height: 200, frames: [
                  { caption: 'Ищем 23 в отсортированном массиве. left = 0, right = 8.', boxes: [2, 5, 8, 12, 16, 23, 38, 56, 72].map((v, i) => ({ id: `e${i}`, label: String(i), value: String(v), x: 10 + i * 67, y: 70, w: 60, h: 56, color: 'blue' as const })) },
                  { caption: 'mid = 4, arr[4] = 16 < 23 → отбрасываем левую половину.', boxes: [2, 5, 8, 12, 16, 23, 38, 56, 72].map((v, i) => ({ id: `e${i}`, label: String(i), value: String(v), x: 10 + i * 67, y: 70, w: 60, h: 56, color: (i < 4 ? 'gray' : i === 4 ? 'yellow' : 'blue') as 'gray', highlight: i === 4 })) },
                  { caption: 'left = 5, right = 8, mid = 6, arr[6] = 38 > 23 → отбрасываем правую часть.', boxes: [2, 5, 8, 12, 16, 23, 38, 56, 72].map((v, i) => ({ id: `e${i}`, label: String(i), value: String(v), x: 10 + i * 67, y: 70, w: 60, h: 56, color: (i <= 4 || i > 6 ? 'gray' : i === 6 ? 'yellow' : 'blue') as 'gray', highlight: i === 6 })) },
                  { caption: 'left = 5, right = 5, mid = 5, arr[5] = 23 — нашли за 3 шага!', boxes: [2, 5, 8, 12, 16, 23, 38, 56, 72].map((v, i) => ({ id: `e${i}`, label: String(i), value: String(v), x: 10 + i * 67, y: 70, w: 60, h: 56, color: (i === 5 ? 'green' : 'gray') as 'gray', highlight: i === 5 })) },
                ] } },
                { kind: 'quiz', topic: 'search', question: 'Какое главное условие для бинарного поиска?', options: ['Массив должен быть отсортирован', 'Массив должен быть коротким', 'Элементы должны быть уникальными', 'Массив должен содержать только числа'], answer: 0, explain: 'Только в отсортированном массиве можно понять, в какой половине искать.' },
                { kind: 'quiz', topic: 'search', question: 'Сколько максимум сравнений нужно бинарному поиску в массиве из 1 024 элементов?', options: ['около 10', '512', '1 024', '100'], answer: 0, explain: '2¹⁰ = 1024, поэтому ~10 делений пополам (log₂ 1024 = 10).' },
                { kind: 'order', topic: 'search', lang: 'python', prompt: 'Собери тело цикла бинарного поиска', lines: ['    mid = (left + right) // 2', '    if arr[mid] == target:', '        return mid', '    elif arr[mid] < target:', '        left = mid + 1', '    else:', '        right = mid - 1'] },
                { kind: 'code', topic: 'search', lang: 'python', prompt: 'Реализуй `binary_search(arr, target)`: верни индекс `target` в отсортированном списке или `-1`.', starter: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    # твой код\n', tests: [{ expr: 'binary_search([1, 3, 5, 7, 9, 11], 7)', expected: '3' }, { expr: 'binary_search([1, 3, 5, 7, 9, 11], 4)', expected: '-1' }, { expr: 'binary_search([], 1)', expected: '-1' }, { expr: 'binary_search(list(range(0, 1000000, 2)), 999998)', expected: '499999', hidden: true }], hints: ['Цикл `while left <= right:`', 'Середина: `mid = (left + right) // 2`.', 'Сдвигай left или right в зависимости от сравнения.'], solution: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        if arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1' },
              ],
            },
          ],
        },
        {
          id: 'algo-2',
          title: 'Сортировки',
          lessons: [
            {
              id: 'algo-bubble',
              title: 'Сортировка пузырьком и выбором',
              minutes: 12,
              steps: [
                {
                  kind: 'theory',
                  topic: 'sorting',
                  title: 'Простые сортировки O(n²)',
                  md: `**Сортировка пузырьком (bubble sort):** проходим по массиву и меняем соседей местами, если они стоят неправильно. После каждого прохода самый большой элемент «всплывает» в конец.

\`\`\`python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
\`\`\`

**Сортировка выбором (selection sort):** находим минимум в неотсортированной части и ставим его в начало.

\`\`\`python
def selection_sort(arr):
    for i in range(len(arr)):
        min_i = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_i]:
                min_i = j
        arr[i], arr[min_i] = arr[min_i], arr[i]
    return arr
\`\`\`

Обе — **O(n²)**: понятны, но медленны для больших массивов. Их учат, чтобы понять идею сортировки. На практике используют встроенные \`sorted()\` / \`.sort()\` — они работают за **O(n log n)** (алгоритм Timsort).`,
                },
                { kind: 'animation', topic: 'sorting', title: 'Пузырёк в действии', anim: { width: 520, height: 220, frames: (() => {
                  const steps: { arr: number[]; hl: number[]; cap: string }[] = [
                    { arr: [5, 2, 8, 1], hl: [0, 1], cap: 'Сравниваем 5 и 2: 5 > 2 — меняем местами.' },
                    { arr: [2, 5, 8, 1], hl: [1, 2], cap: 'Сравниваем 5 и 8: порядок верный.' },
                    { arr: [2, 5, 8, 1], hl: [2, 3], cap: 'Сравниваем 8 и 1: меняем. 8 «всплыла» в конец!' },
                    { arr: [2, 5, 1, 8], hl: [1, 2], cap: 'Второй проход: 5 и 1 — меняем.' },
                    { arr: [2, 1, 5, 8], hl: [0, 1], cap: 'Третий проход: 2 и 1 — меняем.' },
                    { arr: [1, 2, 5, 8], hl: [], cap: 'Массив отсортирован: [1, 2, 5, 8] ✅' },
                  ];
                  return steps.map((s) => ({ caption: s.cap, boxes: s.arr.map((v) => ({ id: `v${v}`, value: String(v), x: 40 + s.arr.indexOf(v) * 115, y: 200 - v * 20, w: 90, h: v * 20, color: (s.hl.includes(s.arr.indexOf(v)) ? 'yellow' : s.hl.length === 0 ? 'green' : 'blue') as 'blue', highlight: s.hl.includes(s.arr.indexOf(v)) })) }));
                })() } },
                { kind: 'predict', topic: 'sorting', prompt: 'Каким станет массив после ПЕРВОГО прохода пузырька?', lang: 'python', code: 'arr = [4, 3, 1, 2]\n# один проход: сравнить и поменять соседей слева направо', answer: '[3, 1, 2, 4]', explain: '(4,3)→[3,4,1,2] → (4,1)→[3,1,4,2] → (4,2)→[3,1,2,4]. Максимум 4 оказался в конце.' },
                { kind: 'quiz', topic: 'sorting', question: 'Почему пузырёк редко используют в реальных программах?', options: ['Он работает за O(n²) — слишком медленно для больших данных', 'Он неправильно сортирует', 'Он работает только с числами', 'Его запретили'], answer: 0, explain: 'Для 100 000 элементов это ~10 миллиардов сравнений.' },
                { kind: 'code', topic: 'sorting', lang: 'python', prompt: 'Реализуй `bubble_sort(arr)`, которая сортирует список по возрастанию и возвращает его. Не используй `sort`/`sorted`!', starter: 'def bubble_sort(arr):\n    # твой код\n    return arr\n', tests: [{ expr: 'bubble_sort([5, 2, 9, 1, 5, 6])', expected: '[1, 2, 5, 5, 6, 9]' }, { expr: 'bubble_sort([])', expected: '[]' }, { expr: 'bubble_sort([3, -1, 0])', expected: '[-1, 0, 3]' }], hints: ['Два вложенных цикла.', 'Внутренний: `for j in range(len(arr) - 1 - i):`', 'Обмен: `arr[j], arr[j + 1] = arr[j + 1], arr[j]`.'], solution: 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(n - 1 - i):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr' },
              ],
            },
            {
              id: 'algo-merge',
              title: 'Сортировка слиянием: разделяй и властвуй',
              minutes: 13,
              steps: [
                {
                  kind: 'theory',
                  topic: 'sorting',
                  title: 'O(n log n) с помощью рекурсии',
                  md: `**Разделяй и властвуй:** разбить задачу на части, решить каждую, объединить ответы.

**Сортировка слиянием (merge sort):**
1. Если в массиве 0 или 1 элемент — он уже отсортирован (базовый случай).
2. Делим массив пополам.
3. Рекурсивно сортируем каждую половину.
4. **Сливаем** две отсортированные половины в одну.

\`\`\`python
def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i]); i += 1
        else:
            result.append(b[j]); j += 1
    return result + a[i:] + b[j:]

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    return merge(merge_sort(arr[:mid]), merge_sort(arr[mid:]))
\`\`\`

Массив делится пополам log n раз, а на каждом уровне слияние проходит по n элементам → **O(n log n)**.

Другие быстрые сортировки: **быстрая сортировка (quicksort)** — выбираем опорный элемент и делим на «меньше» и «больше»; **пирамидальная (heapsort)**.`,
                },
                { kind: 'example', topic: 'sorting', lang: 'python', code: 'def merge(a, b):\n    result = []\n    i = j = 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            result.append(a[i]); i += 1\n        else:\n            result.append(b[j]); j += 1\n    return result + a[i:] + b[j:]\n\ndef merge_sort(arr, depth=0):\n    print("  " * depth + str(arr))\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    return merge(merge_sort(arr[:mid], depth + 1), merge_sort(arr[mid:], depth + 1))\n\nprint(merge_sort([38, 27, 43, 3, 9, 82, 10]))', note: 'Отступы показывают глубину рекурсии — видно, как массив делится.' },
                { kind: 'predict', topic: 'sorting', prompt: 'Что вернёт функция merge из теории?', lang: 'python', code: 'print(merge([1, 4, 9], [2, 3, 10]))', answer: '[1, 2, 3, 4, 9, 10]', explain: 'Слияние берёт меньший из «голов» двух списков, пока один не закончится.' },
                { kind: 'code', topic: 'sorting', lang: 'python', prompt: 'Реализуй функцию `merge(a, b)`, сливающую два **отсортированных** списка в один отсортированный за O(len(a) + len(b)).', starter: 'def merge(a, b):\n    result = []\n    i = j = 0\n    # твой код\n    return result\n', tests: [{ expr: 'merge([1, 4, 9], [2, 3, 10])', expected: '[1, 2, 3, 4, 9, 10]' }, { expr: 'merge([], [1, 2])', expected: '[1, 2]' }, { expr: 'merge([5], [])', expected: '[5]' }, { expr: 'merge([1, 1], [1])', expected: '[1, 1, 1]' }], hints: ['Пока оба индекса в пределах: сравни a[i] и b[j], добавь меньший.', 'После цикла допиши остатки: `result += a[i:] + b[j:]`.'], solution: 'def merge(a, b):\n    result = []\n    i = j = 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            result.append(a[i])\n            i += 1\n        else:\n            result.append(b[j])\n            j += 1\n    result += a[i:] + b[j:]\n    return result' },
              ],
            },
          ],
        },
        {
          id: 'algo-3',
          title: 'Структуры данных',
          lessons: [
            {
              id: 'algo-stack-queue',
              title: 'Стек и очередь',
              minutes: 11,
              steps: [
                {
                  kind: 'theory',
                  topic: 'algorithms',
                  title: 'LIFO и FIFO',
                  md: `**Стек (stack)** — «стопка тарелок»: кладём сверху и берём сверху. **LIFO** — Last In, First Out.
- операции: \`push\` (положить), \`pop\` (взять верхний), \`peek\` (посмотреть верхний);
- применение: отмена действий (Ctrl+Z), стек вызовов функций, проверка скобок, кнопка «назад» в браузере.

\`\`\`python
stack = []
stack.append(1)   # push
stack.append(2)
stack.pop()       # 2
\`\`\`

**Очередь (queue)** — «очередь в магазине»: встаём в конец, обслуживают из начала. **FIFO** — First In, First Out.
- применение: очередь задач, печать документов, обход графа в ширину, обработка запросов сервером.

\`\`\`python
from collections import deque
q = deque()
q.append("Аня")     # в конец
q.append("Боря")
q.popleft()         # "Аня" — из начала, за O(1)
\`\`\`

> ⚠️ \`list.pop(0)\` в Python работает за O(n) — все элементы сдвигаются. Для очереди используй \`deque\`.`,
                },
                { kind: 'match', topic: 'algorithms', prompt: 'Стек или очередь?', pairs: [['Ctrl+Z (отмена)', 'Стек'], ['Очередь на печать', 'Очередь'], ['Вызовы функций', 'Стек'], ['Обслуживание клиентов по порядку', 'Очередь']] },
                { kind: 'predict', topic: 'algorithms', lang: 'python', code: 's = []\ns.append("a")\ns.append("b")\ns.append("c")\ns.pop()\ns.append("d")\nprint(s)', answer: "['a', 'b', 'd']", explain: 'pop() снимает верхний элемент "c", затем кладём "d".' },
                { kind: 'code', topic: 'algorithms', lang: 'python', prompt: 'Напиши `is_balanced(s)`: проверь, правильно ли расставлены скобки `()[]{}` в строке (другие символы игнорируй). Используй стек.', starter: 'def is_balanced(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    # твой код\n', tests: [{ expr: 'is_balanced("([]{})")', expected: 'true' }, { expr: 'is_balanced("([)]")', expected: 'false' }, { expr: 'is_balanced("((")', expected: 'false' }, { expr: 'is_balanced("print(a[0])")', expected: 'true' }, { expr: 'is_balanced("")', expected: 'true' }], hints: ['Открывающую скобку кладём в стек.', 'Для закрывающей: стек не должен быть пуст, и верхний элемент должен быть её парой.', 'В конце стек должен быть пустым.'], solution: 'def is_balanced(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in s:\n        if ch in "([{":\n            stack.append(ch)\n        elif ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack' },
              ],
            },
            {
              id: 'algo-hash',
              title: 'Хеш-таблицы и задача «Две суммы»',
              minutes: 12,
              steps: [
                {
                  kind: 'theory',
                  topic: 'algorithms',
                  title: 'Как словарь находит ключ за O(1)',
                  md: `**Хеш-функция** превращает ключ в число (хеш). По хешу вычисляется номер «корзины» в массиве, где лежит значение. Поэтому поиск, вставка и удаление в среднем занимают **O(1)**.

\`\`\`text
"кот"  → hash → 7  → корзина 7 % 8 = 7
"пёс"  → hash → 12 → корзина 12 % 8 = 4
\`\`\`

Если два ключа попали в одну корзину — **коллизия**; её решают цепочками или поиском свободной ячейки.

В Python хеш-таблицы — это \`dict\` и \`set\`, в JavaScript — \`Map\`, \`Set\` и обычные объекты.

**Главный приём на собеседованиях:** заменить вложенный цикл O(n²) на один проход с хеш-таблицей O(n).

**Задача «Две суммы»:** найти индексы двух чисел, дающих в сумме target.

\`\`\`python
# O(n²) — перебор пар
for i in range(n):
    for j in range(i + 1, n):
        if nums[i] + nums[j] == target: ...

# O(n) — запоминаем увиденные числа
seen = {}
for i, x in enumerate(nums):
    if target - x in seen:
        return [seen[target - x], i]
    seen[x] = i
\`\`\``,
                },
                { kind: 'quiz', topic: 'algorithms', question: 'Почему хеш-таблица ищет ключ в среднем за O(1)?', options: ['Хеш-функция сразу вычисляет место хранения', 'Она хранит всё в отсортированном виде', 'Она перебирает элементы очень быстро', 'Потому что ключи — короткие строки'], answer: 0, explain: 'Не нужно перебирать — адрес вычисляется по ключу.' },
                { kind: 'code', topic: 'algorithms', lang: 'python', prompt: 'Реализуй `two_sum(nums, target)` за O(n): верни список из двух индексов `[i, j]` (i < j), где `nums[i] + nums[j] == target`. Ответ гарантированно существует.', starter: 'def two_sum(nums, target):\n    seen = {}\n    # твой код\n', tests: [{ expr: 'two_sum([2, 7, 11, 15], 9)', expected: '[0, 1]' }, { expr: 'two_sum([3, 2, 4], 6)', expected: '[1, 2]' }, { expr: 'two_sum([3, 3], 6)', expected: '[0, 1]' }], hints: ['Для каждого x нужно число `target - x`.', 'Проверь, видели ли его раньше (`in seen`), иначе запомни `seen[x] = i`.'], solution: 'def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i' },
                { kind: 'code', topic: 'algorithms', lang: 'js', prompt: 'На JavaScript: напиши `firstUnique(s)`, возвращающую первый неповторяющийся символ строки или `null`. Используй `Map`.', starter: 'function firstUnique(s) {\n  \n}\n', tests: [{ expr: 'firstUnique("swiss")', expected: '"w"' }, { expr: 'firstUnique("aabb")', expected: 'null' }, { expr: 'firstUnique("codeverse")', expected: '"c"' }], hints: ['Первым проходом посчитай частоты: `counts.set(ch, (counts.get(ch) ?? 0) + 1)`.', 'Вторым проходом найди первый символ с частотой 1.'], solution: 'function firstUnique(s) {\n  const counts = new Map();\n  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);\n  for (const ch of s) if (counts.get(ch) === 1) return ch;\n  return null;\n}' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'algo-advanced',
      title: 'Продвинутые алгоритмы (дорожная карта)',
      chapters: [
        { id: 'algo-two-pointers', title: 'Два указателя и скользящее окно', lessons: [], planned: ['Два указателя на отсортированном массиве', 'Скользящее окно фиксированного размера', 'Окно переменного размера', 'Префиксные суммы'] },
        { id: 'algo-trees', title: 'Деревья', lessons: [], planned: ['Бинарные деревья', 'Обходы: прямой, симметричный, обратный', 'Бинарное дерево поиска', 'Куча и очередь с приоритетом', 'Trie (префиксное дерево)'] },
        { id: 'algo-graphs', title: 'Графы', lessons: [], planned: ['Представление графа', 'Обход в ширину (BFS)', 'Обход в глубину (DFS)', 'Алгоритм Дейкстры', 'Топологическая сортировка', 'Система непересекающихся множеств'] },
        { id: 'algo-dp', title: 'Динамическое программирование', lessons: [], planned: ['Мемоизация', 'Числа Фибоначчи и лесенка', 'Задача о рюкзаке', 'Наибольшая общая подпоследовательность', 'Редакционное расстояние'] },
        { id: 'algo-greedy', title: 'Жадные алгоритмы и бэктрекинг', lessons: [], planned: ['Жадный выбор', 'Задача о расписании', 'Перебор с возвратом', 'Генерация перестановок', 'N ферзей'] },
        { id: 'algo-interview', title: 'Подготовка к собеседованию', lessons: [], planned: ['Как решать задачу на интервью', 'Разбор 50 классических задач', 'System design: основы', 'Поведенческие вопросы'] },
      ],
    },
  ],
};
