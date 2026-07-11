'use client';

import { useState } from 'react';
import { PageHead } from '@/components/PageHead';
import { ClubCard } from '@/components/clubs/ClubCard';
import { Select } from '@/components/ui/Field';
import { Empty } from '@/components/ui/Empty';
import { I } from '@/components/ui/icons';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club } from '@/lib/types';

export function ClubsBrowser({ lang, clubs, playerCounts }: { lang: Lang; clubs: Club[]; playerCounts: Record<number, number> }) {
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const [cat, setCat] = useState('');
  const states = [...new Set(clubs.map((c) => c.state))].sort();
  const filtered = clubs.filter(
    (c) => (!q || c.club_name.toLowerCase().includes(q.toLowerCase())) && (!state || c.state === state) && (!cat || c.club_category === cat)
  );
  const catOptions: [string, string][] = [
    ['', translate('lbl.allcat', lang)],
    ['club', lang === 0 ? 'Kelab' : 'Club'],
    ['school', lang === 0 ? 'Sekolah' : 'School'],
  ];

  return (
    <div className="section wrap">
      <PageHead
        kicker={translate('nav.clubs', lang)}
        title={lang === 0 ? 'Direktori Kelab' : 'Club Directory'}
        sub={lang === 0 ? 'Terokai semua kelab dan sekolah yang berdaftar dengan BFM.' : 'Explore every club and school registered with the BFM.'}
      />
      <div className="row wrap-w" style={{ gap: 12, marginBottom: 28 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <I.search style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--ink-faint)' }} />
          <input className="input" style={{ paddingLeft: 42 }} placeholder={translate('cta.search', lang)} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={state} onChange={(e) => setState(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
          <option value="">{translate('lbl.allstates', lang)}</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <div className="row" style={{ gap: 8 }}>
          {catOptions.map(([v, l]) => (
            <button key={v} className={`chip ${cat === v ? 'active' : ''}`} onClick={() => setCat(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {filtered.map((c) => (
          <ClubCard key={c.club_id} club={c} lang={lang} playerCount={playerCounts[c.club_id] ?? 0} />
        ))}
      </div>
      {filtered.length === 0 && <Empty>{lang === 0 ? 'Tiada kelab dijumpai.' : 'No clubs found.'}</Empty>}
    </div>
  );
}
