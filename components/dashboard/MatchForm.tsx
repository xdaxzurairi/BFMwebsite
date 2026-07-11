'use client';

import { useActionState, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { updateMatchAction } from '@/app/actions/matches';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Match, Club } from '@/lib/types';

export function MatchForm({ m, home, away, lang, onClose }: { m: Match; home?: Club; away?: Club; lang: Lang; onClose: () => void }) {
  const action = updateMatchAction.bind(null, m.match_id);
  const [state, formAction, pending] = useActionState(action, null);
  useActionToast(state, pending, translate('match.updated', lang), onClose);
  const [status, setStatus] = useState(m.status);

  return (
    <Modal title={lang === 0 ? 'Kemas Kini Perlawanan' : 'Update Match'} onClose={onClose}>
      <form action={formAction}>
        <div className="row center" style={{ gap: 16, justifyContent: 'center', marginBottom: 22 }}>
          <div className="col" style={{ alignItems: 'center', gap: 8, flex: 1 }}>
            <ClubLogo club={home ?? { club_name: '?' }} size={48} />
            <span style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{home?.club_name}</span>
            <Input name="home_score" type="number" defaultValue={m.home_score ?? ''} style={{ textAlign: 'center', fontSize: 22, fontWeight: 800 }} />
          </div>
          <span className="display" style={{ fontSize: 30, color: 'var(--ink-faint)', marginTop: 30 }}>
            –
          </span>
          <div className="col" style={{ alignItems: 'center', gap: 8, flex: 1 }}>
            <ClubLogo club={away ?? { club_name: '?' }} size={48} />
            <span style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{away?.club_name}</span>
            <Input name="away_score" type="number" defaultValue={m.away_score ?? ''} style={{ textAlign: 'center', fontSize: 22, fontWeight: 800 }} />
          </div>
        </div>
        <Field label={translate('lbl.status', lang)}>
          <Select name="status" value={status} onChange={(e) => setStatus(e.target.value as Match['status'])}>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="postponed">Postponed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {translate('cta.cancel', lang)}
          </Button>
          <Button variant="primary" icon={I.check} disabled={pending}>
            {translate('cta.save', lang)}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
