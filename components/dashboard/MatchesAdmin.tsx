'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/dashboard/DashShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { useConfirm } from '@/components/ui/useConfirm';
import { MatchForm } from './MatchForm';
import { MatchCreateForm } from './MatchCreateForm';
import { deleteMatchAction } from '@/app/actions/matches';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Match, Club, Tournament } from '@/lib/types';

export function MatchesAdmin({ matches, clubs, tournaments, lang }: { matches: Match[]; clubs: Club[]; tournaments: Tournament[]; lang: Lang }) {
  const [edit, setEdit] = useState<Match | null>(null);
  const [create, setCreate] = useState(false);
  const confirm = useConfirm({ confirm: translate('cta.confirm', lang), cancel: translate('cta.cancel', lang) });
  const clubById = new Map(clubs.map((c) => [c.club_id, c]));
  const sorted = [...matches].sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  return (
    <div>
      <SectionHead
        title={translate('dash.allmatches', lang)}
        action={
          <Button variant="primary" icon={I.plus} onClick={() => setCreate(true)}>
            {lang === 0 ? 'Jadualkan Perlawanan' : 'Schedule Match'}
          </Button>
        }
      />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>{lang === 0 ? 'Perlawanan' : 'Match'}</th>
              <th>{translate('lbl.date', lang)}</th>
              <th className="num">{translate('lbl.score', lang)}</th>
              <th>{translate('lbl.status', lang)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const h = clubById.get(m.home_team_id);
              const a = clubById.get(m.away_team_id);
              return (
                <tr key={m.match_id}>
                  <td className="muted">{m.match_number}</td>
                  <td style={{ fontWeight: 700 }}>
                    {h?.club_name} <span className="muted">vs</span> {a?.club_name}
                  </td>
                  <td className="muted">{fmt.time(m.match_date)}</td>
                  <td className="num">{m.status === 'completed' ? `${m.home_score} – ${m.away_score}` : '—'}</td>
                  <td>
                    <StatusBadge status={m.status} label={statusLbl(m.status, lang)} />
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => setEdit(m)}>
                        <I.edit />
                      </button>
                      <button className="btn btn-ghost btn-icon" onClick={() => confirm.ask(translate('confirm.del', lang), () => deleteMatchAction(m.match_id))}>
                        <I.trash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {matches.length === 0 && <Empty>{lang === 0 ? 'Tiada perlawanan.' : 'No matches.'}</Empty>}
      </div>
      {edit && <MatchForm m={edit} home={clubById.get(edit.home_team_id)} away={clubById.get(edit.away_team_id)} lang={lang} onClose={() => setEdit(null)} />}
      {create && <MatchCreateForm tournaments={tournaments} clubs={clubs} lang={lang} onClose={() => setCreate(false)} />}
      {confirm.node}
    </div>
  );
}
