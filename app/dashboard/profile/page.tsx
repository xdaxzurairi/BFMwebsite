import { redirect } from 'next/navigation';
import { DashShell, SectionHead } from '@/components/dashboard/DashShell';
import { managerNavItems } from '@/components/dashboard/navItems';
import { ClubProfileForm } from '@/components/dashboard/ClubProfileForm';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { getClub, getPlayersOfClub, getOfficialsOfClub, getRegistrationsForClub } from '@/lib/queries';
import { t as translate } from '@/lib/i18n';

export default async function ClubProfilePage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== 'club_manager' || !appUser.club_id) redirect('/dashboard');

  const club = await getClub(appUser.club_id);
  if (!club) redirect('/dashboard');

  const [players, officials, regs] = await Promise.all([
    getPlayersOfClub(club.club_id),
    getOfficialsOfClub(club.club_id),
    getRegistrationsForClub(club.club_id),
  ]);

  return (
    <DashShell
      items={managerNavItems(lang, { players: players.length, officials: officials.length, regs: regs.length })}
      active="profile"
      title={`${translate('dash.myclub', lang)} · ${club.club_name}`}
      subtitle={`${translate('dash.welcome', lang)}, ${club.manager_name.trim()}`}
    >
      <SectionHead title={translate('dash.profile', lang)} />
      <ClubProfileForm club={club} lang={lang} />
    </DashShell>
  );
}
