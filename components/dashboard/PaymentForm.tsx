'use client';

import { useActionState, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { recordPaymentAction } from '@/app/actions/payments';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Registration, Club, Tournament } from '@/lib/types';

export function PaymentForm({
  approved,
  clubs,
  tournaments,
  lang,
  onClose,
}: {
  approved: Registration[];
  clubs: Club[];
  tournaments: Tournament[];
  lang: Lang;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(recordPaymentAction, null);
  useActionToast(state, pending, translate('pay.recorded', lang), onClose);

  const clubById = new Map(clubs.map((c) => [c.club_id, c]));
  const tournamentById = new Map(tournaments.map((t) => [t.tournament_id, t]));
  const first = approved[0];
  const [reg, setReg] = useState(first ? `${first.tournament_id}:${first.club_id}` : '');
  const [amount, setAmount] = useState(first ? tournamentById.get(first.tournament_id)?.entry_fee ?? '' : '');

  const [tid, cid] = reg.split(':');

  return (
    <Modal title={translate('cta.record', lang)} onClose={onClose}>
      {approved.length === 0 ? (
        <Empty>
          {lang === 0
            ? 'Tiada pendaftaran yang diluluskan lagi. Luluskan pendaftaran kelab dalam tab Pendaftaran dahulu.'
            : 'No approved registrations yet. Approve a club registration in the Registrations tab first.'}
        </Empty>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="tournament_id" value={tid} />
          <input type="hidden" name="club_id" value={cid} />
          <div className="col" style={{ gap: 16 }}>
            <Field label={lang === 0 ? 'Pendaftaran (Kelab · Kejohanan)' : 'Registration (Club · Tournament)'} error={state?.error}>
              <Select
                value={reg}
                onChange={(e) => {
                  setReg(e.target.value);
                  const [t] = e.target.value.split(':').map(Number);
                  setAmount(tournamentById.get(t)?.entry_fee ?? '');
                }}
              >
                {approved.map((r) => (
                  <option key={r.registration_id} value={`${r.tournament_id}:${r.club_id}`}>
                    {clubById.get(r.club_id)?.club_name} · {tournamentById.get(r.tournament_id)?.tournament_name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid field-grid-2" style={{ gap: 16 }}>
              <Field label={`${translate('lbl.amount', lang)} (RM)`}>
                <Input name="payment_amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Field>
              <Field label={translate('lbl.method', lang)}>
                <Select name="payment_method" defaultValue="bank_transfer">
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="fpx">FPX</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </Select>
              </Field>
            </div>
            <Field label={translate('lbl.ref', lang)}>
              <Input name="payment_reference" placeholder="TXN-2026-…" />
            </Field>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
            <Button type="button" variant="ghost" onClick={onClose}>
              {translate('cta.cancel', lang)}
            </Button>
            <Button variant="primary" icon={I.check} disabled={pending}>
              {translate('cta.save', lang)}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
