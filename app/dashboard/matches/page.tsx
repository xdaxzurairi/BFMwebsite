import { redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { adminNavItems } from '@/components/dashboard/navItems';
import { MatchesAdmin } from '@/components/dashboard/MatchesAdmin';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getMatches, getClubs, getTournaments, getAllRegistrations } from '@/lib/queries';

export default async function MatchesAdminPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'technical_admin')) redirect('/dashboard');

  const [matches, clubs, tournaments, allRegs] = await Promise.all([getMatches(), getClubs(), getTournaments(), getAllRegistrations()]);
  const pending = allRegs.filter((r) => r.status === 'pending').length;

  return (
    <DashShell items={adminNavItems(lang, pending)} active="matches" title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Kawalan penuh liga BFM' : 'Full control of the BFM league'}>
      <MatchesAdmin matches={matches} clubs={clubs} tournaments={tournaments} lang={lang} />
    </DashShell>
  );
}
