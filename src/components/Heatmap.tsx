// Календарь активности (как на GitHub): насыщенность клетки = опыт за день.
import { today } from '../store/progress';

export function Heatmap({ activity, weeks = 16 }: { activity: Record<string, number>; weeks?: number }) {
  const days: { date: string; xp: number }[] = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - weeks * 7 + 1);
  // Выравниваем начало на понедельник.
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = today(d);
    days.push({ date: key, xp: activity[key] ?? 0 });
  }
  const level = (xp: number) => (xp === 0 ? 0 : xp < 30 ? 1 : xp < 80 ? 2 : xp < 200 ? 3 : 4);
  const cols: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7));
  const total = days.reduce((s, d) => s + d.xp, 0);
  const activeDays = days.filter((d) => d.xp > 0).length;
  return (
    <div className="heatmap-wrap">
      <div className="heatmap" role="img" aria-label={`Активность: ${activeDays} дней, ${total} XP`}>
        {cols.map((col, i) => (
          <div key={i} className="hm-col">
            {col.map((d) => (
              <div key={d.date} className={`hm-cell l${level(d.xp)}`} title={`${d.date}: ${d.xp} XP`} />
            ))}
          </div>
        ))}
      </div>
      <div className="muted small">
        {activeDays} активных дней · {total} XP за {weeks} недель
      </div>
    </div>
  );
}
