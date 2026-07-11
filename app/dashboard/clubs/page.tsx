import { redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { adminNavItems } from '@/components/dashboard/navItems';
import { ClubsAdmin } from '@/components/dashboard/ClubsAdmin';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getClubs, getPlayersOfClub, getAllRegistrations } from '@/lib/queries';

export default async function ClubsAdminPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'technical_admin')) redirect('/dashboard');

  const [clubs, allRegs] = await Promise.all([getClubs(), getAllRegistrations()]);
  const pending = allRegs.filter((r) => r.status === 'pending').length;
  const playerCounts: Record<number, number> = {};
  await Promise.all(
    clubs.map(async (c) => {
      const players = await getPlayersOfClub(c.club_id);
      playerCounts[c.club_id] = players.length;
    })
  );

  return (
    <DashShell items={adminNavItems(lang, pending)} active="clubs" title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Kawalan penuh liga BFM' : 'Full control of the BFM league'}>
      <ClubsAdmin clubs={clubs} playerCounts={playerCounts} lang={lang} />
    </DashShell>
  );
}
