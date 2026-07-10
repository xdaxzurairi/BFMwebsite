'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { RosterTable } from './RosterTable';
import { OfficialsList } from './OfficialsList';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Player, Official, PlayerStatRow } from '@/lib/types';

export function ClubDetailTabs({
  lang,
  players,
  stats,
  officials,
}: {
  lang: Lang;
  players: Player[];
  stats: Map<number, PlayerStatRow>;
  officials: Official[];
}) {
  const [tab, setTab] = useState('roster');
  return (
    <>
      <Tabs
        tabs={[
          { id: 'roster', label: translate('lbl.roster', lang) },
          { id: 'officials', label: translate('lbl.officials', lang) },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div style={{ marginTop: 24 }}>
        {tab === 'roster' && <RosterTable players={players} stats={stats} lang={lang} />}
        {tab === 'officials' && <OfficialsList officials={officials} lang={lang} />}
      </div>
    </>
  );
}
