import { Diamond } from '@/components/ui/icons';
import type { Match, Club } from '@/lib/types';

export function Ticker({ matches, clubs }: { matches: Match[]; clubs: Club[] }) {
  const byId = new Map(clubs.map((c) => [c.club_id, c]));
  const completed = matches.filter((m) => m.status === 'completed');
  const items = completed.map((m) => {
    const h = byId.get(m.home_team_id);
    const a = byId.get(m.away_team_id);
    return `${h?.club_name ?? '—'} ${m.home_score}–${m.away_score} ${a?.club_name ?? '—'}`;
  });
  const pool = items.length ? [...items, ...items, ...items] : [];
  if (!pool.length) return null;

  return (
    <div className="marquee" style={{ background: 'var(--ink)', color: '#fff', padding: '14px 0' }}>
      <div className="marquee-track">
        {pool.map((s, i) => (
          <span key={i} className="marquee-item" style={{ fontSize: 18 }}>
            {s}
            <Diamond style={{ background: 'var(--clay-bright)' }} />
          </span>
        ))}
      </div>
    </div>
  );
}
