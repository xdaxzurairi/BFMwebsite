'use client';

import Link from 'next/link';
import { Metric } from '@/components/dashboard/DashShell';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { I } from '@/components/ui/icons';
import { setRegistrationStatusAction } from '@/app/actions/registrations';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club, Tournament, Registration, Payment } from '@/lib/types';

export function AdminOverview({
  lang,
  clubCount,
  playerCount,
  tournamentCount,
  payments,
  pending,
  clubs,
  tournaments,
}: {
  lang: Lang;
  clubCount: number;
  playerCount: number;
  tournamentCount: number;
  payments: Payment[];
  pending: Registration[];
  clubs: Club[];
  tournaments: Tournament[];
}) {
  const clubById = new Map(clubs.map((c) => [c.club_id, c]));
  const tournamentById = new Map(tournaments.map((t) => [t.tournament_id, t]));
  const revenue = payments.filter((p) => p.payment_status === 'completed').reduce((a, p) => a + p.payment_amount, 0);

  return (
    <div className="col" style={{ gap: 24 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        <Metric icon={I.shield} label={translate('stats.clubs', lang)} value={clubCount} />
        <Metric icon={I.users} label={translate('stats.players', lang)} value={playerCount} tone="clay" />
        <Metric icon={I.calendar} label={translate('nav.tournaments', lang)} value={tournamentCount} />
        <div className="card pad">
          <div className="row between center">
            <div className="stat-label muted">{lang === 0 ? 'Kutipan' : 'Revenue'}</div>
            <I.money style={{ width: 18, height: 18, color: 'var(--field)' }} />
          </div>
          <div className="display" style={{ fontSize: 38, marginTop: 8, color: 'var(--field)' }}>
            RM {revenue.toLocaleString('en-MY')}
          </div>
        </div>
      </div>
      <div className="card pad">
        <div className="row between center" style={{ marginBottom: 14 }}>
          <h3 className="h-md">{translate('dash.pending', lang)}</h3>
          {pending.length > 0 && (
            <span className="badge badge-pending">
              {pending.length} {lang === 0 ? 'menunggu' : 'waiting'}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <Empty>{lang === 0 ? 'Tiada tindakan tertunggak. Bagus!' : 'Nothing pending. All clear!'}</Empty>
        ) : (
          <div className="col" style={{ gap: 10 }}>
            {pending.slice(0, 4).map((r) => {
              const c = clubById.get(r.club_id);
              const tn = tournamentById.get(r.tournament_id);
              if (!c) return null;
              return (
                <div key={r.registration_id} className="row between center" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap', gap: 10 }}>
                  <div className="row center" style={{ gap: 11 }}>
                    <ClubLogo club={c} size={36} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.club_name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {tn?.tournament_name}
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <form action={setRegistrationStatusAction.bind(null, r.registration_id, 'approved')}>
                      <Button size="sm" variant="field" icon={I.check}>
                        {translate('cta.approve', lang)}
                      </Button>
                    </form>
                    <form action={setRegistrationStatusAction.bind(null, r.registration_id, 'rejected')}>
                      <Button size="sm" variant="ghost">
                        {translate('cta.reject', lang)}
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
            {pending.length > 4 && (
              <Link href="/dashboard/registrations">
                <Button variant="ghost" size="sm">
                  {translate('cta.viewall', lang)}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
