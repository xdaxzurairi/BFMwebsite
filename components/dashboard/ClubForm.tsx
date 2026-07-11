'use client';

import { useActionState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { createClubAction, updateClubAction } from '@/app/actions/clubs';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club } from '@/lib/types';

const STATES = ['Kuala Lumpur', 'Selangor', 'Pulau Pinang', 'Johor', 'Sabah', 'Melaka', 'Perak', 'Sarawak', 'Negeri Sembilan', 'Kedah', 'Pahang', 'Terengganu', 'Kelantan', 'Perlis'];

export function ClubForm({ club, lang, onClose }: { club: Club | null; lang: Lang; onClose: () => void }) {
  const action = club ? updateClubAction.bind(null, club.club_id) : createClubAction;
  const [state, formAction, pending] = useActionState(action, null);
  useActionToast(state, pending, translate(club ? 'club.updated' : 'club.added', lang), onClose);

  return (
    <Modal title={club ? translate('cta.edit', lang) : lang === 0 ? 'Tambah Kelab' : 'Add Club'} onClose={onClose}>
      <form action={formAction}>
        <div className="grid field-grid-2" style={{ gap: 16 }}>
          <Field label={lang === 0 ? 'Nama Kelab' : 'Club Name'}>
            <Input name="club_name" defaultValue={club?.club_name} required />
          </Field>
          <Field label={translate('lbl.state', lang)}>
            <Select name="state" defaultValue={club?.state ?? STATES[0]}>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label={translate('lbl.category', lang)}>
            <Select name="club_category" defaultValue={club?.club_category ?? 'club'}>
              <option value="club">Club</option>
              <option value="school">School</option>
            </Select>
          </Field>
          <Field label={translate('lbl.manager', lang)}>
            <Input name="manager_name" defaultValue={club?.manager_name} required />
          </Field>
          <Field label={lang === 0 ? 'Telefon' : 'Phone'}>
            <Input name="phone" defaultValue={club?.phone ?? ''} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={club?.email ?? ''} />
          </Field>
          <Field label={lang === 0 ? 'Warna' : 'Color'}>
            <input type="color" name="color" defaultValue={club?.color ?? '#1f6f43'} style={{ width: '100%', height: 44, borderRadius: 8, border: '1.5px solid var(--line)', cursor: 'pointer' }} />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label={lang === 0 ? 'Logo Kelab' : 'Club Logo'} hint={lang === 0 ? 'Muat naik imej dari peranti (pilihan)' : 'Upload an image from your device (optional)'}>
              <input type="file" name="logo_file" accept="image/*" className="input" />
            </Field>
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
