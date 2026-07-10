import { redirect } from 'next/navigation';
import { Diamond } from '@/components/ui/icons';
import { DashShell } from '@/components/dashboard/DashShell';
import { managerNavItems, adminNavItems } from '@/components/dashboard/navItems';
import { ManagerOverview } from '@/components/dashboard/ManagerOverview';
import { AdminOverview } from '@/components/dashboard/AdminOverview';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getClub, getPlayersOfClub, getOfficialsOfClub, getRegistrationsForClub, getPlayerStats, getClubs, getAllRegistrations, getAllPayments, getTournaments } from '@/lib/queries';
import { t as translate } from '@/lib/i18n';

export default async function DashboardOverviewPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser) redirect('/sign-in');

  if (appUser.role === 'admin' || appUser.role === 'technical_admin') {
    const [clubs, tournaments, regs, payments] = await Promise.all([getClubs(), getTournaments(), getAllRegistrations(), getAllPayments()]);
    const pending = regs.filter((r) => r.status === 'pending');
    const playerCount = (await getPlayerStats()).length;
    return (
      <DashShell items={adminNavItems(lang, pending.length)} active="overview" title={lang === 0 ? 'Konsol Pentadbir' : 'Admin Console'} subtitle={lang === 0 ? 'Kawalan penuh liga BFM' : 'Full control of the BFM league'}>
        <AdminOverview lang={lang} clubCount={clubs.length} playerCount={playerCount} tournamentCount={tournaments.length} payments={payments} pending={pending} clubs={clubs} tournaments={tournaments} />
      </DashShell>
    );
  }

  if (appUser.role === 'club_manager') {
    const club = appUser.club_id ? await getClub(appUser.club_id) : null;
    if (!club) {
      return (
        <div className="wrap section tight">
          <div className="card pad" style={{ textAlign: 'center', padding: '60px 30px' }}>
            <Diamond cls="outline" style={{ width: 26, height: 26, margin: '0 auto 16px' }} />
            <h2 className="h-md" style={{ marginBottom: 10 }}>
              {lang === 0 ? 'Belum ada kelab dikaitkan' : 'No club linked yet'}
            </h2>
            <p className="muted" style={{ maxWidth: 420, margin: '0 auto' }}>
              {lang === 0
                ? 'Sila hubungi Pentadbir BFM untuk mendaftarkan kelab anda sebelum mengurus pemain dan pegawai.'
                : 'Please ask a BFM Admin to register your club before managing players and officials.'}
            </p>
          </div>
        </div>
      );
    }
    const [players, officials, regs, stats] = await Promise.all([
      getPlayersOfClub(club.club_id),
      getOfficialsOfClub(club.club_id),
      getRegistrationsForClub(club.club_id),
      getPlayerStats(),
    ]);
    return (
      <DashShell
        items={managerNavItems(lang, { players: players.length, officials: officials.length, regs: regs.length })}
        active="overview"
        title={`${translate('dash.myclub', lang)} · ${club.club_name}`}
        subtitle={`${translate('dash.welcome', lang)}, ${club.manager_name.trim()}`}
      >
        <ManagerOverview lang={lang} club={club} players={players} officials={officials} regs={regs} stats={stats.filter((s) => s.club_id === club.club_id)} />
      </DashShell>
    );
  }

  redirect('/');
}
