import { redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { managerNavItems } from '@/components/dashboard/navItems';
import { ManagerStats } from '@/components/dashboard/ManagerStats';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getClub, getClubs, getMatches, getPlayersOfClub, getOfficialsOfClub, getRegistrationsForClub, getStatCountsForClub } from '@/lib/queries';
import { t as translate } from '@/lib/i18n';

export default async function ManagerStatsPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== 'club_manager' || !appUser.club_id) redirect('/dashboard');

  const club = await getClub(appUser.club_id);
  if (!club) redirect('/dashboard');

  const [players, officials, regs, clubs, matches, statCounts] = await Promise.all([
    getPlayersOfClub(club.club_id),
    getOfficialsOfClub(club.club_id),
    getRegistrationsForClub(club.club_id),
    getClubs(),
    getMatches(),
    getStatCountsForClub(club.club_id),
  ]);
  const ours = matches.filter((m) => (m.home_team_id === club.club_id || m.away_team_id === club.club_id) && (m.status === 'completed' || m.status === 'live'));

  return (
    <DashShell
      items={managerNavItems(lang, { players: players.length, officials: officials.length, regs: regs.length })}
      active="stats"
      title={`${translate('dash.myclub', lang)} · ${club.club_name}`}
      subtitle={`${translate('dash.welcome', lang)}, ${club.manager_name.trim()}`}
    >
      <ManagerStats club={club} clubs={clubs} matches={ours} statCounts={statCounts} lang={lang} />
    </DashShell>
  );
}
