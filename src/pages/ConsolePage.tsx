import { Terminal } from '../components/Terminal';
import { navigate } from '../router';

const CHALLENGES = [
  { title: 'Навигация', cmds: 'pwd → ls → cd projects → ls → cd ..' },
  { title: 'Файлы', cmds: 'mkdir lab && cd lab → touch a.txt → echo привет > a.txt → cat a.txt' },
  { title: 'Запуск программ', cmds: 'python hello.py → node hello.js → python (REPL), exit()' },
  { title: 'Конвейеры', cmds: 'cat hello.py | grep print | wc -l' },
  { title: 'Git', cmds: 'git init → git add . → git commit -m "init" → git log --oneline' },
  { title: 'Ветки и слияние', cmds: 'git checkout -b feature → изменить файл → git commit -am "..." → git checkout main → git merge feature' },
  { title: 'Пакеты', cmds: 'pip install numpy → python (REPL) → import numpy as np' },
];

export function ConsolePage() {
  return (
    <div className="page console-page">
      <h1>⌨️ Виртуальная консоль</h1>
      <p className="muted">
        Настоящая оболочка с файловой системой, Python, Node.js-песочницей, Git, npm и pip. Всё происходит в безопасной песочнице — ничего нельзя сломать. Файлы общие с <a href="#/ide" onClick={(e) => (e.preventDefault(), navigate('/ide'))}>IDE</a>.
      </p>
      <Terminal height={Math.max(360, Math.min(620, window.innerHeight - 260))} />
      <section className="card">
        <div className="card-label">🧪 Попробуй сам</div>
        <div className="challenge-grid">
          {CHALLENGES.map((c) => (
            <div key={c.title} className="challenge">
              <b>{c.title}</b>
              <code>{c.cmds}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
