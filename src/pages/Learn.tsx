// Дорожная карта обучения: треки → модули → главы → уроки, экзамены по модулям и темы «скоро».
import { useState } from 'react';
import { TRACKS } from '../content/course';
import { useStore } from '../store/progress';
import { navigate, useRoute } from '../router';

export function Learn() {
  const { query } = useRoute();
  const [trackId, setTrackId] = useState(query.get('track') ?? 'basics');
  const completed = useStore((s) => s.completedLessons);
  const inProgress = useStore((s) => s.lessonStep);
  const exams = useStore((s) => s.exams);
  const track = TRACKS.find((t) => t.id === trackId) ?? TRACKS[0];
  const [showPlanned, setShowPlanned] = useState(true);

  // Рекомендуемый следующий урок в треке.
  const firstOpen = track.modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons)).find((l) => !completed[l.id]);

  return (
    <div className="page learn">
      <h1>🗺️ Обучение</h1>
      <p className="muted">Все уроки открыты — но рекомендуем идти по порядку. Каждый урок: теория, анимации, примеры и много практики.</p>
      <div className="track-tabs" role="tablist">
        {TRACKS.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === track.id} className={`track-tab ${t.id === track.id ? 'active' : ''}`} style={{ ['--c' as string]: t.color }} onClick={() => setTrackId(t.id)}>
            <span>{t.icon}</span> {t.title}
          </button>
        ))}
      </div>
      <div className="track-desc card" style={{ ['--c' as string]: track.color }}>
        <span className="track-big-icon">{track.icon}</span>
        <div>
          <h2>{track.title}</h2>
          <p>{track.description}</p>
        </div>
      </div>
      <label className="toggle muted small">
        <input type="checkbox" checked={showPlanned} onChange={(e) => setShowPlanned(e.target.checked)} /> Показывать главы из дорожной карты (в разработке)
      </label>

      {track.modules.map((m, mi) => {
        const lessons = m.chapters.flatMap((c) => c.lessons);
        const done = lessons.filter((l) => completed[l.id]).length;
        const isRoadmap = lessons.length === 0;
        if (isRoadmap && !showPlanned) return null;
        return (
          <section key={m.id} className={`module ${isRoadmap ? 'roadmap' : ''}`}>
            <div className="module-head">
              <div>
                <div className="muted small">Модуль {mi + 1}</div>
                <h2>{m.title}</h2>
              </div>
              {!isRoadmap && (
                <div className="module-meta">
                  <span className="muted small">{done}/{lessons.length} уроков</span>
                  <div className="mini-progress" style={{ width: 120 }}><div style={{ width: `${(done / lessons.length) * 100}%` }} /></div>
                  <button className={`btn btn-sm ${exams[m.id]?.passed ? 'btn-good' : ''}`} onClick={() => navigate(`/exam/${m.id}`)}>
                    {exams[m.id]?.passed ? `🏆 Экзамен сдан (${exams[m.id].best}%)` : '📜 Экзамен'}
                  </button>
                </div>
              )}
            </div>
            <div className="chapters">
              {m.chapters.map((c) => {
                if (!c.lessons.length && !showPlanned) return null;
                return (
                  <div key={c.id} className={`chapter ${c.lessons.length ? '' : 'planned'}`}>
                    <div className="chapter-title">
                      <b>{c.title}</b>
                      {!c.lessons.length && <span className="badge">скоро</span>}
                    </div>
                    {c.description && <div className="muted small">{c.description}</div>}
                    <div className="lessons">
                      {c.lessons.map((l) => {
                        const status = completed[l.id] ? 'done' : inProgress[l.id] !== undefined ? 'progress' : l.id === firstOpen?.id ? 'next' : '';
                        return (
                          <button key={l.id} className={`lesson-row ${status}`} onClick={() => navigate(`/lesson/${l.id}`)}>
                            <span className="lesson-status">{status === 'done' ? '✅' : status === 'progress' ? '⏳' : status === 'next' ? '▶️' : '○'}</span>
                            <span className="lesson-name">{l.title}</span>
                            <span className="muted small">{l.steps.length} шагов · {l.minutes} мин</span>
                            {completed[l.id] && <span className="score">{completed[l.id].score}%</span>}
                          </button>
                        );
                      })}
                      {c.planned?.map((p) => (
                        <div key={p} className="lesson-row planned-row">
                          <span className="lesson-status">🔒</span>
                          <span className="lesson-name">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
