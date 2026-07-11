'use client';

import { useActionState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { addOfficialAction, updateOfficialAction } from '@/app/actions/officials';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Official } from '@/lib/types';

export function OfficialForm({ clubId, official, lang, onClose }: { clubId: number; official: Official | null; lang: Lang; onClose: () => void }) {
  const action = official ? updateOfficialAction.bind(null, official.official_id, clubId) : addOfficialAction.bind(null, clubId);
  const [state, formAction, pending] = useActionState(action, null);
  useActionToast(state, pending, translate(official ? 'official.updated' : 'official.added', lang), onClose);

  return (
    <Modal title={official ? translate('cta.edit', lang) : lang === 0 ? 'Tambah Pegawai' : 'Add Official'} onClose={onClose}>
      <form action={formAction}>
        <div className="grid field-grid-2" style={{ gap: 16 }}>
          <Field label={lang === 0 ? 'Nama Pertama' : 'First Name'}>
            <Input name="first_name" defaultValue={official?.first_name} required />
          </Field>
          <Field label={lang === 0 ? 'Nama Akhir' : 'Last Name'}>
            <Input name="last_name" defaultValue={official?.last_name} required />
          </Field>
          <Field label={translate('lbl.position', lang)} hint={lang === 0 ? 'cth: Jurulatih, Pengurus' : 'e.g. Coach, Manager'}>
            <Input name="position" defaultValue={official?.position} required />
          </Field>
          <Field label={lang === 0 ? 'Peranan' : 'Role'}>
            <Input name="role" defaultValue={official?.role ?? ''} />
          </Field>
          <Field label={lang === 0 ? 'Telefon' : 'Phone'}>
            <Input name="phone" defaultValue={official?.phone ?? ''} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={official?.email ?? ''} />
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
