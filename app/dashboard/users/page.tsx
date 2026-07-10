import { redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { adminNavItems } from '@/components/dashboard/navItems';
import { UsersAdmin } from '@/components/dashboard/UsersAdmin';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getUsers, getClubs, getAllRegistrations } from '@/lib/queries';

export default async function UsersAdminPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'technical_admin')) redirect('/dashboard');

  const [users, clubs, allRegs] = await Promise.all([getUsers(), getClubs(), getAllRegistrations()]);
  const pending = allRegs.filter((r) => r.status === 'pending').length;

  return (
    <DashShell items={adminNavItems(lang, pending)} active="users" title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Kawalan penuh liga BFM' : 'Full control of the BFM league'}>
      <UsersAdmin users={users} clubs={clubs} lang={lang} />
    </DashShell>
  );
}
