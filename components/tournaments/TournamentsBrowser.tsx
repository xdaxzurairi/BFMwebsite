'use client';

import { useState } from 'react';
import { PageHead } from '@/components/PageHead';
import { Empty } from '@/components/ui/Empty';
import { TournamentCard } from './TournamentCard';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Tournament } from '@/lib/types';

export function TournamentsBrowser({ lang, tournaments, teamCounts }: { lang: Lang; tournaments: Tournament[]; teamCounts: Record<number, number> }) {
  const [f, setF] = useState('all');
  const filters: [string, string][] = [
    ['all', lang === 0 ? 'Semua' : 'All'],
    ['upcoming', lang === 0 ? 'Akan Datang' : 'Upcoming'],
    ['ongoing', lang === 0 ? 'Berlangsung' : 'Ongoing'],
    ['completed', lang === 0 ? 'Selesai' : 'Completed'],
  ];
  const list = tournaments
    .filter((x) => f === 'all' || x.status === f)
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  return (
    <div className="section wrap">
      <PageHead
        kicker={translate('nav.tournaments', lang)}
        title={lang === 0 ? 'Kejohanan' : 'Tournaments'}
        sub={lang === 0 ? 'Pertandingan rasmi BFM sepanjang musim 2026.' : 'Official BFM competitions throughout the 2026 season.'}
      />
      <div className="row" style={{ gap: 8, marginBottom: 26, flexWrap: 'wrap' }}>
        {filters.map(([v, l]) => (
          <button key={v} className={`chip ${f === v ? 'active' : ''}`} onClick={() => setF(v)}>
            {l}
          </button>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))' }}>
        {list.map((tn) => (
          <TournamentCard key={tn.tournament_id} tn={tn} lang={lang} teamCount={teamCounts[tn.tournament_id] ?? 0} />
        ))}
      </div>
      {list.length === 0 && <Empty>{lang === 0 ? 'Tiada kejohanan.' : 'No tournaments.'}</Empty>}
    </div>
  );
}
