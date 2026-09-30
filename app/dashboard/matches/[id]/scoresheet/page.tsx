import { notFound, redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { adminNavItems } from '@/components/dashboard/navItems';
import { ScoresheetEditor } from '@/components/dashboard/ScoresheetEditor';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getAllRegistrations, getClub, getMatch, getMatchBoxScore, getMatchInnings, getMatchPitching, getPlayersOfClub } from '@/lib/queries';
import type { Player } from '@/lib/types';

export default async function ScoresheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'technical_admin')) redirect('/dashboard');

  const match = await getMatch(Number(id));
  if (!match) notFound();

  const [home, away, homeRoster, awayRoster, box, pitching, innings, allRegs] = await Promise.all([
    getClub(match.home_team_id),
    getClub(match.away_team_id),
    getPlayersOfClub(match.home_team_id),
    getPlayersOfClub(match.away_team_id),
    getMatchBoxScore(match.match_id),
    getMatchPitching(match.match_id),
    getMatchInnings(match.match_id),
    getAllRegistrations(),
  ]);
  if (!home || !away) notFound();

  // Active rosters, plus anyone already on this scoresheet who has since been deactivated.
  const byId = new Map<number, Player>([...homeRoster, ...awayRoster].map((p) => [p.player_id, p]));
  for (const r of [...box, ...pitching]) if (!byId.has(r.player.player_id)) byId.set(r.player.player_id, r.player);
  const pending = allRegs.filter((r) => r.status === 'pending').length;

  return (
    <DashShell items={adminNavItems(lang, pending)} active="matches" title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Scoresheet rasmi perlawanan' : 'Official match scoresheet'}>
      <ScoresheetEditor
        key={`${match.match_id}-${match.updated_at}-${box.length}-${pitching.length}-${innings.length}`}
        match={match}
        away={away}
        home={home}
        players={[...byId.values()]}
        batting={box.map(withoutPlayer)}
        pitching={pitching.map(withoutPlayer)}
        innings={innings}
        lang={lang}
      />
    </DashShell>
  );
}

function withoutPlayer<T extends { player: Player }>(row: T): Omit<T, 'player'> {
  const copy: Partial<T> = { ...row };
  delete copy.player;
  return copy as Omit<T, 'player'>;
}
