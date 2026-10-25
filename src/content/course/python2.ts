// Трек Python, часть 2: функции, ООП, ошибки, модули, файлы, базы данных, анализ данных и дорожная карта.
import type { Module } from '../types';

export const pythonModules2: Module[] = [
  {
    id: 'py-functions',
    title: 'Функции',
    chapters: [
      {
        id: 'py-fn-1',
        title: 'Создаём свои функции',
        lessons: [
          {
            id: 'py-def',
            title: 'def: свои команды',
            minutes: 11,
            steps: [
              {
                kind: 'theory',
                topic: 'functions',
                title: 'Функция — именованный кусок кода',
                md: `Ты уже пользовался функциями: \`print()\`, \`len()\`, \`input()\`. Теперь создадим свои.

\`\`\`python
def greet(name):
    print(f"Привет, {name}!")

greet("Аня")
greet("Боря")
\`\`\`

- \`def\` — объявление функции, \`greet\` — имя, \`name\` — **параметр** (переменная, которая получит значение при вызове).
- \`"Аня"\` при вызове — **аргумент**.
- Код функции выполняется только при **вызове** \`greet(...)\`.

**return** — вернуть результат:

\`\`\`python
def square(x):
    return x * x

area = square(5) + square(3)   # 25 + 9
print(area)                     # 34
\`\`\`

\`return\` сразу завершает функцию. Если return нет — функция возвращает \`None\`.

**Зачем функции?**
1. Не повторять код (принцип DRY — Don't Repeat Yourself).
2. Разбивать сложную задачу на маленькие понятные части.
3. Давать куску кода понятное имя: \`calculate_discount(price)\` читается лучше, чем 5 строк формул.

> ⚠️ \`print\` внутри функции ≠ \`return\`. print показывает значение человеку, return отдаёт его программе для дальнейших вычислений.`,
              },
              { kind: 'animation', topic: 'functions', title: 'Вызов функции и стек', anim: { lang: 'python', code: 'def double(n):\n    result = n * 2\n    return result\n\nx = double(4)\nprint(x)', width: 420, height: 210, frames: [
                { caption: 'Python запоминает функцию double, но пока не выполняет её тело.', line: 1, boxes: [{ id: 'g', label: 'глобальная область', value: 'double = <функция>', x: 20, y: 130, w: 220, color: 'gray' }] },
                { caption: 'x = double(4): вызов! На стек кладётся новый кадр, параметр n = 4.', line: 5, boxes: [{ id: 'g', label: 'глобальная область', value: 'double = <функция>', x: 20, y: 130, w: 220, color: 'gray' }, { id: 'f', label: 'кадр double', value: 'n = 4', x: 20, y: 40, w: 220, color: 'purple', highlight: true }] },
                { caption: 'result = 4 * 2 = 8 — локальная переменная внутри функции.', line: 2, boxes: [{ id: 'g', label: 'глобальная область', value: 'double = <функция>', x: 20, y: 130, w: 220, color: 'gray' }, { id: 'f', label: 'кадр double', value: 'n = 4, result = 8', x: 20, y: 40, w: 220, color: 'purple', highlight: true }] },
                { caption: 'return result: значение 8 «возвращается» в место вызова, кадр функции удаляется.', line: 3, boxes: [{ id: 'g', label: 'глобальная область', value: 'double, x = 8', x: 20, y: 130, w: 220, color: 'green', highlight: true }, { id: 'r', label: 'return', value: '8', x: 290, y: 80, w: 100, color: 'yellow' }], arrows: [{ from: 'r', to: 'g' }] },
                { caption: 'print(x) → 8. Переменных n и result больше не существует.', line: 6, boxes: [{ id: 'g', label: 'глобальная область', value: 'double, x = 8', x: 20, y: 130, w: 220, color: 'green' }] },
              ] } },
              { kind: 'predict', topic: 'functions', lang: 'python', code: 'def add(a, b):\n    return a + b\n\nprint(add(2, 3) * add(1, 1))', answer: '10', explain: 'add(2, 3) = 5, add(1, 1) = 2, 5 * 2 = 10.' },
              { kind: 'predict', topic: 'functions', lang: 'python', code: 'def show(x):\n    print(x * 2)\n\nresult = show(5)\nprint(result)', answer: '10\nNone', explain: 'show печатает 10, но ничего не возвращает (нет return) → result = None.' },
              { kind: 'quiz', topic: 'functions', question: 'Что делает `return`?', options: ['Возвращает значение и завершает функцию', 'Печатает значение', 'Перезапускает функцию', 'Создаёт переменную'], answer: 0, explain: 'return отдаёт результат туда, где функцию вызвали, и сразу выходит из функции.' },
              { kind: 'code', topic: 'functions', lang: 'python', prompt: 'Напиши функцию `is_even(n)`, которая **возвращает** `True`, если n чётное, и `False` иначе.', starter: 'def is_even(n):\n    pass\n', tests: [{ expr: 'is_even(4)', expected: 'true' }, { expr: 'is_even(7)', expected: 'false' }, { expr: 'is_even(0)', expected: 'true' }, { expr: 'is_even(-3)', expected: 'false', hidden: true }], hints: ['Чётность: `n % 2 == 0`.', 'Можно сразу `return n % 2 == 0` — сравнение и так даёт True/False.'], solution: 'def is_even(n):\n    return n % 2 == 0' },
              { kind: 'code', topic: 'functions', lang: 'python', prompt: 'Напиши функцию `max_of_three(a, b, c)`, возвращающую наибольшее из трёх чисел, **не используя** встроенную `max`.', starter: 'def max_of_three(a, b, c):\n    pass\n', tests: [{ expr: 'max_of_three(1, 5, 3)', expected: '5' }, { expr: 'max_of_three(9, 2, 4)', expected: '9' }, { expr: 'max_of_three(-1, -5, -2)', expected: '-1' }, { expr: 'max_of_three(7, 7, 7)', expected: '7' }], hints: ['Заведи переменную `biggest = a`.', 'Сравни её с b и c и обнови, если нашлось больше.'], solution: 'def max_of_three(a, b, c):\n    biggest = a\n    if b > biggest:\n        biggest = b\n    if c > biggest:\n        biggest = c\n    return biggest' },
            ],
          },
          {
            id: 'py-params-scope',
            title: 'Параметры по умолчанию и область видимости',
            minutes: 10,
            steps: [
              {
                kind: 'theory',
                topic: 'scope',
                title: 'Гибкие функции и где живут переменные',
                md: `**Значения по умолчанию:**
\`\`\`python
def power(base, exp=2):
    return base ** exp

power(5)      # 25 — exp взят по умолчанию
power(2, 10)  # 1024
\`\`\`

**Именованные аргументы** — можно указывать имя параметра: \`power(exp=3, base=2)\`.

**\*args и \*\*kwargs** — любое число аргументов:
\`\`\`python
def total(*numbers):        # numbers — кортеж
    return sum(numbers)
total(1, 2, 3, 4)            # 10
\`\`\`

**Область видимости (scope).** Переменные, созданные внутри функции, — **локальные**: они существуют только во время вызова и не видны снаружи.

\`\`\`python
count = 10          # глобальная

def f():
    count = 99      # это ДРУГАЯ, локальная переменная
    print(count)    # 99

f()
print(count)        # 10 — глобальная не изменилась
\`\`\`

Функция может **читать** глобальные переменные, но для изменения нужно \`global\` — и это считается плохим стилем. Правильный путь: передавать значения через параметры и возвращать через \`return\`.

> ⚠️ Ловушка: изменяемое значение по умолчанию \`def add(item, lst=[])\` — список создаётся ОДИН раз и копится между вызовами. Пиши \`lst=None\` и внутри \`if lst is None: lst = []\`.`,
              },
              { kind: 'predict', topic: 'scope', lang: 'python', code: 'x = 5\n\ndef change():\n    x = 100\n    return x\n\nprint(change())\nprint(x)', answer: '100\n5', explain: 'Внутри функции создаётся локальная x = 100. Глобальная x остаётся 5.' },
              { kind: 'predict', topic: 'functions', lang: 'python', code: 'def greet(name, greeting="Привет"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Оля"))\nprint(greet("Макс", "Здорово"))', answer: 'Привет, Оля!\nЗдорово, Макс!', explain: 'Если второй аргумент не передан, используется значение по умолчанию.' },
              { kind: 'quiz', topic: 'scope', question: 'Можно ли обратиться к локальной переменной функции после её завершения?', options: ['Нет, она уничтожается после выхода', 'Да, всегда', 'Только если она число', 'Только внутри цикла'], answer: 0, explain: 'Локальные переменные живут только во время вызова функции.' },
              { kind: 'code', topic: 'functions', lang: 'python', prompt: 'Напиши функцию `price_with_discount(price, percent=10)`, которая возвращает цену со скидкой (float). `price_with_discount(1000)` → `900.0`, `price_with_discount(1000, 25)` → `750.0`.', starter: 'def price_with_discount(price, percent=10):\n    pass\n', tests: [{ expr: 'price_with_discount(1000)', expected: '900.0' }, { expr: 'price_with_discount(1000, 25)', expected: '750.0' }, { expr: 'price_with_discount(80, 50)', expected: '40.0' }], hints: ['Скидка: `price * percent / 100`.', 'Верни `price - скидка`.'], solution: 'def price_with_discount(price, percent=10):\n    return price - price * percent / 100' },
            ],
          },
          {
            id: 'py-recursion',
            title: 'Рекурсия',
            minutes: 12,
            steps: [
              {
                kind: 'theory',
                topic: 'recursion',
                title: 'Функция, которая вызывает саму себя',
                md: `**Рекурсия** — когда функция вызывает саму себя для решения меньшей версии той же задачи. Как матрёшка: открываешь — внутри такая же, только меньше.

У рекурсивной функции два обязательных элемента:
1. **Базовый случай** — когда остановиться (самая маленькая матрёшка).
2. **Рекурсивный шаг** — вызов себя с задачей поменьше.

\`\`\`python
def factorial(n):
    if n <= 1:                      # базовый случай
        return 1
    return n * factorial(n - 1)     # рекурсивный шаг

print(factorial(5))  # 5 * 4 * 3 * 2 * 1 = 120
\`\`\`

Как это выполняется:
\`\`\`text
factorial(5) = 5 * factorial(4)
             = 5 * 4 * factorial(3)
             = 5 * 4 * 3 * factorial(2)
             = 5 * 4 * 3 * 2 * factorial(1)
             = 5 * 4 * 3 * 2 * 1 = 120
\`\`\`

Каждый вызов кладёт новый кадр на **стек вызовов**. Без базового случая стек переполнится → \`RecursionError\`.

Рекурсия особенно удобна для «древовидных» задач: обход папок, деревья, перебор вариантов, алгоритмы «разделяй и властвуй» (быстрая сортировка, сортировка слиянием).

> 💡 Открой этот пример в отладчике (🐞) и посмотри вкладку «Вызовы» — увидишь, как растёт и уменьшается стек.`,
              },
              { kind: 'example', topic: 'recursion', lang: 'python', code: 'def countdown(n):\n    if n == 0:\n        print("Пуск! 🚀")\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)' },
              { kind: 'predict', topic: 'recursion', lang: 'python', code: 'def sum_to(n):\n    if n == 0:\n        return 0\n    return n + sum_to(n - 1)\n\nprint(sum_to(4))', answer: '10', explain: '4 + 3 + 2 + 1 + 0 = 10.' },
              { kind: 'findline', topic: 'recursion', lang: 'python', prompt: 'Эта функция никогда не остановится. Какая строка виновата?', code: 'def fib(n):\n    if n == 0:\n        return 0\n    return fib(n - 1) + fib(n - 2)', answer: 2, explain: 'Базовый случай неполный: для n = 1 вызывается fib(0) и fib(-1), а для отрицательных чисел рекурсия бесконечна. Нужно `if n <= 1: return n`.' },
              { kind: 'code', topic: 'recursion', lang: 'python', prompt: 'Напиши **рекурсивную** функцию `power(base, exp)` (exp ≥ 0, целое) без использования `**`.', starter: 'def power(base, exp):\n    pass\n', tests: [{ expr: 'power(2, 10)', expected: '1024' }, { expr: 'power(5, 0)', expected: '1' }, { expr: 'power(3, 4)', expected: '81' }], hints: ['Базовый случай: exp == 0 → вернуть 1.', 'Шаг: base * power(base, exp - 1).'], solution: 'def power(base, exp):\n    if exp == 0:\n        return 1\n    return base * power(base, exp - 1)' },
              { kind: 'code', topic: 'recursion', lang: 'python', prompt: 'Напиши рекурсивную функцию `digit_sum(n)`, возвращающую сумму цифр неотрицательного числа: `digit_sum(1234)` → 10.', starter: 'def digit_sum(n):\n    pass\n', tests: [{ expr: 'digit_sum(1234)', expected: '10' }, { expr: 'digit_sum(0)', expected: '0' }, { expr: 'digit_sum(9999)', expected: '36' }], hints: ['Последняя цифра: `n % 10`, остальное число: `n // 10`.', 'Базовый случай: n < 10 → вернуть n.'], solution: 'def digit_sum(n):\n    if n < 10:\n        return n\n    return n % 10 + digit_sum(n // 10)' },
            ],
          },
          {
            id: 'py-lambda',
            title: 'Лямбды, sorted, map, filter',
            minutes: 9,
            steps: [
              {
                kind: 'theory',
                topic: 'functions',
                title: 'Функции как значения',
                md: `В Python функции — обычные значения: их можно класть в переменные и передавать в другие функции.

**lambda** — короткая анонимная функция в одну строку:
\`\`\`python
square = lambda x: x * x
print(square(4))  # 16
\`\`\`

Чаще всего лямбды передают как **ключ** сортировки:
\`\`\`python
users = [("Аня", 17), ("Боря", 15), ("Вика", 19)]
by_age = sorted(users, key=lambda u: u[1])
words = sorted(["яблоко", "ёж", "кот"], key=len)
\`\`\`

**map** применяет функцию к каждому элементу, **filter** оставляет подходящие:
\`\`\`python
nums = [1, 2, 3, 4, 5]
print(list(map(lambda x: x * 10, nums)))        # [10, 20, 30, 40, 50]
print(list(filter(lambda x: x % 2 == 0, nums))) # [2, 4]
\`\`\`

Другие полезные встроенные функции: \`any()\`, \`all()\`, \`zip()\`, \`enumerate()\`, \`reversed()\`, \`sorted(..., reverse=True)\`.`,
              },
              { kind: 'predict', topic: 'functions', lang: 'python', code: 'names = ["Вика", "Ян", "Александр"]\nprint(sorted(names, key=len))\nprint(max(names, key=len))', answer: "['Ян', 'Вика', 'Александр']\nАлександр", explain: 'Сортировка и поиск максимума по длине строки.' },
              { kind: 'match', topic: 'functions', prompt: 'Сопоставь функцию и назначение', pairs: [['map', 'Применить функцию к каждому элементу'], ['filter', 'Оставить элементы по условию'], ['zip', 'Объединить последовательности попарно'], ['any', 'Есть ли хотя бы один истинный элемент']] },
              { kind: 'code', topic: 'functions', lang: 'python', prompt: 'Отсортируй список товаров по **убыванию цены** и выведи названия через запятую с пробелом.', starter: 'products = [("Мышь", 900), ("Монитор", 15000), ("Коврик", 300), ("Клавиатура", 2500)]\n', tests: [{ expected: 'Монитор, Клавиатура, Мышь, Коврик' }], hints: ['`sorted(products, key=lambda p: p[1], reverse=True)`', 'Названия: `[p[0] for p in ...]`, склейка: `", ".join(...)`.'], solution: 'products = [("Мышь", 900), ("Монитор", 15000), ("Коврик", 300), ("Клавиатура", 2500)]\nordered = sorted(products, key=lambda p: p[1], reverse=True)\nprint(", ".join(p[0] for p in ordered))' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'py-oop',
    title: 'ООП, ошибки и модули',
    chapters: [
      {
        id: 'py-oop-1',
        title: 'Классы и объекты',
        lessons: [
          {
            id: 'py-classes',
            title: 'Классы: свои типы данных',
            minutes: 13,
            steps: [
              {
                kind: 'theory',
                topic: 'classes',
                title: 'Класс — чертёж, объект — изделие',
                md: `**Класс** описывает, какие данные (**атрибуты**) и действия (**методы**) будут у объектов. **Объект** (экземпляр) — конкретная вещь, созданная по чертежу.

\`\`\`python
class Dog:
    def __init__(self, name, age):   # конструктор: вызывается при создании
        self.name = name             # атрибуты объекта
        self.age = age

    def bark(self):                  # метод
        print(f"{self.name}: Гав!")

    def birthday(self):
        self.age += 1

rex = Dog("Рекс", 3)
bim = Dog("Бим", 5)
rex.bark()          # Рекс: Гав!
rex.birthday()
print(rex.age)      # 4
print(bim.age)      # 5 — у каждого объекта свои данные
\`\`\`

- \`__init__\` — **конструктор**, настраивает новый объект.
- \`self\` — ссылка на сам объект (первый параметр каждого метода).
- \`rex.name\` — обращение к атрибуту через точку.

**Специальные методы** («магические»):
- \`__str__\` — как объект выглядит в \`print\`;
- \`__len__\`, \`__eq__\`, \`__add__\` — поддержка \`len()\`, \`==\`, \`+\`.

**Зачем ООП?** Объединить данные и действия над ними в одно целое. Игровой персонаж, банковский счёт, корзина магазина — естественно описываются классами.`,
              },
              { kind: 'example', topic: 'classes', lang: 'python', code: 'class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            print("Недостаточно средств!")\n            return\n        self.balance -= amount\n\n    def __str__(self):\n        return f"Счёт {self.owner}: {self.balance} ₽"\n\nacc = BankAccount("Аня", 100)\nacc.deposit(50)\nacc.withdraw(500)\nacc.withdraw(30)\nprint(acc)' },
              { kind: 'predict', topic: 'classes', lang: 'python', code: 'class Counter:\n    def __init__(self):\n        self.value = 0\n    def inc(self):\n        self.value += 1\n\na = Counter()\nb = Counter()\na.inc(); a.inc(); b.inc()\nprint(a.value, b.value)', answer: '2 1', explain: 'У каждого объекта свой атрибут value.' },
              { kind: 'quiz', topic: 'classes', question: 'Что такое `self`?', options: ['Ссылка на объект, у которого вызван метод', 'Имя класса', 'Глобальная переменная', 'Ключевое слово для return'], answer: 0, explain: 'При вызове `rex.bark()` Python передаёт rex в параметр self.' },
              { kind: 'order', topic: 'classes', lang: 'python', prompt: 'Собери класс прямоугольника с методом площади', lines: ['class Rect:', '    def __init__(self, w, h):', '        self.w = w', '        self.h = h', '    def area(self):', '        return self.w * self.h'] },
              { kind: 'code', topic: 'classes', lang: 'python', prompt: 'Создай класс `Player` с атрибутами `name` и `hp` (по умолчанию 100) и методами: `take_damage(n)` — уменьшает hp, но не ниже 0; `is_alive()` — возвращает True, если hp > 0.', starter: 'class Player:\n    pass\n', tests: [{ expr: '(lambda p: (p.take_damage(30), p.hp)[1])(Player("Ann"))', expected: '70' }, { expr: '(lambda p: (p.take_damage(150), p.hp, p.is_alive())[1:])(Player("Bob"))', expected: '[0, false]' }, { expr: 'Player("Cid", 50).is_alive()', expected: 'true' }], hints: ['Конструктор: `def __init__(self, name, hp=100):`', '`self.hp = max(0, self.hp - n)`', '`return self.hp > 0`'], solution: 'class Player:\n    def __init__(self, name, hp=100):\n        self.name = name\n        self.hp = hp\n\n    def take_damage(self, n):\n        self.hp = max(0, self.hp - n)\n\n    def is_alive(self):\n        return self.hp > 0' },
            ],
          },
          {
            id: 'py-inheritance',
            title: 'Наследование и полиморфизм',
            minutes: 10,
            steps: [
              {
                kind: 'theory',
                topic: 'classes',
                title: 'Классы-потомки',
                md: `**Наследование** — создание класса на основе другого. Потомок получает всё от родителя и может добавить своё или изменить поведение.

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."

class Cat(Animal):          # Cat наследует Animal
    def speak(self):        # переопределяем метод
        return "Мяу"

class Dog(Animal):
    def speak(self):
        return "Гав"

for pet in [Cat("Мурка"), Dog("Шарик")]:
    print(pet.name, "говорит", pet.speak())
\`\`\`

**Полиморфизм** — один и тот же вызов \`pet.speak()\` работает по-разному для разных типов. Код цикла не знает, кошка там или собака.

**super()** — вызвать метод родителя:
\`\`\`python
class Robot(Animal):
    def __init__(self, name, model):
        super().__init__(name)   # родительский конструктор
        self.model = model
\`\`\`

**Три кита ООП:** инкапсуляция (данные + методы вместе, скрытие деталей), наследование, полиморфизм.`,
              },
              { kind: 'predict', topic: 'classes', lang: 'python', code: 'class Shape:\n    def area(self):\n        return 0\n\nclass Square(Shape):\n    def __init__(self, a):\n        self.a = a\n    def area(self):\n        return self.a ** 2\n\nshapes = [Shape(), Square(3)]\nprint([s.area() for s in shapes])', answer: '[0, 9]', explain: 'Square переопределяет area(); у базового Shape площадь 0.' },
              { kind: 'quiz', topic: 'classes', question: 'Зачем нужен `super().__init__(...)`?', options: ['Вызвать конструктор родительского класса', 'Создать новый класс', 'Удалить объект', 'Сделать метод статическим'], answer: 0, explain: 'super() даёт доступ к методам родителя.' },
              { kind: 'code', topic: 'classes', lang: 'python', prompt: 'Есть класс `Employee` с методом `salary()`, возвращающим 50000. Создай потомка `Manager`, у которого `salary()` возвращает зарплату родителя **плюс 20000** (используй `super()`).', starter: 'class Employee:\n    def salary(self):\n        return 50000\n\n# класс Manager\n', tests: [{ expr: 'Manager().salary()', expected: '70000' }, { expr: 'Employee().salary()', expected: '50000' }, { expr: 'isinstance(Manager(), Employee)', expected: 'true' }], hints: ['`class Manager(Employee):`', '`return super().salary() + 20000`'], solution: 'class Employee:\n    def salary(self):\n        return 50000\n\nclass Manager(Employee):\n    def salary(self):\n        return super().salary() + 20000' },
            ],
          },
        ],
      },
      {
        id: 'py-oop-2',
        title: 'Ошибки, модули, файлы',
        lessons: [
          {
            id: 'py-exceptions',
            title: 'Исключения: try / except',
            minutes: 10,
            steps: [
              {
                kind: 'theory',
                topic: 'errors',
                title: 'Ошибки — это нормально',
                md: `Когда что-то идёт не так, Python **выбрасывает исключение** (exception) и останавливает программу. Но исключение можно **поймать** и обработать:

\`\`\`python
try:
    age = int(input("Возраст: "))
    print(100 / age)
except ValueError:
    print("Это не число!")
except ZeroDivisionError:
    print("На ноль делить нельзя")
else:
    print("Всё прошло хорошо")    # если ошибок не было
finally:
    print("Выполнится всегда")
\`\`\`

**Частые исключения:**

| Исключение | Когда |
|---|---|
| \`ValueError\` | неверное значение: \`int("abc")\` |
| \`TypeError\` | неверный тип: \`"a" + 1\` |
| \`ZeroDivisionError\` | деление на ноль |
| \`IndexError\` | индекс вне списка |
| \`KeyError\` | нет ключа в словаре |
| \`NameError\` | неизвестное имя |
| \`FileNotFoundError\` | нет файла |

**Свои исключения:** \`raise ValueError("Сумма должна быть положительной")\`.

**Как читать traceback:** смотри на **последнюю строку** (тип и сообщение) и на номер строки в твоём коде.

> 💡 Не лови все ошибки подряд (\`except:\` без типа) — так ты спрячешь настоящие баги. Лови конкретные исключения, которые ожидаешь.`,
              },
              { kind: 'predict', topic: 'errors', lang: 'python', code: 'try:\n    nums = [1, 2, 3]\n    print(nums[5])\nexcept IndexError:\n    print("Нет такого элемента")\nfinally:\n    print("Конец")', answer: 'Нет такого элемента\nКонец', explain: 'nums[5] вызывает IndexError, он пойман; finally выполняется всегда.' },
              { kind: 'match', topic: 'errors', prompt: 'Какое исключение вызовет код?', pairs: [['int("десять")', 'ValueError'], ['10 / 0', 'ZeroDivisionError'], ['{"a": 1}["b"]', 'KeyError'], ['"5" + 5', 'TypeError']] },
              { kind: 'code', topic: 'errors', lang: 'python', prompt: 'Напиши функцию `safe_divide(a, b)`: возвращает `a / b`, а при делении на ноль возвращает строку `"Ошибка"`. Используй try/except.', starter: 'def safe_divide(a, b):\n    pass\n', tests: [{ expr: 'safe_divide(10, 4)', expected: '2.5' }, { expr: 'safe_divide(1, 0)', expected: '"Ошибка"' }], hints: ['`try: return a / b`', '`except ZeroDivisionError: return "Ошибка"`'], solution: 'def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return "Ошибка"' },
              { kind: 'code', topic: 'errors', lang: 'python', prompt: 'Читай строки, пока не придёт `стоп`. Складывай только те, что являются целыми числами, остальные пропускай (используй try/except). Выведи сумму.', starter: 'total = 0\n', tests: [{ stdin: ['5', 'abc', '10', '2.5', 'стоп'], expected: '15' }, { stdin: ['стоп'], expected: '0' }], hints: ['Цикл `while True`, внутри `line = input()` и проверка на "стоп".', 'В try: `total += int(line)`; except ValueError: `pass` или `continue`.'], solution: 'total = 0\nwhile True:\n    line = input()\n    if line == "стоп":\n        break\n    try:\n        total += int(line)\n    except ValueError:\n        pass\nprint(total)' },
            ],
          },
          {
            id: 'py-modules',
            title: 'Модули: math, random, datetime',
            minutes: 9,
            steps: [
              {
                kind: 'theory',
                topic: 'modules',
                title: 'Не изобретай велосипед',
                md: `**Модуль** — файл с готовым кодом. В Python огромная **стандартная библиотека** и сотни тысяч сторонних пакетов (PyPI).

\`\`\`python
import math
print(math.sqrt(16), math.pi)

from random import randint, choice
print(randint(1, 6))               # кубик
print(choice(["камень", "ножницы", "бумага"]))

import datetime as dt
print(dt.date.today())
\`\`\`

| Модуль | Для чего |
|---|---|
| \`math\` | корни, синусы, округления, π |
| \`random\` | случайные числа и выбор |
| \`datetime\` | даты и время |
| \`json\` | работа с JSON |
| \`os\`, \`pathlib\` | файлы и папки |
| \`collections\` | Counter, defaultdict, deque |
| \`itertools\` | комбинации, перестановки |
| \`re\` | регулярные выражения |
| \`sqlite3\` | встроенная база данных |

**Свой модуль** — это просто .py файл. Если рядом лежит \`utils.py\` с функцией \`hello\`, пиши \`from utils import hello\`.

**Сторонние пакеты** ставят командой \`pip install имя\`. В [консоли CodeVerse](#/console) работает \`pip install numpy\` — пакеты реально загружаются в песочницу!`,
              },
              { kind: 'example', topic: 'modules', lang: 'python', code: 'from collections import Counter\nimport math\n\nwords = "яблоко груша яблоко слива яблоко груша".split()\nprint(Counter(words).most_common(2))\nprint(math.factorial(10))\nprint(round(math.pi, 4))' },
              { kind: 'match', topic: 'modules', prompt: 'Какой модуль подойдёт?', pairs: [['Бросить игральный кубик', 'random'], ['Корень квадратный', 'math'], ['Сколько дней до Нового года', 'datetime'], ['Посчитать частоту слов', 'collections']] },
              { kind: 'code', topic: 'modules', lang: 'python', prompt: 'Используя `math`, напиши функцию `circle_area(r)`, возвращающую площадь круга, округлённую до 2 знаков.', starter: 'import math\n\ndef circle_area(r):\n    pass\n', tests: [{ expr: 'circle_area(1)', expected: '3.14' }, { expr: 'circle_area(2.5)', expected: '19.63' }, { expr: 'circle_area(0)', expected: '0' }], hints: ['Площадь = π · r².', '`round(math.pi * r ** 2, 2)`'], solution: 'import math\n\ndef circle_area(r):\n    return round(math.pi * r ** 2, 2)' },
            ],
          },
          {
            id: 'py-files',
            title: 'Работа с файлами',
            minutes: 9,
            steps: [
              {
                kind: 'theory',
                topic: 'files',
                title: 'Читаем и пишем файлы',
                md: `Чтобы данные сохранялись после завершения программы, их пишут в файлы.

\`\`\`python
# Запись ("w" — перезаписать, "a" — дописать)
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("Первая строка\\n")
    f.write("Вторая строка\\n")

# Чтение целиком
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()

# Построчно
with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())
\`\`\`

- \`with\` автоматически **закрывает** файл, даже если случилась ошибка.
- Режимы: \`"r"\` чтение (по умолчанию), \`"w"\` запись, \`"a"\` дозапись, \`"rb"/"wb"\` двоичные файлы.
- Всегда указывай \`encoding="utf-8"\` для русского текста.

**JSON-файлы** — удобный способ сохранять структуры:
\`\`\`python
import json
with open("save.json", "w") as f:
    json.dump({"level": 3, "coins": 120}, f)
with open("save.json") as f:
    data = json.load(f)
\`\`\``,
              },
              { kind: 'example', topic: 'files', lang: 'python', code: 'with open("todo.txt", "w", encoding="utf-8") as f:\n    for task in ["Выучить циклы", "Сделать проект", "Повторить карточки"]:\n        f.write(task + "\\n")\n\nwith open("todo.txt", encoding="utf-8") as f:\n    for i, line in enumerate(f, start=1):\n        print(f"{i}. {line.strip()}")', note: 'Файлы создаются в виртуальной файловой системе песочницы Python.' },
              { kind: 'quiz', topic: 'files', question: 'Чем режим "a" отличается от "w"?', options: ['"a" дописывает в конец, "w" перезаписывает файл', 'Ничем', '"a" только читает', '"w" дописывает, "a" удаляет'], answer: 0, explain: 'a = append (дописать), w = write (записать заново).' },
              { kind: 'code', topic: 'files', lang: 'python', prompt: 'Запиши в файл `scores.txt` числа 10, 20, 30 (каждое на новой строке), затем прочитай файл и выведи **сумму** чисел.', starter: '', tests: [{ expected: '60' }], hints: ['Запись: `f.write(str(n) + "\\n")`.', 'Чтение: `sum(int(line) for line in f)`.'], solution: 'with open("scores.txt", "w") as f:\n    for n in [10, 20, 30]:\n        f.write(str(n) + "\\n")\n\nwith open("scores.txt") as f:\n    print(sum(int(line) for line in f))' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'py-data',
    title: 'Данные и базы данных',
    chapters: [
      {
        id: 'py-data-1',
        title: 'SQL и SQLite',
        lessons: [
          {
            id: 'py-sqlite',
            title: 'Базы данных: SQLite и SQL',
            minutes: 14,
            steps: [
              {
                kind: 'theory',
                topic: 'general',
                title: 'Таблицы, строки, запросы',
                md: `**База данных** хранит большие объёмы данных и умеет быстро их искать. Самые популярные — **реляционные**: данные лежат в **таблицах** (как в Excel), а общаются с ними на языке **SQL**.

| id | name | age | city |
|---|---|---|---|
| 1 | Аня | 17 | Казань |
| 2 | Боря | 15 | Пермь |

**Основные SQL-команды:**

\`\`\`sql
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);
INSERT INTO users (name, age) VALUES ('Аня', 17);
SELECT name, age FROM users WHERE age > 16 ORDER BY age DESC;
UPDATE users SET age = 18 WHERE name = 'Аня';
DELETE FROM users WHERE id = 2;
SELECT COUNT(*), AVG(age) FROM users;
\`\`\`

**SQLite** — база данных в одном файле, встроена в Python (\`import sqlite3\`). PostgreSQL и MySQL работают похоже, но как отдельные серверы.

\`\`\`python
import sqlite3
conn = sqlite3.connect(":memory:")       # база в памяти (или "app.db")
cur = conn.cursor()
cur.execute("CREATE TABLE users (name TEXT, age INTEGER)")
cur.execute("INSERT INTO users VALUES (?, ?)", ("Аня", 17))
for row in cur.execute("SELECT * FROM users"):
    print(row)
conn.commit()
\`\`\`

> ⚠️ Никогда не вставляй данные пользователя в SQL через f-строки — это **SQL-инъекция**, классическая уязвимость. Используй параметры \`?\`.`,
              },
              { kind: 'example', topic: 'general', lang: 'python', code: 'import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE games (title TEXT, year INTEGER, rating REAL)")\ncur.executemany("INSERT INTO games VALUES (?, ?, ?)", [\n    ("Minecraft", 2011, 9.1),\n    ("Tetris", 1984, 8.7),\n    ("Portal 2", 2011, 9.5),\n    ("Doom", 1993, 8.9),\n])\n\nfor title, rating in cur.execute("SELECT title, rating FROM games WHERE year >= 2000 ORDER BY rating DESC"):\n    print(title, rating)\n\nprint(cur.execute("SELECT COUNT(*), ROUND(AVG(rating), 2) FROM games").fetchone())' },
              { kind: 'match', topic: 'general', prompt: 'SQL-команда и действие', pairs: [['SELECT', 'Прочитать данные'], ['INSERT', 'Добавить строку'], ['UPDATE', 'Изменить данные'], ['DELETE', 'Удалить строки'], ['WHERE', 'Условие отбора']] },
              { kind: 'order', topic: 'general', prompt: 'Собери запрос: имена пользователей старше 18, отсортированные по имени', lines: ['SELECT name', 'FROM users', 'WHERE age > 18', 'ORDER BY name'] },
              { kind: 'code', topic: 'general', lang: 'python', prompt: 'Создай таблицу `products(name, price)`, добавь товары: Хлеб 50, Сыр 400, Молоко 90, Чай 250. Выведи **названия товаров дороже 100**, отсортированные по цене по возрастанию, каждое с новой строки.', starter: 'import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\n', tests: [{ expected: 'Чай\nСыр' }], hints: ['`CREATE TABLE products (name TEXT, price INTEGER)`', 'Вставка через `executemany` с параметрами `?`.', '`SELECT name FROM products WHERE price > 100 ORDER BY price`'], solution: 'import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE products (name TEXT, price INTEGER)")\ncur.executemany("INSERT INTO products VALUES (?, ?)", [("Хлеб", 50), ("Сыр", 400), ("Молоко", 90), ("Чай", 250)])\nfor (name,) in cur.execute("SELECT name FROM products WHERE price > 100 ORDER BY price"):\n    print(name)' },
            ],
          },
        ],
      },
      {
        id: 'py-data-2',
        title: 'NumPy и Pandas',
        lessons: [
          {
            id: 'py-numpy-pandas',
            title: 'Анализ данных: NumPy и Pandas',
            minutes: 14,
            steps: [
              {
                kind: 'theory',
                topic: 'general',
                title: 'Инструменты data science',
                md: `**NumPy** — быстрые массивы чисел и математика над ними. Операции применяются сразу ко всему массиву (векторизация) — в десятки раз быстрее циклов.

\`\`\`python
import numpy as np
a = np.array([1, 2, 3, 4])
print(a * 10)          # [10 20 30 40]
print(a.mean(), a.std())
m = np.arange(9).reshape(3, 3)   # матрица 3×3
\`\`\`

**Pandas** — таблицы (\`DataFrame\`) с удобной фильтрацией, группировкой и статистикой. Это «Excel на стероидах» для программистов.

\`\`\`python
import pandas as pd
df = pd.DataFrame({
    "name": ["Аня", "Боря", "Вика"],
    "score": [92, 78, 85],
    "group": ["A", "B", "A"],
})
print(df[df["score"] > 80])                 # фильтр
print(df.groupby("group")["score"].mean())  # среднее по группам
print(df.sort_values("score", ascending=False).head(2))
\`\`\`

Pandas читает CSV, Excel, SQL, JSON: \`pd.read_csv("data.csv")\`.

> 💡 В CodeVerse эти библиотеки реально работают в браузере (Pyodide). При первом импорте они загружаются несколько секунд.`,
              },
              { kind: 'example', topic: 'general', lang: 'python', code: 'import numpy as np\n\ntemps = np.array([-5, -2, 0, 3, 8, 12, 15])\nprint("Средняя:", temps.mean())\nprint("Выше нуля:", temps[temps > 0])\nprint("В Фаренгейтах:", temps * 9 / 5 + 32)' },
              { kind: 'example', topic: 'general', lang: 'python', code: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "товар": ["ноутбук", "мышь", "монитор", "мышь", "ноутбук"],\n    "цена": [80000, 1500, 20000, 1700, 75000],\n    "магазин": ["А", "А", "Б", "Б", "Б"],\n})\nprint(df.groupby("товар")["цена"].mean())\nprint()\nprint(df[df["магазин"] == "Б"].sort_values("цена"))' },
              { kind: 'quiz', topic: 'general', question: 'Почему операции NumPy быстрее обычных циклов Python?', options: ['Они выполняются над всем массивом сразу в оптимизированном коде на C', 'NumPy использует Интернет', 'Циклы Python запрещены', 'NumPy пропускает часть элементов'], answer: 0, explain: 'Векторизация: внутренний цикл написан на C и работает с непрерывным блоком памяти.' },
              { kind: 'code', topic: 'general', lang: 'python', prompt: 'С помощью NumPy создай массив чисел от 1 до 10 (`np.arange`), выведи **сумму квадратов** этих чисел (одно число).', starter: 'import numpy as np\n', tests: [{ expected: '385' }], hints: ['`a = np.arange(1, 11)`', '`(a ** 2).sum()`'], solution: 'import numpy as np\n\na = np.arange(1, 11)\nprint((a ** 2).sum())' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'py-pro',
    title: 'Python для профессионалов (дорожная карта)',
    chapters: [
      { id: 'py-adv', title: 'Продвинутый Python', lessons: [], planned: ['Генераторы и yield', 'Итераторы и протокол итерации', 'Декораторы', 'Контекстные менеджеры', 'Аннотации типов и mypy', 'dataclasses', 'Модули и пакеты, venv', 'Тестирование: pytest'] },
      { id: 'py-async', title: 'Асинхронность: AsyncIO и WebSockets', lessons: [], planned: ['Синхронный vs асинхронный код', 'async/await', 'asyncio.gather и задачи', 'aiohttp', 'WebSockets-сервер и клиент'] },
      { id: 'py-web-scrape', title: 'Requests, BeautifulSoup, Selenium', lessons: [], planned: ['HTTP-запросы с requests', 'Парсинг HTML: BeautifulSoup', 'CSS-селекторы', 'Selenium: управление браузером', 'Этика и robots.txt', 'Проект: парсер новостей'] },
      { id: 'py-flask', title: 'Flask', lessons: [], planned: ['Первое веб-приложение', 'Маршруты и шаблоны Jinja', 'Формы и сессии', 'REST API на Flask', 'Проект: блог'] },
      { id: 'py-fastapi', title: 'FastAPI', lessons: [], planned: ['Эндпоинты и Pydantic', 'Валидация и документация OpenAPI', 'Зависимости и авторизация JWT', 'Асинхронные эндпоинты', 'Проект: REST API задач'] },
      { id: 'py-django', title: 'Django', lessons: [], planned: ['Проект и приложения', 'Модели и ORM', 'Админка', 'Представления и шаблоны', 'Django REST Framework', 'Проект: интернет-магазин'] },
      { id: 'py-sql-pro', title: 'PostgreSQL и SQLAlchemy', lessons: [], planned: ['JOIN и связи таблиц', 'Индексы и транзакции', 'PostgreSQL', 'ORM SQLAlchemy', 'Миграции Alembic'] },
      { id: 'py-bots', title: 'Telegram и Discord-боты', lessons: [], planned: ['Telegram Bot API', 'aiogram: команды и кнопки', 'Состояния и FSM', 'Discord API и discord.py', 'Хостинг бота 24/7'] },
      { id: 'py-cv', title: 'OpenCV', lessons: [], planned: ['Изображения как массивы', 'Фильтры и контуры', 'Распознавание лиц', 'Видео с камеры'] },
      { id: 'py-ml', title: 'Машинное обучение: TensorFlow и PyTorch', lessons: [], planned: ['Что такое ML', 'Линейная регрессия с нуля', 'scikit-learn', 'Нейронные сети: перцептрон', 'PyTorch: тензоры и обучение', 'TensorFlow/Keras', 'Компьютерное зрение (CNN)', 'Проект: распознавание цифр'] },
      { id: 'py-auto', title: 'Автоматизация', lessons: [], planned: ['Работа с файлами и папками', 'Excel и CSV', 'Письма и уведомления', 'Планировщик задач', 'Проект: автосортировка загрузок'] },
    ],
  },
];
