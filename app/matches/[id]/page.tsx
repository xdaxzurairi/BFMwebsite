import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Empty } from '@/components/ui/Empty';
import { I } from '@/components/ui/icons';
import { getLang } from '@/lib/lang';
import { getMatch, getClub, getTournament, getMatchBoxScore, getHeadToHead, getStatReviews } from '@/lib/queries';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club, Player, PlayerMatchStat } from '@/lib/types';

export const revalidate = 60;

type BoxRow = PlayerMatchStat & { player: Player };

export default async function MatchCentrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  const match = await getMatch(Number(id));
  if (!match) notFound();

  const [home, away, tournament, allBox, h2h, reviews] = await Promise.all([
    getClub(match.home_team_id),
    getClub(match.away_team_id),
    getTournament(match.tournament_id),
    getMatchBoxScore(match.match_id),
    getHeadToHead(match.home_team_id, match.away_team_id),
    getStatReviews(match.match_id),
  ]);
  // Only stats the opposing club (or an admin) approved are shown publicly.
  const reviewOf = (clubId: number) => reviews.find((r) => r.club_id === clubId);
  const box = allBox.filter((r) => reviewOf(r.player.club_id)?.status === 'approved');
  const unapproved = [away, home].flatMap((c) => {
    const r = c ? reviewOf(c.club_id) : undefined;
    return c && r && r.status !== 'approved' ? [{ club: c, status: r.status }] : [];
  });
  const clubById = new Map([home, away].filter((c): c is Club => !!c).map((c) => [c.club_id, c]));
  const done = match.status === 'completed';
  const homeBox = box.filter((r) => r.player.club_id === match.home_team_id);
  const awayBox = box.filter((r) => r.player.club_id === match.away_team_id);
  const hits = (rows: BoxRow[]) => rows.reduce((n, r) => n + r.hits, 0);
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
      <Link href="/matches" className="btn btn-ghost btn-sm" style={{ marginBottom: 22 }}>
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
        <div className="row center wrap-w" style={{ gap: 22, justifyContent: 'center', marginTop: 30, color: 'oklch(1 0 0 / .75)', fontSize: 14 }}>
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
        </div>
      </div>

      {done && (
        <div className="card" style={{ overflowX: 'auto', marginTop: 20 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>{translate('tbl.team', lang)}</th>
                <th className="num">R</th>
                <th className="num">H</th>
              </tr>
            </thead>
            <tbody>
              {[
                { club: away, score: match.away_score, rows: awayBox },
                { club: home, score: match.home_score, rows: homeBox },
              ].map((ln, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{ln.club?.club_name ?? '—'}</td>
                  <td className="num" style={{ fontWeight: 800, fontSize: 16 }}>
                    {ln.score}
                  </td>
                  <td className="num">{ln.rows.length ? hits(ln.rows) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="h-md" style={{ margin: '40px 0 16px' }}>
        {translate('mc.box', lang)}
      </h2>
      {unapproved.map((u) => (
        <p key={u.club.club_id} className="review-note" style={{ marginTop: 0, marginBottom: 12 }}>
          <strong>{u.club.club_name}:</strong> {translate(u.status === 'disputed' ? 'review.mc.disputed' : 'review.mc.pending', lang)}
        </p>
      ))}
      {box.length === 0 ? (
        <Empty>{translate('mc.nobox', lang)}</Empty>
      ) : (
        <div className="grid box-grid">
          <BoxTable club={away} rows={awayBox} lang={lang} />
          <BoxTable club={home} rows={homeBox} lang={lang} />
        </div>
      )}

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
  );
}

function BoxTable({ club, rows, lang }: { club: Club | null; rows: BoxRow[]; lang: Lang }) {
  const sum = (k: 'at_bats' | 'hits' | 'runs' | 'rbi') => rows.reduce((n, r) => n + r[k], 0);
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <div className="row center" style={{ gap: 10, padding: '16px 16px 4px' }}>
        {club && <ClubLogo club={club} size={28} />}
        <span style={{ fontWeight: 800 }}>{club?.club_name ?? '—'}</span>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>{lang === 0 ? 'Pemain' : 'Batter'}</th>
            <th className="num">{translate('tbl.ab', lang)}</th>
            <th className="num">{translate('tbl.r', lang)}</th>
            <th className="num">{translate('tbl.h', lang)}</th>
            <th className="num">RBI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.stat_id}>
              <td>
                <Link href={`/players/${r.player.player_id}`} style={{ fontWeight: 700 }}>
                  {r.player.first_name} {r.player.last_name}
                </Link>{' '}
                <span className="muted" style={{ fontSize: 12 }}>
                  #{r.player.jersey_number} {r.player.position}
                </span>
              </td>
              <td className="num">{r.at_bats}</td>
              <td className="num">{r.runs}</td>
              <td className="num">{r.hits}</td>
              <td className="num">{r.rbi}</td>
            </tr>
          ))}
          {rows.length > 0 && (
            <tr style={{ background: 'var(--cream)' }}>
              <td style={{ fontWeight: 800 }}>{lang === 0 ? 'Jumlah' : 'Totals'}</td>
              <td className="num">{sum('at_bats')}</td>
              <td className="num">{sum('runs')}</td>
              <td className="num">{sum('hits')}</td>
              <td className="num">{sum('rbi')}</td>
            </tr>
          )}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                —
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
