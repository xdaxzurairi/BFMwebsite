import { redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { adminNavItems } from '@/components/dashboard/navItems';
import { TournamentsAdmin } from '@/components/dashboard/TournamentsAdmin';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getTournaments, getAllRegistrations } from '@/lib/queries';

export default async function TournamentsAdminPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'technical_admin')) redirect('/dashboard');

  const [tournaments, allRegs] = await Promise.all([getTournaments(), getAllRegistrations()]);
  const pending = allRegs.filter((r) => r.status === 'pending').length;
  const teamCounts: Record<number, number> = {};
  tournaments.forEach((tn) => {
    teamCounts[tn.tournament_id] = allRegs.filter((r) => r.tournament_id === tn.tournament_id && r.status === 'approved').length;
  });

  return (
    <DashShell items={adminNavItems(lang, pending)} active="tournaments" title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Kawalan penuh liga BFM' : 'Full control of the BFM league'}>
      <TournamentsAdmin tournaments={tournaments} teamCounts={teamCounts} lang={lang} />
    </DashShell>
  );
}
