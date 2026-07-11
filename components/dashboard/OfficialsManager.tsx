'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/dashboard/DashShell';
import { Avatar } from '@/components/ui/ClubLogo';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { useConfirm } from '@/components/ui/useConfirm';
import { I } from '@/components/ui/icons';
import { OfficialForm } from './OfficialForm';
import { deleteOfficialAction } from '@/app/actions/officials';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Official } from '@/lib/types';

export function OfficialsManager({ clubId, officials, lang }: { clubId: number; officials: Official[]; lang: Lang }) {
  const [edit, setEdit] = useState<{ official: Official | null } | null>(null);
  const confirm = useConfirm({ confirm: translate('cta.confirm', lang), cancel: translate('cta.cancel', lang) });

  return (
    <div>
      <SectionHead
        title={translate('dash.manageofficials', lang)}
        action={
          <Button variant="primary" icon={I.plus} onClick={() => setEdit({ official: null })}>
            {lang === 0 ? 'Tambah Pegawai' : 'Add Official'}
          </Button>
        }
      />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
        {officials.map((o) => (
          <div key={o.official_id} className="card pad">
            <div className="row center" style={{ gap: 13 }}>
              <Avatar a={o.first_name} b={o.last_name} size={46} color="var(--clay)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>
                  {o.first_name} {o.last_name}
                </div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {o.position}
                </div>
              </div>
            </div>
            <div className="badge" style={{ marginTop: 12 }}>
              {o.role}
            </div>
            <div className="row" style={{ gap: 6, marginTop: 14, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ official: o })}>
                <I.edit />
              </button>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() =>
                  confirm.ask(translate('confirm.del', lang), () => {
                    deleteOfficialAction(o.official_id, clubId);
                  })
                }
              >
                <I.trash />
              </button>
            </div>
          </div>
        ))}
      </div>
      {officials.length === 0 && (
        <div className="card">
          <Empty>{lang === 0 ? 'Belum ada pegawai.' : 'No officials yet.'}</Empty>
        </div>
      )}
      {edit && <OfficialForm clubId={clubId} official={edit.official} lang={lang} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}
