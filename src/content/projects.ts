// Пошаговые проекты для портфолио: логика проверяется тестами, веб-проекты — живым предпросмотром.
import type { Project } from './types';

const SNAKE_HTML = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Змейка</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>🐍 Змейка</h1>
  <div id="score">Счёт: 0</div>
  <canvas id="game" width="400" height="400"></canvas>
  <p class="hint">Стрелки или WASD — управление, пробел — пауза</p>
  <script src="script.js"></script>
</body>
</html>
`;
const SNAKE_CSS = `body { background: #0f172a; color: #e2e8f0; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; }
canvas { background: #111827; border: 2px solid #334155; border-radius: 8px; }
#score { font-size: 1.2rem; margin-bottom: 8px; }
.hint { color: #94a3b8; }
`;

const PONG_HTML = `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Pong</title><link rel="stylesheet" href="style.css"></head>
<body>
  <canvas id="pong" width="600" height="360"></canvas>
  <p>Управление: W/S — левая ракетка. Правой управляет компьютер.</p>
  <script src="script.js"></script>
</body>
</html>
`;
const PONG_CSS = `body { background: #020617; color: #cbd5e1; font-family: monospace; display: grid; place-items: center; }
canvas { background: #000; border: 2px solid #475569; margin-top: 16px; }
`;

export const PROJECTS: Project[] = [
  {
    id: 'py-calculator',
    title: 'Консольный калькулятор',
    icon: '🧮',
    difficulty: 1,
    track: 'python',
    tags: ['функции', 'условия', 'ошибки'],
    summary: 'Калькулятор, который понимает выражения вида «12 * 4», обрабатывает ошибки и хранит историю.',
    steps: [
      { title: 'Операции', lang: 'python', md: 'Напиши функцию `calculate(a, op, b)`, которая поддерживает `+ - * /` и возвращает результат. Для неизвестной операции верни строку `"Неизвестная операция"`.', starter: 'def calculate(a, op, b):\n    pass\n', tests: [{ expr: 'calculate(2, "+", 3)', expected: '5' }, { expr: 'calculate(10, "/", 4)', expected: '2.5' }, { expr: 'calculate(3, "*", 7)', expected: '21' }, { expr: 'calculate(1, "^", 2)', expected: '"Неизвестная операция"' }] },
      { title: 'Деление на ноль', lang: 'python', md: 'Добавь обработку деления на ноль: верни `"Ошибка: деление на ноль"`. Используй try/except или проверку.', starter: 'def calculate(a, op, b):\n    if op == "+":\n        return a + b\n    if op == "-":\n        return a - b\n    if op == "*":\n        return a * b\n    if op == "/":\n        return a / b\n    return "Неизвестная операция"\n', tests: [{ expr: 'calculate(5, "/", 0)', expected: '"Ошибка: деление на ноль"' }, { expr: 'calculate(9, "/", 3)', expected: '3.0' }] },
      { title: 'Разбор выражения', lang: 'python', md: 'Напиши `evaluate(expr)`, принимающую строку вида `"12 * 4"` (числа и оператор через пробел). Числа могут быть дробными. Используй свою `calculate`.', starter: 'def calculate(a, op, b):\n    if op == "/" and b == 0:\n        return "Ошибка: деление на ноль"\n    return {"+": a + b, "-": a - b, "*": a * b, "/": a / b if b else 0}.get(op, "Неизвестная операция")\n\ndef evaluate(expr):\n    pass\n', tests: [{ expr: 'evaluate("12 * 4")', expected: '48.0' }, { expr: 'evaluate("7.5 - 2.5")', expected: '5.0' }, { expr: 'evaluate("1 / 0")', expected: '"Ошибка: деление на ноль"' }] },
      { title: 'Интерактивный режим и история', lang: 'python', md: 'Собери программу: читай выражения, пока пользователь не введёт `выход`, печатай `= результат`, а в конце — `Вычислений: N`.\n\n> 💡 Это уже полноценная программа — запусти её и в консоли: создай файл `calc.py` и выполни `python calc.py`.', starter: 'def evaluate(expr):\n    a, op, b = expr.split()\n    a, b = float(a), float(b)\n    if op == "/" and b == 0:\n        return "Ошибка: деление на ноль"\n    return {"+": a + b, "-": a - b, "*": a * b, "/": a / b if b else 0}.get(op, "Неизвестная операция")\n\nhistory = []\n# твой цикл\n', tests: [{ stdin: ['2 + 2', '10 / 4', 'выход'], expected: '= 4.0\n= 2.5\nВычислений: 2' }] },
    ],
  },
  {
    id: 'py-guess',
    title: 'Игра «Угадай число»',
    icon: '🎲',
    difficulty: 1,
    track: 'python',
    tags: ['циклы', 'random', 'бинарный поиск'],
    summary: 'Компьютер загадывает число, игрок угадывает по подсказкам «больше/меньше». Бонус — бот, угадывающий бинарным поиском.',
    steps: [
      { title: 'Подсказка', lang: 'python', md: 'Функция `hint(secret, guess)` возвращает `"Больше"`, `"Меньше"` или `"Угадал!"`.', starter: 'def hint(secret, guess):\n    pass\n', tests: [{ expr: 'hint(50, 30)', expected: '"Больше"' }, { expr: 'hint(50, 70)', expected: '"Меньше"' }, { expr: 'hint(50, 50)', expected: '"Угадал!"' }] },
      { title: 'Игровой цикл', lang: 'python', md: 'Секрет — 42 (для проверки). Читай попытки, печатай подсказку, а при угадывании — `Попыток: N` и выходи.', starter: 'secret = 42\nattempts = 0\n', tests: [{ stdin: ['50', '25', '42'], expected: 'Меньше\nБольше\nУгадал!\nПопыток: 3' }] },
      { title: 'Бот-угадыватель', lang: 'python', md: 'Напиши `bot_guess(secret, low=1, high=100)`, которая угадывает число **бинарным поиском** и возвращает количество попыток. Для чисел 1..100 бот должен укладываться в 7 попыток.', starter: 'def bot_guess(secret, low=1, high=100):\n    attempts = 0\n    # твой код\n', tests: [{ expr: 'max(bot_guess(s) for s in range(1, 101)) <= 7', expected: 'true' }, { expr: 'bot_guess(50)', expected: '1' }] },
    ],
  },
  {
    id: 'py-todo',
    title: 'Менеджер задач',
    icon: '✅',
    difficulty: 2,
    track: 'python',
    tags: ['классы', 'JSON', 'файлы'],
    summary: 'Класс TaskManager с добавлением, выполнением, фильтрами и сохранением в JSON-файл.',
    steps: [
      { title: 'Класс задач', lang: 'python', md: 'Создай класс `TaskManager` с методами `add(title)` (возвращает id, начиная с 1), `complete(id)`, `pending()` — список названий невыполненных задач.', starter: 'class TaskManager:\n    def __init__(self):\n        self.tasks = []\n', tests: [{ expr: '(lambda m: (m.add("A"), m.add("B"), m.complete(1), m.pending())[-1])(TaskManager())', expected: '["B"]' }, { expr: '(lambda m: [m.add("X"), m.add("Y")])(TaskManager())', expected: '[1, 2]' }] },
      { title: 'Сохранение в JSON', lang: 'python', md: 'Добавь методы `save(path)` и `load(path)`, сохраняющие задачи в JSON-файл. Тест создаст менеджер, сохранит, загрузит в новый и сравнит.', starter: 'import json\n\nclass TaskManager:\n    def __init__(self):\n        self.tasks = []\n\n    def add(self, title):\n        self.tasks.append({"id": len(self.tasks) + 1, "title": title, "done": False})\n        return len(self.tasks)\n\n    def complete(self, task_id):\n        for t in self.tasks:\n            if t["id"] == task_id:\n                t["done"] = True\n\n    def pending(self):\n        return [t["title"] for t in self.tasks if not t["done"]]\n', tests: [{ expr: '(lambda a, b: (a.add("Учить Python"), a.add("Сделать проект"), a.complete(2), a.save("t.json"), b.load("t.json"), b.pending())[-1])(TaskManager(), TaskManager())', expected: '["Учить Python"]' }] },
    ],
  },
  {
    id: 'py-telegram-bot',
    title: 'Telegram-бот',
    icon: '🤖',
    difficulty: 2,
    track: 'python',
    tags: ['боты', 'словари', 'API'],
    summary: 'Логика бота с командами /start, /help, /todo, /weather. В песочнице — проверка логики, рядом — готовый код для настоящего Telegram на aiogram.',
    steps: [
      { title: 'Обработчик команд', lang: 'python', md: `Любой бот — это функция «сообщение → ответ». Напиши \`handle(text)\`:
- \`/start\` → \`Привет! Я бот CodeVerse 🤖\`
- \`/help\` → \`Команды: /start, /help, /echo <текст>\`
- \`/echo <текст>\` → сам текст
- всё остальное → \`Не понимаю 🤔 Напиши /help\``, starter: 'def handle(text):\n    pass\n', tests: [{ expr: 'handle("/start")', expected: '"Привет! Я бот CodeVerse 🤖"' }, { expr: 'handle("/echo привет мир")', expected: '"привет мир"' }, { expr: 'handle("/help")', expected: '"Команды: /start, /help, /echo <текст>"' }, { expr: 'handle("как дела")', expected: '"Не понимаю 🤔 Напиши /help"' }] },
      { title: 'Список дел для каждого пользователя', lang: 'python', md: 'Добавь состояние: `handle(user_id, text)`. Команды `/add <дело>` → `Добавлено`, `/list` → дела через `; ` или `Список пуст`. У каждого пользователя свой список (словарь user_id → список).', starter: 'todos = {}\n\ndef handle(user_id, text):\n    pass\n', tests: [{ expr: '(handle(1, "/add Купить хлеб"), handle(1, "/add Учить Python"), handle(2, "/list"), handle(1, "/list"))', expected: '["Добавлено", "Добавлено", "Список пуст", "Купить хлеб; Учить Python"]' }] },
      { title: 'Запускаем по-настоящему', lang: 'python', md: `Логика готова! Чтобы бот заработал в Telegram:
1. Напиши [@BotFather](https://t.me/BotFather) → \`/newbot\` → получи токен.
2. На своём компьютере: \`pip install aiogram\`.
3. Подключи свою функцию \`handle\`:

\`\`\`python
import asyncio
from aiogram import Bot, Dispatcher
from aiogram.types import Message

bot = Bot(token="ТВОЙ_ТОКЕН")
dp = Dispatcher()

@dp.message()
async def on_message(message: Message):
    await message.answer(handle(message.from_user.id, message.text or ""))

asyncio.run(dp.start_polling(bot))
\`\`\`

> ⚠️ Никогда не публикуй токен в GitHub — храни его в переменной окружения.

Нажми «Готово», когда разберёшься с кодом.` },
    ],
  },
  {
    id: 'js-discord-bot',
    title: 'Discord-бот',
    icon: '🎮',
    difficulty: 2,
    track: 'js',
    tags: ['боты', 'объекты', 'Map'],
    summary: 'Бот для сервера: команды !ping, !roll, !poll и уровни участников. Логика проверяется тестами, плюс код для discord.js.',
    steps: [
      { title: 'Команды', lang: 'js', md: 'Напиши `handleCommand(content)`:\n- `!ping` → `"Pong! 🏓"`\n- `!roll` → случайное число 1–6 строкой (например, `"🎲 4"`)\n- `!say <текст>` → текст\n- остальное → `null` (бот молчит).', starter: 'function handleCommand(content) {\n  \n}\n', tests: [{ expr: 'handleCommand("!ping")', expected: '"Pong! 🏓"' }, { expr: '/^🎲 [1-6]$/.test(handleCommand("!roll"))', expected: 'true' }, { expr: 'handleCommand("!say всем привет")', expected: '"всем привет"' }, { expr: 'handleCommand("hello")', expected: 'null' }] },
      { title: 'Опыт участников', lang: 'js', md: 'За каждое сообщение участник получает 10 XP, уровень = `Math.floor(xp / 50) + 1`. Напиши класс `Levels` с методами `message(userId)` (возвращает строку `"🎉 Уровень N!"` при повышении уровня, иначе `null`) и `level(userId)`.', starter: 'class Levels {\n  constructor() {\n    this.xp = new Map();\n  }\n}\n', tests: [{ expr: '(() => { const l = new Levels(); const r = []; for (let i = 0; i < 5; i++) r.push(l.message("u1")); return [r.filter(Boolean), l.level("u1"), l.level("u2")]; })()', expected: '[["🎉 Уровень 2!"], 2, 1]' }] },
      { title: 'Подключаем discord.js', lang: 'js', md: `Настоящий бот на Node.js:

\`\`\`js
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const levels = new Levels();

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  const reply = handleCommand(msg.content);
  if (reply) await msg.reply(reply);
  const up = levels.message(msg.author.id);
  if (up) await msg.channel.send(\`\${msg.author}: \${up}\`);
});

client.login(process.env.DISCORD_TOKEN);
\`\`\`

Токен создаётся на [Discord Developer Portal](https://discord.com/developers/applications). Нажми «Готово».` },
    ],
  },
  {
    id: 'web-snake',
    title: 'Игра «Змейка»',
    icon: '🐍',
    difficulty: 3,
    track: 'web',
    tags: ['canvas', 'игры', 'массивы'],
    summary: 'Классическая змейка на Canvas: игровой цикл, управление, еда, столкновения, счёт и рекорд.',
    steps: [
      { title: 'Поле и змейка', lang: 'web', md: 'Нарисуем поле 20×20 клеток и змейку из трёх сегментов. Змейка — массив координат `[{x, y}, ...]`. Нажми **Предпросмотр**, затем поменяй цвет змейки.', files: { 'index.html': SNAKE_HTML, 'style.css': SNAKE_CSS, 'script.js': `const canvas = document.getElementById("game");\nconst ctx = canvas.getContext("2d");\nconst SIZE = 20; // размер клетки\nconst snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];\n\nfunction draw() {\n  ctx.fillStyle = "#111827";\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  ctx.fillStyle = "#4ade80"; // попробуй другой цвет!\n  for (const part of snake) {\n    ctx.fillRect(part.x * SIZE, part.y * SIZE, SIZE - 2, SIZE - 2);\n  }\n}\n\ndraw();\n` } },
      { title: 'Движение и управление', lang: 'web', md: 'Игровой цикл: каждые 120 мс добавляем новую голову в направлении движения и убираем хвост. Стрелки меняют направление (но нельзя развернуться назад).', files: { 'index.html': SNAKE_HTML, 'style.css': SNAKE_CSS, 'script.js': `const canvas = document.getElementById("game");\nconst ctx = canvas.getContext("2d");\nconst SIZE = 20, CELLS = 20;\nlet snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];\nlet dir = { x: 1, y: 0 };\n\ndocument.addEventListener("keydown", (e) => {\n  const keys = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };\n  const k = keys[e.key];\n  if (k && (k[0] !== -dir.x || k[1] !== -dir.y)) dir = { x: k[0], y: k[1] };\n});\n\nfunction step() {\n  const head = { x: (snake[0].x + dir.x + CELLS) % CELLS, y: (snake[0].y + dir.y + CELLS) % CELLS };\n  snake.unshift(head);\n  snake.pop();\n  draw();\n}\n\nfunction draw() {\n  ctx.fillStyle = "#111827";\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  snake.forEach((p, i) => {\n    ctx.fillStyle = i === 0 ? "#86efac" : "#4ade80";\n    ctx.fillRect(p.x * SIZE, p.y * SIZE, SIZE - 2, SIZE - 2);\n  });\n}\n\nsetInterval(step, 120);\n` } },
      { title: 'Еда, рост, счёт и проигрыш', lang: 'web', md: 'Добавим еду: когда голова на клетке с едой — не убираем хвост (змейка растёт) и увеличиваем счёт. Столкновение с собой — конец игры. Рекорд хранится в `localStorage`. **Задание:** ускоряй игру с каждым съеденным яблоком.', files: { 'index.html': SNAKE_HTML, 'style.css': SNAKE_CSS, 'script.js': `const canvas = document.getElementById("game");\nconst ctx = canvas.getContext("2d");\nconst scoreEl = document.getElementById("score");\nconst SIZE = 20, CELLS = 20;\nlet snake, dir, food, score, paused = false, timer;\nlet best = Number(localStorage.getItem("snake-best") || 0);\n\nfunction reset() {\n  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];\n  dir = { x: 1, y: 0 };\n  score = 0;\n  placeFood();\n  clearInterval(timer);\n  timer = setInterval(step, 120);\n}\n\nfunction placeFood() {\n  do {\n    food = { x: Math.floor(Math.random() * CELLS), y: Math.floor(Math.random() * CELLS) };\n  } while (snake.some((p) => p.x === food.x && p.y === food.y));\n}\n\ndocument.addEventListener("keydown", (e) => {\n  if (e.key === " ") paused = !paused;\n  const keys = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };\n  const k = keys[e.key];\n  if (k && (k[0] !== -dir.x || k[1] !== -dir.y)) dir = { x: k[0], y: k[1] };\n});\n\nfunction step() {\n  if (paused) return;\n  const head = { x: (snake[0].x + dir.x + CELLS) % CELLS, y: (snake[0].y + dir.y + CELLS) % CELLS };\n  if (snake.some((p) => p.x === head.x && p.y === head.y)) {\n    best = Math.max(best, score);\n    localStorage.setItem("snake-best", best);\n    alert("Игра окончена! Счёт: " + score);\n    return reset();\n  }\n  snake.unshift(head);\n  if (head.x === food.x && head.y === food.y) {\n    score++;\n    placeFood();\n    // TODO: ускорь игру — перезапусти интервал с меньшей задержкой\n  } else {\n    snake.pop();\n  }\n  draw();\n}\n\nfunction draw() {\n  ctx.fillStyle = "#111827";\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  ctx.fillStyle = "#f87171";\n  ctx.beginPath();\n  ctx.arc(food.x * SIZE + SIZE / 2, food.y * SIZE + SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);\n  ctx.fill();\n  snake.forEach((p, i) => {\n    ctx.fillStyle = i === 0 ? "#86efac" : "#4ade80";\n    ctx.fillRect(p.x * SIZE, p.y * SIZE, SIZE - 2, SIZE - 2);\n  });\n  scoreEl.textContent = "Счёт: " + score + " · Рекорд: " + best;\n}\n\nreset();\n` } },
    ],
  },
  {
    id: 'web-pong',
    title: 'Pong',
    icon: '🏓',
    difficulty: 3,
    track: 'web',
    tags: ['canvas', 'физика', 'ИИ противника'],
    summary: 'Пинг-понг против компьютера: отражения мяча, ракетки, простейший ИИ и счёт.',
    steps: [
      { title: 'Игра целиком', lang: 'web', md: 'Здесь вся игра: `requestAnimationFrame` для плавной анимации, отражение мяча от стен (`dy = -dy`) и ракеток, ИИ, который следует за мячом с ограниченной скоростью.\n\n**Задания:**\n1. Сделай ИИ слабее (уменьши его скорость).\n2. Ускоряй мяч после каждого отражения от ракетки.\n3. Добавь победу при счёте 5.', files: { 'index.html': PONG_HTML, 'style.css': PONG_CSS, 'script.js': `const c = document.getElementById("pong");\nconst ctx = c.getContext("2d");\nconst P = { w: 10, h: 70 };\nconst left = { y: 145, score: 0 }, right = { y: 145, score: 0 };\nconst ball = { x: 300, y: 180, dx: 4, dy: 3, r: 7 };\nconst keys = {};\nconst AI_SPEED = 4; // скорость компьютера\n\ndocument.addEventListener("keydown", (e) => (keys[e.key] = true));\ndocument.addEventListener("keyup", (e) => (keys[e.key] = false));\n\nfunction resetBall(dir) {\n  Object.assign(ball, { x: 300, y: 180, dx: 4 * dir, dy: (Math.random() * 4 - 2) || 2 });\n}\n\nfunction update() {\n  if (keys.w) left.y -= 6;\n  if (keys.s) left.y += 6;\n  const target = ball.y - P.h / 2;\n  right.y += Math.max(-AI_SPEED, Math.min(AI_SPEED, target - right.y));\n  left.y = Math.max(0, Math.min(c.height - P.h, left.y));\n  right.y = Math.max(0, Math.min(c.height - P.h, right.y));\n\n  ball.x += ball.dx;\n  ball.y += ball.dy;\n  if (ball.y < ball.r || ball.y > c.height - ball.r) ball.dy = -ball.dy;\n\n  if (ball.x - ball.r < 20 && ball.y > left.y && ball.y < left.y + P.h) ball.dx = Math.abs(ball.dx);\n  if (ball.x + ball.r > c.width - 20 && ball.y > right.y && ball.y < right.y + P.h) ball.dx = -Math.abs(ball.dx);\n\n  if (ball.x < 0) { right.score++; resetBall(1); }\n  if (ball.x > c.width) { left.score++; resetBall(-1); }\n}\n\nfunction draw() {\n  ctx.fillStyle = "#000";\n  ctx.fillRect(0, 0, c.width, c.height);\n  ctx.fillStyle = "#fff";\n  ctx.setLineDash([6, 10]);\n  ctx.strokeStyle = "#555";\n  ctx.beginPath(); ctx.moveTo(300, 0); ctx.lineTo(300, 360); ctx.stroke();\n  ctx.fillRect(10, left.y, P.w, P.h);\n  ctx.fillRect(c.width - 20, right.y, P.w, P.h);\n  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();\n  ctx.font = "32px monospace";\n  ctx.fillText(left.score, 240, 40);\n  ctx.fillText(right.score, 340, 40);\n}\n\nfunction loop() {\n  update();\n  draw();\n  requestAnimationFrame(loop);\n}\nloop();\n` } },
    ],
  },
  {
    id: 'web-calculator',
    title: 'Калькулятор на сайте',
    icon: '🖩',
    difficulty: 2,
    track: 'web',
    tags: ['HTML', 'CSS Grid', 'DOM', 'события'],
    summary: 'Красивый калькулятор с сеткой кнопок, поддержкой клавиатуры и историей вычислений.',
    steps: [
      { title: 'Логика вычислений', lang: 'js', md: 'Сначала — логика без интерфейса. Напиши `compute(a, op, b)` для `+ - × ÷`. Деление на ноль → `"Ошибка"`. Результат округляй до 10 знаков, чтобы `0.1 + 0.2` давало `0.3`: `Math.round(x * 1e10) / 1e10`.', starter: 'function compute(a, op, b) {\n  \n}\n', tests: [{ expr: 'compute(0.1, "+", 0.2)', expected: '0.3' }, { expr: 'compute(6, "×", 7)', expected: '42' }, { expr: 'compute(1, "÷", 0)', expected: '"Ошибка"' }, { expr: 'compute(10, "-", 15)', expected: '-5' }] },
      { title: 'Интерфейс', lang: 'web', md: 'Подключаем логику к кнопкам. CSS Grid раскладывает кнопки сеткой 4×5. **Задание:** добавь кнопку `%` и поддержку клавиш Enter и Backspace.', files: { 'index.html': `<!doctype html>\n<html lang="ru">\n<head><meta charset="utf-8"><title>Калькулятор</title><link rel="stylesheet" href="style.css"></head>\n<body>\n  <div class="calc">\n    <div class="display" id="display">0</div>\n    <div class="keys">\n      <button data-k="C" class="fn">C</button><button data-k="±" class="fn">±</button><button data-k="⌫" class="fn">⌫</button><button data-k="÷" class="op">÷</button>\n      <button data-k="7">7</button><button data-k="8">8</button><button data-k="9">9</button><button data-k="×" class="op">×</button>\n      <button data-k="4">4</button><button data-k="5">5</button><button data-k="6">6</button><button data-k="-" class="op">−</button>\n      <button data-k="1">1</button><button data-k="2">2</button><button data-k="3">3</button><button data-k="+" class="op">+</button>\n      <button data-k="0" class="wide">0</button><button data-k=".">.</button><button data-k="=" class="eq">=</button>\n    </div>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>\n`, 'style.css': `body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: linear-gradient(135deg, #1e1b4b, #0f172a); font-family: system-ui, sans-serif; }\n.calc { width: 300px; background: #111827; border-radius: 24px; padding: 20px; box-shadow: 0 20px 60px #0008; }\n.display { color: white; font-size: 2.6rem; text-align: right; padding: 16px 8px; overflow: hidden; }\n.keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }\nbutton { height: 60px; border: 0; border-radius: 16px; font-size: 1.3rem; background: #1f2937; color: white; cursor: pointer; transition: transform .05s, filter .2s; }\nbutton:active { transform: scale(.95); }\nbutton:hover { filter: brightness(1.2); }\n.op { background: #7c3aed; } .fn { background: #374151; } .eq { background: #22c55e; } .wide { grid-column: span 2; }\n`, 'script.js': `const display = document.getElementById("display");\nlet current = "0", prev = null, op = null, fresh = false;\n\nfunction compute(a, op, b) {\n  if (op === "÷" && b === 0) return "Ошибка";\n  const r = { "+": a + b, "-": a - b, "×": a * b, "÷": a / b }[op];\n  return Math.round(r * 1e10) / 1e10;\n}\n\nfunction press(k) {\n  if (/\\d/.test(k)) {\n    current = current === "0" || fresh ? k : current + k;\n    fresh = false;\n  } else if (k === "." && !current.includes(".")) current += ".";\n  else if (k === "C") { current = "0"; prev = op = null; }\n  else if (k === "⌫") current = current.length > 1 ? current.slice(0, -1) : "0";\n  else if (k === "±") current = String(-Number(current));\n  else if ("+-×÷".includes(k)) {\n    if (op && !fresh) current = String(compute(prev, op, Number(current)));\n    prev = Number(current); op = k; fresh = true;\n  } else if (k === "=" && op) {\n    current = String(compute(prev, op, Number(current)));\n    op = null; fresh = true;\n  }\n  display.textContent = current;\n}\n\ndocument.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => press(b.dataset.k)));\ndocument.addEventListener("keydown", (e) => {\n  const map = { "*": "×", "/": "÷", Escape: "C" };\n  const k = map[e.key] ?? e.key;\n  if (/^[\\d.+\\-×÷C]$/.test(k)) press(k);\n  // TODO: Enter → "=", Backspace → "⌫"\n});\n` } },
    ],
  },
  {
    id: 'web-todo',
    title: 'Менеджер задач в браузере',
    icon: '📝',
    difficulty: 2,
    track: 'web',
    tags: ['DOM', 'localStorage', 'фильтры'],
    summary: 'To-do приложение: добавление, отметка, удаление, фильтры «все/активные/выполненные», сохранение между перезагрузками.',
    steps: [
      { title: 'Готовое приложение', lang: 'web', md: 'Разбери код: состояние хранится в массиве `tasks`, функция `render()` перерисовывает список, `save()` пишет в localStorage.\n\n**Задания:** 1) добавь счётчик «осталось N задач»; 2) двойной клик по задаче — редактирование; 3) кнопка «Удалить выполненные».', files: { 'index.html': `<!doctype html>\n<html lang="ru">\n<head><meta charset="utf-8"><title>Задачи</title><link rel="stylesheet" href="style.css"></head>\n<body>\n  <main>\n    <h1>📝 Мои задачи</h1>\n    <form id="form"><input id="input" placeholder="Что нужно сделать?" autocomplete="off"><button>Добавить</button></form>\n    <div class="filters">\n      <button data-f="all" class="active">Все</button><button data-f="active">Активные</button><button data-f="done">Выполненные</button>\n    </div>\n    <ul id="list"></ul>\n  </main>\n  <script src="script.js"></script>\n</body>\n</html>\n`, 'style.css': `body { font-family: system-ui, sans-serif; background: #f1f5f9; display: flex; justify-content: center; }\nmain { width: min(480px, 92vw); margin-top: 40px; background: white; padding: 24px; border-radius: 16px; box-shadow: 0 10px 30px #0001; }\nform { display: flex; gap: 8px; }\ninput { flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }\nbutton { padding: 10px 14px; border: 0; border-radius: 8px; background: #6366f1; color: white; cursor: pointer; }\n.filters { margin: 12px 0; display: flex; gap: 6px; }\n.filters button { background: #e2e8f0; color: #334155; }\n.filters .active { background: #6366f1; color: white; }\nul { list-style: none; padding: 0; }\nli { display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #e2e8f0; }\nli.done span { text-decoration: line-through; color: #94a3b8; }\nli span { flex: 1; }\nli .del { background: #ef4444; padding: 4px 10px; }\n`, 'script.js': `let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");\nlet filter = "all";\nconst list = document.getElementById("list");\n\nfunction save() {\n  localStorage.setItem("tasks", JSON.stringify(tasks));\n}\n\nfunction render() {\n  list.innerHTML = "";\n  tasks\n    .filter((t) => filter === "all" || (filter === "done" ? t.done : !t.done))\n    .forEach((t) => {\n      const li = document.createElement("li");\n      li.className = t.done ? "done" : "";\n      const box = document.createElement("input");\n      box.type = "checkbox";\n      box.checked = t.done;\n      box.onchange = () => { t.done = box.checked; save(); render(); };\n      const span = document.createElement("span");\n      span.textContent = t.title;\n      const del = document.createElement("button");\n      del.className = "del";\n      del.textContent = "✕";\n      del.onclick = () => { tasks = tasks.filter((x) => x !== t); save(); render(); };\n      li.append(box, span, del);\n      list.append(li);\n    });\n}\n\ndocument.getElementById("form").addEventListener("submit", (e) => {\n  e.preventDefault();\n  const input = document.getElementById("input");\n  const title = input.value.trim();\n  if (!title) return;\n  tasks.push({ title, done: false, id: Date.now() });\n  input.value = "";\n  save();\n  render();\n});\n\ndocument.querySelectorAll(".filters button").forEach((b) =>\n  b.addEventListener("click", () => {\n    filter = b.dataset.f;\n    document.querySelectorAll(".filters button").forEach((x) => x.classList.toggle("active", x === b));\n    render();\n  }),\n);\n\nrender();\n` } },
    ],
  },
  {
    id: 'web-weather',
    title: 'Погодное приложение',
    icon: '🌦️',
    difficulty: 3,
    track: 'web',
    tags: ['fetch', 'API', 'async/await', 'JSON'],
    summary: 'Поиск города и прогноз погоды через бесплатный API Open-Meteo без ключа: геокодинг, текущая погода и прогноз на 5 дней.',
    steps: [
      { title: 'Разбор ответа API', lang: 'js', md: 'API возвращает коды погоды (WMO). Напиши `describe(code)`: 0 → `"☀️ Ясно"`, 1–3 → `"⛅ Облачно"`, 45–48 → `"🌫️ Туман"`, 51–67 → `"🌧️ Дождь"`, 71–77 → `"❄️ Снег"`, 95+ → `"⛈️ Гроза"`, иначе `"🌡️ Неизвестно"`.', starter: 'function describe(code) {\n  \n}\n', tests: [{ expr: 'describe(0)', expected: '"☀️ Ясно"' }, { expr: 'describe(2)', expected: '"⛅ Облачно"' }, { expr: 'describe(61)', expected: '"🌧️ Дождь"' }, { expr: 'describe(73)', expected: '"❄️ Снег"' }, { expr: 'describe(96)', expected: '"⛈️ Гроза"' }, { expr: 'describe(80)', expected: '"🌡️ Неизвестно"' }] },
      { title: 'Приложение', lang: 'web', md: 'Два запроса через `fetch`: сначала геокодинг (название → координаты), потом прогноз. Всё асинхронно с `async/await` и обработкой ошибок.\n\n> Для работы нужен Интернет. **Задание:** добавь отображение скорости ветра и запоминание последнего города.', files: { 'index.html': `<!doctype html>\n<html lang="ru">\n<head><meta charset="utf-8"><title>Погода</title><link rel="stylesheet" href="style.css"></head>\n<body>\n  <main>\n    <h1>🌦️ Погода</h1>\n    <form id="form"><input id="city" value="Москва" placeholder="Город"><button>Показать</button></form>\n    <div id="result"></div>\n  </main>\n  <script src="script.js"></script>\n</body>\n</html>\n`, 'style.css': `body { font-family: system-ui, sans-serif; background: linear-gradient(160deg, #0ea5e9, #6366f1); min-height: 100vh; margin: 0; color: white; display: flex; justify-content: center; }\nmain { width: min(520px, 92vw); margin-top: 40px; }\nform { display: flex; gap: 8px; }\ninput { flex: 1; padding: 12px; border-radius: 12px; border: 0; font-size: 1rem; }\nbutton { padding: 12px 18px; border-radius: 12px; border: 0; background: #0f172a; color: white; cursor: pointer; }\n.now { font-size: 3rem; margin: 20px 0 4px; }\n.days { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 16px; }\n.day { background: #ffffff26; border-radius: 12px; padding: 10px; text-align: center; }\n`, 'script.js': `const result = document.getElementById("result");\n\nfunction describe(code) {\n  if (code === 0) return "☀️ Ясно";\n  if (code <= 3) return "⛅ Облачно";\n  if (code >= 45 && code <= 48) return "🌫️ Туман";\n  if (code >= 51 && code <= 67) return "🌧️ Дождь";\n  if (code >= 71 && code <= 77) return "❄️ Снег";\n  if (code >= 95) return "⛈️ Гроза";\n  return "🌡️ Неизвестно";\n}\n\nasync function show(city) {\n  result.textContent = "Загрузка…";\n  try {\n    const geo = await fetch("https://geocoding-api.open-meteo.com/v1/search?count=1&language=ru&name=" + encodeURIComponent(city)).then((r) => r.json());\n    if (!geo.results?.length) throw new Error("Город не найден");\n    const { latitude, longitude, name, country } = geo.results[0];\n    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto";\n    const data = await fetch(url).then((r) => r.json());\n    const cw = data.current_weather;\n    const days = data.daily.time.slice(0, 5).map((t, i) => '<div class="day">' + new Date(t).toLocaleDateString("ru", { weekday: "short" }) + "<br>" + describe(data.daily.weathercode[i]).split(" ")[0] + "<br>" + Math.round(data.daily.temperature_2m_max[i]) + "° / " + Math.round(data.daily.temperature_2m_min[i]) + "°</div>").join("");\n    result.innerHTML = "<h2>" + name + ", " + country + "</h2><div class=now>" + Math.round(cw.temperature) + "°C</div><div>" + describe(cw.weathercode) + '</div><div class="days">' + days + "</div>";\n  } catch (e) {\n    result.textContent = "Ошибка: " + e.message;\n  }\n}\n\ndocument.getElementById("form").addEventListener("submit", (e) => {\n  e.preventDefault();\n  show(document.getElementById("city").value);\n});\nshow("Москва");\n` } },
    ],
  },
  {
    id: 'js-rest-api',
    title: 'Свой REST API',
    icon: '🛰️',
    difficulty: 3,
    track: 'js',
    tags: ['REST', 'HTTP', 'маршрутизация', 'Express'],
    summary: 'Пишем мини-фреймворк в стиле Express: маршруты с параметрами, CRUD для заметок, коды ответов HTTP.',
    steps: [
      { title: 'Маршрутизатор', lang: 'js', md: 'Напиши `matchRoute(pattern, path)`: шаблон `/notes/:id` и путь `/notes/42` → `{ id: "42" }`; при несовпадении → `null`.', starter: 'function matchRoute(pattern, path) {\n  \n}\n', tests: [{ expr: 'matchRoute("/notes/:id", "/notes/42")', expected: '{"id": "42"}' }, { expr: 'matchRoute("/users/:u/posts/:p", "/users/ann/posts/7")', expected: '{"u": "ann", "p": "7"}' }, { expr: 'matchRoute("/notes", "/notes")', expected: '{}' }, { expr: 'matchRoute("/notes/:id", "/users/1")', expected: 'null' }, { expr: 'matchRoute("/a/:x", "/a/1/2")', expected: 'null' }] },
      { title: 'CRUD-сервер заметок', lang: 'js', md: 'Реализуй `createApp()` с методом `handle(method, path, body)` → `{ status, body }`:\n- `GET /notes` → 200, массив заметок\n- `POST /notes` с `{text}` → 201, созданная заметка `{id, text}` (id с 1)\n- `GET /notes/:id` → 200 или 404 `{error: "Not found"}`\n- `DELETE /notes/:id` → 204 (body `null`) или 404', starter: 'function createApp() {\n  const notes = [];\n  let nextId = 1;\n  return {\n    handle(method, path, body) {\n      \n    },\n  };\n}\n', tests: [{ expr: '(() => { const a = createApp(); a.handle("POST", "/notes", {text: "Купить молоко"}); return a.handle("GET", "/notes/1"); })()', expected: '{"status": 200, "body": {"id": 1, "text": "Купить молоко"}}' }, { expr: '(() => { const a = createApp(); const r = a.handle("POST", "/notes", {text: "A"}); return r.status; })()', expected: '201' }, { expr: 'createApp().handle("GET", "/notes/9").status', expected: '404' }, { expr: '(() => { const a = createApp(); a.handle("POST", "/notes", {text: "A"}); a.handle("DELETE", "/notes/1"); return a.handle("GET", "/notes").body.length; })()', expected: '0' }] },
      { title: 'То же на Express', lang: 'js', md: `На настоящем Node.js с Express код почти такой же:

\`\`\`js
import express from "express";
const app = express();
app.use(express.json());
const notes = [];
let nextId = 1;

app.get("/notes", (req, res) => res.json(notes));
app.post("/notes", (req, res) => {
  const note = { id: nextId++, text: req.body.text };
  notes.push(note);
  res.status(201).json(note);
});
app.get("/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  note ? res.json(note) : res.status(404).json({ error: "Not found" });
});
app.delete("/notes/:id", (req, res) => { /* ... */ });

app.listen(3000, () => console.log("http://localhost:3000"));
\`\`\`

Запусти локально: \`npm init -y && npm i express && node server.js\`. Нажми «Готово».` },
    ],
  },
  {
    id: 'py-auth',
    title: 'Система авторизации',
    icon: '🔐',
    difficulty: 3,
    track: 'python',
    tags: ['безопасность', 'hashlib', 'классы'],
    summary: 'Регистрация и вход с хешированием паролей и «солью», проверка сложности пароля, блокировка после 3 неудачных попыток.',
    steps: [
      { title: 'Проверка пароля', lang: 'python', md: 'Напиши `password_strength(p)`, возвращающую список проблем: `"короткий"` (меньше 8), `"нет цифр"`, `"нет заглавных"`. Надёжный пароль → пустой список.', starter: 'def password_strength(p):\n    problems = []\n    # твой код\n    return problems\n', tests: [{ expr: 'password_strength("abc")', expected: '["короткий", "нет цифр", "нет заглавных"]' }, { expr: 'password_strength("Secret123")', expected: '[]' }, { expr: 'password_strength("longpassword1")', expected: '["нет заглавных"]' }] },
      { title: 'Хеширование', lang: 'python', md: 'Пароли **никогда** не хранят открытым текстом. Напиши `hash_password(password, salt)` → `sha256(salt + password)` в hex и класс `Auth` с методами `register(login, password)` (False, если логин занят) и `login(login, password)`. После 3 неверных попыток подряд вход блокируется (возвращай `"blocked"`).', starter: 'import hashlib\nimport secrets\n\ndef hash_password(password, salt):\n    return hashlib.sha256((salt + password).encode()).hexdigest()\n\nclass Auth:\n    def __init__(self):\n        self.users = {}\n', tests: [{ expr: '(lambda a: (a.register("ann", "Pass1234"), a.register("ann", "x"), a.login("ann", "Pass1234"), a.login("ann", "wrong")))(Auth())', expected: '[true, false, true, false]' }, { expr: '(lambda a: (a.register("bob", "Qwerty12"), [a.login("bob", "no") for _ in range(3)], a.login("bob", "Qwerty12"))[-1])(Auth())', expected: '"blocked"' }, { expr: '(lambda a: (a.register("cid", "Abcdef12"), "Abcdef12" not in str(a.users))[-1])(Auth())', expected: 'true' }] },
    ],
  },
  {
    id: 'py-neural',
    title: 'Мини-нейросеть с нуля',
    icon: '🧠',
    difficulty: 4,
    track: 'python',
    tags: ['ML', 'математика', 'обучение'],
    summary: 'Перцептрон, который сам учится логическим операциям AND и OR. Понимаем, что такое веса, ошибка и обучение.',
    steps: [
      { title: 'Нейрон', lang: 'python', md: `Искусственный нейрон: умножает входы на **веса**, складывает с **смещением** (bias) и пропускает через функцию активации.

\`\`\`text
сумма = x1·w1 + x2·w2 + b
выход = 1, если сумма > 0, иначе 0
\`\`\`

Напиши \`predict(inputs, weights, bias)\`.`, starter: 'def predict(inputs, weights, bias):\n    pass\n', tests: [{ expr: 'predict([1, 1], [0.5, 0.5], -0.7)', expected: '1' }, { expr: 'predict([1, 0], [0.5, 0.5], -0.7)', expected: '0' }, { expr: 'predict([0, 0], [1, 1], 0.5)', expected: '1' }] },
      { title: 'Обучение', lang: 'python', md: `Правило обучения перцептрона: для каждого примера считаем ошибку \`error = target - predict\` и сдвигаем веса:

\`\`\`text
w_i += lr · error · x_i
b   += lr · error
\`\`\`

Напиши \`train(data, epochs=20, lr=0.1)\`, возвращающую \`(weights, bias)\`. Начальные веса — нули. Тест обучит сеть на AND и OR и проверит все 4 случая.`, starter: 'def predict(inputs, weights, bias):\n    s = sum(x * w for x, w in zip(inputs, weights)) + bias\n    return 1 if s > 0 else 0\n\ndef train(data, epochs=20, lr=0.1):\n    weights = [0.0, 0.0]\n    bias = 0.0\n    # твой код\n    return weights, bias\n', tests: [{ name: 'Логическое И (AND)', expr: '(lambda d: (lambda w, b: [predict(x, w, b) for x, _ in d])(*train(d)))([([0,0],0),([0,1],0),([1,0],0),([1,1],1)])', expected: '[0, 0, 0, 1]' }, { name: 'Логическое ИЛИ (OR)', expr: '(lambda d: (lambda w, b: [predict(x, w, b) for x, _ in d])(*train(d)))([([0,0],0),([0,1],1),([1,0],1),([1,1],1)])', expected: '[0, 1, 1, 1]' }] },
      { title: 'Почему XOR не получится', lang: 'python', md: `Попробуй обучить сеть на XOR (исключающее ИЛИ: 1 только когда входы разные). Не выйдет: один нейрон проводит лишь **прямую линию**, а точки XOR нельзя разделить одной прямой. Решение — несколько слоёв нейронов: так появились **глубокие нейросети**, которые мы изучим в главе про PyTorch.

\`\`\`python
xor = [([0,0],0),([0,1],1),([1,0],1),([1,1],0)]
w, b = train(xor, epochs=1000)
print([predict(x, w, b) for x, _ in xor])  # не [0, 1, 1, 0]
\`\`\`

Нажми «Готово».` },
    ],
  },
  {
    id: 'py-parser',
    title: 'Парсер веб-страницы',
    icon: '🕷️',
    difficulty: 3,
    track: 'python',
    tags: ['парсинг', 'BeautifulSoup', 'HTML'],
    summary: 'Извлекаем заголовки, ссылки и цены из HTML с помощью BeautifulSoup (работает прямо в браузере).',
    steps: [
      { title: 'Заголовки новостей', lang: 'python', md: 'Дан HTML страницы новостей. Напиши `get_titles(html)`, возвращающую список текстов всех `<h2 class="title">`. Используй BeautifulSoup: `BeautifulSoup(html, "html.parser")`, `soup.select("h2.title")`, `.get_text(strip=True)`.\n\n> Первый запуск загрузит пакет beautifulsoup4 (пара секунд).', starter: 'from bs4 import BeautifulSoup\n\nHTML = """\n<div class="news">\n  <h2 class="title">Python 4 не выйдет</h2><p>…</p>\n  <h2 class="title"> Вышел новый процессор </h2>\n  <h2 class="ad">Реклама</h2>\n  <h2 class="title">Учёные научили ИИ шутить</h2>\n</div>\n"""\n\ndef get_titles(html):\n    pass\n', tests: [{ expr: 'get_titles(HTML)', expected: '["Python 4 не выйдет", "Вышел новый процессор", "Учёные научили ИИ шутить"]' }] },
      { title: 'Каталог товаров', lang: 'python', md: 'Напиши `parse_products(html)` → список словарей `{"name": ..., "price": int}` для каждого `.product`. Цена записана как `"1 299 ₽"` — убери пробелы и знак рубля.', starter: 'from bs4 import BeautifulSoup\n\nHTML = """\n<ul>\n  <li class="product"><span class="name">Мышь</span><span class="price">1 299 ₽</span></li>\n  <li class="product"><span class="name">Клавиатура</span><span class="price">3 490 ₽</span></li>\n</ul>\n"""\n\ndef parse_products(html):\n    pass\n', tests: [{ expr: 'parse_products(HTML)', expected: '[{"name": "Мышь", "price": 1299}, {"name": "Клавиатура", "price": 3490}]' }] },
    ],
  },
  {
    id: 'web-synth',
    title: 'Музыкальный синтезатор',
    icon: '🎹',
    difficulty: 3,
    track: 'web',
    tags: ['Web Audio', 'события клавиатуры', 'математика звука'],
    summary: 'Пианино в браузере на Web Audio API: ноты по формуле частот, клавиатура компьютера как клавиши, разные тембры.',
    steps: [
      { title: 'Частоты нот', lang: 'js', md: 'Частота ноты на n полутонов выше ноты Ля (440 Гц): `440 · 2^(n/12)`. Напиши `noteFrequency(n)`, округляя до 2 знаков.', starter: 'function noteFrequency(n) {\n  \n}\n', tests: [{ expr: 'noteFrequency(0)', expected: '440' }, { expr: 'noteFrequency(12)', expected: '880' }, { expr: 'noteFrequency(3)', expected: '523.25' }, { expr: 'noteFrequency(-9)', expected: '261.63' }] },
      { title: 'Пианино', lang: 'web', md: 'Клавиши A S D F G H J K играют гамму. `OscillatorNode` генерирует звук, `GainNode` плавно затухает. **Задание:** добавь выбор тембра (sine/square/sawtooth/triangle).', files: { 'index.html': `<!doctype html>\n<html lang="ru">\n<head><meta charset="utf-8"><title>Синтезатор</title><link rel="stylesheet" href="style.css"></head>\n<body>\n  <h1>🎹 Синтезатор</h1>\n  <div id="keys"></div>\n  <p>Нажимай клавиши A S D F G H J K или кликай мышкой</p>\n  <script src="script.js"></script>\n</body>\n</html>\n`, 'style.css': `body { background: #18181b; color: #e4e4e7; font-family: system-ui; text-align: center; }\n#keys { display: inline-flex; gap: 4px; margin-top: 20px; }\n.key { width: 56px; height: 200px; background: #fafafa; color: #18181b; border-radius: 0 0 8px 8px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 10px; font-weight: bold; cursor: pointer; user-select: none; transition: background .1s; }\n.key.on { background: #a78bfa; }\n`, 'script.js': `const ctx = new (window.AudioContext || window.webkitAudioContext)();\nconst notes = [\n  ["A", "До", -9], ["S", "Ре", -7], ["D", "Ми", -5], ["F", "Фа", -4],\n  ["G", "Соль", -2], ["H", "Ля", 0], ["J", "Си", 2], ["K", "До", 3],\n];\nconst noteFrequency = (n) => 440 * 2 ** (n / 12);\n\nfunction play(n, el) {\n  const osc = ctx.createOscillator();\n  const gain = ctx.createGain();\n  osc.type = "triangle";\n  osc.frequency.value = noteFrequency(n);\n  gain.gain.setValueAtTime(0.4, ctx.currentTime);\n  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);\n  osc.connect(gain).connect(ctx.destination);\n  osc.start();\n  osc.stop(ctx.currentTime + 1.2);\n  el.classList.add("on");\n  setTimeout(() => el.classList.remove("on"), 150);\n}\n\nconst box = document.getElementById("keys");\nconst byKey = {};\nfor (const [key, name, n] of notes) {\n  const el = document.createElement("div");\n  el.className = "key";\n  el.innerHTML = name + "<br>" + key;\n  el.onmousedown = () => play(n, el);\n  box.append(el);\n  byKey[key.toLowerCase()] = [n, el];\n}\ndocument.addEventListener("keydown", (e) => {\n  if (e.repeat) return;\n  const k = byKey[e.key.toLowerCase()];\n  if (k) play(...k);\n});\n` } },
    ],
  },
  {
    id: 'web-shop',
    title: 'Интернет-магазин',
    icon: '🛒',
    difficulty: 3,
    track: 'web',
    tags: ['корзина', 'reduce', 'фильтры', 'шаблоны'],
    summary: 'Каталог с поиском и фильтром по категориям, корзина с подсчётом суммы, промокоды и оформление заказа.',
    steps: [
      { title: 'Логика корзины', lang: 'js', md: 'Напиши класс `Cart`: `add(product, qty = 1)`, `remove(id)`, `total()` (сумма с учётом количества) и `applyPromo(code)`: `"SALE10"` даёт скидку 10% на total, неизвестный код → `false`.', starter: 'class Cart {\n  constructor() {\n    this.items = new Map(); // id → { product, qty }\n    this.discount = 0;\n  }\n}\n', tests: [{ expr: '(() => { const c = new Cart(); c.add({id: 1, price: 100}, 2); c.add({id: 2, price: 50}); return c.total(); })()', expected: '250' }, { expr: '(() => { const c = new Cart(); c.add({id: 1, price: 100}); c.add({id: 1, price: 100}); return c.total(); })()', expected: '200' }, { expr: '(() => { const c = new Cart(); c.add({id: 1, price: 300}); c.applyPromo("SALE10"); return c.total(); })()', expected: '270' }, { expr: 'new Cart().applyPromo("FREE")', expected: 'false' }, { expr: '(() => { const c = new Cart(); c.add({id: 1, price: 10}); c.remove(1); return c.total(); })()', expected: '0' }] },
      { title: 'Витрина', lang: 'web', md: 'Каталог рендерится из массива товаров, поиск и фильтр пересчитывают список при вводе. **Задания:** сортировка по цене; сохранение корзины в localStorage; кнопки +/− в корзине.', files: { 'index.html': `<!doctype html>\n<html lang="ru">\n<head><meta charset="utf-8"><title>CodeShop</title><link rel="stylesheet" href="style.css"></head>\n<body>\n  <header><h1>🛒 CodeShop</h1><div id="cartInfo">Корзина: 0 ₽</div></header>\n  <div class="controls"><input id="search" placeholder="Поиск…"><select id="cat"><option value="">Все категории</option></select></div>\n  <div id="grid"></div>\n  <script src="script.js"></script>\n</body>\n</html>\n`, 'style.css': `body { margin: 0; font-family: system-ui; background: #f8fafc; }\nheader { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: #0f172a; color: white; }\n.controls { display: flex; gap: 8px; padding: 16px 24px; }\ninput, select { padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; }\n#grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; padding: 0 24px 24px; }\n.card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 4px 14px #0001; display: flex; flex-direction: column; gap: 6px; }\n.card .emoji { font-size: 3rem; text-align: center; }\n.card button { margin-top: auto; padding: 8px; border: 0; border-radius: 8px; background: #22c55e; color: white; cursor: pointer; }\n`, 'script.js': `const products = [\n  { id: 1, name: "Ноутбук", price: 75000, cat: "Электроника", emoji: "💻" },\n  { id: 2, name: "Наушники", price: 4990, cat: "Электроника", emoji: "🎧" },\n  { id: 3, name: "Книга «Чистый код»", price: 1200, cat: "Книги", emoji: "📘" },\n  { id: 4, name: "Кружка разработчика", price: 650, cat: "Сувениры", emoji: "☕" },\n  { id: 5, name: "Механическая клавиатура", price: 8900, cat: "Электроника", emoji: "⌨️" },\n  { id: 6, name: "Стикеры", price: 300, cat: "Сувениры", emoji: "🏷️" },\n];\nconst cart = new Map();\nconst grid = document.getElementById("grid");\nconst search = document.getElementById("search");\nconst cat = document.getElementById("cat");\n\nfor (const c of [...new Set(products.map((p) => p.cat))]) cat.add(new Option(c, c));\n\nfunction render() {\n  const q = search.value.toLowerCase();\n  grid.innerHTML = "";\n  products\n    .filter((p) => p.name.toLowerCase().includes(q) && (!cat.value || p.cat === cat.value))\n    .forEach((p) => {\n      const card = document.createElement("div");\n      card.className = "card";\n      card.innerHTML = '<div class="emoji">' + p.emoji + "</div><b></b><span>" + p.price.toLocaleString("ru") + " ₽</span><button>В корзину</button>";\n      card.querySelector("b").textContent = p.name;\n      card.querySelector("button").onclick = () => { cart.set(p.id, (cart.get(p.id) ?? 0) + 1); updateCart(); };\n      grid.append(card);\n    });\n}\n\nfunction updateCart() {\n  const total = [...cart].reduce((sum, [id, qty]) => sum + products.find((p) => p.id === id).price * qty, 0);\n  const count = [...cart.values()].reduce((a, b) => a + b, 0);\n  document.getElementById("cartInfo").textContent = "Корзина: " + count + " шт · " + total.toLocaleString("ru") + " ₽";\n}\n\nsearch.oninput = render;\ncat.onchange = render;\nrender();\n` } },
    ],
  },
  {
    id: 'web-editor',
    title: 'Текстовый редактор с Markdown',
    icon: '✍️',
    difficulty: 2,
    track: 'web',
    tags: ['textarea', 'регулярные выражения', 'автосохранение'],
    summary: 'Блокнот с живым предпросмотром Markdown, счётчиком слов, автосохранением и экспортом в файл.',
    steps: [
      { title: 'Мини-Markdown', lang: 'js', md: 'Напиши `md(line)`, превращающую одну строку Markdown в HTML: `# Заголовок` → `<h1>Заголовок</h1>`, `## X` → `<h2>X</h2>`, `- пункт` → `<li>пункт</li>`, `**жирный**` внутри строки → `<b>жирный</b>`, иначе `<p>текст</p>`.', starter: 'function md(line) {\n  \n}\n', tests: [{ expr: 'md("# Привет")', expected: '"<h1>Привет</h1>"' }, { expr: 'md("## Раздел")', expected: '"<h2>Раздел</h2>"' }, { expr: 'md("- пункт")', expected: '"<li>пункт</li>"' }, { expr: 'md("это **важно** знать")', expected: '"<p>это <b>важно</b> знать</p>"' }] },
      { title: 'Редактор', lang: 'web', md: 'Слева — текст, справа — предпросмотр. Сохранение в localStorage при каждом вводе, экспорт в .md файл. **Задание:** добавь поддержку `*курсива*` и кнопку «тёмная тема».', files: { 'index.html': `<!doctype html>\n<html lang="ru">\n<head><meta charset="utf-8"><title>Блокнот</title><link rel="stylesheet" href="style.css"></head>\n<body>\n  <header>✍️ Блокнот <span id="stats"></span> <button id="export">Скачать .md</button></header>\n  <main><textarea id="text"></textarea><article id="preview"></article></main>\n  <script src="script.js"></script>\n</body>\n</html>\n`, 'style.css': `body { margin: 0; font-family: system-ui; height: 100vh; display: flex; flex-direction: column; }\nheader { padding: 10px 16px; background: #1e293b; color: white; display: flex; gap: 16px; align-items: center; }\nheader button { margin-left: auto; }\nmain { flex: 1; display: grid; grid-template-columns: 1fr 1fr; }\ntextarea { border: 0; padding: 16px; font: 15px/1.6 monospace; resize: none; border-right: 1px solid #e2e8f0; outline: none; }\narticle { padding: 16px; overflow: auto; }\n#stats { color: #94a3b8; font-size: .9rem; }\n`, 'script.js': `const text = document.getElementById("text");\nconst preview = document.getElementById("preview");\nconst esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");\n\nfunction md(line) {\n  const inline = (s) => esc(s).replace(/\\*\\*(.+?)\\*\\*/g, "<b>$1</b>");\n  if (line.startsWith("## ")) return "<h2>" + inline(line.slice(3)) + "</h2>";\n  if (line.startsWith("# ")) return "<h1>" + inline(line.slice(2)) + "</h1>";\n  if (line.startsWith("- ")) return "<li>" + inline(line.slice(2)) + "</li>";\n  return line.trim() ? "<p>" + inline(line) + "</p>" : "";\n}\n\nfunction update() {\n  preview.innerHTML = text.value.split("\\n").map(md).join("");\n  const words = text.value.split(/\\s+/).filter(Boolean).length;\n  document.getElementById("stats").textContent = words + " слов · " + text.value.length + " символов";\n  localStorage.setItem("notepad", text.value);\n}\n\ntext.value = localStorage.getItem("notepad") ?? "# Мои заметки\\n\\nЭто **мой** блокнот.\\n\\n- пункт 1\\n- пункт 2";\ntext.oninput = update;\ndocument.getElementById("export").onclick = () => {\n  const a = document.createElement("a");\n  a.href = URL.createObjectURL(new Blob([text.value], { type: "text/markdown" }));\n  a.download = "notes.md";\n  a.click();\n};\nupdate();\n` } },
    ],
  },
];

/** Каталог идей проектов с техническим заданием — для самостоятельной практики. */
export const PROJECT_IDEAS: { title: string; level: 1 | 2 | 3 | 4 | 5; stack: string; spec: string }[] = [
  { title: 'Генератор паролей', level: 1, stack: 'Python', spec: 'Длина и наборы символов задаются пользователем, проверка надёжности, копирование.' },
  { title: 'Конвертер валют', level: 1, stack: 'Python/JS', spec: 'Курсы из API, история конвертаций, обработка ошибок сети.' },
  { title: 'Камень-ножницы-бумага', level: 1, stack: 'Python', spec: 'Игра против компьютера до 3 побед, статистика.' },
  { title: 'Виселица', level: 1, stack: 'Python', spec: 'Случайное слово из списка, ASCII-рисунок, учёт ошибок.' },
  { title: 'Таймер Pomodoro', level: 1, stack: 'Web', spec: '25/5 минут, звук, счётчик циклов, сохранение настроек.' },
  { title: 'Квиз-игра', level: 1, stack: 'Web', spec: 'Вопросы из JSON, таймер, итоговый результат.' },
  { title: 'Список покупок', level: 1, stack: 'Web', spec: 'Добавление, отметка, категории, localStorage.' },
  { title: 'Крестики-нолики', level: 2, stack: 'Web', spec: 'Два игрока и бот с алгоритмом минимакс.' },
  { title: 'Галерея изображений', level: 2, stack: 'Web', spec: 'Сетка, лайтбокс, фильтры по тегам, ленивая загрузка.' },
  { title: 'Трекер привычек', level: 2, stack: 'Web', spec: 'Календарь отметок, серии, графики прогресса.' },
  { title: 'Бюджет-трекер', level: 2, stack: 'Python/Web', spec: 'Доходы/расходы, категории, отчёт за месяц, экспорт CSV.' },
  { title: 'Чат-бот поддержки', level: 2, stack: 'Python', spec: 'Ответы по ключевым словам, сценарии, логирование диалогов.' },
  { title: 'Мемори (пары карточек)', level: 2, stack: 'Web', spec: 'Переворот карт, счёт ходов, таймер, уровни сложности.' },
  { title: 'Сапёр', level: 3, stack: 'Web', spec: 'Генерация поля, флажки, рекурсивное открытие пустых клеток.' },
  { title: 'Тетрис', level: 3, stack: 'Web/Canvas', spec: 'Фигуры, вращение, удаление линий, ускорение, рекорды.' },
  { title: 'Платформер', level: 4, stack: 'Web/Canvas', spec: 'Гравитация, прыжки, столкновения, уровни из массива, камера.' },
  { title: 'Арканоид', level: 3, stack: 'Web/Canvas', spec: 'Кирпичи, бонусы, жизни, физика отражений.' },
  { title: 'Flappy Bird', level: 3, stack: 'Web/Canvas', spec: 'Генерация труб, гравитация, счёт.' },
  { title: 'Игра «Жизнь» Конвея', level: 3, stack: 'Python/Web', spec: 'Клеточный автомат, редактор начального состояния.' },
  { title: 'Чат в реальном времени', level: 4, stack: 'Node.js + WebSocket', spec: 'Комнаты, никнеймы, история сообщений, «печатает…».' },
  { title: 'Блог', level: 4, stack: 'Flask/Django или Next.js', spec: 'Посты, комментарии, авторизация, Markdown, пагинация.' },
  { title: 'Форум', level: 4, stack: 'Django/Express + PostgreSQL', spec: 'Разделы, темы, роли, модерация, поиск.' },
  { title: 'Сокращатель ссылок', level: 3, stack: 'FastAPI/Express', spec: 'Короткие коды, редирект, статистика переходов.' },
  { title: 'REST API библиотеки', level: 3, stack: 'FastAPI', spec: 'CRUD книг и авторов, фильтры, валидация, документация OpenAPI.' },
  { title: 'Парсер вакансий', level: 3, stack: 'Python + BeautifulSoup', spec: 'Сбор вакансий, фильтр по зарплате, выгрузка в Excel.' },
  { title: 'Telegram-бот напоминаний', level: 3, stack: 'Python + aiogram', spec: 'Напоминания по времени, часовые пояса, SQLite.' },
  { title: 'Discord-бот модератор', level: 3, stack: 'discord.js', spec: 'Фильтр слов, предупреждения, роли, логирование.' },
  { title: 'Музыкальный плеер', level: 3, stack: 'Web', spec: 'Плейлист, прогресс-бар, визуализатор частот (AnalyserNode).' },
  { title: 'Файловый менеджер', level: 3, stack: 'Python/Electron', spec: 'Навигация, копирование, поиск, предпросмотр файлов.' },
  { title: 'Простой браузер', level: 4, stack: 'Electron', spec: 'Вкладки, адресная строка, история, закладки.' },
  { title: 'Собственный игровой движок', level: 5, stack: 'JS/Canvas', spec: 'Сцены, спрайты, система сущностей, ввод, звук.' },
  { title: 'Интерпретатор мини-языка', level: 5, stack: 'Python', spec: 'Лексер, парсер, AST, выполнение переменных, условий и циклов.' },
  { title: 'Распознавание рукописных цифр', level: 5, stack: 'PyTorch', spec: 'Обучение на MNIST, точность > 98%, веб-демо с рисованием.' },
  { title: 'Рекомендательная система фильмов', level: 4, stack: 'Pandas + scikit-learn', spec: 'Коллаборативная фильтрация, метрики качества.' },
  { title: 'Детектор лиц на видео', level: 4, stack: 'OpenCV', spec: 'Поток с камеры, рамки лиц, размытие фона.' },
  { title: 'Дашборд криптовалют', level: 3, stack: 'React', spec: 'Графики цен, избранное, обновление в реальном времени.' },
  { title: 'Kanban-доска', level: 3, stack: 'React', spec: 'Колонки, перетаскивание карточек, сохранение.' },
  { title: 'Видеозвонки', level: 5, stack: 'WebRTC + Node.js', spec: 'Сигнальный сервер, комнаты, демонстрация экрана.' },
  { title: 'PWA-заметки офлайн', level: 4, stack: 'Service Worker + IndexedDB', spec: 'Работа без сети, синхронизация, установка на телефон.' },
  { title: 'CI/CD для своего проекта', level: 4, stack: 'GitHub Actions + Docker', spec: 'Тесты на каждый пуш, сборка образа, автодеплой.' },
  { title: '3D-галерея', level: 4, stack: 'Three.js', spec: 'Комната с картинами, управление камерой, освещение.' },
  { title: 'Своя библиотека валидации', level: 4, stack: 'TypeScript', spec: 'Схемы, понятные ошибки, публикация в npm.' },
  { title: 'Автоматизация отчётов', level: 3, stack: 'Python + openpyxl', spec: 'Сбор данных из CSV, сводная таблица, рассылка по почте.' },
  { title: 'Система мониторинга сайтов', level: 4, stack: 'Python AsyncIO', spec: 'Проверка доступности сотен сайтов параллельно, уведомления.' },
];
