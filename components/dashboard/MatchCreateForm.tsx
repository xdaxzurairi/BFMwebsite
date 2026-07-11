'use client';

import { useActionState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { createMatchAction } from '@/app/actions/matches';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Tournament, Club } from '@/lib/types';

export function MatchCreateForm({ tournaments, clubs, lang, onClose }: { tournaments: Tournament[]; clubs: Club[]; lang: Lang; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createMatchAction, null);
  useActionToast(state, pending, translate('match.added', lang), onClose);

  return (
    <Modal title={lang === 0 ? 'Jadualkan Perlawanan' : 'Schedule Match'} onClose={onClose}>
      <form action={formAction}>
        <div className="grid field-grid-2" style={{ gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label={translate('nav.tournaments', lang)} error={state?.error}>
              <Select name="tournament_id" defaultValue={tournaments[0]?.tournament_id}>
                {tournaments.map((tn) => (
                  <option key={tn.tournament_id} value={tn.tournament_id}>
                    {tn.tournament_name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={lang === 0 ? 'Pasukan Rumah' : 'Home Team'}>
            <Select name="home_team_id" defaultValue="">
              <option value="">—</option>
              {clubs.map((c) => (
                <option key={c.club_id} value={c.club_id}>
                  {c.club_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={lang === 0 ? 'Pasukan Tetamu' : 'Away Team'}>
            <Select name="away_team_id" defaultValue="">
              <option value="">—</option>
              {clubs.map((c) => (
                <option key={c.club_id} value={c.club_id}>
                  {c.club_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={lang === 0 ? 'Tarikh & Masa' : 'Date & Time'}>
            <Input type="datetime-local" name="match_date" required />
          </Field>
          <Field label={translate('lbl.venue', lang)}>
            <Input name="venue" />
          </Field>
          <Field label={lang === 0 ? 'Nama Pusingan' : 'Round Name'} hint="e.g. Group A, Final">
            <Input name="round_name" />
          </Field>
          <Field label={lang === 0 ? 'Jenis' : 'Type'}>
            <Select name="match_type" defaultValue="group">
              <option value="group">Group</option>
              <option value="semifinal">Semifinal</option>
              <option value="final">Final</option>
            </Select>
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
    </Modal>
  );
}
