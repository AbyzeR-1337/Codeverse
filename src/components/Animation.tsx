// Проигрыватель анимаций-схем: «коробки» плавно перемещаются между кадрами, стрелки показывают связи.
import { useEffect, useState } from 'react';
import type { AnimationSpec } from '../content/types';
import { highlight } from './Markdown';
import { useStore } from '../store/progress';

export function Animation({ spec, autoPlay = true }: { spec: AnimationSpec; autoPlay?: boolean }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const reduced = useStore((s) => s.settings.reducedMotion);
  const frame = spec.frames[i];
  const W = spec.width ?? 640;
  const H = spec.height ?? 260;

  useEffect(() => {
    if (!playing) return;
    if (i >= spec.frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => x + 1), 2400);
    return () => clearTimeout(t);
  }, [playing, i, spec.frames.length]);

  const boxes = new Map(frame.boxes.map((b) => [b.id, b]));
  const center = (id: string) => {
    const b = boxes.get(id);
    if (!b) return null;
    return { x: b.x + (b.w ?? 110) / 2, y: b.y + (b.h ?? 54) / 2, w: b.w ?? 110, h: b.h ?? 54 };
  };
  const edge = (from: { x: number; y: number; w: number; h: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const sx = Math.abs(dx) / (from.w / 2 + 6);
    const sy = Math.abs(dy) / (from.h / 2 + 6);
    const s = Math.max(sx, sy) || 1;
    return { x: from.x + dx / s, y: from.y + dy / s };
  };

  const codeLines = spec.code?.split('\n');

  return (
    <div className="anim">
      <div className={`anim-stage ${spec.code ? 'with-code' : ''}`}>
        {codeLines && (
          <pre className="anim-code">
            {codeLines.map((l, n) => (
              <div key={n} className={`anim-code-line ${frame.line === n + 1 ? 'active' : ''}`}>
                <span className="ln">{n + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: highlight(l, spec.lang ?? 'js') || ' ' }} />
              </div>
            ))}
          </pre>
        )}
        <svg viewBox={`0 0 ${W} ${H}`} className="anim-svg" role="img" aria-label={frame.caption}>
          <defs>
            <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="anim-arrowhead" />
            </marker>
          </defs>
          {frame.arrows?.map((a, k) => {
            const f = center(a.from);
            const t = center(a.to);
            if (!f || !t) return null;
            const p1 = edge(f, t);
            const p2 = edge(t as typeof f, f);
            return (
              <g key={`${a.from}-${a.to}-${k}`} className="anim-arrow">
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} markerEnd="url(#arrowhead)" />
                {a.label && (
                  <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 6} textAnchor="middle" className="anim-arrow-label">
                    {a.label}
                  </text>
                )}
              </g>
            );
          })}
          {frame.boxes.map((b) => {
            const w = b.w ?? 110;
            const h = b.h ?? 54;
            return (
              <g key={b.id} className={`anim-box c-${b.color ?? 'accent'} ${b.highlight ? 'hl' : ''}`} style={{ transform: `translate(${b.x}px, ${b.y}px)`, transition: reduced ? 'none' : undefined }}>
                {b.shape === 'circle' ? <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2} /> : <rect width={w} height={h} rx={b.shape === 'round' ? h / 2 : 10} />}
                {b.label && (
                  <text x={w / 2} y={b.value !== undefined ? h / 2 - 7 : h / 2 + 5} textAnchor="middle" className="anim-label">
                    {b.label}
                  </text>
                )}
                {b.value !== undefined && (
                  <text x={w / 2} y={b.label ? h / 2 + 14 : h / 2 + 5} textAnchor="middle" className="anim-value">
                    {b.value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="anim-caption" aria-live="polite">{frame.caption}</div>
      <div className="anim-controls">
        <button className="btn btn-sm" onClick={() => setI(0)} aria-label="Сначала">⏮</button>
        <button className="btn btn-sm" onClick={() => setI((x) => Math.max(0, x - 1))} aria-label="Назад">◀</button>
        <button className="btn btn-sm btn-primary" onClick={() => (i >= spec.frames.length - 1 ? (setI(0), setPlaying(true)) : setPlaying((p) => !p))}>
          {playing ? '⏸ Пауза' : i >= spec.frames.length - 1 ? '↻ Ещё раз' : '▶ Играть'}
        </button>
        <button className="btn btn-sm" onClick={() => setI((x) => Math.min(spec.frames.length - 1, x + 1))} aria-label="Вперёд">▶</button>
        <div className="anim-dots">
          {spec.frames.map((_, k) => (
            <button key={k} className={`dot ${k === i ? 'active' : ''} ${k < i ? 'done' : ''}`} onClick={() => setI(k)} aria-label={`Кадр ${k + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
