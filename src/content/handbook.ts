// Встроенная документация-справочник: шпаргалки по Python, JavaScript, Git, терминалу, HTTP, SQL, Big-O.

export interface HandbookArticle {
  id: string;
  title: string;
  icon: string;
  group: 'Python' | 'JavaScript' | 'Инструменты' | 'Веб' | 'Алгоритмы';
  md: string;
}

export const HANDBOOK: HandbookArticle[] = [
  {
    id: 'py-cheatsheet',
    title: 'Python: шпаргалка по синтаксису',
    icon: '🐍',
    group: 'Python',
    md: `## Переменные и типы
\`\`\`python
x = 10            # int
pi = 3.14         # float
name = "Аня"      # str
ok = True         # bool
nothing = None
type(x)           # <class 'int'>
int("5"), str(5), float("2.5"), bool(0)
\`\`\`

## Ввод и вывод
\`\`\`python
s = input("Введите: ")
print("a", "b", sep="-", end="!\\n")
print(f"{name} — {x * 2:.1f}")
\`\`\`

## Условия и циклы
\`\`\`python
if x > 5:
    ...
elif x == 5:
    ...
else:
    ...

for i in range(0, 10, 2): ...
for i, item in enumerate(items): ...
for a, b in zip(list1, list2): ...
while cond:
    break / continue

value = "да" if x > 0 else "нет"   # тернарный оператор
\`\`\`

## Функции
\`\`\`python
def f(a, b=2, *args, **kwargs):
    return a + b

square = lambda x: x * x
\`\`\`

## Классы
\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __str__(self):
        return f"({self.x}, {self.y})"

class Point3D(Point):
    def __init__(self, x, y, z):
        super().__init__(x, y)
        self.z = z
\`\`\`

## Исключения
\`\`\`python
try:
    risky()
except (ValueError, KeyError) as e:
    print(e)
else:
    ...
finally:
    ...
raise ValueError("сообщение")
\`\`\`

## Файлы
\`\`\`python
with open("f.txt", "w", encoding="utf-8") as f:
    f.write("текст")
with open("f.txt", encoding="utf-8") as f:
    lines = f.readlines()
\`\`\``,
  },
  {
    id: 'py-collections',
    title: 'Python: строки, списки, словари, множества',
    icon: '📋',
    group: 'Python',
    md: `## Строки
| Метод | Описание |
|---|---|
| \`s.upper()\`, \`s.lower()\`, \`s.title()\` | регистр |
| \`s.strip()\`, \`s.lstrip()\`, \`s.rstrip()\` | убрать пробелы |
| \`s.split(sep)\`, \`sep.join(list)\` | разбить / склеить |
| \`s.replace(a, b)\` | заменить |
| \`s.find(x)\`, \`s.index(x)\`, \`s.count(x)\` | поиск |
| \`s.startswith(x)\`, \`s.endswith(x)\` | начало / конец |
| \`s.isdigit()\`, \`s.isalpha()\`, \`s.isalnum()\` | проверки |
| \`s[::-1]\` | разворот |

## Списки
| Операция | Сложность |
|---|---|
| \`lst[i]\`, \`lst[i] = x\` | O(1) |
| \`lst.append(x)\`, \`lst.pop()\` | O(1) |
| \`lst.insert(0, x)\`, \`lst.pop(0)\` | O(n) |
| \`x in lst\` | O(n) |
| \`lst.sort()\`, \`sorted(lst)\` | O(n log n) |

\`\`\`python
squares = [x**2 for x in range(10) if x % 2 == 0]
matrix = [[0] * 3 for _ in range(3)]
\`\`\`

## Словари
\`\`\`python
d = {"a": 1}
d.get("b", 0)
d.setdefault("c", []).append(1)
for k, v in d.items(): ...
{k: v for k, v in pairs}
from collections import Counter, defaultdict
Counter("банан").most_common(1)   # [('а', 2)]
\`\`\`

## Множества
\`\`\`python
a | b   # объединение
a & b   # пересечение
a - b   # разность
a ^ b   # симметричная разность
\`\`\``,
  },
  {
    id: 'js-cheatsheet',
    title: 'JavaScript: шпаргалка по синтаксису',
    icon: '🟨',
    group: 'JavaScript',
    md: `## Переменные и типы
\`\`\`js
const PI = 3.14;      // нельзя переприсвоить
let count = 0;        // можно менять
typeof 42             // "number"
Number("5"), String(5), Boolean(0), parseInt("42px")
\`\`\`

## Операторы
\`\`\`js
a === b, a !== b      // строгое сравнение
a && b, a || b, !a
a ?? b                // b, если a == null
obj?.prop?.deep       // безопасный доступ
cond ? "да" : "нет"
\`\`\`

## Условия и циклы
\`\`\`js
if (x > 0) { } else if (x === 0) { } else { }
switch (v) { case 1: ...; break; default: ... }
for (let i = 0; i < n; i++) { }
for (const item of array) { }
for (const key in object) { }
while (cond) { }
\`\`\`

## Функции
\`\`\`js
function add(a, b = 0) { return a + b; }
const mul = (a, b) => a * b;
const sum = (...nums) => nums.reduce((s, n) => s + n, 0);
\`\`\`

## Объекты и массивы
\`\`\`js
const user = { name: "Аня", age: 17 };
const { name, ...rest } = user;
const copy = { ...user, age: 18 };
const [first, ...others] = [1, 2, 3];
Object.keys(user), Object.values(user), Object.entries(user)
\`\`\`

## Классы
\`\`\`js
class Animal {
  #secret = 1;
  constructor(name) { this.name = name; }
  speak() { return "..."; }
  static create(n) { return new Animal(n); }
  get title() { return this.name.toUpperCase(); }
}
class Dog extends Animal {
  speak() { return super.speak() + " Гав"; }
}
\`\`\`

## Асинхронность
\`\`\`js
setTimeout(() => {}, 1000);
const data = await fetch(url).then((r) => r.json());
await Promise.all([p1, p2]);
try { await risky(); } catch (e) { console.error(e); }
\`\`\``,
  },
  {
    id: 'js-arrays',
    title: 'JavaScript: методы массивов и строк',
    icon: '📚',
    group: 'JavaScript',
    md: `## Массивы — не меняют исходный
| Метод | Результат |
|---|---|
| \`map(fn)\` | новый массив преобразованных значений |
| \`filter(fn)\` | элементы, для которых fn → true |
| \`reduce(fn, init)\` | одно итоговое значение |
| \`find(fn)\`, \`findIndex(fn)\` | первый подходящий / его индекс |
| \`some(fn)\`, \`every(fn)\` | хотя бы один / все |
| \`includes(x)\`, \`indexOf(x)\` | наличие / индекс |
| \`slice(a, b)\` | копия части |
| \`concat(...)\`, \`flat()\` | объединение / выравнивание |
| \`join(sep)\` | строка |
| \`toSorted()\`, \`toReversed()\` | отсортированная / развёрнутая копия |

## Массивы — меняют исходный
\`push\`, \`pop\`, \`shift\`, \`unshift\`, \`splice\`, \`sort\`, \`reverse\`, \`fill\`

> ⚠️ \`sort()\` без функции сортирует как строки. Числа: \`arr.sort((a, b) => a - b)\`.

## Строки
\`length\`, \`at(i)\`, \`slice(a, b)\`, \`indexOf\`, \`includes\`, \`startsWith\`, \`endsWith\`, \`toUpperCase\`, \`toLowerCase\`, \`trim\`, \`split\`, \`replace\`, \`replaceAll\`, \`repeat\`, \`padStart\`, \`padEnd\`

## Map и Set
\`\`\`js
const m = new Map([["a", 1]]);
m.set("b", 2); m.get("a"); m.has("b"); m.delete("a"); m.size;
const s = new Set([1, 2, 2]);   // {1, 2}
[...new Set(arr)]               // уникальные значения
\`\`\``,
  },
  {
    id: 'dom',
    title: 'DOM и события',
    icon: '🕸️',
    group: 'Веб',
    md: `## Поиск элементов
\`\`\`js
document.getElementById("id")
document.querySelector(".class")       // первый
document.querySelectorAll("li")        // все (NodeList)
el.closest(".card")                     // ближайший предок
\`\`\`

## Изменение
\`\`\`js
el.textContent = "текст";
el.innerHTML = "<b>HTML</b>";   // осторожно с данными пользователя!
el.classList.add("active"); el.classList.toggle("open");
el.style.color = "red";
el.setAttribute("href", "/");
el.dataset.id                   // атрибут data-id
\`\`\`

## Создание и удаление
\`\`\`js
const li = document.createElement("li");
list.append(li); li.remove();
\`\`\`

## События
\`\`\`js
btn.addEventListener("click", (e) => {
  e.preventDefault();      // отменить действие по умолчанию
  e.target;                // элемент, на котором произошло событие
});
\`\`\`
Частые события: \`click\`, \`input\`, \`change\`, \`submit\`, \`keydown\`, \`mouseover\`, \`scroll\`, \`DOMContentLoaded\`.

## Хранилище
\`\`\`js
localStorage.setItem("key", JSON.stringify(obj));
JSON.parse(localStorage.getItem("key"));
\`\`\``,
  },
  {
    id: 'git',
    title: 'Git: все основные команды',
    icon: '🌿',
    group: 'Инструменты',
    md: `## Настройка
\`\`\`text
git config --global user.name "Имя"
git config --global user.email "mail@example.com"
\`\`\`

## Ежедневная работа
| Команда | Смысл |
|---|---|
| \`git init\` | создать репозиторий |
| \`git clone <url>\` | скачать репозиторий |
| \`git status\` | состояние файлов |
| \`git add <файл>\` / \`git add .\` | в индекс |
| \`git commit -m "msg"\` | коммит |
| \`git log --oneline --graph\` | история |
| \`git diff\` / \`git diff --staged\` | изменения |
| \`git restore <файл>\` | отменить изменения в файле |
| \`git restore --staged <файл>\` | убрать из индекса |

## Ветки
| Команда | Смысл |
|---|---|
| \`git branch\` | список веток |
| \`git switch -c feature\` | создать и перейти |
| \`git switch main\` | перейти |
| \`git merge feature\` | слить в текущую |
| \`git branch -d feature\` | удалить ветку |

## Удалённые репозитории
\`\`\`text
git remote add origin https://github.com/user/repo.git
git push -u origin main
git pull
git fetch
\`\`\`

## Конфликт слияния
Git помечает спорные места:
\`\`\`text
<<<<<<< HEAD
наша версия
=======
их версия
>>>>>>> feature
\`\`\`
Оставь нужное, удали маркеры, затем \`git add\` и \`git commit\`.

## .gitignore
\`\`\`text
node_modules/
__pycache__/
.env
*.log
\`\`\``,
  },
  {
    id: 'terminal',
    title: 'Терминал: команды Linux/macOS',
    icon: '⌨️',
    group: 'Инструменты',
    md: `| Команда | Описание |
|---|---|
| \`pwd\` | текущая папка |
| \`ls -la\` | все файлы подробно |
| \`cd путь\`, \`cd ..\`, \`cd ~\` | переход |
| \`mkdir -p a/b/c\` | создать папки |
| \`touch file\` | создать файл |
| \`cat file\` | показать файл |
| \`head -n 5 file\`, \`tail -n 5 file\` | начало / конец |
| \`cp -r src dst\` | копировать |
| \`mv src dst\` | переместить / переименовать |
| \`rm file\`, \`rm -r dir\` | удалить |
| \`grep -n шаблон file\` | поиск строк |
| \`find . -name "*.py"\` | поиск файлов |
| \`wc -l file\` | число строк |
| \`echo текст > file\` | записать |
| \`echo текст >> file\` | дописать |
| \`cmd1 | cmd2\` | конвейер |
| \`cmd1 && cmd2\` | выполнить cmd2, если cmd1 успешна |

## Windows (PowerShell) — аналоги
\`ls\` → \`dir\`, \`cat\` → \`type\`, \`rm\` → \`del\`, \`touch\` → \`ni\`, \`clear\` → \`cls\`.

## Горячие клавиши
- **Tab** — автодополнение
- **↑ / ↓** — история
- **Ctrl+C** — прервать программу
- **Ctrl+L** — очистить экран`,
  },
  {
    id: 'http',
    title: 'HTTP: методы, коды, заголовки',
    icon: '🌐',
    group: 'Веб',
    md: `## Методы
| Метод | Назначение | Идемпотентен |
|---|---|---|
| GET | получить | да |
| POST | создать | нет |
| PUT | заменить | да |
| PATCH | частично изменить | нет |
| DELETE | удалить | да |

## Коды ответов
| Группа | Примеры |
|---|---|
| 1xx — информация | 101 Switching Protocols |
| 2xx — успех | 200 OK, 201 Created, 204 No Content |
| 3xx — перенаправление | 301 Moved Permanently, 304 Not Modified |
| 4xx — ошибка клиента | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx — ошибка сервера | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

## Популярные заголовки
- \`Content-Type: application/json\`
- \`Authorization: Bearer <token>\`
- \`Accept-Language: ru\`
- \`Cache-Control: no-cache\`
- \`Access-Control-Allow-Origin: *\` (CORS)

## fetch в JavaScript
\`\`\`js
const res = await fetch("/api/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Привет" }),
});
if (!res.ok) throw new Error(res.status);
const data = await res.json();
\`\`\`

## requests в Python
\`\`\`python
import requests
r = requests.get("https://api.github.com/users/octocat", timeout=10)
r.raise_for_status()
print(r.json()["name"])
\`\`\``,
  },
  {
    id: 'sql',
    title: 'SQL: основные запросы',
    icon: '🗄️',
    group: 'Инструменты',
    md: `\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  city_id INTEGER REFERENCES cities(id)
);

INSERT INTO users (name, age) VALUES ('Аня', 17), ('Боря', 22);

SELECT name, age FROM users
WHERE age >= 18 AND name LIKE 'А%'
ORDER BY age DESC
LIMIT 10;

UPDATE users SET age = age + 1 WHERE id = 1;
DELETE FROM users WHERE age < 14;

-- агрегаты и группировка
SELECT city_id, COUNT(*) AS n, AVG(age)
FROM users
GROUP BY city_id
HAVING COUNT(*) > 5;

-- соединение таблиц
SELECT users.name, cities.title
FROM users
JOIN cities ON users.city_id = cities.id;

CREATE INDEX idx_users_age ON users(age);
\`\`\`

| Тип JOIN | Что вернёт |
|---|---|
| INNER JOIN | только совпадающие строки |
| LEFT JOIN | все строки левой таблицы + совпадения |
| RIGHT JOIN | все строки правой + совпадения |
| FULL JOIN | все строки обеих таблиц |`,
  },
  {
    id: 'bigo',
    title: 'Сложность алгоритмов и структур данных',
    icon: '⏱️',
    group: 'Алгоритмы',
    md: `## Структуры данных
| Структура | Доступ | Поиск | Вставка | Удаление |
|---|---|---|---|---|
| Массив | O(1) | O(n) | O(n) | O(n) |
| Динамический массив (в конец) | O(1) | O(n) | O(1)* | O(1) |
| Связный список | O(n) | O(n) | O(1) | O(1) |
| Стек / очередь | — | O(n) | O(1) | O(1) |
| Хеш-таблица | — | O(1)* | O(1)* | O(1)* |
| Сбалансированное дерево поиска | O(log n) | O(log n) | O(log n) | O(log n) |
| Куча | — | O(n) | O(log n) | O(log n) |

\\* в среднем / амортизированно

## Сортировки
| Алгоритм | Лучший | Средний | Худший | Память |
|---|---|---|---|---|
| Пузырёк | O(n) | O(n²) | O(n²) | O(1) |
| Выбором | O(n²) | O(n²) | O(n²) | O(1) |
| Вставками | O(n) | O(n²) | O(n²) | O(1) |
| Слиянием | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Быстрая | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Timsort (Python, JS) | O(n) | O(n log n) | O(n log n) | O(n) |

## Шаблоны решений
- **Два указателя** — отсортированные массивы, палиндромы.
- **Скользящее окно** — подстроки/подмассивы с условием.
- **Хеш-таблица** — «видели ли мы это раньше?», подсчёт частот.
- **Бинарный поиск** — отсортированные данные или монотонная функция.
- **BFS/DFS** — графы, сетки, деревья.
- **Динамическое программирование** — оптимальные подзадачи, пересекающиеся вычисления.`,
  },
  {
    id: 'regex',
    title: 'Регулярные выражения',
    icon: '🔣',
    group: 'Инструменты',
    md: `| Шаблон | Значение |
|---|---|
| \`.\` | любой символ |
| \`\\d\`, \`\\w\`, \`\\s\` | цифра, буква/цифра/_, пробельный |
| \`[abc]\`, \`[^abc]\`, \`[а-я]\` | набор символов |
| \`*\`, \`+\`, \`?\` | 0+, 1+, 0 или 1 раз |
| \`{3}\`, \`{2,5}\` | точное количество / диапазон |
| \`^\`, \`$\` | начало / конец строки |
| \`(...)\` | группа |
| \`a|b\` | или |

\`\`\`python
import re
re.findall(r"\\d+", "a1b22c333")          # ['1', '22', '333']
re.sub(r"\\s+", " ", "много   пробелов")
re.match(r"^[\\w.]+@\\w+\\.\\w+$", "a@b.ru")
\`\`\`

\`\`\`js
"a1b22".match(/\\d+/g)                    // ["1", "22"]
/^\\+7\\d{10}$/.test("+79991234567")       // true
"2024-01-15".replace(/(\\d+)-(\\d+)-(\\d+)/, "$3.$2.$1")
\`\`\``,
  },
];

