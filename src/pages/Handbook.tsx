// Справочник: шпаргалки и документация с поиском.
import { useState } from 'react';
import { HANDBOOK, GLOSSARY } from '../content/handbook';
import { Markdown } from '../components/Markdown';
import { navigate } from '../router';

export function Handbook({ id }: { id?: string }) {
  const [q, setQ] = useState('');
  const article = HANDBOOK.find((a) => a.id === id);
  if (article)
    return (
      <div className="page handbook-article">
        <button className="btn btn-ghost" onClick={() => navigate('/handbook')}>← Справочник</button>
        <h1>{article.icon} {article.title}</h1>
        <Markdown md={article.md} className="card" />
      </div>
    );

  const ql = q.toLowerCase();
  const results = HANDBOOK.filter((a) => !q || a.title.toLowerCase().includes(ql) || a.md.toLowerCase().includes(ql));
  const terms = GLOSSARY.filter(([t, d]) => q && (t.toLowerCase().includes(ql) || d.toLowerCase().includes(ql)));
  const groups = [...new Set(results.map((a) => a.group))];
  return (
    <div className="page handbook">
      <h1>📚 Справочник</h1>
      <p className="muted">Шпаргалки, таблицы и глоссарий — вся документация под рукой, даже офлайн.</p>
      <input className="input search" placeholder="🔎 Поиск: map, git merge, 404, словарь…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      {terms.length > 0 && (
        <section className="card">
          <div className="card-label">Глоссарий</div>
          {terms.map(([t, d]) => (
            <div key={t} className="glossary-row"><b>{t}</b> — {d}</div>
          ))}
        </section>
      )}
      {groups.map((g) => (
        <section key={g}>
          <h2>{g}</h2>
          <div className="handbook-grid">
            {results.filter((a) => a.group === g).map((a) => (
              <button key={a.id} className="handbook-card" onClick={() => navigate(`/handbook/${a.id}`)}>
                <span className="hb-icon">{a.icon}</span>
                <b>{a.title}</b>
              </button>
            ))}
          </div>
        </section>
      ))}
      {!q && (
        <section className="card">
          <div className="card-label">📖 Глоссарий ({GLOSSARY.length} терминов)</div>
          {GLOSSARY.map(([t, d]) => (
            <div key={t} className="glossary-row"><b>{t}</b> — {d}</div>
          ))}
        </section>
      )}
    </div>
  );
}
