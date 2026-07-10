'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/dashboard/DashShell';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { useConfirm } from '@/components/ui/useConfirm';
import { PaymentForm } from './PaymentForm';
import { deletePaymentAction } from '@/app/actions/payments';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Payment, Registration, Club, Tournament } from '@/lib/types';

export function PaymentsAdmin({
  payments,
  approvedRegs,
  clubs,
  tournaments,
  lang,
}: {
  payments: Payment[];
  approvedRegs: Registration[];
  clubs: Club[];
  tournaments: Tournament[];
  lang: Lang;
}) {
  const [add, setAdd] = useState(false);
  const confirm = useConfirm({ confirm: translate('cta.confirm', lang), cancel: translate('cta.cancel', lang) });
  const clubById = new Map(clubs.map((c) => [c.club_id, c]));
  const tournamentById = new Map(tournaments.map((t) => [t.tournament_id, t]));
  const revenue = payments.filter((p) => p.payment_status === 'completed').reduce((a, p) => a + p.payment_amount, 0);

  return (
    <div>
      <SectionHead
        title={translate('dash.payments', lang)}
        action={
          <Button variant="primary" icon={I.plus} onClick={() => setAdd(true)}>
            {translate('cta.record', lang)}
          </Button>
        }
      />
      <div className="card pad" style={{ marginBottom: 18, background: 'var(--field-darker)', color: '#fff' }}>
        <div className="stat-label" style={{ color: 'var(--field-glow)' }}>
          {lang === 0 ? 'Jumlah Kutipan' : 'Total Revenue'}
        </div>
        <div className="display" style={{ fontSize: 48, color: '#fff', marginTop: 4 }}>
          RM {revenue.toLocaleString('en-MY')}
        </div>
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{translate('lbl.club', lang)}</th>
              <th>{translate('nav.tournaments', lang)}</th>
              <th className="num">{translate('lbl.amount', lang)}</th>
              <th>{translate('lbl.method', lang)}</th>
              <th>{translate('lbl.ref', lang)}</th>
              <th>{translate('lbl.status', lang)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const c = clubById.get(p.club_id);
              const tn = tournamentById.get(p.tournament_id);
              if (!c) return null;
              return (
                <tr key={p.payment_id}>
                  <td>
                    <div className="row center" style={{ gap: 10 }}>
                      <ClubLogo club={c} size={30} />
                      <span style={{ fontWeight: 700 }}>{c.club_name}</span>
                    </div>
                  </td>
                  <td className="muted">{tn?.tournament_name}</td>
                  <td className="num" style={{ color: 'var(--field)' }}>
                    {fmt.money(p.payment_amount)}
                  </td>
                  <td className="muted">{p.payment_method.replace('_', ' ').toUpperCase()}</td>
                  <td className="muted" style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {p.payment_reference || '—'}
                  </td>
                  <td>
                    <StatusBadge status={p.payment_status} label={statusLbl(p.payment_status, lang)} />
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => confirm.ask(translate('confirm.del', lang), () => deletePaymentAction(p.payment_id))}
                    >
                      <I.trash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {payments.length === 0 && <Empty>{lang === 0 ? 'Tiada bayaran direkodkan.' : 'No payments recorded.'}</Empty>}
      </div>
      {add && <PaymentForm approved={approvedRegs} clubs={clubs} tournaments={tournaments} lang={lang} onClose={() => setAdd(false)} />}
      {confirm.node}
    </div>
  );
}
