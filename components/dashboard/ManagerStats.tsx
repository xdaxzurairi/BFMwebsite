'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/dashboard/DashShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { MatchStatsForm } from './MatchStatsForm';
import { ReviewStatsModal } from './ReviewStatsModal';
import { StatReviewBadge } from './StatReviewBadge';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Match, Club, StatReview } from '@/lib/types';

export function ManagerStats({ club, clubs, matches, reviews, lang }: { club: Club; clubs: Club[]; matches: Match[]; reviews: StatReview[]; lang: Lang }) {
  const [open, setOpen] = useState<Match | null>(null);
  const [reviewing, setReviewing] = useState<{ m: Match; opp: Club } | null>(null);
  const clubById = new Map(clubs.map((c) => [c.club_id, c]));
  const reviewOf = (matchId: number, clubId: number) => reviews.find((r) => r.match_id === matchId && r.club_id === clubId);
  const oppId = (m: Match) => (m.home_team_id === club.club_id ? m.away_team_id : m.home_team_id);
  const sorted = [...matches].sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
  const missing = sorted.filter((m) => !reviewOf(m.match_id, club.club_id)).length;
  const queue = sorted.filter((m) => reviewOf(m.match_id, oppId(m))?.status === 'pending');

  return (
    <div>
      {queue.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <SectionHead title={`${translate('review.queue', lang)} (${queue.length})`} />
          <p className="muted" style={{ fontSize: 14, marginBottom: 14, maxWidth: 620 }}>
            {translate('review.queuehelp', lang)}
          </p>
          <div className="col" style={{ gap: 10 }}>
            {queue.map((m) => {
              const opp = clubById.get(oppId(m));
              if (!opp) return null;
              return (
                <div key={m.match_id} className="card pad row between center review-card">
                  <div>
                    <div style={{ fontWeight: 800 }}>{opp.club_name}</div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {fmt.time(m.match_date)} · {m.match_number}
                    </div>
                  </div>
                  <Button size="sm" variant="field" icon={I.check} onClick={() => setReviewing({ m, opp })}>
                    {translate('review.btn', lang)}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              <th>{translate('review.mine', lang)}</th>
              <th>{translate('review.theirs', lang)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const isHome = m.home_team_id === club.club_id;
              const opp = clubById.get(oppId(m));
              const ourScore = isHome ? m.home_score : m.away_score;
              const theirScore = isHome ? m.away_score : m.home_score;
              const mine = reviewOf(m.match_id, club.club_id);
              const theirs = reviewOf(m.match_id, oppId(m));
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
                    <StatReviewBadge review={mine} lang={lang} />
                    {mine?.status === 'disputed' && mine.review_note && <div className="review-note-sm">“{mine.review_note}”</div>}
                  </td>
                  <td>
                    {theirs && theirs.status !== 'approved' && opp ? (
                      <button className="linkish" onClick={() => setReviewing({ m, opp })}>
                        <StatReviewBadge review={theirs} lang={lang} />
                      </button>
                    ) : (
                      <StatReviewBadge review={theirs} lang={lang} />
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button size="sm" variant={mine ? 'ghost' : 'field'} icon={mine ? I.edit : I.plus} onClick={() => setOpen(m)}>
                      {mine ? translate('cta.edit', lang) : translate('stats.enter', lang)}
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
      {reviewing && <ReviewStatsModal m={reviewing.m} club={reviewing.opp} lang={lang} onClose={() => setReviewing(null)} />}
    </div>
  );
}
