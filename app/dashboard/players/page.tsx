import { redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { managerNavItems } from '@/components/dashboard/navItems';
import { PlayersManager } from '@/components/dashboard/PlayersManager';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getClub, getPlayersOfClub, getOfficialsOfClub, getRegistrationsForClub, getPlayerStats } from '@/lib/queries';
import { t as translate } from '@/lib/i18n';

export default async function ManagePlayersPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== 'club_manager' || !appUser.club_id) redirect('/dashboard');

  const club = await getClub(appUser.club_id);
  if (!club) redirect('/dashboard');

  const [players, officials, regs, stats] = await Promise.all([
    getPlayersOfClub(club.club_id),
    getOfficialsOfClub(club.club_id),
    getRegistrationsForClub(club.club_id),
    getPlayerStats(),
  ]);
  const statsByPlayer = new Map(stats.filter((s) => s.club_id === club.club_id).map((s) => [s.player_id, s]));

  return (
    <DashShell
      items={managerNavItems(lang, { players: players.length, officials: officials.length, regs: regs.length })}
      active="players"
      title={`${translate('dash.myclub', lang)} · ${club.club_name}`}
      subtitle={`${translate('dash.welcome', lang)}, ${club.manager_name.trim()}`}
    >
      <PlayersManager clubId={club.club_id} players={players} stats={statsByPlayer} lang={lang} />
    </DashShell>
  );
}
