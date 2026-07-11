'use client';

import { useActionState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useActionToast } from '@/components/ui/useActionToast';
import { I } from '@/components/ui/icons';
import { createNewsAction, updateNewsAction } from '@/app/actions/news';
import { t as translate, type Lang } from '@/lib/i18n';
import type { News } from '@/lib/types';

export function NewsForm({ nw, lang, onClose }: { nw: News | null; lang: Lang; onClose: () => void }) {
  const action = nw ? updateNewsAction.bind(null, nw.news_id) : createNewsAction;
  const [state, formAction, pending] = useActionState(action, null);
  useActionToast(state, pending, translate(nw ? 'news.updated' : 'news.added', lang), onClose);

  return (
    <Modal wide title={nw ? translate('cta.edit', lang) : lang === 0 ? 'Tambah Berita' : 'Add News'} onClose={onClose}>
      <form action={formAction}>
        <div className="grid field-grid-2" style={{ gap: 16 }}>
          <Field label="Tajuk (BM)">
            <Input name="title_bm" defaultValue={nw?.title_bm} required />
          </Field>
          <Field label="Title (EN)">
            <Input name="title_en" defaultValue={nw?.title_en} required />
          </Field>
          <Field label="Kategori (BM)">
            <Input name="category_bm" defaultValue={nw?.category_bm ?? 'Pengumuman'} />
          </Field>
          <Field label="Category (EN)">
            <Input name="category_en" defaultValue={nw?.category_en ?? 'Announcement'} />
          </Field>
          <Field label={translate('lbl.date', lang)}>
            <Input type="date" name="published_date" defaultValue={nw?.published_date ?? new Date().toISOString().slice(0, 10)} />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label={lang === 0 ? 'Muat Naik Imej' : 'Upload Image'} hint={lang === 0 ? 'Pilih fail dari peranti anda' : 'Choose a photo from your device'}>
              <input type="file" name="cover_image_file" accept="image/*" className="input" />
            </Field>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label={lang === 0 ? 'Atau URL Imej' : 'Or Image URL'} hint={lang === 0 ? 'Digunakan jika tiada fail dimuat naik' : 'Used only if no file is uploaded above'}>
              <Input type="url" name="cover_image" defaultValue={nw?.cover_image ?? ''} placeholder="https://…" />
            </Field>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Isi (BM)">
              <Textarea name="body_bm" defaultValue={nw?.body_bm} />
            </Field>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Body (EN)">
              <Textarea name="body_en" defaultValue={nw?.body_en} />
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
