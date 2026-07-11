'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SectionHead } from '@/components/dashboard/DashShell';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/useConfirm';
import { ClubForm } from './ClubForm';
import { deactivateClubAction } from '@/app/actions/clubs';
import { I } from '@/components/ui/icons';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club } from '@/lib/types';

export function ClubsAdmin({ clubs, playerCounts, lang }: { clubs: Club[]; playerCounts: Record<number, number>; lang: Lang }) {
  const [edit, setEdit] = useState<{ club: Club | null } | null>(null);
  const confirm = useConfirm({ confirm: translate('cta.confirm', lang), cancel: translate('cta.cancel', lang) });

  return (
    <div>
      <SectionHead
        title={translate('dash.allclubs', lang)}
        action={
          <Button variant="primary" icon={I.plus} onClick={() => setEdit({ club: null })}>
            {lang === 0 ? 'Tambah Kelab' : 'Add Club'}
          </Button>
        }
      />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{translate('lbl.club', lang)}</th>
              <th>{translate('lbl.state', lang)}</th>
              <th>{translate('lbl.category', lang)}</th>
              <th>{translate('lbl.manager', lang)}</th>
              <th className="num">{translate('lbl.players', lang)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c.club_id}>
                <td>
                  <Link href={`/clubs/${c.club_id}`} className="row center" style={{ gap: 10 }}>
                    <ClubLogo club={c} size={32} />
                    <span style={{ fontWeight: 700 }}>{c.club_name}</span>
                  </Link>
                </td>
                <td className="muted">{c.state}</td>
                <td>
                  <span className="badge">{c.club_category === 'school' ? (lang === 0 ? 'Sekolah' : 'School') : lang === 0 ? 'Kelab' : 'Club'}</span>
                </td>
                <td className="muted">{c.manager_name}</td>
                <td className="num">{playerCounts[c.club_id] ?? 0}</td>
                <td>
                  <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ club: c })}>
                      <I.edit />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(translate('confirm.del', lang), () => deactivateClubAction(c.club_id))}>
                      <I.trash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ClubForm club={edit.club} lang={lang} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}
