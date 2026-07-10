import { redirect } from 'next/navigation';
import { DashShell } from '@/components/dashboard/DashShell';
import { managerNavItems, adminNavItems } from '@/components/dashboard/navItems';
import { MyRegistrations } from '@/components/dashboard/MyRegistrations';
import { RegistrationsAdmin } from '@/components/dashboard/RegistrationsAdmin';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import {
  getClub,
  getPlayersOfClub,
  getOfficialsOfClub,
  getRegistrationsForClub,
  getTournaments,
  getAllRegistrations,
  getClubs,
  getAllPayments,
} from '@/lib/queries';
import { t as translate } from '@/lib/i18n';

export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<{ register?: string }> }) {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser) redirect('/sign-in');

  if (appUser.role === 'admin' || appUser.role === 'technical_admin') {
    const [regs, clubs, tournaments] = await Promise.all([getAllRegistrations(), getClubs(), getTournaments()]);
    const pending = regs.filter((r) => r.status === 'pending').length;
    return (
      <DashShell items={adminNavItems(lang, pending)} active="regs" title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Kawalan penuh liga BFM' : 'Full control of the BFM league'}>
        <RegistrationsAdmin regs={regs} clubs={clubs} tournaments={tournaments} lang={lang} />
      </DashShell>
    );
  }

  if (appUser.role !== 'club_manager' || !appUser.club_id) redirect('/dashboard');
  const club = await getClub(appUser.club_id);
  if (!club) redirect('/dashboard');

  const { register } = await searchParams;
  const [players, officials, regs, tournaments, payments] = await Promise.all([
    getPlayersOfClub(club.club_id),
    getOfficialsOfClub(club.club_id),
    getRegistrationsForClub(club.club_id),
    getTournaments(),
    getAllPayments(),
  ]);
  const openTournaments = tournaments.filter((t) => t.status === 'upcoming');

  return (
    <DashShell
      items={managerNavItems(lang, { players: players.length, officials: officials.length, regs: regs.length })}
      active="myregs"
      title={`${translate('dash.myclub', lang)} · ${club.club_name}`}
      subtitle={`${translate('dash.welcome', lang)}, ${club.manager_name.trim()}`}
    >
      <MyRegistrations
        clubId={club.club_id}
        regs={regs}
        openTournaments={openTournaments}
        tournaments={tournaments}
        payments={payments.filter((p) => p.club_id === club.club_id)}
        lang={lang}
        autoRegister={register ? Number(register) : undefined}
      />
    </DashShell>
  );
}
