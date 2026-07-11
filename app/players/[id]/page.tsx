import Link from 'next/link';
import { notFound } from 'next/navigation';
import { I } from '@/components/ui/icons';
import { getLang } from '@/lib/lang';
import { getPlayer, getClub, getPlayerStats } from '@/lib/queries';
import { fmt } from '@/lib/format';
import { t as translate } from '@/lib/i18n';

export const revalidate = 60;

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playerId = Number(id);
  const lang = await getLang();
  const player = await getPlayer(playerId);
  if (!player) notFound();

  const [club, statRows] = await Promise.all([getClub(player.club_id), getPlayerStats(playerId)]);
  const s = statRows[0] ?? {
    total_matches: 0,
    total_hits: 0,
    total_runs: 0,
    total_rbi: 0,
    batting_average: 0,
  };

  const stats = [
    { label: translate('lbl.avg', lang), value: fmt.avg(s.batting_average), big: true },
    { label: translate('lbl.matches', lang), value: s.total_matches },
    { label: translate('lbl.hits', lang), value: s.total_hits },
    { label: translate('lbl.runs', lang), value: s.total_runs },
    { label: translate('lbl.rbi', lang), value: s.total_rbi },
  ];

  return (
    <div className="section wrap">
      <Link href={`/clubs/${player.club_id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: 22 }}>
        <I.arrowL />
        {club ? club.club_name : translate('cta.back', lang)}
      </Link>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="row wrap-w" style={{ gap: 0 }}>
          <div style={{ width: 260, flex: 'none', background: club?.color ?? 'var(--field)', position: 'relative', minHeight: 260 }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 22px, oklch(1 0 0 / .07) 22px 23px)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <span className="display" style={{ fontSize: 130, color: 'oklch(1 0 0 / .9)' }}>
                {player.jersey_number}
              </span>
            </div>
          </div>
          <div className="pad" style={{ flex: 1, minWidth: 280, padding: 34 }}>
            <div className="kicker" style={{ marginBottom: 12 }}>
              {club?.club_name}
            </div>
            <h1 className="h-lg">
              {player.first_name} {player.last_name}
            </h1>
            <div className="tag-row" style={{ marginTop: 14 }}>
              <span className="badge" style={{ background: 'var(--field)', color: '#fff' }}>
                {player.position}
              </span>
              <span className="badge">#{player.jersey_number}</span>
              {player.medical_clearance && (
                <span className="badge badge-approved">
                  <I.check style={{ width: 12, height: 12 }} />
                  {lang === 0 ? 'Saringan Perubatan' : 'Medically Cleared'}
                </span>
              )}
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(90px,1fr))', marginTop: 28, gap: 18 }}>
              {stats.map((st, i) => (
                <div key={i}>
                  <div className="display" style={{ fontSize: st.big ? 44 : 36, color: st.big ? 'var(--clay)' : 'var(--ink)' }}>
                    {st.value}
                  </div>
                  <div className="stat-label muted" style={{ marginTop: 2 }}>
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
