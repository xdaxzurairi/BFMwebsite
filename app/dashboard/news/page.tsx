import { redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { adminNavItems } from '@/components/dashboard/navItems';
import { NewsAdmin } from '@/components/dashboard/NewsAdmin';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getNews, getAllRegistrations } from '@/lib/queries';

export default async function NewsAdminPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'technical_admin')) redirect('/dashboard');

  const [news, allRegs] = await Promise.all([getNews(), getAllRegistrations()]);
  const pending = allRegs.filter((r) => r.status === 'pending').length;

  return (
    <DashShell items={adminNavItems(lang, pending)} active="news" title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Kawalan penuh liga BFM' : 'Full control of the BFM league'}>
      <NewsAdmin news={news} lang={lang} />
    </DashShell>
  );
}
