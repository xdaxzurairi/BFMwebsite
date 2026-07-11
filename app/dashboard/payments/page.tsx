import { redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { adminNavItems } from '@/components/dashboard/navItems';
import { PaymentsAdmin } from '@/components/dashboard/PaymentsAdmin';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getAllPayments, getAllRegistrations, getClubs, getTournaments } from '@/lib/queries';

export default async function PaymentsAdminPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'technical_admin')) redirect('/dashboard');

  const [payments, allRegs, clubs, tournaments] = await Promise.all([getAllPayments(), getAllRegistrations(), getClubs(), getTournaments()]);
  const pending = allRegs.filter((r) => r.status === 'pending').length;
  const approvedRegs = allRegs.filter((r) => r.status === 'approved');

  return (
    <DashShell items={adminNavItems(lang, pending)} active="payments" title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Kawalan penuh liga BFM' : 'Full control of the BFM league'}>
      <PaymentsAdmin payments={payments} approvedRegs={approvedRegs} clubs={clubs} tournaments={tournaments} lang={lang} />
    </DashShell>
  );
}
