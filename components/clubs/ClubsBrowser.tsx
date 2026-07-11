'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { ClubLogo } from '@/components/ui/ClubLogo';
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
        {filtered.map((c) => {
          const n = playerCounts[c.club_id] ?? 0;
          return (
            <Link key={c.club_id} href={`/clubs/${c.club_id}`} className="card hover" style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ height: 76, background: c.color ?? undefined, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 15px, oklch(1 0 0 / .07) 15px 16px)' }} />
              </div>
              <div className="pad" style={{ marginTop: -30 }}>
                <ClubLogo club={c} size={52} />
                <h3 style={{ fontWeight: 800, fontSize: 17, marginTop: 12, lineHeight: 1.15 }}>{c.club_name}</h3>
                <div className="row center" style={{ gap: 6, color: 'var(--ink-faint)', fontSize: 13, marginTop: 5 }}>
                  <I.pin style={{ width: 14, height: 14 }} />
                  {c.state}
                </div>
                <div className="tag-row" style={{ marginTop: 14 }}>
                  <span className="badge">{c.club_category === 'school' ? (lang === 0 ? 'Sekolah' : 'School') : lang === 0 ? 'Kelab' : 'Club'}</span>
                  <span className="badge">
                    <I.users style={{ width: 12, height: 12 }} />
                    {n} {translate('lbl.players', lang)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && <Empty>{lang === 0 ? 'Tiada kelab dijumpai.' : 'No clubs found.'}</Empty>}
    </div>
  );
}
