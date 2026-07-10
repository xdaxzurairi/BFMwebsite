import { ClubLogo } from '@/components/ui/ClubLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Empty } from '@/components/ui/Empty';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import type { Lang } from '@/lib/i18n';
import type { Match, Club } from '@/lib/types';

export function MatchList({ matches, clubs, lang }: { matches: Match[]; clubs: Club[]; lang: Lang }) {
  if (!matches.length) {
    return <Empty>{lang === 0 ? 'Tiada perlawanan dijadualkan.' : 'No matches scheduled.'}</Empty>;
  }
  const byId = new Map(clubs.map((c) => [c.club_id, c]));
  const sorted = [...matches].sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
  return (
    <div className="col" style={{ gap: 12 }}>
      {sorted.map((m) => {
        const h = byId.get(m.home_team_id);
        const a = byId.get(m.away_team_id);
        const done = m.status === 'completed';
        return (
          <div key={m.match_id} className="card pad">
            <div className="row between center" style={{ marginBottom: 12 }}>
              <span className="badge">{m.round_name || m.match_number}</span>
              <span className="muted" style={{ fontSize: 13 }}>
                {fmt.time(m.match_date)}
              </span>
            </div>
            <div className="row center" style={{ gap: 16 }}>
              <div className="row center" style={{ gap: 11, flex: 1, justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 800, textAlign: 'right' }}>{h?.club_name}</span>
                <ClubLogo club={h ?? { club_name: '?' }} size={38} />
              </div>
              <div className="row center" style={{ gap: 10, minWidth: 110, justifyContent: 'center' }}>
                {done ? (
                  <>
                    <span className="display" style={{ fontSize: 34, color: (m.home_score ?? 0) >= (m.away_score ?? 0) ? 'var(--field)' : 'var(--ink-faint)' }}>
                      {m.home_score}
                    </span>
                    <span className="muted">–</span>
                    <span className="display" style={{ fontSize: 34, color: (m.away_score ?? 0) >= (m.home_score ?? 0) ? 'var(--field)' : 'var(--ink-faint)' }}>
                      {m.away_score}
                    </span>
                  </>
                ) : (
                  <StatusBadge status={m.status} label={statusLbl(m.status, lang)} />
                )}
              </div>
              <div className="row center" style={{ gap: 11, flex: 1 }}>
                <ClubLogo club={a ?? { club_name: '?' }} size={38} />
                <span style={{ fontWeight: 800 }}>{a?.club_name}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
