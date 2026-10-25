// Курс Python: функции и ООП глубже, модуль «Продвинутый Python», работа с JSON и CSV.
import type { Chapter, Module } from '../types';

const py = String.raw;

export const pythonExtraChapters2: Record<string, Chapter[]> = {
  'py-functions': [
    {
      id: 'py-fn-2',
      title: 'Функции глубже',
      description: 'Произвольное число аргументов, функции как значения, замыкания.',
      lessons: [
        {
          id: 'py-functions-advanced',
          title: '*args, **kwargs, замыкания и функции высшего порядка',
          minutes: 14,
          steps: [
            {
              kind: 'theory',
              topic: 'functions',
              title: 'Функции — такие же значения, как числа',
              md: `**Любое количество аргументов:**
\`\`\`python
def report(title, *args, **kwargs):
    print(title)          # обязательный аргумент
    print(args)           # кортеж позиционных: (1, 2, 3)
    print(kwargs)         # словарь именованных: {'color': 'red'}

report("Итог", 1, 2, 3, color="red")
\`\`\`

**Распаковка при вызове:** \`f(*[1, 2])\` — то же, что \`f(1, 2)\`; \`f(**{"a": 1})\` — то же, что \`f(a=1)\`.

**Функции высшего порядка** принимают или возвращают функции:
\`\`\`python
def apply_twice(func, x):
    return func(func(x))

apply_twice(lambda v: v * 3, 2)   # 18
\`\`\`

**Замыкание** — функция, созданная внутри другой функции, «помнит» её переменные:
\`\`\`python
def make_counter():
    count = 0
    def inc():
        nonlocal count     # меняем переменную внешней функции
        count += 1
        return count
    return inc

c = make_counter()
c(); c()
print(c())   # 3
\`\`\`

\`nonlocal\` нужен, чтобы **изменить** переменную внешней функции (для чтения не нужен).`,
            },
            { kind: 'predict', topic: 'functions', lang: 'python', code: py`def f(*args, **kwargs):
    print(len(args), sorted(kwargs))

f(1, 2, 3, a=1, b=2)`, answer: "3 ['a', 'b']", explain: 'args = (1, 2, 3), kwargs = {"a": 1, "b": 2}; sorted(kwargs) — отсортированные ключи.' },
            { kind: 'predict', topic: 'scope', lang: 'python', code: py`def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

a = make_counter()
b = make_counter()
a(); a()
print(a(), b())`, answer: '3 1', explain: 'У каждого счётчика своя переменная count в замыкании.' },
            { kind: 'quiz', topic: 'functions', question: 'Что делает `nonlocal x` внутри вложенной функции?', options: ['Позволяет изменять переменную x из внешней (объемлющей) функции', 'Создаёт глобальную переменную', 'Удаляет x', 'Делает x константой'], answer: 0, explain: 'Без nonlocal присваивание x = ... создало бы новую локальную переменную.' },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'python',
              prompt: 'Напиши `apply_n(func, x, n)` — применить функцию к x ровно n раз подряд.',
              starter: 'def apply_n(func, x, n):\n    pass\n',
              tests: [{ expr: 'apply_n(lambda v: v * 2, 1, 10)', expected: '1024' }, { expr: 'apply_n(lambda s: s + "!", "hi", 3)', expected: '"hi!!!"' }, { expr: 'apply_n(abs, -5, 0)', expected: '-5' }],
              hints: ['Цикл `for _ in range(n): x = func(x)`.'],
              solution: py`def apply_n(func, x, n):
    for _ in range(n):
        x = func(x)
    return x`,
            },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'python',
              prompt: 'Напиши `make_multiplier(k)`, возвращающую **функцию**, которая умножает свой аргумент на k.',
              starter: 'def make_multiplier(k):\n    pass\n',
              tests: [{ expr: 'make_multiplier(3)(5)', expected: '15' }, { expr: '[make_multiplier(2)(x) for x in range(4)]', expected: '[0, 2, 4, 6]' }],
              hints: ['Внутри объяви `def multiply(x): return x * k` и верни `multiply` (без скобок!).'],
              solution: py`def make_multiplier(k):
    def multiply(x):
        return x * k
    return multiply`,
            },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'python',
              prompt: 'Напиши `pipeline(*funcs)` — верни функцию, которая пропускает значение через все функции **слева направо**: `pipeline(f, g)(x) == g(f(x))`. Без функций — значение не меняется.',
              starter: 'def pipeline(*funcs):\n    pass\n',
              tests: [{ expr: 'pipeline(lambda x: x + 1, lambda x: x * 2)(3)', expected: '8' }, { expr: 'pipeline()(5)', expected: '5' }, { expr: 'pipeline(str.strip, str.upper, len)("  hello ")', expected: '5' }],
              hints: ['Верни внутреннюю функцию `run(x)`.', 'Внутри — цикл по `funcs`, на каждом шаге `x = f(x)`.'],
              solution: py`def pipeline(*funcs):
    def run(x):
        for f in funcs:
            x = f(x)
        return x
    return run`,
            },
          ],
        },
      ],
    },
  ],
  'py-oop': [
    {
      id: 'py-oop-3',
      title: 'ООП глубже',
      description: 'Магические методы, свойства и dataclasses.',
      lessons: [
        {
          id: 'py-magic-methods',
          title: 'Магические методы и свойства',
          minutes: 14,
          steps: [
            {
              kind: 'theory',
              topic: 'classes',
              title: 'Учим свои объекты работать с +, ==, len и print',
              md: `Методы с двойными подчёркиваниями («dunder», «магические») вызываются Python автоматически:

| Метод | Когда вызывается |
|---|---|
| \`__init__(self, ...)\` | создание объекта |
| \`__str__(self)\` | \`print(obj)\`, \`str(obj)\` |
| \`__repr__(self)\` | в консоли и внутри списков |
| \`__eq__(self, other)\` | \`a == b\` |
| \`__lt__(self, other)\` | \`a < b\`, сортировка |
| \`__add__(self, other)\` | \`a + b\` |
| \`__len__(self)\` | \`len(obj)\` |
| \`__getitem__(self, i)\` | \`obj[i]\` |
| \`__contains__(self, x)\` | \`x in obj\` |

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    def __str__(self):
        return f"Vector({self.x}, {self.y})"

print(Vector(1, 2) + Vector(3, 4))   # Vector(4, 6)
\`\`\`

**Свойства (@property)** — метод, который читается как атрибут. С сеттером можно проверять значения:
\`\`\`python
class Account:
    def __init__(self):
        self._balance = 0          # «_» — договорённость: внутреннее поле
    @property
    def balance(self):
        return self._balance
    @balance.setter
    def balance(self, value):
        if value < 0:
            raise ValueError("Баланс не может быть отрицательным")
        self._balance = value
\`\`\``,
            },
            { kind: 'predict', topic: 'classes', lang: 'python', code: py`class Playlist:
    def __init__(self, songs):
        self.songs = songs
    def __len__(self):
        return len(self.songs)
    def __str__(self):
        return f"Плейлист из {len(self)} песен"

p = Playlist(["a", "b", "c"])
print(p)
print(len(p) * 2)`, answer: 'Плейлист из 3 песен\n6', explain: 'print вызывает __str__, len() — __len__.' },
            { kind: 'match', topic: 'classes', prompt: 'Какой метод нужен?', pairs: [['a + b', '__add__'], ['a == b', '__eq__'], ['sorted(список_объектов)', '__lt__'], ['print(obj)', '__str__'], ['x in obj', '__contains__']] },
            {
              kind: 'code',
              topic: 'classes',
              lang: 'python',
              prompt: 'Создай класс `Vector` с полями x и y, поддержкой `+`, `==`, умножения на число (`v * 3`) и `str(v)` в виде `Vector(4, 6)`.',
              starter: 'class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n',
              tests: [{ expr: 'str(Vector(1, 2) + Vector(3, 4))', expected: '"Vector(4, 6)"' }, { expr: 'Vector(1, 2) == Vector(1, 2)', expected: 'true' }, { expr: 'Vector(1, 2) == Vector(2, 1)', expected: 'false' }, { expr: 'str(Vector(1, -2) * 3)', expected: '"Vector(3, -6)"' }],
              hints: ['`__add__` возвращает **новый** Vector.', 'Умножение на число — метод `__mul__(self, k)`.', '`__str__` возвращает строку через f-строку.'],
              solution: py`class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, k):
        return Vector(self.x * k, self.y * k)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __str__(self):
        return f"Vector({self.x}, {self.y})"`,
            },
            {
              kind: 'code',
              topic: 'classes',
              lang: 'python',
              prompt: 'Создай класс `Temperature(celsius)` со свойством `celsius` (чтение и запись) и свойством только для чтения `fahrenheit` (F = C × 9/5 + 32). Попытка установить температуру ниже −273.15 должна выбрасывать `ValueError`.',
              starter: 'class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n',
              tests: [{ expr: 'Temperature(100).fahrenheit', expected: '212.0' }, { expr: '(lambda t: (setattr(t, "celsius", 25), t.fahrenheit)[1])(Temperature(0))', expected: '77.0' }, { expr: '(lambda t: t.celsius)(Temperature(-40))', expected: '-40' }],
              hints: ['Храни значение в `self._celsius`.', 'Сеттер: `@celsius.setter`, внутри проверка и `raise ValueError(...)`.', 'В `__init__` присваивание `self.celsius = celsius` уже пройдёт через сеттер.'],
              solution: py`class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Ниже абсолютного нуля")
        self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32`,
            },
          ],
        },
        {
          id: 'py-dataclasses',
          title: 'dataclasses: классы для данных',
          minutes: 10,
          steps: [
            {
              kind: 'theory',
              topic: 'classes',
              title: 'Меньше шаблонного кода',
              md: `Часто класс нужен просто чтобы хранить данные. \`@dataclass\` сам пишет \`__init__\`, \`__repr__\` и \`__eq__\`:

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class Item:
    name: str
    price: float
    qty: int = 1                         # значение по умолчанию
    tags: list = field(default_factory=list)   # изменяемое значение — только так!

    def total(self):
        return self.price * self.qty

a = Item("Мышь", 900)
print(a)            # Item(name='Мышь', price=900, qty=1, tags=[])
a == Item("Мышь", 900)   # True — сравнение по полям
\`\`\`

Полезные параметры:
- \`@dataclass(frozen=True)\` — объект нельзя изменить (можно класть в set и использовать как ключ словаря);
- \`@dataclass(order=True)\` — объекты можно сравнивать \`<\` и сортировать (по полям по порядку).

> 💡 Аннотации типов (\`name: str\`) здесь обязательны — по ним dataclass узнаёт, какие есть поля.`,
            },
            { kind: 'predict', topic: 'classes', lang: 'python', code: py`from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int = 0

print(Point(1, 2))
print(Point(3) == Point(3, 0))`, answer: 'Point(x=1, y=2)\nTrue', explain: '__repr__ и __eq__ сгенерированы автоматически; y по умолчанию 0.' },
            { kind: 'quiz', topic: 'classes', question: 'Почему для поля-списка в dataclass пишут `field(default_factory=list)`, а не `= []`?', options: ['Чтобы у каждого объекта был свой новый список, а не один общий', 'Так быстрее', 'Списки запрещены в dataclass', 'Чтобы список был неизменяемым'], answer: 0, explain: 'Та же ловушка, что с изменяемыми значениями по умолчанию в функциях.' },
            {
              kind: 'code',
              topic: 'classes',
              lang: 'python',
              prompt: 'Опиши `@dataclass` `Item` с полями `name`, `price`, `qty` (по умолчанию 1) и методом `total()`. Затем напиши функцию `cart_total(items)` — общая стоимость корзины.',
              starter: 'from dataclasses import dataclass\n',
              tests: [{ expr: 'cart_total([Item("a", 10, 2), Item("b", 5)])', expected: '25' }, { expr: 'Item("x", 3).qty', expected: '1' }, { expr: 'Item("x", 3) == Item("x", 3, 1)', expected: 'true' }],
              hints: ['Поля с типами: `name: str`, `price: float`, `qty: int = 1`.', '`cart_total` — `sum(i.total() for i in items)`.'],
              solution: py`from dataclasses import dataclass

@dataclass
class Item:
    name: str
    price: float
    qty: int = 1

    def total(self):
        return self.price * self.qty

def cart_total(items):
    return sum(i.total() for i in items)`,
            },
            {
              kind: 'code',
              topic: 'classes',
              lang: 'python',
              prompt: 'Опиши `@dataclass(order=True)` `Player` с полями `score` и `name` (в этом порядке!) и функцию `leaderboard(players)` — список имён по убыванию очков.',
              starter: 'from dataclasses import dataclass\n',
              tests: [{ expr: 'leaderboard([Player(10, "Аня"), Player(30, "Боря"), Player(20, "Вика")])', expected: '["Боря", "Вика", "Аня"]' }],
              hints: ['С `order=True` объекты сравниваются по полям по порядку — сначала score.', '`sorted(players, reverse=True)`.'],
              solution: py`from dataclasses import dataclass

@dataclass(order=True)
class Player:
    score: int
    name: str

def leaderboard(players):
    return [p.name for p in sorted(players, reverse=True)]`,
            },
          ],
        },
      ],
    },
  ],
  'py-data': [
    {
      id: 'py-data-0',
      title: 'Форматы данных: JSON и CSV',
      lessons: [
        {
          id: 'py-json-csv',
          title: 'JSON и CSV: чтение и запись данных',
          minutes: 12,
          steps: [
            {
              kind: 'theory',
              topic: 'json',
              title: 'Два самых популярных формата',
              md: `**JSON** — для вложенных структур (настройки, ответы API):
\`\`\`python
import json
data = {"name": "Аня", "skills": ["Python", "SQL"]}
text = json.dumps(data, ensure_ascii=False, indent=2)   # объект → строка
back = json.loads(text)                                 # строка → объект

with open("save.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)              # прямо в файл
with open("save.json", encoding="utf-8") as f:
    data = json.load(f)
\`\`\`

**CSV** — таблицы (Excel, выгрузки): строки, значения через запятую.
\`\`\`text
name,age,city
Аня,17,Казань
Боря,22,Пермь
\`\`\`

\`\`\`python
import csv
with open("people.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):        # каждая строка — словарь
        print(row["name"], int(row["age"]))

with open("out.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "score"])
    writer.writerow(["Аня", 95])
\`\`\`

> ⚠️ Из CSV всё читается **строками** — числа нужно преобразовать через \`int()\` / \`float()\`.`,
            },
            { kind: 'example', topic: 'json', lang: 'python', title: 'CSV → статистика → JSON', code: py`import csv, io, json

text = """name,city,score
Аня,Казань,95
Боря,Пермь,72
Вика,Казань,88
"""
rows = list(csv.DictReader(io.StringIO(text)))
by_city = {}
for r in rows:
    by_city.setdefault(r["city"], []).append(int(r["score"]))
report = {city: sum(s) / len(s) for city, s in by_city.items()}
print(json.dumps(report, ensure_ascii=False))`, note: '`io.StringIO` превращает строку в «файл» — удобно для примеров и тестов.' },
            { kind: 'quiz', topic: 'json', question: 'Ты прочитал строку CSV через DictReader: `row["age"]` равно `"17"`. Что вернёт `row["age"] + 1`?', options: ['Ошибку TypeError — это строка', '18', '"171"', '17'], answer: 0, explain: 'Значения из CSV — строки. Нужно `int(row["age"]) + 1`.' },
            { kind: 'match', topic: 'json', prompt: 'Функция модуля json', pairs: [['json.dumps', 'объект → строка'], ['json.loads', 'строка → объект'], ['json.dump', 'объект → файл'], ['json.load', 'файл → объект']] },
            {
              kind: 'code',
              topic: 'json',
              lang: 'python',
              prompt: 'Напиши `csv_to_json(text)`: на вход — текст CSV с заголовком `name,price,qty`. Верни JSON-строку — список объектов `{"name": ..., "total": price*qty}` (total — число). Используй `ensure_ascii=False`.',
              starter: 'import csv, io, json\n\ndef csv_to_json(text):\n    pass\n',
              tests: [{ expr: 'json.loads(csv_to_json("name,price,qty\\nЧай,150,2\\nСыр,400,1\\n"))', expected: '[{"name": "Чай", "total": 300}, {"name": "Сыр", "total": 400}]' }, { expr: 'json.loads(csv_to_json("name,price,qty\\n"))', expected: '[]' }],
              hints: ['`csv.DictReader(io.StringIO(text))` даёт словари.', 'Не забудь `int(...)` для цены и количества.', '`json.dumps(result, ensure_ascii=False)`.'],
              solution: py`import csv, io, json

def csv_to_json(text):
    result = []
    for row in csv.DictReader(io.StringIO(text)):
        result.append({"name": row["name"], "total": int(row["price"]) * int(row["qty"])})
    return json.dumps(result, ensure_ascii=False)`,
            },
          ],
        },
      ],
    },
  ],
};

