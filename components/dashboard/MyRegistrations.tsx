'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/dashboard/DashShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { useConfirm } from '@/components/ui/useConfirm';
import { RegisterModal } from './RegisterModal';
import { withdrawRegistrationAction } from '@/app/actions/registrations';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Registration, Tournament, Payment } from '@/lib/types';

export function MyRegistrations({
  clubId,
  regs,
  openTournaments,
  tournaments,
  payments,
  lang,
  autoRegister,
}: {
  clubId: number;
  regs: Registration[];
  openTournaments: Tournament[];
  tournaments: Tournament[];
  payments: Payment[];
  lang: Lang;
  autoRegister?: number;
}) {
  const [showModal, setShowModal] = useState(!!autoRegister);
  const confirm = useConfirm({ confirm: translate('cta.confirm', lang), cancel: translate('cta.cancel', lang) });
  const tournamentById = new Map(tournaments.map((t) => [t.tournament_id, t]));

  return (
    <div>
      <SectionHead
        title={translate('dash.myregs', lang)}
        action={
          <Button variant="primary" icon={I.plus} onClick={() => setShowModal(true)}>
            {translate('cta.register', lang)}
          </Button>
        }
      />
      <div className="col" style={{ gap: 12 }}>
        {regs.map((r) => {
          const tn = tournamentById.get(r.tournament_id);
          const pay = payments.find((p) => p.tournament_id === r.tournament_id && p.club_id === clubId);
          return (
            <div key={r.registration_id} className="card pad">
              <div className="row between center" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div className="row center" style={{ gap: 10, marginBottom: 6 }}>
                    <StatusBadge status={r.status} label={statusLbl(r.status, lang)} />
                    <span className="muted" style={{ fontSize: 13 }}>
                      {fmt.date(r.registration_date, lang)}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 17 }}>{tn?.tournament_name}</h3>
                  <div className="row" style={{ gap: 14, marginTop: 6, fontSize: 13, color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
                    <span className="row center" style={{ gap: 5 }}>
                      <I.money style={{ width: 14, height: 14 }} />
                      {fmt.money(tn?.entry_fee, tn?.currency)}
                    </span>
                    {pay ? (
                      <span className="badge badge-completed">{lang === 0 ? 'Telah Bayar' : 'Paid'}</span>
                    ) : (
                      <span className="badge badge-pending">{lang === 0 ? 'Belum Bayar' : 'Unpaid'}</span>
                    )}
                  </div>
                </div>
                {(r.status === 'pending' || r.status === 'approved') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={I.x}
                    onClick={() =>
                      confirm.ask(lang === 0 ? 'Tarik diri daripada kejohanan ini?' : 'Withdraw from this tournament?', () => {
                        withdrawRegistrationAction(r.registration_id);
                      })
                    }
                  >
                    {translate('cta.withdraw', lang)}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {regs.length === 0 && (
          <div className="card">
            <Empty>{translate('reg.none', lang)}</Empty>
          </div>
        )}
      </div>
      {showModal && <RegisterModal clubId={clubId} open={openTournaments} preselect={autoRegister} lang={lang} onClose={() => setShowModal(false)} />}
      {confirm.node}
    </div>
  );
}