/** Глоссарий — основа карточек для интервального повторения. */
export const GLOSSARY: [string, string][] = [
  ['Алгоритм', 'Точная конечная последовательность шагов для решения задачи'],
  ['Переменная', 'Именованное место в памяти, где хранится значение'],
  ['Функция', 'Именованный блок кода, который можно вызывать многократно; принимает параметры и может возвращать результат'],
  ['Параметр и аргумент', 'Параметр — переменная в объявлении функции; аргумент — значение, переданное при вызове'],
  ['Интерпретатор', 'Программа, выполняющая код строка за строкой без создания отдельного исполняемого файла'],
  ['Компилятор', 'Программа, переводящая весь исходный код в машинный код до запуска'],
  ['Бит / байт', 'Бит — 0 или 1; байт — 8 бит'],
  ['Цикл', 'Конструкция, повторяющая блок кода, пока выполняется условие или есть элементы'],
  ['Итерация', 'Одно выполнение тела цикла'],
  ['Рекурсия', 'Вызов функцией самой себя; нужен базовый случай'],
  ['Массив / список', 'Упорядоченная коллекция элементов с доступом по индексу (с нуля)'],
  ['Словарь / объект', 'Коллекция пар «ключ → значение» с быстрым доступом по ключу'],
  ['Класс', 'Шаблон для создания объектов: описывает их данные и методы'],
  ['Объект (экземпляр)', 'Конкретная сущность, созданная по классу'],
  ['Наследование', 'Создание класса на основе существующего с перенятием его свойств и методов'],
  ['Полиморфизм', 'Возможность одинаково работать с объектами разных классов через общий интерфейс'],
  ['Инкапсуляция', 'Объединение данных и методов и скрытие деталей реализации'],
  ['Исключение', 'Событие ошибки во время выполнения, которое можно поймать и обработать'],
  ['Область видимости', 'Часть программы, где доступна переменная'],
  ['Замыкание', 'Функция, запомнившая переменные внешней области, в которой была создана'],
  ['Асинхронность', 'Выполнение долгих операций без блокировки остального кода'],
  ['Promise', 'Объект JavaScript, представляющий результат асинхронной операции в будущем'],
  ['Event loop', 'Механизм, который выполняет колбэки из очереди, когда стек вызовов пуст'],
  ['API', 'Набор правил, по которым программы обращаются к сервису или библиотеке'],
  ['REST', 'Стиль API: ресурсы по URL, действия — HTTP-методами, данные — обычно JSON'],
  ['JSON', 'Текстовый формат данных из объектов, массивов, строк, чисел, true/false и null'],
  ['HTTP', 'Протокол обмена запросами и ответами между клиентом и сервером'],
  ['DNS', 'Система, преобразующая доменные имена в IP-адреса'],
  ['Git', 'Распределённая система контроля версий'],
  ['Коммит', 'Сохранённый снимок состояния проекта в Git с сообщением'],
  ['Ветка', 'Независимая линия разработки в Git'],
  ['Merge', 'Слияние изменений одной ветки в другую'],
  ['DOM', 'Объектное дерево веб-страницы, которым управляет JavaScript'],
  ['O-нотация', 'Способ описать, как растёт время/память алгоритма при росте входных данных'],
  ['Хеш-таблица', 'Структура данных с поиском по ключу в среднем за O(1) с помощью хеш-функции'],
  ['Стек', 'Структура LIFO: последний пришёл — первый ушёл'],
  ['Очередь', 'Структура FIFO: первый пришёл — первый ушёл'],
  ['Бинарный поиск', 'Поиск в отсортированном массиве делением пополам, O(log n)'],
  ['База данных', 'Организованное хранилище данных с быстрым поиском и изменением'],
  ['SQL', 'Язык запросов к реляционным базам данных'],
  ['SQL-инъекция', 'Уязвимость, когда данные пользователя попадают в текст SQL-запроса'],
  ['Фреймворк', 'Каркас приложения с готовой архитектурой, в который встраивается твой код'],
  ['Библиотека', 'Набор готового кода, который ты вызываешь из своей программы'],
  ['Отладка (debugging)', 'Поиск и исправление ошибок в программе'],
  ['Точка останова', 'Строка, на которой отладчик приостанавливает выполнение'],
  ['Стек вызовов', 'Список активных вызовов функций в порядке их вложенности'],
];