export const pythonAdvancedModule: Module = {
  id: 'py-advanced',
  title: 'Продвинутый Python',
  chapters: [
    {
      id: 'py-adv-1',
      title: 'Генераторы, декораторы, контекстные менеджеры',
      lessons: [
        {
          id: 'py-generators',
          title: 'Итераторы и генераторы',
          minutes: 14,
          steps: [
            {
              kind: 'theory',
              topic: 'functions',
              title: 'Значения по одному, по требованию',
              md: `**Итератор** — объект, который выдаёт элементы по одному через \`next()\`. Цикл \`for\` работает именно так:
\`\`\`python
it = iter([10, 20])
next(it)   # 10
next(it)   # 20
next(it)   # StopIteration — элементы кончились
\`\`\`

**Генератор** — функция с \`yield\`. Она не возвращает всё сразу, а «замирает» на каждом yield и продолжает с того же места при следующем запросе:
\`\`\`python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for x in countdown(3):
    print(x)          # 3, 2, 1
\`\`\`

**Генераторное выражение** — как list comprehension, но в круглых скобках и «ленивое»:
\`\`\`python
squares = (x * x for x in range(10**9))   # мгновенно, память не тратится
sum(x * x for x in range(1000))            # скобки можно не дублировать
\`\`\`

Зачем:
- **экономия памяти** — миллионы строк большого файла можно обработать по одной;
- **бесконечные последовательности** — генератор может работать вечно, а мы берём сколько нужно;
- **конвейеры** — генераторы удобно соединять друг с другом.

\`itertools.islice(gen, n)\` — взять первые n элементов из любого итератора.`,
            },
            { kind: 'predict', topic: 'functions', lang: 'python', code: py`def gen():
    print("старт")
    yield 1
    print("середина")
    yield 2

g = gen()
print(next(g))
print(next(g))`, answer: 'старт\n1\nсередина\n2', explain: 'Код генератора выполняется только когда запрашивают следующий элемент и останавливается на yield.' },
            { kind: 'predict', topic: 'functions', lang: 'python', code: py`print(sum(x * x for x in range(4)))`, answer: '14', explain: '0 + 1 + 4 + 9 = 14.' },
            { kind: 'quiz', topic: 'functions', question: 'Чем `(x for x in data)` лучше `[x for x in data]` для огромных данных?', options: ['Не создаёт весь список в памяти — элементы вычисляются по одному', 'Работает в 100 раз быстрее всегда', 'Можно обращаться по индексу', 'Ничем'], answer: 0, explain: 'Генератор ленивый. Но по нему можно пройти только один раз и нельзя брать элемент по индексу.' },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'python',
              prompt: 'Напиши генератор `fib_gen(n)`, выдающий первые n чисел Фибоначчи (0, 1, 1, 2, 3, …).',
              starter: 'def fib_gen(n):\n    pass\n',
              tests: [{ expr: 'list(fib_gen(7))', expected: '[0, 1, 1, 2, 3, 5, 8]' }, { expr: 'list(fib_gen(0))', expected: '[]' }, { expr: 'type(fib_gen(3)).__name__', expected: '"generator"', name: 'Это генератор' }],
              hints: ['Храни два последних числа `a, b = 0, 1`.', 'В цикле n раз: `yield a`, затем `a, b = b, a + b`.'],
              solution: py`def fib_gen(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b`,
            },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'python',
              prompt: 'Напиши **бесконечный** генератор `evens()` (0, 2, 4, …) и функцию `take(gen, n)` — список первых n элементов любого генератора.',
              starter: 'def evens():\n    pass\n\ndef take(gen, n):\n    pass\n',
              tests: [{ expr: 'take(evens(), 4)', expected: '[0, 2, 4, 6]' }, { expr: 'take(iter("abc"), 2)', expected: '["a", "b"]' }],
              hints: ['В `evens` — `while True:` с `yield`.', 'В `take` — `[next(gen) for _ in range(n)]` или `itertools.islice`.'],
              solution: py`def evens():
    n = 0
    while True:
        yield n
        n += 2

def take(gen, n):
    return [next(gen) for _ in range(n)]`,
            },
          ],
        },
        {
          id: 'py-decorators',
          title: 'Декораторы',
          minutes: 14,
          steps: [
            {
              kind: 'theory',
              topic: 'functions',
              title: 'Обёртки вокруг функций',
              md: `**Декоратор** — функция, которая принимает функцию и возвращает новую, «обёрнутую»: с дополнительным поведением до или после вызова.

\`\`\`python
import functools

def log_calls(func):
    @functools.wraps(func)           # сохраняет имя и описание исходной функции
    def wrapper(*args, **kwargs):
        print(f"Вызов {func.__name__}{args}")
        result = func(*args, **kwargs)
        print(f"Результат: {result}")
        return result
    return wrapper

@log_calls                 # то же самое, что add = log_calls(add)
def add(a, b):
    return a + b

add(2, 3)
\`\`\`

Где используются: логирование, замер времени, кеширование (\`@functools.cache\`), проверка прав доступа, повтор при ошибке, маршруты в Flask (\`@app.route("/")\`), тесты (\`@pytest.mark...\`).

**Декоратор с параметрами** — это функция, возвращающая декоратор (три уровня вложенности):
\`\`\`python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            return [func(*args, **kwargs) for _ in range(times)]
        return wrapper
    return decorator

@repeat(3)
def hello():
    return "привет"
\`\`\``,
            },
            { kind: 'predict', topic: 'functions', lang: 'python', code: py`def shout(func):
    def wrapper(name):
        return func(name).upper() + "!"
    return wrapper

@shout
def greet(name):
    return "привет, " + name

print(greet("аня"))`, answer: 'ПРИВЕТ, АНЯ!', explain: 'greet заменена на wrapper: результат исходной функции переводится в верхний регистр, добавляется «!».' },
            { kind: 'quiz', topic: 'functions', question: 'Чему эквивалентна запись `@decor` над `def f(): ...`?', options: ['f = decor(f)', 'f = decor', 'decor = f(decor)', 'f()'], answer: 0, explain: 'Синтаксис @ — сокращение для переприсваивания функции.' },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'python',
              prompt: 'Напиши декоратор `count_calls`, который считает вызовы функции и хранит число в атрибуте `calls` обёртки.',
              starter: 'def count_calls(func):\n    pass\n',
              tests: [{ expr: '(lambda f: (f(), f(), f.calls)[-1])(count_calls(lambda: None))', expected: '2' }, { expr: '(lambda f: (f(2, 3), f.calls))(count_calls(lambda a, b: a + b))', expected: '[5, 1]' }],
              hints: ['Внутри объяви `def wrapper(*args, **kwargs):`, увеличивай `wrapper.calls += 1`.', 'Перед `return wrapper` установи `wrapper.calls = 0`.'],
              solution: py`def count_calls(func):
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper`,
            },
            {
              kind: 'code',
              topic: 'recursion',
              lang: 'python',
              prompt: 'Напиши декоратор `memoize`, запоминающий результаты по аргументам. С ним рекурсивная `fib` (уже в коде) должна считать `fib(70)` мгновенно.',
              starter: 'def memoize(func):\n    pass\n\n@memoize\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n',
              tests: [{ expr: 'fib(10)', expected: '55' }, { expr: 'fib(70)', expected: '190392490709135' }],
              hints: ['Храни словарь `cache = {}` в замыкании.', 'Ключ — кортеж аргументов `args`.', 'Если ключ есть — верни из кеша, иначе вычисли и сохрани.'],
              solution: py`def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memoize
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)`,
            },
            {
              kind: 'code',
              topic: 'functions',
              lang: 'python',
              prompt: 'Напиши декоратор с параметром `repeat(times)`: декорированная функция вызывается `times` раз и возвращает **список** результатов.',
              starter: 'def repeat(times):\n    pass\n',
              tests: [{ expr: 'repeat(3)(lambda: 1)()', expected: '[1, 1, 1]' }, { expr: 'repeat(2)(lambda x: x * 10)(4)', expected: '[40, 40]' }],
              hints: ['Три уровня: `repeat(times)` → `decorator(func)` → `wrapper(*args, **kwargs)`.'],
              solution: py`def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            return [func(*args, **kwargs) for _ in range(times)]
        return wrapper
    return decorator`,
            },
          ],
        },
        {
          id: 'py-context-managers',
          title: 'Контекстные менеджеры: with',
          minutes: 11,
          steps: [
            {
              kind: 'theory',
              topic: 'errors',
              title: 'Гарантированная уборка за собой',
              md: `\`with\` гарантирует, что «закрывающее» действие выполнится, даже если внутри случилась ошибка. Мы уже использовали его с файлами: \`with open(...) as f\`.

Свой контекстный менеджер — класс с двумя методами:
\`\`\`python
class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self                      # то, что попадёт в «as»
    def __exit__(self, exc_type, exc, tb):
        import time
        print(f"Прошло {time.perf_counter() - self.start:.3f} с")
        return False                     # False — ошибку не глушим

with Timer():
    sum(range(1_000_000))
\`\`\`

Или проще — генератор с декоратором \`contextlib.contextmanager\`:
\`\`\`python
from contextlib import contextmanager

@contextmanager
def tag(name):
    print(f"<{name}>")
    yield                 # здесь выполняется тело with
    print(f"</{name}>")
\`\`\`

Что делают через with: файлы, соединения с базой данных, блокировки потоков, временная смена настроек, замер времени, транзакции.`,
            },
            { kind: 'predict', topic: 'errors', lang: 'python', code: py`from contextlib import contextmanager

@contextmanager
def box():
    print("открыть")
    try:
        yield
    finally:
        print("закрыть")

try:
    with box():
        print("работаю")
        raise ValueError("ой")
except ValueError as e:
    print("поймали", e)`, answer: 'открыть\nработаю\nзакрыть\nпоймали ой', explain: 'finally в менеджере выполнился до того, как ошибка дошла до внешнего except.' },
            { kind: 'quiz', topic: 'errors', question: 'Какие методы нужны классу, чтобы его можно было использовать в `with`?', options: ['__enter__ и __exit__', '__init__ и __del__', '__open__ и __close__', '__with__'], answer: 0, explain: '__enter__ вызывается при входе, __exit__ — при выходе (в том числе при ошибке).' },
            {
              kind: 'code',
              topic: 'classes',
              lang: 'python',
              prompt: 'Напиши класс-менеджер `Tag(name)`: при входе печатает `<name>`, при выходе — `</name>`. Код внизу уже использует его и должен вывести вложенные теги.',
              starter: '# твой класс Tag\n\n\nwith Tag("ul"):\n    with Tag("li"):\n        print("пункт")\n',
              tests: [{ expected: '<ul>\n<li>\nпункт\n</li>\n</ul>' }],
              hints: ['`__init__` сохраняет имя.', '`__enter__` печатает открывающий тег, `__exit__(self, *args)` — закрывающий.'],
              solution: py`class Tag:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"<{self.name}>")
        return self

    def __exit__(self, *args):
        print(f"</{self.name}>")
        return False


with Tag("ul"):
    with Tag("li"):
        print("пункт")`,
            },
            {
              kind: 'code',
              topic: 'errors',
              lang: 'python',
              prompt: 'С помощью `@contextmanager` напиши `safe()`: если внутри with возникла ошибка, она не роняет программу, а печатается как `Ошибка: <сообщение>`.',
              starter: 'from contextlib import contextmanager\n\n# твой менеджер safe\n\n\nwith safe():\n    print(10 / 2)\nwith safe():\n    int("abc")\nprint("программа продолжается")\n',
              tests: [{ expected: "5.0\nОшибка: invalid literal for int() with base 10: 'abc'\nпрограмма продолжается" }],
              hints: ['Внутри генератора: `try: yield` / `except Exception as e: print(f"Ошибка: {e}")`.'],
              solution: py`from contextlib import contextmanager

@contextmanager
def safe():
    try:
        yield
    except Exception as e:
        print(f"Ошибка: {e}")


with safe():
    print(10 / 2)
with safe():
    int("abc")
print("программа продолжается")`,
            },
          ],
        },
      ],
    },
    {
      id: 'py-adv-2',
      title: 'Качество кода',
      lessons: [
        {
          id: 'py-typing',
          title: 'Аннотации типов',
          minutes: 9,
          steps: [
            {
              kind: 'theory',
              topic: 'types',
              title: 'Подсказки для людей и инструментов',
              md: `Python не требует указывать типы, но их можно **подсказать**:

\`\`\`python
def average(nums: list[float]) -> float | None:
    if not nums:
        return None
    return sum(nums) / len(nums)

age: int = 17
users: dict[str, int] = {"Аня": 17}
\`\`\`

| Запись | Смысл |
|---|---|
| \`int\`, \`str\`, \`float\`, \`bool\` | простые типы |
| \`list[int]\` | список целых |
| \`dict[str, float]\` | словарь строка → число |
| \`tuple[int, str]\` | кортеж из двух элементов |
| \`Optional[int]\` | число или None |
| \`Union[str, int]\` | строка или число |
| \`Callable[[int], str]\` | функция int → str |

Начиная с Python 3.10 «или» пишут короче через вертикальную черту: \`int | None\` вместо \`Optional[int]\`.

**Важно:** во время выполнения Python аннотации **не проверяет**. Их используют:
- редакторы — для подсказок и автодополнения;
- проверяльщики (\`mypy\`, \`pyright\`) — находят ошибки до запуска;
- библиотеки (FastAPI, Pydantic, dataclasses) — для проверки данных.

> 💡 В больших проектах аннотации — обязательная практика: код становится понятнее, а ошибки ловятся раньше.`,
            },
            { kind: 'predict', topic: 'types', lang: 'python', code: py`def double(x: int) -> int:
    return x * 2

print(double("ab"))`, answer: 'abab', explain: 'Аннотации не проверяются при выполнении — строка просто повторилась. Ошибку заметил бы mypy.' },
            { kind: 'match', topic: 'types', prompt: 'Сопоставь аннотацию и значение', pairs: [['list[str]', '["a", "b"]'], ['dict[str, int]', '{"a": 1}'], ['tuple[int, int]', '(3, 4)'], ['int | None', 'None']] },
            {
              kind: 'code',
              topic: 'types',
              lang: 'python',
              prompt: 'Напиши функцию **с аннотациями** `average(nums: list[float]) -> float | None` — среднее значение или `None` для пустого списка.',
              starter: 'def average(nums):\n    pass\n',
              tests: [{ expr: 'average([1, 2])', expected: '1.5' }, { expr: 'average([])', expected: 'null' }, { expr: 'average.__annotations__["return"] is not None', expected: 'true', name: 'Есть аннотация возвращаемого значения' }],
              hints: ['Синтаксис: `def average(nums: list[float]) -> float | None:`', 'Пустой список — `if not nums: return None`.'],
              solution: py`def average(nums: list[float]) -> float | None:
    if not nums:
        return None
    return sum(nums) / len(nums)`,
            },
          ],
        },
        {
          id: 'py-testing',
          title: 'Тестирование и отладка',
          minutes: 13,
          steps: [
            {
              kind: 'theory',
              topic: 'errors',
              title: 'Как программисты проверяют свой код',
              md: `**assert** — проверка «должно быть так, иначе ошибка»:
\`\`\`python
def square(x):
    return x * x

assert square(3) == 9
assert square(-2) == 4, "Квадрат отрицательного должен быть положительным"
\`\`\`

**Автотесты** — функции, которые проверяют код. В реальных проектах используют **pytest**: функции с именем \`test_...\` запускаются командой \`pytest\`.
\`\`\`python
def test_square():
    assert square(0) == 0
    assert square(5) == 25
\`\`\`

**Что проверять (граничные случаи):**
- пустые входные данные: \`[]\`, \`""\`, \`0\`;
- один элемент;
- отрицательные числа, очень большие числа;
- повторяющиеся значения;
- «неправильный» ввод.

**TDD** (разработка через тестирование): сначала пишешь тест, он падает, потом — код, чтобы тест прошёл.

**Отладка.** Если что-то не работает:
1. Прочитай **последнюю строку** traceback — тип и текст ошибки.
2. Найди в traceback **свою** строку с номером.
3. Выведи промежуточные значения (\`print\`) или пройди код **пошаговым отладчиком** 🐞.
4. Уменьши пример до минимального, на котором ошибка повторяется.`,
            },
            { kind: 'predict', topic: 'errors', lang: 'python', code: py`def is_adult(age):
    return age > 18

try:
    assert is_adult(20)
    assert is_adult(18), "18 лет — уже взрослый"
    print("все проверки прошли")
except AssertionError as e:
    print("тест упал:", e)`, answer: 'тест упал: 18 лет — уже взрослый', explain: 'Граничный случай 18 обнаружил баг: нужно >=, а не >.' },
            { kind: 'quiz', topic: 'errors', question: 'Функция ищет максимум в списке. Какой тест важнее всего добавить?', options: ['Список только из отрицательных чисел и пустой список', 'Список [1, 2, 3]', 'Список из 10 положительных чисел', 'Тот же тест ещё раз'], answer: 0, explain: 'Граничные случаи чаще всего ломают код — именно их и надо проверять.' },
            { kind: 'findline', topic: 'errors', lang: 'python', prompt: 'Тест `assert middle([1, 2, 3, 4]) == 2.5` падает. Какая строка содержит ошибку?', code: py`def middle(nums):
    n = len(nums)
    if n % 2 == 1:
        return nums[n // 2]
    return (nums[n // 2] + nums[n // 2 + 1]) / 2`, answer: 5, explain: 'Для чётной длины средние элементы — с индексами n//2 − 1 и n//2.' },
            {
              kind: 'code',
              topic: 'errors',
              lang: 'python',
              prompt: 'Напиши функцию `normalize_phone(s)`, чтобы прошли все проверки внизу. Она должна оставить только цифры и привести номер к виду `+7XXXXXXXXXX` (если номер начинается с 8 — заменить её на 7).',
              starter: py`def normalize_phone(s):
    pass


assert normalize_phone("+7 (999) 123-45-67") == "+79991234567"
assert normalize_phone("8 999 123 45 67") == "+79991234567"
assert normalize_phone("79991234567") == "+79991234567"
print("Все тесты пройдены")
`,
              tests: [{ expected: 'Все тесты пройдены' }],
              hints: ['Оставь цифры: `"".join(ch for ch in s if ch.isdigit())`.', 'Если первая цифра 8 — замени её на 7.', 'Добавь «+» в начало.'],
              solution: py`def normalize_phone(s):
    digits = "".join(ch for ch in s if ch.isdigit())
    if digits.startswith("8"):
        digits = "7" + digits[1:]
    return "+" + digits


assert normalize_phone("+7 (999) 123-45-67") == "+79991234567"
assert normalize_phone("8 999 123 45 67") == "+79991234567"
assert normalize_phone("79991234567") == "+79991234567"
print("Все тесты пройдены")`,
            },
          ],
        },
        {
          id: 'py-regex',
          title: 'Регулярные выражения',
          minutes: 13,
          steps: [
            {
              kind: 'theory',
              topic: 'strings',
              title: 'Поиск по шаблону',
              md: `**Регулярное выражение** — шаблон для поиска в тексте. Модуль \`re\`:

| Шаблон | Значение |
|---|---|
| \`\\d\` | цифра |
| \`\\w\` | буква, цифра или _ |
| \`\\s\` | пробельный символ |
| \`.\` | любой символ |
| \`[abc]\`, \`[а-я]\` | один из символов |
| \`+\` | 1 или больше раз |
| \`*\` | 0 или больше |
| \`?\` | 0 или 1 |
| \`{3}\`, \`{2,4}\` | ровно 3 / от 2 до 4 |
| \`^\`, \`$\` | начало / конец строки |
| \`(...)\` | группа — часть, которую нужно достать |

\`\`\`python
import re
re.findall(r"\\d+", "a1b22c333")              # ['1', '22', '333']
re.search(r"(\\d{2})\\.(\\d{2})", "Дата: 25.10").groups()   # ('25', '10')
re.sub(r"\\s+", " ", "много    пробелов")      # 'много пробелов'
bool(re.fullmatch(r"[A-Z]\\d{3}", "A123"))      # True — вся строка по шаблону
\`\`\`

> 💡 Пиши шаблоны в **сырых строках** \`r"..."\`, чтобы обратные слэши не превращались в спецсимволы Python.`,
            },
            { kind: 'predict', topic: 'strings', lang: 'python', code: py`import re
print(re.findall(r"\d+", "a1b22c333"))
print(re.sub(r"[aeiou]", "*", "regular"))`, answer: "['1', '22', '333']\nr*g*l*r", explain: 'findall возвращает все совпадения, sub заменяет каждую гласную на *.' },
            { kind: 'match', topic: 'strings', prompt: 'Шаблон и что он найдёт', pairs: [['\\d{4}', 'год, например 2025'], ['[A-Z]\\w*', 'слово с заглавной латинской буквы'], ['\\s+', 'один или несколько пробелов'], ['^\\+7\\d{10}$', 'номер вида +79991234567']] },
            {
              kind: 'code',
              topic: 'strings',
              lang: 'python',
              prompt: 'Напиши `extract_emails(text)` — список всех email-адресов из текста (шаблон: буквы/цифры/точки/подчёркивания/дефисы, @, домен с точкой).',
              starter: 'import re\n\ndef extract_emails(text):\n    pass\n',
              tests: [{ expr: 'extract_emails("Пиши на ann@mail.ru или bob.smith@site.org, спам: @nope")', expected: '["ann@mail.ru", "bob.smith@site.org"]' }, { expr: 'extract_emails("нет адресов")', expected: '[]' }],
              hints: ['Шаблон: `r"[\\w.-]+@[\\w-]+\\.[\\w.]+"`.', '`re.findall(шаблон, text)`.'],
              solution: py`import re

def extract_emails(text):
    return re.findall(r"[\w.-]+@[\w-]+\.[\w.]+", text)`,
            },
            {
              kind: 'code',
              topic: 'strings',
              lang: 'python',
              prompt: 'Напиши `reformat_dates(text)`: замени все даты вида `ДД.ММ.ГГГГ` на `ГГГГ-ММ-ДД`. Используй группы и `re.sub`.',
              starter: 'import re\n\ndef reformat_dates(text):\n    pass\n',
              tests: [{ expr: 'reformat_dates("С 01.09.2025 по 31.05.2026")', expected: '"С 2025-09-01 по 2026-05-31"' }, { expr: 'reformat_dates("без дат")', expected: '"без дат"' }],
              hints: ['Шаблон с тремя группами: `r"(\\d{2})\\.(\\d{2})\\.(\\d{4})"`.', 'В замене обращайся к группам: `r"\\3-\\2-\\1"`.'],
              solution: py`import re

def reformat_dates(text):
    return re.sub(r"(\d{2})\.(\d{2})\.(\d{4})", r"\3-\2-\1", text)`,
            },
          ],
        },
      ],
    },
  ],
};
