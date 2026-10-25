// Мини-игры: скоростные викторины по генераторам заданий, тренажёр печати кода и «Робот-программист».
import { useEffect, useMemo, useRef, useState } from 'react';
import { GENERATORS, GenQuestion, randomQuestion } from '../content/generators';
import { getState, setState, useStore } from '../store/progress';
import { awardXp, recordAnswer, track } from '../store/actions';
import { navigate } from '../router';
import { CodeBlock } from '../components/Markdown';
import type { Lang } from '../content/types';

interface GameInfo {
  id: string;
  title: string;
  icon: string;
  description: string;
  generators?: string[];
  seconds?: number;
}

export const GAMES: GameInfo[] = [
  { id: 'output-rush', title: 'Что выведет?', icon: '⚡', description: '60 секунд, чтобы предсказать вывод как можно большего числа программ. Серия правильных ответов умножает очки.', generators: ['arithmetic', 'loops', 'strings', 'conditions', 'lists', 'types'], seconds: 60 },
  { id: 'bug-hunt', title: 'Охота на баги', icon: '🐞', description: 'Найди строку с ошибкой быстрее, чем баг доберётся до продакшена! 45 секунд.', generators: ['bugs'], seconds: 45 },
  { id: 'binary-blitz', title: 'Бинарный блиц', icon: '0️⃣', description: 'Переводи числа из двоичной системы в десятичную на скорость.', generators: ['binary'], seconds: 45 },
  { id: 'logic-race', title: 'Логическая гонка', icon: '⚖️', description: 'Приоритет операторов, логика и типы данных — успей ответить!', generators: ['logic', 'types', 'arithmetic'], seconds: 50 },
  { id: 'terminal-master', title: 'Мастер терминала', icon: '⌨️', description: 'Выбирай правильные команды терминала и Git.', generators: ['terminal'], seconds: 45 },
  { id: 'code-typer', title: 'Скоростная печать кода', icon: '⌨', description: 'Набери фрагменты кода без ошибок. Скобки, кавычки и отступы — всё как в реальной работе.' },
  { id: 'robot', title: 'Робот-программист', icon: '🤖', description: 'Составь программу из команд и циклов, чтобы робот дошёл до цели. Учит алгоритмическому мышлению.' },
];

