'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/dashboard/DashShell';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/useConfirm';
import { NewsForm } from './NewsForm';
import { deleteNewsAction } from '@/app/actions/news';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { t as translate, type Lang } from '@/lib/i18n';
import type { News } from '@/lib/types';

export function NewsAdmin({ news, lang }: { news: News[]; lang: Lang }) {
  const [edit, setEdit] = useState<{ nw: News | null } | null>(null);
  const confirm = useConfirm({ confirm: translate('cta.confirm', lang), cancel: translate('cta.cancel', lang) });

  return (
    <div>
      <SectionHead
        title={translate('dash.allnews', lang)}
        action={
          <Button variant="primary" icon={I.plus} onClick={() => setEdit({ nw: null })}>
            {lang === 0 ? 'Tambah Berita' : 'Add News'}
          </Button>
        }
      />
      <div className="col" style={{ gap: 12 }}>
        {news.map((nw) => (
          <div key={nw.news_id} className="card pad">
            <div className="row between center" style={{ gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="row center" style={{ gap: 10, marginBottom: 6 }}>
                  <span className="badge" style={{ background: 'var(--field)', color: '#fff' }}>
                    {lang === 0 ? nw.category_bm : nw.category_en}
                  </span>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {fmt.date(nw.published_date, lang)}
                  </span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 16 }}>{lang === 0 ? nw.title_bm : nw.title_en}</h3>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ nw })}>
                  <I.edit />
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(translate('confirm.del', lang), () => deleteNewsAction(nw.news_id))}>
                  <I.trash />
                </button>
              </div>
            </div>
          </div>
        ))}
        {news.length === 0 && (
          <div className="card">{lang === 0 ? 'Tiada berita.' : 'No news.'}</div>
        )}
      </div>
      {edit && <NewsForm nw={edit.nw} lang={lang} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}
