import Link from 'next/link';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Match, Club } from '@/lib/types';

/* MLB-style schedule ribbon: live games, then the latest finals, then what's next. */
export function Scoreboard({ matches, clubs, lang }: { matches: Match[]; clubs: Club[]; lang: Lang }) {
  const byId = new Map(clubs.map((c) => [c.club_id, c]));
  const time = (m: Match) => new Date(m.match_date).getTime();
  const live = matches.filter((m) => m.status === 'live');
  const finals = matches.filter((m) => m.status === 'completed').sort((a, b) => time(b) - time(a)).slice(0, 6).reverse();
  const next = matches.filter((m) => m.status === 'scheduled').sort((a, b) => time(a) - time(b)).slice(0, 6);
  const items = [...finals, ...live, ...next];
  if (!items.length) return null;

  return (
    <div className="scoreboard" aria-label={translate('mc.scoreboard', lang)}>
      <div className="wrap row center" style={{ gap: 0 }}>
        <Link href="/matches" className="scoreboard-label stat-label">
          {translate('mc.scoreboard', lang)}
        </Link>
        <div className="scoreboard-track">
          {items.map((m) => {
            const done = m.status === 'completed';
            const teams: [Club | undefined, number | null][] = [
              [byId.get(m.away_team_id), m.away_score],
              [byId.get(m.home_team_id), m.home_score],
            ];
            const top = Math.max(m.home_score ?? 0, m.away_score ?? 0);
            return (
              <Link key={m.match_id} href={`/matches/${m.match_id}`} className={`sb-card ${m.status === 'live' ? 'sb-live' : ''}`}>
                <div className="sb-head">
                  {done ? translate('mc.final', lang) : m.status === 'live' ? statusLbl('live', lang) : fmt.time(m.match_date)}
                </div>
                {teams.map(([club, score], i) => (
                  <div key={i} className="sb-team" style={{ opacity: done && score !== top ? 0.55 : 1 }}>
                    <ClubLogo club={club ?? { club_name: '?' }} size={20} />
                    <span className="sb-name">{club?.club_name ?? '—'}</span>
                    {(done || m.status === 'live') && <span className="sb-score">{score ?? 0}</span>}
                  </div>
                ))}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
