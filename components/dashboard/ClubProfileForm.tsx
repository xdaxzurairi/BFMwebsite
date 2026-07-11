'use client';

import { useActionState } from 'react';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { updateClubAction } from '@/app/actions/clubs';
import { compressFileInput } from '@/lib/compressImage';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club } from '@/lib/types';

const STATES = ['Kuala Lumpur', 'Selangor', 'Pulau Pinang', 'Johor', 'Sabah', 'Melaka', 'Perak', 'Sarawak', 'Negeri Sembilan', 'Kedah', 'Pahang', 'Terengganu', 'Kelantan', 'Perlis'];

export function ClubProfileForm({ club, lang }: { club: Club; lang: Lang }) {
  const action = updateClubAction.bind(null, club.club_id);
  const [state, formAction, pending] = useActionState(action, null);
  useActionToast(state, pending, translate('club.updated', lang));

  return (
    <form action={formAction}>
      <div className="card pad">
        <div className="row center" style={{ gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
          <ClubLogo club={club} size={64} />
          <div className="field" style={{ flex: 1, maxWidth: 160 }}>
            <label>{lang === 0 ? 'Warna Kelab' : 'Club Color'}</label>
            <input type="color" name="color" defaultValue={club.color || '#1f6f43'} style={{ width: '100%', height: 40, borderRadius: 8, border: '1.5px solid var(--line)', cursor: 'pointer' }} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 200 }}>
            <label>{lang === 0 ? 'Muat Naik Logo' : 'Upload Logo'}</label>
            <input type="file" name="logo_file" accept="image/*" className="input" onChange={(e) => compressFileInput(e.currentTarget)} />
          </div>
        </div>
        <div className="grid field-grid-2" style={{ gap: 16 }}>
          <Field label={lang === 0 ? 'Nama Kelab' : 'Club Name'}>
            <Input name="club_name" defaultValue={club.club_name} required />
          </Field>
          <Field label={translate('lbl.state', lang)}>
            <Select name="state" defaultValue={club.state}>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label={translate('lbl.manager', lang)}>
            <Input name="manager_name" defaultValue={club.manager_name} required />
          </Field>
          <Field label={lang === 0 ? 'Telefon' : 'Phone'}>
            <Input name="phone" defaultValue={club.phone ?? ''} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={club.email ?? ''} />
          </Field>
          <input type="hidden" name="club_category" defaultValue={club.club_category} />
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 22 }}>
          <Button variant="primary" icon={I.check} disabled={pending}>
            {translate('cta.save', lang)}
          </Button>
        </div>
      </div>
    </form>
  );
}
