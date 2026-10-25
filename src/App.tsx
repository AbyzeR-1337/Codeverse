// Каркас приложения: навигация (боковая панель на компьютере, нижняя панель на телефоне),
// маршрутизация по hash-адресам и глобальные уведомления (опыт, уровни, достижения).
import { lazy, Suspense, useEffect, useState } from 'react';
import { navigate, useRoute } from './router';
import { levelFromXp, levelTitle, onUi, UiEvent, useStore, xpForLevel } from './store/progress';
import { ACHIEVEMENTS } from './store/achievements';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { useCourse } from './store/course';

const LessonPlayer = lazy(() => import('./pages/LessonPlayer').then((m) => ({ default: m.LessonPlayer })));
const IDE = lazy(() => import('./pages/IDE').then((m) => ({ default: m.IDE })));
const ConsolePage = lazy(() => import('./pages/ConsolePage').then((m) => ({ default: m.ConsolePage })));
const Problems = lazy(() => import('./pages/Problems').then((m) => ({ default: m.Problems })));
const ProblemPage = lazy(() => import('./pages/Problems').then((m) => ({ default: m.ProblemPage })));
const Projects = lazy(() => import('./pages/Projects').then((m) => ({ default: m.Projects })));
const ProjectPage = lazy(() => import('./pages/Projects').then((m) => ({ default: m.ProjectPage })));
const Games = lazy(() => import('./pages/Games').then((m) => ({ default: m.Games })));
const GamePage = lazy(() => import('./pages/Games').then((m) => ({ default: m.GamePage })));
const Review = lazy(() => import('./pages/Review').then((m) => ({ default: m.Review })));
const Practice = lazy(() => import('./pages/Practice').then((m) => ({ default: m.Practice })));
const Interview = lazy(() => import('./pages/Interview').then((m) => ({ default: m.Interview })));
const Exam = lazy(() => import('./pages/Exam').then((m) => ({ default: m.Exam })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const Handbook = lazy(() => import('./pages/Handbook').then((m) => ({ default: m.Handbook })));
const Courses = lazy(() => import('./pages/Courses').then((m) => ({ default: m.Courses })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

const NAV: { path: string; icon: string; label: string; mobile?: boolean; extra?: boolean }[] = [
  { path: '/', icon: '🏠', label: 'Главная', mobile: true },
  { path: '/learn', icon: '🗺️', label: 'Мой курс', mobile: true },
  { path: '/practice', icon: '🎯', label: 'Тренировка', mobile: true },
  { path: '/problems', icon: '🧩', label: 'Задачи' },
  { path: '/projects', icon: '🛠️', label: 'Проекты' },
  { path: '/review', icon: '🔁', label: 'Повторение' },
  { path: '/ide', icon: '💻', label: 'Редактор кода', mobile: true },
  { path: '/console', icon: '⌨️', label: 'Консоль' },
  { path: '/handbook', icon: '📚', label: 'Справочник' },
  { path: '/courses', icon: '🎓', label: 'Все курсы' },
  { path: '/games', icon: '🎮', label: 'Мини-игры', extra: true },
  { path: '/interview', icon: '🤝', label: 'Собеседование', extra: true },
  { path: '/profile', icon: '👤', label: 'Профиль', mobile: true },
  { path: '/settings', icon: '⚙️', label: 'Настройки' },
];

interface Toast {
  id: number;
  e: UiEvent;
}

function Notifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Очередь «больших» событий: несколько достижений подряд показываются по одному.
  const [queue, setQueue] = useState<UiEvent[]>([]);
  const big = queue[0] ?? null;
  const setBig = (_: null) => setQueue((q) => q.slice(1));
  useEffect(
    () =>
      onUi((e) => {
        if (e.type === 'level' || e.type === 'achievement') {
          setQueue((q) => [...q, e]);
          return;
        }
        const id = Math.random();
        setToasts((t) => [...t.slice(-3), { id, e }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), e.type === 'toast' ? 3500 : 2200);
      }),
    [],
  );
  const ach = big?.type === 'achievement' ? ACHIEVEMENTS.find((a) => a.id === big.id) : null;
  return (
    <>
      <div className="toasts" aria-live="polite">
        {toasts.map(({ id, e }) => (
          <div key={id} className={`toast ${e.type === 'toast' ? `toast-${e.tone ?? 'info'}` : 'toast-xp'}`}>
            {e.type === 'xp' && (
              <>
                <b>+{e.amount} XP</b> <span>{e.reason}</span>
              </>
            )}
            {e.type === 'quest' && (
              <>
                <b>🏁 Задание выполнено!</b> <span>{e.title}</span>
              </>
            )}
            {e.type === 'toast' && e.text}
          </div>
        ))}
      </div>
      {big && (
        <div className="modal-backdrop" onClick={() => setBig(null)}>
          <div className="celebrate" onClick={(ev) => ev.stopPropagation()} role="dialog" aria-modal="true">
            {big.type === 'level' && (
              <>
                <div className="celebrate-icon">🎉</div>
                <h2>Новый уровень: {big.level}!</h2>
                <p>Звание: <b>{levelTitle(big.level)}</b></p>
              </>
            )}
            {ach && (
              <>
                <div className="celebrate-icon">{ach.icon}</div>
                <div className={`tier tier-${ach.tier}`}>Достижение</div>
                <h2>{ach.title}</h2>
                <p>{ach.description}</p>
                {ach.xp > 0 && <p className="muted">+{ach.xp} XP</p>}
              </>
            )}
            <button className="btn btn-primary" onClick={() => setBig(null)} autoFocus>
              Отлично!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function XpBadge() {
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const lvl = levelFromXp(xp);
  const from = xpForLevel(lvl);
  const to = xpForLevel(lvl + 1);
  return (
    <button className="xp-badge" onClick={() => navigate('/profile')} title="Профиль">
      <span className="lvl">{lvl}</span>
      <span className="xp-bar">
        <span style={{ width: `${((xp - from) / (to - from)) * 100}%` }} />
      </span>
      <span className="streak" title="Серия дней">🔥 {streak.current}</span>
    </button>
  );
}

function CourseChip() {
  const course = useCourse();
  return (
    <a className="course-chip" href="#/courses" style={{ ['--c' as string]: course?.color ?? 'var(--accent)' }} title="Сменить курс">
      <span>{course?.icon ?? '🎓'}</span>
      <span className="course-chip-text">
        <small className="muted">Курс</small>
        <b>{course?.short ?? 'Выбрать курс'}</b>
      </span>
    </a>
  );
}

function Page({ parts }: { parts: string[] }) {
  const [p0, p1] = parts;
  switch (p0) {
    case undefined:
      return <Home />;
    case 'learn':
      return <Learn />;
    case 'lesson':
      return <LessonPlayer key={p1} id={p1} />;
    case 'ide':
      return <IDE />;
    case 'console':
      return <ConsolePage />;
    case 'problems':
      return <Problems />;
    case 'problem':
      return <ProblemPage key={p1} id={p1} />;
    case 'projects':
      return <Projects />;
    case 'project':
      return <ProjectPage key={p1} id={p1} />;
    case 'games':
      return <Games />;
    case 'game':
      return <GamePage key={p1} id={p1} />;
    case 'review':
      return <Review />;
    case 'practice':
      return <Practice />;
    case 'interview':
      return <Interview />;
    case 'exam':
      return <Exam key={p1} id={p1} />;
    case 'profile':
      return <Profile />;
    case 'handbook':
      return <Handbook key={p1} id={p1} />;
    case 'settings':
      return <Settings />;
    case 'courses':
      return <Courses />;
    default:
      return (
        <div className="page center">
          <h1>404 🛸</h1>
          <p>Такой страницы нет во вселенной CodeVerse.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>На главную</button>
        </div>
      );
  }
}

export function App() {
  const { path, parts } = useRoute();
  const theme = useStore((s) => s.settings.theme);
  const focusMode = useStore((s) => s.settings.focusMode);
  const nav = NAV.filter((n) => !(focusMode && n.extra));
  const [menuOpen, setMenuOpen] = useState(false);
  const fullBleed = parts[0] === 'ide' || parts[0] === 'lesson';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => setMenuOpen(false), [path]);

  const active = (p: string) => (p === '/' ? path === '/' : path.startsWith(p) || (p === '/learn' && path.startsWith('/lesson')) || (p === '/problems' && path.startsWith('/problem')) || (p === '/projects' && path.startsWith('/project')) || (p === '/games' && path.startsWith('/game')));

  return (
    <div className={`app ${menuOpen ? 'menu-open' : ''} ${fullBleed ? 'full-mode' : ''}`}>
      <aside className="sidebar">
        <a className="logo" href="#/" aria-label="CodeVerse — на главную">
          <span className="logo-mark">&lt;/&gt;</span>
          <span className="logo-text">CodeVerse</span>
        </a>
        <XpBadge />
        <CourseChip />
        <nav>
          {nav.map((n) => (
            <a key={n.path} href={`#${n.path}`} className={`nav-item ${active(n.path) ? 'active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-foot muted small">Учись каждый день — даже 15 минут меняют всё.</div>
      </aside>
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => setMenuOpen((o) => !o)} aria-label="Меню">☰</button>
        <a className="logo" href="#/">
          <span className="logo-mark">&lt;/&gt;</span>
          <span className="logo-text">CodeVerse</span>
        </a>
        <XpBadge />
      </header>
      <div className="backdrop" onClick={() => setMenuOpen(false)} />
      <main className={`content ${fullBleed ? 'full' : ''}`}>
        <Suspense fallback={<div className="page center muted">Загрузка…</div>}>
          <Page parts={parts} />
        </Suspense>
      </main>
      <nav className="bottombar">
        {nav.filter((n) => n.mobile).map((n) => (
          <a key={n.path} href={`#${n.path}`} className={active(n.path) ? 'active' : ''}>
            <span>{n.icon}</span>
            <small>{n.label}</small>
          </a>
        ))}
      </nav>
      <Notifications />
    </div>
  );
}
