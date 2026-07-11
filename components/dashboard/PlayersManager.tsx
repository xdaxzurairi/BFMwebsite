'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/dashboard/DashShell';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { useConfirm } from '@/components/ui/useConfirm';
import { I } from '@/components/ui/icons';
import { PlayerForm } from './PlayerForm';
import { deletePlayerAction } from '@/app/actions/players';
import { fmt } from '@/lib/format';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Player, PlayerStatRow } from '@/lib/types';

export function PlayersManager({ clubId, players, stats, lang }: { clubId: number; players: Player[]; stats: Map<number, PlayerStatRow>; lang: Lang }) {
  const [edit, setEdit] = useState<{ player: Player | null } | null>(null);
  const confirm = useConfirm({ confirm: translate('cta.confirm', lang), cancel: translate('cta.cancel', lang) });

  return (
    <div>
      <SectionHead
        title={translate('dash.manageplayers', lang)}
        action={
          <Button variant="primary" icon={I.plus} onClick={() => setEdit({ player: null })}>
            {lang === 0 ? 'Tambah Pemain' : 'Add Player'}
          </Button>
        }
      />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{translate('lbl.jersey', lang)}</th>
              <th>{lang === 0 ? 'Nama' : 'Name'}</th>
              <th>{translate('lbl.position', lang)}</th>
              <th className="num">{translate('lbl.avg', lang)}</th>
              <th>{lang === 0 ? 'Perubatan' : 'Medical'}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const s = stats.get(p.player_id);
              return (
                <tr key={p.player_id}>
                  <td>
                    <span className="display" style={{ fontSize: 20, color: 'var(--clay)' }}>
                      {p.jersey_number}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {p.first_name} {p.last_name}
                  </td>
                  <td className="muted">{p.position}</td>
                  <td className="num">{fmt.avg(s?.batting_average ?? 0)}</td>
                  <td>
                    {p.medical_clearance ? (
                      <span className="badge badge-approved">{lang === 0 ? 'Lulus' : 'Cleared'}</span>
                    ) : (
                      <span className="badge badge-pending">{lang === 0 ? 'Belum' : 'Pending'}</span>
                    )}
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ player: p })}>
                        <I.edit />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() =>
                          confirm.ask(translate('confirm.del', lang), () => {
                            deletePlayerAction(p.player_id, clubId);
                          })
                        }
                      >
                        <I.trash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {players.length === 0 && <Empty>{lang === 0 ? 'Belum ada pemain. Tambah yang pertama.' : 'No players yet. Add your first.'}</Empty>}
      </div>
      {edit && <PlayerForm clubId={clubId} player={edit.player} lang={lang} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}
