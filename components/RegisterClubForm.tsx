'use client';

import { useActionState } from 'react';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { I } from '@/components/ui/icons';
import { registerClubAction } from '@/app/actions/clubs';
import { t as translate, type Lang } from '@/lib/i18n';

const STATES = ['Kuala Lumpur', 'Selangor', 'Pulau Pinang', 'Johor', 'Sabah', 'Melaka', 'Perak', 'Sarawak', 'Negeri Sembilan', 'Kedah', 'Pahang', 'Terengganu', 'Kelantan', 'Perlis'];

export function RegisterClubForm({ lang, defaultManagerName }: { lang: Lang; defaultManagerName?: string }) {
  const [state, formAction, pending] = useActionState(registerClubAction, null);

  return (
    <form action={formAction} className="card pad">
      {state?.error && (
        <div className="field-err" style={{ marginBottom: 16 }}>
          {state.error}
        </div>
      )}
      <div className="grid field-grid-2" style={{ gap: 16 }}>
        <Field label={lang === 0 ? 'Nama Kelab' : 'Club Name'}>
          <Input name="club_name" required />
        </Field>
        <Field label={translate('lbl.state', lang)}>
          <Select name="state" defaultValue={STATES[0]}>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label={translate('lbl.category', lang)}>
          <Select name="club_category" defaultValue="club">
            <option value="club">Club</option>
            <option value="school">School</option>
          </Select>
        </Field>
        <Field label={translate('lbl.manager', lang)}>
          <Input name="manager_name" defaultValue={defaultManagerName} required />
        </Field>
        <Field label={lang === 0 ? 'Telefon' : 'Phone'}>
          <Input name="phone" />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" />
        </Field>
        <Field label={lang === 0 ? 'Warna' : 'Color'}>
          <input type="color" name="color" defaultValue="#1f6f43" style={{ width: '100%', height: 44, borderRadius: 8, border: '1.5px solid var(--line)', cursor: 'pointer' }} />
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label={lang === 0 ? 'Logo Kelab' : 'Club Logo'} hint={lang === 0 ? 'Muat naik imej dari peranti (pilihan)' : 'Upload an image from your device (optional)'}>
            <input type="file" name="logo_file" accept="image/*" className="input" />
          </Field>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 22 }}>
        <Button variant="primary" icon={I.check} disabled={pending}>
          {translate('cta.registerclub', lang)}
        </Button>
      </div>
    </form>
  );
}
