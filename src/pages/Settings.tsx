// Настройки: внешний вид, обучение, ИИ-наставник (Claude), синхронизация между устройствами, данные.
import { useRef, useState } from 'react';
import { resetProgress, setState, toast, useStore } from '../store/progress';
import { exportProgress, importProgress, syncNow } from '../store/sync';
import { resetVfs } from '../runtime/vfs';
import { useCourse } from '../store/course';
import { navigate } from '../router';
import { isPythonReady, pythonVersion, warmupPython } from '../runtime/runner';

export function Settings() {
  const settings = useStore((s) => s.settings);
  const course = useCourse();
  const set = <K extends keyof typeof settings>(k: K, v: (typeof settings)[K]) => setState((s) => void (s.settings[k] = v));
  const fileRef = useRef<HTMLInputElement>(null);
  const [pyStatus, setPyStatus] = useState(isPythonReady() ? `Python ${pythonVersion()} готов` : '');

  const genToken = () => set('syncToken', Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join(''));

  return (
    <div className="page settings">
      <h1>⚙️ Настройки</h1>

      <section className="card">
        <div className="card-label">🎨 Внешний вид</div>
        <div className="setting">
          <span>Тема</span>
          <div className="lang-switch">
            <button className={settings.theme === 'dark' ? 'active' : ''} onClick={() => set('theme', 'dark')}>🌙 Тёмная</button>
            <button className={settings.theme === 'light' ? 'active' : ''} onClick={() => set('theme', 'light')}>☀️ Светлая</button>
          </div>
        </div>
        <div className="setting">
          <span>Размер шрифта редактора: {settings.fontSize}px</span>
          <input type="range" min={11} max={22} value={settings.fontSize} onChange={(e) => set('fontSize', Number(e.target.value))} />
        </div>
        <label className="setting">
          <span>Уменьшить анимации</span>
          <input type="checkbox" checked={settings.reducedMotion} onChange={(e) => set('reducedMotion', e.target.checked)} />
        </label>
      </section>

      <section className="card">
        <div className="card-label">🎓 Обучение</div>
        <div className="setting">
          <span>Курс: <b>{course ? `${course.icon} ${course.title}` : 'не выбран'}</b></span>
          <button className="btn btn-sm" onClick={() => navigate('/courses')}>Сменить курс</button>
        </div>
        <label className="setting">
          <span>
            Режим «только программирование»
            <br />
            <small className="muted">Скрывает мини-игры, собеседование и сезонные события — остаются курс, практика и инструменты.</small>
          </span>
          <input type="checkbox" checked={settings.focusMode} onChange={(e) => set('focusMode', e.target.checked)} />
        </label>
        <label className="setting">
          <span>Quick Time Events во время уроков</span>
          <input type="checkbox" checked={settings.qte} onChange={(e) => set('qte', e.target.checked)} />
        </label>
        <div className="setting">
          <span>Python в браузере (Pyodide) {pyStatus && <small className="muted">— {pyStatus}</small>}</span>
          <button className="btn btn-sm" onClick={async () => { setPyStatus('загрузка…'); await warmupPython({ onStatus: setPyStatus }); setPyStatus(`Python ${pythonVersion()} готов`); }}>Загрузить заранее</button>
        </div>
      </section>

      <section className="card">
        <div className="card-label">🤖 ИИ-наставник (Claude)</div>
        <p className="muted small">Без ключа помощник работает локально: объясняет ошибки, даёт подсказки, показывает переменные по шагам. С ключом Claude API он ведёт свободный диалог, разбирает любой код и объясняет разные способы решения. Ключ хранится только в этом браузере и не синхронизируется.</p>
        <div className="setting col">
          <span>API-ключ Anthropic</span>
          <input className="input" type="password" placeholder="sk-ant-..." value={settings.aiKey} onChange={(e) => set('aiKey', e.target.value.trim())} autoComplete="off" />
        </div>
        <div className="setting col">
          <span>Модель</span>
          <select className="input" value={settings.aiModel} onChange={(e) => set('aiModel', e.target.value)}>
            <option value="claude-opus-5-5">Claude Opus 5.5 (рекомендуется)</option>
            <option value="claude-sonnet-5-5">Claude Sonnet 5.5 (быстрее)</option>
            <option value="claude-haiku-5-5">Claude Haiku 5.5 (самая быстрая)</option>
          </select>
        </div>
      </section>

      <section className="card">
        <div className="card-label">☁️ Синхронизация между устройствами</div>
        <p className="muted small">Укажи адрес сервера синхронизации (запуск: <code>npm run sync-server</code>) и один и тот же секретный код на телефоне и компьютере — прогресс, черновики и файлы будут объединяться автоматически. Можно начать урок на телефоне и продолжить на компьютере с того же места.</p>
        <div className="setting col">
          <span>Адрес сервера</span>
          <input className="input" placeholder="https://sync.example.com" value={settings.syncUrl} onChange={(e) => set('syncUrl', e.target.value.trim())} />
        </div>
        <div className="setting col">
          <span>Секретный код синхронизации</span>
          <div className="row">
            <input className="input" value={settings.syncToken} onChange={(e) => set('syncToken', e.target.value.trim())} placeholder="одинаковый на всех устройствах" />
            <button className="btn btn-sm" onClick={genToken}>Сгенерировать</button>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => syncNow()} disabled={!settings.syncUrl || !settings.syncToken}>Синхронизировать сейчас</button>
        <hr />
        <p className="muted small">Без сервера: выгрузи прогресс в файл и загрузи его на другом устройстве.</p>
        <div className="toolbar">
          <button className="btn" onClick={exportProgress}>⬇ Экспорт прогресса</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>⬆ Импорт</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importProgress(e.target.files[0]).catch((err) => toast(`Не удалось импортировать: ${err.message}`, 'bad'))} />
        </div>
      </section>

      <section className="card">
        <div className="card-label">📱 Установка приложения</div>
        <p className="small">CodeVerse — прогрессивное веб-приложение. Его можно установить как обычную программу и заниматься офлайн:</p>
        <ul className="small">
          <li><b>Android (Chrome):</b> меню ⋮ → «Установить приложение».</li>
          <li><b>iPhone/iPad (Safari):</b> «Поделиться» → «На экран „Домой“».</li>
          <li><b>Windows, macOS, Linux (Chrome/Edge):</b> значок установки в адресной строке.</li>
        </ul>
      </section>

      <section className="card danger">
        <div className="card-label">⚠️ Данные</div>
        <div className="toolbar">
          <button className="btn" onClick={() => confirm('Вернуть файлы виртуальной ФС к исходным?') && resetVfs()}>Сбросить файлы</button>
          <button className="btn btn-danger" onClick={() => confirm('Удалить весь прогресс? Это действие необратимо.') && (resetProgress(), toast('Прогресс сброшен'))}>Сбросить прогресс</button>
        </div>
      </section>
    </div>
  );
}
