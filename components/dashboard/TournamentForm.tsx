'use client';

import { useActionState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { createTournamentAction, updateTournamentAction } from '@/app/actions/tournaments';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Tournament } from '@/lib/types';

export function TournamentForm({ tn, lang, onClose }: { tn: Tournament | null; lang: Lang; onClose: () => void }) {
  const action = tn ? updateTournamentAction.bind(null, tn.tournament_id) : createTournamentAction;
  const [state, formAction, pending] = useActionState(action, null);
  useActionToast(state, pending, translate(tn ? 'tourn.updated' : 'tourn.created', lang), onClose);

  return (
    <Modal wide title={tn ? translate('cta.edit', lang) : lang === 0 ? 'Cipta Kejohanan' : 'Create Tournament'} onClose={onClose}>
      <form action={formAction}>
        <div className="grid field-grid-2" style={{ gap: 16 }}>
          <Field label={lang === 0 ? 'Nama Kejohanan' : 'Tournament Name'}>
            <Input name="tournament_name" defaultValue={tn?.tournament_name} required />
          </Field>
          <Field label={translate('lbl.venue', lang)}>
            <Input name="location" defaultValue={tn?.location ?? ''} />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label={lang === 0 ? 'Keterangan' : 'Description'}>
              <Textarea name="description" defaultValue={tn?.description ?? ''} />
            </Field>
          </div>
          <Field label={translate('lbl.level', lang)}>
            <Select name="tournament_level" defaultValue={tn?.tournament_level ?? 'local'}>
              <option value="local">Local</option>
              <option value="regional">Regional</option>
              <option value="national">National</option>
              <option value="international">International</option>
            </Select>
          </Field>
          <Field label={translate('lbl.category', lang)}>
            <Select name="tournament_category" defaultValue={tn?.tournament_category ?? 'adult'}>
              <option value="youth">Youth</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </Select>
          </Field>
          <Field label={lang === 0 ? 'Tarikh Mula' : 'Start Date'}>
            <Input type="date" name="start_date" defaultValue={tn?.start_date} required />
          </Field>
          <Field label={lang === 0 ? 'Tarikh Tamat' : 'End Date'}>
            <Input type="date" name="end_date" defaultValue={tn?.end_date} required />
          </Field>
          <Field label={translate('lbl.regclose', lang)}>
            <Input type="date" name="registration_end" defaultValue={tn?.registration_end ?? ''} />
          </Field>
          <Field label={translate('lbl.status', lang)}>
            <Select name="status" defaultValue={tn?.status ?? 'upcoming'}>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </Field>
          <Field label={`${translate('lbl.teams', lang)} (max)`}>
            <Input type="number" name="max_teams" defaultValue={tn?.max_teams ?? 8} />
          </Field>
          <Field label={`${translate('lbl.entryfee', lang)} (RM)`}>
            <Input type="number" name="entry_fee" defaultValue={tn?.entry_fee ?? 0} />
          </Field>
          <Field label={`${translate('lbl.prizepool', lang)} (RM)`}>
            <Input type="number" name="prize_pool" defaultValue={tn?.prize_pool ?? 0} />
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
