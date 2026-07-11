import { I } from '@/components/ui/icons';
import { t } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import type { DashItem } from './DashShell';

export function managerNavItems(lang: Lang, counts: { players: number; officials: number; regs: number }): DashItem[] {
  return [
    { id: 'overview', href: '/dashboard', icon: I.grid, label: t('dash.overview', lang) },
    { id: 'profile', href: '/dashboard/profile', icon: I.pin, label: t('dash.profile', lang) },
    { id: 'players', href: '/dashboard/players', icon: I.users, label: t('dash.manageplayers', lang), count: counts.players },
    { id: 'officials', href: '/dashboard/officials', icon: I.shield, label: t('dash.manageofficials', lang), count: counts.officials },
    { id: 'myregs', href: '/dashboard/registrations', icon: I.trophy, label: t('dash.myregs', lang), count: counts.regs },
  ];
}

export function adminNavItems(lang: Lang, pendingRegs: number): DashItem[] {
  return [
    { id: 'overview', href: '/dashboard', icon: I.grid, label: t('dash.overview', lang) },
    { id: 'regs', href: '/dashboard/registrations', icon: I.trophy, label: t('dash.regs', lang), count: pendingRegs || null },
    { id: 'tournaments', href: '/dashboard/tournaments', icon: I.calendar, label: t('dash.alltourn', lang) },
    { id: 'matches', href: '/dashboard/matches', icon: I.baseball, label: t('dash.allmatches', lang) },
    { id: 'clubs', href: '/dashboard/clubs', icon: I.shield, label: t('dash.allclubs', lang) },
    { id: 'news', href: '/dashboard/news', icon: I.news, label: t('dash.allnews', lang) },
    { id: 'payments', href: '/dashboard/payments', icon: I.money, label: t('dash.payments', lang) },
    { id: 'users', href: '/dashboard/users', icon: I.user, label: t('dash.users', lang) },
  ];
}
