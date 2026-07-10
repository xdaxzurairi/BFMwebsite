'use client';

import { useState } from 'react';
import { PageHead } from '@/components/PageHead';
import { Select } from '@/components/ui/Field';
import { MatchList } from '@/components/MatchList';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Match, Club, Tournament } from '@/lib/types';

export function MatchesBrowser({ lang, matches, clubs, tournaments }: { lang: Lang; matches: Match[]; clubs: Club[]; tournaments: Tournament[] }) {
  const [tid, setTid] = useState('');
  const filtered = matches.filter((m) => !tid || String(m.tournament_id) === tid);

  return (
    <div className="section wrap">
      <PageHead
        kicker={translate('nav.matches', lang)}
        title={lang === 0 ? 'Perlawanan' : 'Match Centre'}
        sub={lang === 0 ? 'Jadual dan keputusan dari semua kejohanan.' : 'Schedule and results across all tournaments.'}
        right={
          <Select value={tid} onChange={(e) => setTid(e.target.value)} style={{ width: 'auto', minWidth: 200 }}>
            <option value="">{lang === 0 ? 'Semua Kejohanan' : 'All Tournaments'}</option>
            {tournaments.map((tn) => (
              <option key={tn.tournament_id} value={tn.tournament_id}>
                {tn.tournament_name}
              </option>
            ))}
          </Select>
        }
      />
      <MatchList matches={filtered} clubs={clubs} lang={lang} />
    </div>
  );
}
