import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Empty } from '@/components/ui/Empty';
import { I } from '@/components/ui/icons';
import { getLang } from '@/lib/lang';
import { LineScore } from '@/components/scoresheet/LineScore';
import { ScoresheetView } from '@/components/scoresheet/ScoresheetView';
import { getMatch, getClub, getTournament, getMatchBoxScore, getMatchPitching, getMatchInnings, getHeadToHead, getStatReviews } from '@/lib/queries';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { lineTotals } from '@/lib/scoresheet';
import { t as translate } from '@/lib/i18n';
import type { Club } from '@/lib/types';

export const revalidate = 60;

export default async function MatchCentrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  const match = await getMatch(Number(id));
  if (!match) notFound();

  const [home, away, tournament, allBox, allPitching, innings, h2h, reviews] = await Promise.all([
    getClub(match.home_team_id),
    getClub(match.away_team_id),
    getTournament(match.tournament_id),
    getMatchBoxScore(match.match_id),
    getMatchPitching(match.match_id),
    getMatchInnings(match.match_id),
    getHeadToHead(match.home_team_id, match.away_team_id),
    getStatReviews(match.match_id),
  ]);
  // Only stats the opposing club (or an admin) approved are shown publicly.
  const reviewOf = (clubId: number) => reviews.find((r) => r.club_id === clubId);
  const box = allBox.filter((r) => reviewOf(r.player.club_id)?.status === 'approved');
  // Pitching lines are admin-entered; hide them only while that club's stats are under review.
  const pitching = allPitching.filter((p) => {
    const st = reviewOf(p.player.club_id)?.status;
    return st !== 'pending' && st !== 'disputed';
  });
  const unapproved = [away, home].flatMap((c) => {
    const r = c ? reviewOf(c.club_id) : undefined;
    return c && r && r.status !== 'approved' ? [{ club: c, status: r.status }] : [];
  });
  const clubById = new Map([home, away].filter((c): c is Club => !!c).map((c) => [c.club_id, c]));
  const done = match.status === 'completed';
  const homeBox = box.filter((r) => r.player.club_id === match.home_team_id);
  const awayBox = box.filter((r) => r.player.club_id === match.away_team_id);
  const homePitching = pitching.filter((p) => p.player.club_id === match.home_team_id);
  const awayPitching = pitching.filter((p) => p.player.club_id === match.away_team_id);
  const showLine = done || innings.length > 0;
  const durationMin = match.ended_at ? Math.round((new Date(match.ended_at).getTime() - new Date(match.match_date).getTime()) / 60000) : null;
  const pastMeetings = h2h.filter((m) => m.match_id !== match.match_id);
  const winsFor = (clubId: number) =>
    pastMeetings.filter((m) => (m.home_team_id === clubId ? (m.home_score ?? 0) > (m.away_score ?? 0) : (m.away_score ?? 0) > (m.home_score ?? 0))).length;

  const side = (club: Club | null, label: string, score: number | null, won: boolean) => (
    <div className="col" style={{ gap: 12, flex: 1, minWidth: 0, textAlign: 'center', alignItems: 'center' }}>
      {club ? (
        <Link href={`/clubs/${club.club_id}`}>
          <ClubLogo club={club} size={84} />
        </Link>
      ) : (
        <ClubLogo club={{ club_name: '?' }} size={84} />
      )}
      <div>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{club?.club_name ?? '—'}</div>
        <div className="stat-label" style={{ color: 'oklch(1 0 0 / .6)', marginTop: 4 }}>
          {label}
        </div>
      </div>
      {done && (
        <div className="display" style={{ fontSize: 76, lineHeight: 1, color: won ? '#fff' : 'oklch(1 0 0 / .45)' }}>
          {score}
        </div>
      )}
    </div>
  );

  return (
    <div className="section wrap">
      <Link href="/matches" className="btn btn-ghost btn-sm no-print" style={{ marginBottom: 22 }}>
        <I.arrowL />
        {translate('nav.matches', lang)}
      </Link>

      <div className="card match-hero" style={{ overflow: 'hidden' }}>
        <div className="row between center wrap-w" style={{ gap: 12, marginBottom: 28 }}>
          <div className="row center wrap-w" style={{ gap: 10 }}>
            {done ? (
              <span className="badge" style={{ background: 'var(--clay)', color: '#fff' }}>
                {translate('mc.final', lang)}
              </span>
            ) : (
              <StatusBadge status={match.status} label={statusLbl(match.status, lang)} />
            )}
            <span className="badge">{match.round_name || match.match_number}</span>
          </div>
          {tournament && (
            <Link href={`/tournaments/${tournament.tournament_id}`} className="stat-label" style={{ color: 'oklch(1 0 0 / .8)' }}>
              {tournament.tournament_name} <I.arrow style={{ width: 12, height: 12, verticalAlign: -1 }} />
            </Link>
          )}
        </div>
        <div className="row center" style={{ gap: 16 }}>
          {side(away, translate('mc.away', lang), match.away_score, done && (match.away_score ?? 0) > (match.home_score ?? 0))}
          <div className="display" style={{ fontSize: 28, color: 'oklch(1 0 0 / .4)' }}>
            {done ? '–' : 'VS'}
          </div>
          {side(home, translate('mc.home', lang), match.home_score, done && (match.home_score ?? 0) > (match.away_score ?? 0))}
        </div>
        {showLine && (
          <LineScore
            innings={innings}
            away={{ name: away?.club_name ?? '—', totals: lineTotals(match.away_score, awayBox, awayBox, match.away_lob) }}
            home={{ name: home?.club_name ?? '—', totals: lineTotals(match.home_score, homeBox, homeBox, match.home_lob) }}
          />
        )}
        <div className="ls-meta">
          <span className="row center" style={{ gap: 6 }}>
            <I.calendar style={{ width: 16, height: 16 }} />
            {fmt.time(match.match_date)}
          </span>
          {match.venue && (
            <span className="row center" style={{ gap: 6 }}>
              <I.pin style={{ width: 16, height: 16 }} />
              {match.venue}
            </span>
          )}
          {durationMin != null && durationMin > 0 && (
            <span className="row center" style={{ gap: 6 }}>
              <I.clock style={{ width: 16, height: 16 }} />
              {Math.floor(durationMin / 60)}:{String(durationMin % 60).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      <h2 className="h-md" style={{ margin: '40px 0 16px' }}>
        {translate('mc.box', lang)}
      </h2>
      {unapproved.map((u) => (
        <p key={u.club.club_id} className="review-note" style={{ marginTop: 0, marginBottom: 12 }}>
          <strong>{u.club.club_name}:</strong> {translate(u.status === 'disputed' ? 'review.mc.disputed' : 'review.mc.pending', lang)}
        </p>
      ))}
      {(box.length === 0 && pitching.length === 0) || !home || !away ? (
        <Empty>{translate('mc.nobox', lang)}</Empty>
      ) : (
        <ScoresheetView away={{ club: away, batting: awayBox, pitching: awayPitching }} home={{ club: home, batting: homeBox, pitching: homePitching }} lang={lang} />
      )}

      <div className="no-print">
        <h2 className="h-md" style={{ margin: '40px 0 16px' }}>
          {translate('mc.h2h', lang)}
        </h2>
        {pastMeetings.length === 0 ? (
          <Empty>{translate('mc.noh2h', lang)}</Empty>
        ) : (
          <div className="card pad">
            <div className="row between center" style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 800 }}>
                {home?.club_name} <span className="display" style={{ fontSize: 26, color: 'var(--field)' }}>{winsFor(match.home_team_id)}</span>
              </span>
              <span className="stat-label muted">
                {pastMeetings.length} {translate('lbl.matches', lang)}
              </span>
              <span style={{ fontWeight: 800 }}>
                <span className="display" style={{ fontSize: 26, color: 'var(--field)' }}>{winsFor(match.away_team_id)}</span> {away?.club_name}
              </span>
            </div>
            <div className="col" style={{ gap: 8 }}>
              {pastMeetings.slice(0, 5).map((m) => (
                <Link key={m.match_id} href={`/matches/${m.match_id}`} className="row between center h2h-row">
                  <span className="muted" style={{ fontSize: 13 }}>
                    {fmt.date(m.match_date, lang)}
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {clubById.get(m.home_team_id)?.club_name} {m.home_score}–{m.away_score} {clubById.get(m.away_team_id)?.club_name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