export function Games() {
  const best = useStore((s) => s.games);
  return (
    <div className="page games">
      <h1>🎮 Мини-игры</h1>
      <p className="muted">Каждая игра генерирует новые задания — повторений не будет. Играя, ты закрепляешь темы и получаешь опыт.</p>
      <div className="game-grid">
        {GAMES.map((g) => (
          <button key={g.id} className="game-card" onClick={() => navigate(`/game/${g.id}`)}>
            <div className="game-icon">{g.icon}</div>
            <h3>{g.title}</h3>
            <p className="muted small">{g.description}</p>
            {best[g.id] !== undefined && <div className="best">🏆 Рекорд: {best[g.id]}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function finishGame(id: string, score: number, xp: number, metric?: 'bugs') {
  const prev = getState().games[id] ?? 0;
  setState((s) => {
    s.games[id] = Math.max(prev, score);
  });
  track('games');
  if (metric) track(metric, Math.floor(score / 10));
  if (xp > 0) awardXp(xp, `Мини-игра`, { metric });
  return score > prev;
}

function QuizRush({ game }: { game: GameInfo }) {
  const preferred = useStore((s) => s.settings.preferredLang);
  const [lang, setLang] = useState<Lang>(preferred);
  const [phase, setPhase] = useState<'start' | 'play' | 'end'>('start');
  const [q, setQ] = useState<GenQuestion | null>(null);
  const [left, setLeft] = useState(game.seconds ?? 60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({ ok: 0, fail: 0 });
  const [flash, setFlash] = useState<'ok' | 'fail' | null>(null);
  const [record, setRecord] = useState(false);
  const topics = useMemo(() => game.generators!.flatMap((g) => GENERATORS[g].topics), [game]);

  const nextQ = () => setQ(randomQuestion(lang, topics));
  useEffect(() => {
    if (phase !== 'play') return;
    if (left <= 0) {
      setPhase('end');
      setRecord(finishGame(game.id, score, Math.round(score / 4), game.id === 'bug-hunt' ? 'bugs' : undefined));
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left, game.id, score]);

  useEffect(() => {
    if (phase !== 'play') return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= (q?.options.length ?? 0)) answer(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const start = () => {
    setScore(0);
    setCombo(0);
    setStats({ ok: 0, fail: 0 });
    setLeft(game.seconds ?? 60);
    setPhase('play');
    nextQ();
  };
  const answer = (i: number) => {
    if (!q) return;
    const ok = i === q.answer;
    recordAnswer(q.topic, ok, 'game');
    if (ok) {
      const mult = 1 + Math.min(4, Math.floor(combo / 3));
      setScore((s) => s + 10 * mult);
      setCombo((c) => c + 1);
      setStats((s) => ({ ...s, ok: s.ok + 1 }));
    } else {
      setCombo(0);
      setStats((s) => ({ ...s, fail: s.fail + 1 }));
    }
    setFlash(ok ? 'ok' : 'fail');
    setTimeout(() => setFlash(null), 250);
    nextQ();
  };

  if (phase === 'start')
    return (
      <div className="game-start">
        <div className="game-icon big">{game.icon}</div>
        <h1>{game.title}</h1>
        <p>{game.description}</p>
        {game.id !== 'terminal-master' && game.id !== 'binary-blitz' && (
          <div className="lang-switch">
            <button className={lang === 'python' ? 'active' : ''} onClick={() => setLang('python')}>🐍 Python</button>
            <button className={lang === 'js' ? 'active' : ''} onClick={() => setLang('js')}>🟨 JavaScript</button>
          </div>
        )}
        <p className="muted small">Подсказка: отвечать можно клавишами 1–4.</p>
        <button className="btn btn-primary btn-lg" onClick={start}>▶ Играть</button>
      </div>
    );
  if (phase === 'end')
    return (
      <div className="game-start">
        <div className="game-icon big">{record ? '🏆' : '🎯'}</div>
        <h1>{record ? 'Новый рекорд!' : 'Время вышло!'}</h1>
        <div className="finish-stats">
          <div><b>{score}</b><span>очков</span></div>
          <div><b>{stats.ok}</b><span>верно</span></div>
          <div><b>{stats.fail}</b><span>ошибок</span></div>
        </div>
        <div className="toolbar center">
          <button className="btn btn-primary btn-lg" onClick={start}>↻ Ещё раз</button>
          <button className="btn" onClick={() => navigate('/games')}>Другие игры</button>
        </div>
      </div>
    );
  return (
    <div className={`quiz-rush ${flash ?? ''}`}>
      <div className="rush-top">
        <span>⏱ {left} с</span>
        <span>⭐ {score}</span>
        <span className={combo >= 3 ? 'combo hot' : 'combo'}>🔥 x{1 + Math.min(4, Math.floor(combo / 3))}</span>
      </div>
      <div className="qte-bar"><div style={{ width: `${(left / (game.seconds ?? 60)) * 100}%` }} /></div>
      {q && (
        <div className="rush-q">
          <div className="qte-q">{q.question}</div>
          {q.code && <CodeBlock code={q.code} lang={q.lang ?? 'js'} />}
          <div className="qte-options">
            {q.options.map((o, i) => (
              <button key={`${o}-${i}`} className="option" onClick={() => answer(i)}>
                <span className="option-mark">{i + 1}</span> {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TYPER_SNIPPETS: { lang: Lang; code: string }[] = [
  { lang: 'python', code: 'for i in range(10):\n    print(i * i)' },
  { lang: 'python', code: 'def greet(name):\n    return f"Привет, {name}!"' },
  { lang: 'python', code: 'squares = [x ** 2 for x in nums if x > 0]' },
  { lang: 'python', code: 'with open("data.txt") as f:\n    lines = f.readlines()' },
  { lang: 'python', code: 'counts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1' },
  { lang: 'js', code: 'const total = items.reduce((sum, x) => sum + x.price, 0);' },
  { lang: 'js', code: 'document.querySelector("#btn").addEventListener("click", () => {\n  count++;\n});' },
  { lang: 'js', code: 'for (let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}' },
  { lang: 'js', code: 'const user = { name: "Аня", age: 17, skills: ["JS", "CSS"] };' },
  { lang: 'js', code: 'async function load(url) {\n  const res = await fetch(url);\n  return res.json();\n}' },
];

function CodeTyper() {
  const [round, setRound] = useState<typeof TYPER_SNIPPETS>([]);
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(0);
  const [startAt, setStartAt] = useState(0);
  const [result, setResult] = useState<{ wpm: number; acc: number; record: boolean } | null>(null);
  const totalChars = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const start = () => {
    setRound([...TYPER_SNIPPETS].sort(() => Math.random() - 0.5).slice(0, 3));
    setI(0);
    setTyped('');
    setErrors(0);
    setStartAt(0);
    setResult(null);
    totalChars.current = 0;
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const target = round[i]?.code ?? '';
  const onInput = (v: string) => {
    if (!startAt) setStartAt(Date.now());
    // Автоотступ: после перевода строки подставляем пробелы, как в редакторе.
    if (v.length > typed.length && v.endsWith('\n')) {
      const indent = target.slice(v.length).match(/^ */)![0];
      v += indent;
    }
    if (v.length > typed.length) {
      const ch = v[v.length - 1];
      if (ch !== target[v.length - 1] && !v.endsWith('\n')) setErrors((e) => e + 1);
    }
    setTyped(v);
    if (v === target) {
      totalChars.current += target.length;
      if (i + 1 < round.length) {
        setI(i + 1);
        setTyped('');
      } else {
        const minutes = (Date.now() - startAt) / 60000;
        const wpm = Math.round(totalChars.current / 5 / Math.max(minutes, 0.01));
        const acc = Math.max(0, Math.round((1 - errors / Math.max(1, totalChars.current)) * 100));
        const score = Math.round((wpm * acc) / 100);
        const record = finishGame('code-typer', score, Math.round(score / 2));
        setResult({ wpm, acc, record });
      }
    }
  };

  if (!round.length || result)
    return (
      <div className="game-start">
        <div className="game-icon big">⌨</div>
        <h1>Скоростная печать кода</h1>
        {result ? (
          <>
            <div className="finish-stats">
              <div><b>{result.wpm}</b><span>слов/мин</span></div>
              <div><b>{result.acc}%</b><span>точность</span></div>
            </div>
            {result.record && <p>🏆 Новый рекорд!</p>}
          </>
        ) : (
          <p>Набери 3 фрагмента кода. Отступы после Enter ставятся автоматически.</p>
        )}
        <button className="btn btn-primary btn-lg" onClick={start}>{result ? '↻ Ещё раз' : '▶ Начать'}</button>
      </div>
    );

  return (
    <div className="typer">
      <div className="muted small">Фрагмент {i + 1} из {round.length} · ошибок: {errors}</div>
      <pre className="typer-target" onClick={() => inputRef.current?.focus()}>
        {target.split('').map((ch, k) => (
          <span key={k} className={k < typed.length ? (typed[k] === ch ? 'ok' : 'bad') : k === typed.length ? 'cursor' : ''}>
            {ch === '\n' ? '↵\n' : ch}
          </span>
        ))}
      </pre>
      <textarea ref={inputRef} className="typer-input" value={typed} onChange={(e) => onInput(e.target.value)} spellCheck={false} autoCapitalize="off" autoComplete="off" rows={4} aria-label="Поле для набора кода" />
    </div>
  );
}

// ───────────── Робот-программист ─────────────
type Cmd = { op: 'F' | 'L' | 'R'; times: number };
interface Level {
  map: string[]; // # — стена, S — старт, G — цель, . — пусто
  dir: 0 | 1 | 2 | 3; // 0 — вверх, 1 — вправо, 2 — вниз, 3 — влево
  maxCmds: number;
  tip: string;
}
const LEVELS: Level[] = [
  { map: ['S...G'], dir: 1, maxCmds: 1, tip: 'Одна команда «вперёд» с повтором ×4. Нажимай на команду в программе, чтобы менять число повторов.' },
  { map: ['S..#', '#..#', '#..G'], dir: 1, maxCmds: 5, tip: 'Повороты меняют направление, но не двигают робота.' },
  { map: ['G...#', '###.#', 'S...#'], dir: 1, maxCmds: 5, tip: 'Подумай о маршруте змейкой.' },
  { map: ['S.#...', '..#.#.', '..#.#.', '....#G'], dir: 2, maxCmds: 9, tip: 'Иногда нужно вернуться назад, чтобы обойти стену.' },
  { map: ['#######', '#S....#', '#####.#', '#G....#', '#######'], dir: 1, maxCmds: 5, tip: 'Используй повторы — длинные коридоры проходятся одной командой.' },
  { map: ['S......', '######.', 'G......'], dir: 1, maxCmds: 5, tip: 'Длинный коридор и два поворота в одну сторону — обойдёшься пятью командами.' },
  { map: ['S.#....', '..#.##.', '..#..#.', '.###.#.', '.....#G'], dir: 2, maxCmds: 13, tip: 'Финальное испытание: найди кратчайший путь.' },
];
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const ARROWS = ['⬆️', '➡️', '⬇️', '⬅️'];

function Robot() {
  const [lvl, setLvl] = useState(0);
  const [prog, setProg] = useState<Cmd[]>([]);
  const [pos, setPos] = useState<{ x: number; y: number; d: number } | null>(null);
  const [status, setStatus] = useState<'edit' | 'run' | 'win' | 'crash'>('edit');
  const level = LEVELS[lvl];
  const start = useMemo(() => {
    for (let y = 0; y < level.map.length; y++) {
      const x = level.map[y].indexOf('S');
      if (x >= 0) return { x, y, d: level.dir };
    }
    return { x: 0, y: 0, d: 0 };
  }, [level]);
  const robot = pos ?? start;

  const run = async () => {
    setStatus('run');
    let cur = { ...start };
    setPos(cur);
    const steps: ('F' | 'L' | 'R')[] = prog.flatMap((c) => Array<'F' | 'L' | 'R'>(c.times).fill(c.op));
    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 320));
      if (s === 'L') cur = { ...cur, d: (cur.d + 3) % 4 };
      else if (s === 'R') cur = { ...cur, d: (cur.d + 1) % 4 };
      else {
        const nx = cur.x + DIRS[cur.d][0];
        const ny = cur.y + DIRS[cur.d][1];
        const cell = level.map[ny]?.[nx];
        if (cell === undefined || cell === '#') {
          setStatus('crash');
          recordAnswer('algorithms', false, 'robot');
          return;
        }
        cur = { ...cur, x: nx, y: ny };
      }
      setPos(cur);
    }
    if (level.map[cur.y][cur.x] === 'G') {
      setStatus('win');
      recordAnswer('algorithms', true, 'robot');
      const best = getState().games.robot ?? 0;
      if (lvl + 1 > best) finishGame('robot', lvl + 1, 20 + lvl * 10);
    } else setStatus('crash');
  };

  const add = (op: Cmd['op']) => {
    if (status === 'run') return;
    setStatus('edit');
    setPos(null);
    const last = prog.at(-1);
    if (last && last.op === op && last.times < 9) setProg([...prog.slice(0, -1), { ...last, times: last.times + 1 }]);
    else if (prog.length < level.maxCmds) setProg([...prog, { op, times: 1 }]);
  };
  const cycle = (i: number) => {
    if (status === 'run') return;
    setPos(null);
    setStatus('edit');
    setProg(prog.map((c, k) => (k === i ? { ...c, times: (c.times % 9) + 1 } : c)));
  };
  const reset = (to = lvl) => {
    setLvl(to);
    setProg([]);
    setPos(null);
    setStatus('edit');
  };
  const label = { F: '⬆ вперёд', L: '↺ налево', R: '↻ направо' };

  return (
    <div className="robot">
      <div className="robot-head">
        <h2>Уровень {lvl + 1} / {LEVELS.length}</h2>
        <span className="muted small">Команд: {prog.length} / {level.maxCmds}</span>
      </div>
      <p className="muted small">💡 {level.tip}</p>
      <div className="robot-board" style={{ gridTemplateColumns: `repeat(${level.map[0].length}, 1fr)` }}>
        {level.map.flatMap((row, y) =>
          row.split('').map((c, x) => (
            <div key={`${x}-${y}`} className={`cell ${c === '#' ? 'wall' : ''} ${c === 'G' ? 'goal' : ''}`}>
              {robot.x === x && robot.y === y ? <span className="bot" style={{ transform: `rotate(${robot.d * 90}deg)` }}>🤖</span> : c === 'G' ? '🏁' : ''}
            </div>
          )),
        )}
      </div>
      <div className="robot-prog">
        <div className="muted small">Программа (нажми на команду, чтобы изменить число повторов):</div>
        <div className="prog-list">
          {prog.length === 0 && <span className="muted small">пусто — добавь команды кнопками ниже</span>}
          {prog.map((c, i) => (
            <button key={i} className="prog-cmd" onClick={() => cycle(i)}>
              {label[c.op]} {c.times > 1 && <b>×{c.times}</b>}
            </button>
          ))}
        </div>
        <div className="toolbar">
          <button className="btn" onClick={() => add('F')}>⬆ Вперёд</button>
          <button className="btn" onClick={() => add('L')}>↺ Налево</button>
          <button className="btn" onClick={() => add('R')}>↻ Направо</button>
          <button className="btn btn-ghost" onClick={() => { setProg(prog.slice(0, -1)); setPos(null); setStatus('edit'); }}>⌫</button>
          <button className="btn btn-primary" onClick={run} disabled={!prog.length || status === 'run'}>▶ Запустить</button>
        </div>
        <pre className="robot-code">{`# Твоя программа на Python:\n${prog.map((c) => (c.times > 1 ? `for _ in range(${c.times}):\n    ${c.op === 'F' ? 'robot.forward()' : c.op === 'L' ? 'robot.left()' : 'robot.right()'}` : c.op === 'F' ? 'robot.forward()' : c.op === 'L' ? 'robot.left()' : 'robot.right()')).join('\n') || '# пусто'}`}</pre>
      </div>
      {status === 'win' && (
        <div className="feedback good">
          <b>🎉 Робот дошёл до цели!</b>
          {lvl + 1 < LEVELS.length ? <button className="btn btn-primary" onClick={() => reset(lvl + 1)}>Следующий уровень →</button> : <span> Ты прошёл все уровни — настоящий алгоритмист! 🏆</span>}
        </div>
      )}
      {status === 'crash' && (
        <div className="feedback bad">
          <b>💥 Робот врезался или не дошёл до флага.</b> Проверь программу шаг за шагом. <button className="btn btn-sm" onClick={() => { setPos(null); setStatus('edit'); }}>Исправить</button>
        </div>
      )}
      <div className="muted small">Направление робота сейчас: {ARROWS[robot.d]}</div>
    </div>
  );
}

export function GamePage({ id }: { id: string }) {
  const game = GAMES.find((g) => g.id === id);
  if (!game) return <div className="page">Игра не найдена</div>;
  return (
    <div className="page game-page">
      <button className="btn btn-ghost" onClick={() => navigate('/games')}>← Все игры</button>
      {game.generators && <QuizRush game={game} />}
      {id === 'code-typer' && <CodeTyper />}
      {id === 'robot' && <Robot />}
    </div>
  );
}
