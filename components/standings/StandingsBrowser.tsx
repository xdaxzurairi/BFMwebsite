'use client';

import { useState } from 'react';
import { PageHead } from '@/components/PageHead';
import { Select } from '@/components/ui/Field';
import { Empty } from '@/components/ui/Empty';
import { StandingsTable } from '@/components/StandingsTable';
import { t as translate, type Lang } from '@/lib/i18n';
import type { StandingRow } from '@/lib/types';

type TournamentOption = { tournament_id: number; tournament_name: string };

export function StandingsBrowser({ lang, standings, tournaments }: { lang: Lang; standings: StandingRow[]; tournaments: TournamentOption[] }) {
  const [tid, setTid] = useState<number | null>(tournaments[0]?.tournament_id ?? null);
  const rows = tid ? standings.filter((s) => s.tournament_id === tid) : [];

  return (
    <div className="section wrap">
      <PageHead
        kicker={translate('nav.standings', lang)}
        title={lang === 0 ? 'Kedudukan Liga' : 'League Standings'}
        right={
          tournaments.length > 0 && (
            <Select value={tid ?? ''} onChange={(e) => setTid(Number(e.target.value))} style={{ width: 'auto', minWidth: 220 }}>
              {tournaments.map((tn) => (
                <option key={tn.tournament_id} value={tn.tournament_id}>
                  {tn.tournament_name}
                </option>
              ))}
            </Select>
          )
        }
      />
      {tournaments.length === 0 ? (
        <Empty>{lang === 0 ? 'Tiada keputusan lagi musim ini.' : 'No results yet this season.'}</Empty>
      ) : (
        <StandingsTable standings={rows} lang={lang} />
      )}
    </div>
  );
}
