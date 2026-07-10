'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Avatar } from '@/components/ui/ClubLogo';
import { Select } from '@/components/ui/Field';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Club, PlayerStatRow } from '@/lib/types';

export function PlayersBrowser({ lang, rows, clubs }: { lang: Lang; rows: PlayerStatRow[]; clubs: Club[] }) {
  const [q, setQ] = useState('');
  const [club, setClub] = useState('');
  const clubById = new Map(clubs.map((c) => [c.club_id, c]));

  const filtered = rows
    .filter((s) => (!q || `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase())) && (!club || String(s.club_id) === club))
    .sort((a, b) => b.batting_average - a.batting_average);

  return (
    <div className="section wrap">
      <PageHead
        kicker={translate('nav.players', lang)}
        title={lang === 0 ? 'Papan Pendahulu' : 'Leaderboard'}
        sub={lang === 0 ? 'Pemain terbaik mengikut purata pukulan merentas semua kelab.' : 'Top players by batting average across every club.'}
      />
      <div className="row wrap-w" style={{ gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <I.search style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--ink-faint)' }} />
          <input className="input" style={{ paddingLeft: 42 }} placeholder={translate('cta.search', lang)} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={club} onChange={(e) => setClub(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
          <option value="">{lang === 0 ? 'Semua Kelab' : 'All Clubs'}</option>
          {clubs.map((c) => (
            <option key={c.club_id} value={c.club_id}>
              {c.club_name}
            </option>
          ))}
        </Select>
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>{lang === 0 ? 'Pemain' : 'Player'}</th>
              <th>{translate('lbl.club', lang)}</th>
              <th>{translate('lbl.position', lang)}</th>
              <th className="num">{translate('lbl.avg', lang)}</th>
              <th className="num">{translate('lbl.hits', lang)}</th>
              <th className="num">{translate('lbl.runs', lang)}</th>
              <th className="num">{translate('lbl.rbi', lang)}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((s, i) => {
              const c = clubById.get(s.club_id);
              return (
                <tr key={s.player_id} className="clickable">
                  <td className="muted tnum" style={{ fontWeight: 800 }}>
                    {i + 1}
                  </td>
                  <td>
                    <Link href={`/players/${s.player_id}`} className="row center" style={{ gap: 10 }}>
                      <Avatar a={s.first_name} b={s.last_name} size={32} color={c?.color ?? undefined} />
                      <span style={{ fontWeight: 700 }}>
                        {s.first_name} {s.last_name}
                      </span>
                    </Link>
                  </td>
                  <td className="muted">{c?.club_name}</td>
                  <td className="muted">{s.position}</td>
                  <td className="num" style={{ color: 'var(--clay)', fontWeight: 800 }}>
                    {fmt.avg(s.batting_average)}
                  </td>
                  <td className="num">{s.total_hits}</td>
                  <td className="num">{s.total_runs}</td>
                  <td className="num">{s.total_rbi}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
