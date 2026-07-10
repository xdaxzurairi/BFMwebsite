'use client';

import { useActionState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { addPlayerAction, updatePlayerAction } from '@/app/actions/players';
import { POSITIONS } from '@/lib/positions';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Player } from '@/lib/types';

export function PlayerForm({ clubId, player, lang, onClose }: { clubId: number; player: Player | null; lang: Lang; onClose: () => void }) {
  const action = player ? updatePlayerAction.bind(null, player.player_id, clubId) : addPlayerAction.bind(null, clubId);
  const [state, formAction, pending] = useActionState(action, null);
  useActionToast(state, pending, translate(player ? 'player.updated' : 'player.added', lang), onClose);

  return (
    <Modal title={player ? `${translate('cta.edit', lang)} ${lang === 0 ? 'Pemain' : 'Player'}` : lang === 0 ? 'Tambah Pemain' : 'Add Player'} onClose={onClose}>
      <form action={formAction}>
        <div className="grid field-grid-2" style={{ gap: 16 }}>
          <Field label={lang === 0 ? 'Nama Pertama' : 'First Name'}>
            <Input name="first_name" defaultValue={player?.first_name} required />
          </Field>
          <Field label={lang === 0 ? 'Nama Akhir' : 'Last Name'}>
            <Input name="last_name" defaultValue={player?.last_name} required />
          </Field>
          <Field label={translate('lbl.jersey', lang)}>
            <Input name="jersey_number" type="number" defaultValue={player?.jersey_number} required />
          </Field>
          <Field label={translate('lbl.position', lang)}>
            <Select name="position" defaultValue={player?.position ?? POSITIONS[0]}>
              {POSITIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label style={{ marginBottom: 2 }}>{lang === 0 ? 'Saringan Perubatan' : 'Medical Clearance'}</label>
            <label className="row center" style={{ gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              <input type="checkbox" name="medical_clearance" defaultChecked={player?.medical_clearance} style={{ width: 18, height: 18, accentColor: 'var(--field)' }} />
              {lang === 0 ? 'Pemain telah lulus saringan perubatan' : 'Player has passed medical clearance'}
            </label>
          </div>
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
