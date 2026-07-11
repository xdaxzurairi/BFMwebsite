'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { TeamsGrid } from './TeamsGrid';
import { MatchList } from '@/components/MatchList';
import { StandingsTable } from '@/components/StandingsTable';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Registration, Match, Club, StandingRow } from '@/lib/types';

export function TournamentDetailTabs({
  lang,
  regs,
  matches,
  clubs,
  standings,
}: {
  lang: Lang;
  regs: Registration[];
  matches: Match[];
  clubs: Club[];
  standings: StandingRow[];
}) {
  const [tab, setTab] = useState('teams');
  return (
    <>
      <Tabs
        tabs={[
          { id: 'teams', label: `${translate('lbl.teams', lang)} (${regs.length})` },
          { id: 'matches', label: `${translate('nav.matches', lang)} (${matches.length})` },
          { id: 'standings', label: translate('nav.standings', lang) },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div style={{ marginTop: 24 }}>
        {tab === 'teams' && <TeamsGrid regs={regs} clubs={clubs} lang={lang} />}
        {tab === 'matches' && <MatchList matches={matches} clubs={clubs} lang={lang} />}
        {tab === 'standings' && <StandingsTable standings={standings} lang={lang} />}
      </div>
    </>
  );
}
