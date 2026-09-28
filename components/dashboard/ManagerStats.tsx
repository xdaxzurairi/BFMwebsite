'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/dashboard/DashShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { MatchStatsForm } from './MatchStatsForm';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Match, Club } from '@/lib/types';

export function ManagerStats({ club, clubs, matches, statCounts, lang }: { club: Club; clubs: Club[]; matches: Match[]; statCounts: Record<number, number>; lang: Lang }) {
  const [open, setOpen] = useState<Match | null>(null);
  const clubById = new Map(clubs.map((c) => [c.club_id, c]));
  const sorted = [...matches].sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
  const missing = sorted.filter((m) => !statCounts[m.match_id]).length;

  return (
    <div>
      <SectionHead title={translate('dash.stats', lang)} />
      <p className="muted" style={{ fontSize: 14, marginBottom: 18, maxWidth: 620 }}>
        {translate('stats.mgrhelp', lang)}
        {missing > 0 && (
          <strong style={{ color: 'var(--clay)' }}>
            {' '}
            {missing} {translate(missing === 1 ? 'stats.missing1' : 'stats.missing', lang)}
          </strong>
        )}
      </p>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{translate('lbl.date', lang)}</th>
              <th>{lang === 0 ? 'Lawan' : 'Opponent'}</th>
              <th className="num">{translate('lbl.score', lang)}</th>
              <th>{translate('lbl.status', lang)}</th>
              <th>{translate('stats.title', lang)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const isHome = m.home_team_id === club.club_id;
              const opp = clubById.get(isHome ? m.away_team_id : m.home_team_id);
              const ourScore = isHome ? m.home_score : m.away_score;
              const theirScore = isHome ? m.away_score : m.home_score;
              const n = statCounts[m.match_id] || 0;
              return (
                <tr key={m.match_id}>
                  <td className="muted">{fmt.time(m.match_date)}</td>
                  <td style={{ fontWeight: 700 }}>
                    <span className="muted">{isHome ? 'vs' : '@'}</span> {opp?.club_name ?? '—'}
                  </td>
                  <td className="num">{ourScore != null && theirScore != null ? `${ourScore} – ${theirScore}` : '—'}</td>
                  <td>
                    <StatusBadge status={m.status} label={statusLbl(m.status, lang)} />
                  </td>
                  <td>
                    {n > 0 ? (
                      <span className="badge badge-approved">
                        {n} {translate('stats.lines', lang)}
                      </span>
                    ) : (
                      <span className="badge badge-pending">{translate('stats.none', lang)}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button size="sm" variant={n ? 'ghost' : 'field'} icon={n ? I.edit : I.plus} onClick={() => setOpen(m)}>
                      {n ? translate('cta.edit', lang) : translate('stats.enter', lang)}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && <Empty>{translate('stats.nomatches', lang)}</Empty>}
      </div>
      {open && (
        <MatchStatsForm
          m={open}
          home={clubById.get(open.home_team_id)}
          away={clubById.get(open.away_team_id)}
          teams={[club]}
          lang={lang}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
