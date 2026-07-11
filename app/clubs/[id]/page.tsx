import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Counter } from '@/components/ui/Counter';
import { I } from '@/components/ui/icons';
import { ClubDetailTabs } from '@/components/clubs/ClubDetailTabs';
import { getLang } from '@/lib/lang';
import { getClub, getPlayersOfClub, getOfficialsOfClub, getPlayerStats } from '@/lib/queries';
import { t as translate } from '@/lib/i18n';

export const revalidate = 60;

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card pad">
      <div className="stat-num" style={{ color: 'var(--field)', fontSize: 46 }}>
        <Counter to={value} />
      </div>
      <div className="stat-label muted" style={{ marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clubId = Number(id);
  const lang = await getLang();
  const club = await getClub(clubId);
  if (!club) notFound();

  const [players, officials, stats] = await Promise.all([getPlayersOfClub(clubId), getOfficialsOfClub(clubId), getPlayerStats()]);
  const statsByPlayer = new Map(stats.filter((s) => s.club_id === clubId).map((s) => [s.player_id, s]));
  const totHits = players.reduce((a, p) => a + (statsByPlayer.get(p.player_id)?.total_hits ?? 0), 0);
  const totRuns = players.reduce((a, p) => a + (statsByPlayer.get(p.player_id)?.total_runs ?? 0), 0);

  return (
    <div>
      <div style={{ background: club.color ?? undefined, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 30px, oklch(1 0 0 / .06) 30px 31px)' }} />
        <div className="wrap" style={{ position: 'relative', paddingTop: 36, paddingBottom: 40 }}>
          <Link href="/clubs" className="btn btn-ghost btn-sm on-dark" style={{ marginBottom: 24 }}>
            <I.arrowL />
            {translate('cta.back', lang)}
          </Link>
          <div className="row center wrap-w" style={{ gap: 22 }}>
            <ClubLogo club={club} size={88} />
            <div style={{ color: '#fff' }}>
              <div className="kicker on-dark" style={{ marginBottom: 8 }}>
                {club.club_category === 'school' ? (lang === 0 ? 'Sekolah' : 'School') : lang === 0 ? 'Kelab' : 'Club'}
              </div>
              <h1 className="h-lg" style={{ color: '#fff' }}>
                {club.club_name}
              </h1>
              <div className="row center" style={{ gap: 18, marginTop: 10, color: 'oklch(1 0 0 / .85)', flexWrap: 'wrap' }}>
                <span className="row center" style={{ gap: 6 }}>
                  <I.pin style={{ width: 15, height: 15 }} />
                  {club.state}
                </span>
                <span className="row center" style={{ gap: 6 }}>
                  <I.user style={{ width: 15, height: 15 }} />
                  {club.manager_name}
                </span>
                <span className="row center" style={{ gap: 6 }}>
                  <I.users style={{ width: 15, height: 15 }} />
                  {players.length} {translate('lbl.players', lang)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="wrap section tight">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 30 }}>
          <StatCard label={translate('lbl.players', lang)} value={players.length} />
          <StatCard label={translate('lbl.hits', lang)} value={totHits} />
          <StatCard label={translate('lbl.runs', lang)} value={totRuns} />
        </div>
        <ClubDetailTabs lang={lang} players={players} stats={statsByPlayer} officials={officials} />
      </div>
    </div>
  );
}
