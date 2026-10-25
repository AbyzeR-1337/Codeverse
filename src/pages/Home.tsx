// Главная: прогресс, «продолжить обучение», задания дня и недели, сезонное событие, слабые темы.
import { useMemo } from 'react';
import { currentSeason, levelFromXp, levelTitle, useStore, xpForLevel } from '../store/progress';
import { ALL_LESSONS, courseStats, TRACKS, trackLessons } from '../content/course';
import { PROBLEMS } from '../content/problems';
import { PROJECTS } from '../content/projects';
import { weakTopics } from '../store/actions';
import { topicIcon, topicTitle } from '../content/topics';
import { navigate } from '../router';
import { Heatmap } from '../components/Heatmap';
import { ALL_CARDS } from '../content/flashcards';

export function Home() {
  const s = useStore((st) => st);
  const lvl = levelFromXp(s.xp);
  const from = xpForLevel(lvl);
  const to = xpForLevel(lvl + 1);
  const season = currentSeason();
  const stats = useMemo(courseStats, []);
  const weak = weakTopics(3);
  const dueCards = ALL_CARDS.filter((c) => s.srs[c.id] && s.srs[c.id].due <= Date.now()).length;

  // Урок, на котором остановились, или первый непройденный в предпочитаемом треке.
  const resume = Object.keys(s.lessonStep)[0];
  const preferredTrack = s.settings.preferredLang === 'js' ? 'js' : 'python';
  const nextRef =
    (resume && ALL_LESSONS.find((r) => r.lesson.id === resume)) ||
    ALL_LESSONS.find((r) => r.track.id === 'basics' && !s.completedLessons[r.lesson.id] && Object.keys(s.completedLessons).length < 3) ||
    ALL_LESSONS.find((r) => r.track.id === preferredTrack && !s.completedLessons[r.lesson.id]) ||
    ALL_LESSONS.find((r) => !s.completedLessons[r.lesson.id]);

  const hour = new Date().getHours();
  const greet = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
  const isNew = Object.keys(s.completedLessons).length === 0;

  return (
    <div className="page home">
      <section className="hero">
        <div>
          <h1>
            {greet}, {s.profile.name}! {s.profile.avatar}
          </h1>
          <p className="muted">
            {isNew ? 'Добро пожаловать в CodeVerse — платформу, где программированию учатся с полного нуля через практику.' : `Уровень ${lvl} · ${levelTitle(lvl)}. Ты на верном пути!`}
          </p>
          <div className="level-bar">
            <div className="level-fill" style={{ width: `${((s.xp - from) / (to - from)) * 100}%` }} />
          </div>
          <div className="muted small">
            {s.xp - from} / {to - from} XP до уровня {lvl + 1}
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat"><b>🔥 {s.streak.current}</b><span>дней подряд</span></div>
          <div className="stat"><b>📘 {Object.keys(s.completedLessons).length}</b><span>уроков</span></div>
          <div className="stat"><b>🧩 {Object.keys(s.solvedProblems).length}</b><span>задач</span></div>
          <div className="stat"><b>🏆 {Object.keys(s.achievements).length}</b><span>достижений</span></div>
        </div>
      </section>

      {season && (
        <section className="season-banner">
          <b>{season.title}</b>
          <span>{season.description}</span>
        </section>
      )}

      <div className="grid-2">
        <section className="card continue-card">
          <div className="card-label">{resume ? '▶ Продолжить с того же места' : isNew ? '🚀 Начни с самого начала' : '▶ Следующий урок'}</div>
          {nextRef ? (
            <>
              <h2>{nextRef.lesson.title}</h2>
              <p className="muted">
                {nextRef.track.icon} {nextRef.track.title} · {nextRef.chapter.title} · ~{nextRef.lesson.minutes} мин
              </p>
              {resume === nextRef.lesson.id && (
                <div className="mini-progress">
                  <div style={{ width: `${(s.lessonStep[resume] / nextRef.lesson.steps.length) * 100}%` }} />
                </div>
              )}
              <button className="btn btn-primary btn-lg" onClick={() => navigate(`/lesson/${nextRef.lesson.id}`)}>
                {resume ? 'Продолжить' : 'Начать урок'} →
              </button>
            </>
          ) : (
            <p>Ты прошёл все доступные уроки! 🎓 Загляни в задачник и проекты.</p>
          )}
        </section>

        <section className="card">
          <div className="card-label">📅 Задания дня</div>
          {s.daily.quests.map((q) => (
            <div key={q.id} className={`quest ${q.done ? 'done' : ''}`}>
              <div className="quest-top">
                <span>{q.done ? '✅' : '⬜'} {q.title}</span>
                <span className="muted small">+{q.xp} XP</span>
              </div>
              <div className="mini-progress">
                <div style={{ width: `${(q.progress / q.goal) * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="card-label" style={{ marginTop: 14 }}>🗓️ Испытания недели</div>
          {s.weekly.quests.map((q) => (
            <div key={q.id} className={`quest ${q.done ? 'done' : ''}`}>
              <div className="quest-top">
                <span>{q.done ? '🏆' : '🎯'} {q.title}</span>
                <span className="muted small">{q.progress}/{q.goal} · +{q.xp} XP</span>
              </div>
              <div className="mini-progress">
                <div style={{ width: `${(q.progress / q.goal) * 100}%` }} />
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="quick-grid">
        <button className="quick" onClick={() => navigate('/practice')}><span>🎯</span><b>Тренировка</b><small>Бесконечные задания{weak.length ? ' на слабые темы' : ''}</small></button>
        <button className="quick" onClick={() => navigate('/review')}><span>🔁</span><b>Повторение</b><small>{dueCards ? `${dueCards} карточек ждут` : 'Интервальные карточки'}</small></button>
        <button className="quick" onClick={() => navigate('/games')}><span>🎮</span><b>Мини-игры</b><small>Учись играя</small></button>
        <button className="quick" onClick={() => navigate('/ide')}><span>💻</span><b>IDE</b><small>Пиши свой код</small></button>
        <button className="quick" onClick={() => navigate('/console')}><span>⌨️</span><b>Консоль</b><small>Терминал и Git</small></button>
        <button className="quick" onClick={() => navigate('/interview')}><span>🤝</span><b>Собеседование</b><small>Готовься к работе</small></button>
      </section>

      {weak.length > 0 && (
        <section className="card">
          <div className="card-label">🤖 ИИ-наставник заметил слабые темы</div>
          <div className="weak-list">
            {weak.map((w) => (
              <button key={w.topic} className="weak-item" onClick={() => navigate(`/practice?topic=${w.topic}`)}>
                <span>{topicIcon(w.topic)} {topicTitle(w.topic)}</span>
                <span className="muted small">{Math.round(w.rate * 100)}% ошибок · потренировать →</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <div className="card-label">🗺️ Треки обучения</div>
        <div className="tracks-row">
          {TRACKS.map((t) => {
            const lessons = trackLessons(t.id);
            const done = lessons.filter((r) => s.completedLessons[r.lesson.id]).length;
            return (
              <button key={t.id} className="track-mini" style={{ ['--c' as string]: t.color }} onClick={() => navigate(`/learn?track=${t.id}`)}>
                <span className="track-icon">{t.icon}</span>
                <b>{t.title}</b>
                <div className="mini-progress"><div style={{ width: `${lessons.length ? (done / lessons.length) * 100 : 0}%` }} /></div>
                <small className="muted">{done} / {lessons.length} уроков</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="card-label">📈 Активность</div>
        <Heatmap activity={s.activity} />
      </section>

      <section className="card about">
        <div className="card-label">🌌 Во вселенной CodeVerse сейчас</div>
        <div className="about-stats">
          <span><b>{stats.tracks}</b> трека</span>
          <span><b>{stats.chapters}</b> глав</span>
          <span><b>{stats.lessons}</b> интерактивных уроков</span>
          <span><b>{stats.steps}</b> шагов</span>
          <span><b>{stats.codeTasks}</b> заданий с кодом</span>
          <span><b>{PROBLEMS.length}</b> задач</span>
          <span><b>{PROJECTS.length}</b> пошаговых проектов</span>
          <span><b>∞</b> генерируемых упражнений</span>
          <span><b>{stats.planned}</b> тем в дорожной карте</span>
        </div>
      </section>
    </div>
  );
}
