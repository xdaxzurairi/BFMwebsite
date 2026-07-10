'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SectionHead } from '@/components/dashboard/DashShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/useConfirm';
import { TournamentForm } from './TournamentForm';
import { deleteTournamentAction } from '@/app/actions/tournaments';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Tournament } from '@/lib/types';

export function TournamentsAdmin({ tournaments, teamCounts, lang }: { tournaments: Tournament[]; teamCounts: Record<number, number>; lang: Lang }) {
  const [edit, setEdit] = useState<{ tn: Tournament | null } | null>(null);
  const confirm = useConfirm({ confirm: translate('cta.confirm', lang), cancel: translate('cta.cancel', lang) });

  return (
    <div>
      <SectionHead
        title={translate('dash.alltourn', lang)}
        action={
          <Button variant="primary" icon={I.plus} onClick={() => setEdit({ tn: null })}>
            {lang === 0 ? 'Cipta Kejohanan' : 'Create Tournament'}
          </Button>
        }
      />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{lang === 0 ? 'Kejohanan' : 'Tournament'}</th>
              <th>{translate('lbl.dates', lang)}</th>
              <th>{translate('lbl.status', lang)}</th>
              <th className="num">{translate('lbl.teams', lang)}</th>
              <th className="num">{translate('lbl.entryfee', lang)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tn) => (
              <tr key={tn.tournament_id}>
                <td style={{ fontWeight: 700 }}>
                  <Link href={`/tournaments/${tn.tournament_id}`}>{tn.tournament_name}</Link>
                </td>
                <td className="muted">{fmt.dateRange(tn.start_date, tn.end_date, lang)}</td>
                <td>
                  <StatusBadge status={tn.status} label={statusLbl(tn.status, lang)} />
                </td>
                <td className="num">
                  {teamCounts[tn.tournament_id] ?? 0}/{tn.max_teams}
                </td>
                <td className="num">{fmt.money(tn.entry_fee, tn.currency)}</td>
                <td>
                  <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => setEdit({ tn })}>
                      <I.edit />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => confirm.ask(translate('confirm.del', lang), () => deleteTournamentAction(tn.tournament_id))}
                    >
                      <I.trash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <TournamentForm tn={edit.tn} lang={lang} onClose={() => setEdit(null)} />}
      {confirm.node}
    </div>
  );
}
