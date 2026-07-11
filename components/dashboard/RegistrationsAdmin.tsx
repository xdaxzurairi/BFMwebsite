'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/dashboard/DashShell';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { useConfirm } from '@/components/ui/useConfirm';
import { I } from '@/components/ui/icons';
import { setRegistrationStatusAction, deleteRegistrationAction } from '@/app/actions/registrations';
import { fmt } from '@/lib/format';
import { statusLbl } from '@/lib/status';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Registration, Club, Tournament } from '@/lib/types';

export function RegistrationsAdmin({ regs, clubs, tournaments, lang }: { regs: Registration[]; clubs: Club[]; tournaments: Tournament[]; lang: Lang }) {
  const [f, setF] = useState('all');
  const confirm = useConfirm({ confirm: translate('cta.confirm', lang), cancel: translate('cta.cancel', lang) });
  const clubById = new Map(clubs.map((c) => [c.club_id, c]));
  const tournamentById = new Map(tournaments.map((t) => [t.tournament_id, t]));

  const filters: [string, string][] = [
    ['all', lang === 0 ? 'Semua' : 'All'],
    ['pending', statusLbl('pending', lang)],
    ['approved', statusLbl('approved', lang)],
    ['rejected', statusLbl('rejected', lang)],
  ];
  const filtered = regs.filter((r) => f === 'all' || r.status === f).sort((a) => (a.status === 'pending' ? -1 : 1));

  return (
    <div>
      <SectionHead
        title={translate('dash.regs', lang)}
        action={
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {filters.map(([v, l]) => (
              <button key={v} className={`chip ${f === v ? 'active' : ''}`} onClick={() => setF(v)}>
                {l}
              </button>
            ))}
          </div>
        }
      />
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{translate('lbl.club', lang)}</th>
              <th>{translate('nav.tournaments', lang)}</th>
              <th>{translate('lbl.date', lang)}</th>
              <th>{translate('lbl.status', lang)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const c = clubById.get(r.club_id);
              const tn = tournamentById.get(r.tournament_id);
              if (!c) return null;
              return (
                <tr key={r.registration_id}>
                  <td>
                    <div className="row center" style={{ gap: 10 }}>
                      <ClubLogo club={c} size={32} />
                      <span style={{ fontWeight: 700 }}>{c.club_name}</span>
                    </div>
                  </td>
                  <td className="muted">{tn?.tournament_name}</td>
                  <td className="muted">{fmt.date(r.registration_date, lang)}</td>
                  <td>
                    <StatusBadge status={r.status} label={statusLbl(r.status, lang)} />
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      {r.status === 'pending' && (
                        <>
                          <Button size="sm" variant="field" icon={I.check} onClick={() => setRegistrationStatusAction(r.registration_id, 'approved')}>
                            {translate('cta.approve', lang)}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setRegistrationStatusAction(r.registration_id, 'rejected')}>
                            {translate('cta.reject', lang)}
                          </Button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => confirm.ask(translate('confirm.del', lang), () => deleteRegistrationAction(r.registration_id))}
                        >
                          <I.trash />
                        </button>
                      )}
                      {r.status === 'rejected' && (
                        <Button size="sm" variant="ghost" icon={I.check} onClick={() => setRegistrationStatusAction(r.registration_id, 'approved')}>
                          {translate('cta.approve', lang)}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <Empty>{translate('reg.none', lang)}</Empty>}
      </div>
      {confirm.node}
    </div>
  );
}
