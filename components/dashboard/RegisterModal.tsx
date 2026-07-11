'use client';

import { useActionState, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { registerForTournamentAction } from '@/app/actions/registrations';
import { fmt } from '@/lib/format';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Tournament } from '@/lib/types';

export function RegisterModal({ clubId, open, preselect, lang, onClose }: { clubId: number; open: Tournament[]; preselect?: number; lang: Lang; onClose: () => void }) {
  const action = registerForTournamentAction.bind(null, clubId);
  const [state, formAction, pending] = useActionState(action, null);
  useActionToast(state, pending, translate('reg.done', lang), onClose);

  const [tid, setTid] = useState(String(preselect || open[0]?.tournament_id || ''));
  const tn = open.find((o) => o.tournament_id === Number(tid));

  return (
    <Modal title={translate('reg.title', lang)} onClose={onClose}>
      {open.length === 0 ? (
        <Empty>{translate('reg.empty', lang)}</Empty>
      ) : (
        <form action={formAction}>
          <div className="col" style={{ gap: 18 }}>
            <Field label={translate('reg.pick', lang)} error={state?.error}>
              <Select name="tournament_id" value={tid} onChange={(e) => setTid(e.target.value)}>
                {open.map((o) => (
                  <option key={o.tournament_id} value={o.tournament_id}>
                    {o.tournament_name}
                  </option>
                ))}
              </Select>
            </Field>
            {tn && (
              <div className="card pad" style={{ background: 'var(--cream)' }}>
                <div className="row" style={{ gap: 20, flexWrap: 'wrap' }}>
                  <div>
                    <div className="stat-label muted">{translate('lbl.entryfee', lang)}</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--field)' }}>{fmt.money(tn.entry_fee, tn.currency)}</div>
                  </div>
                  <div>
                    <div className="stat-label muted">{translate('lbl.dates', lang)}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{fmt.dateRange(tn.start_date, tn.end_date, lang)}</div>
                  </div>
                  <div>
                    <div className="stat-label muted">{translate('lbl.regclose', lang)}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{fmt.date(tn.registration_end, lang)}</div>
                  </div>
                </div>
              </div>
            )}
            <Field label={translate('reg.notes', lang)}>
              <Textarea name="notes" placeholder={lang === 0 ? 'Sebarang maklumat tambahan…' : 'Any extra information…'} />
            </Field>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
            <Button type="button" variant="ghost" onClick={onClose}>
              {translate('cta.cancel', lang)}
            </Button>
            <Button variant="primary" icon={I.trophy} disabled={pending}>
              {translate('cta.submit', lang)}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
