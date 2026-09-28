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

const MIN_AB = 10;

export function PlayersBrowser({ lang, rows, clubs }: { lang: Lang; rows: PlayerStatRow[]; clubs: Club[] }) {
  const [q, setQ] = useState('');
  const [club, setClub] = useState('');
  const clubById = new Map(clubs.map((c) => [c.club_id, c]));

  const filtered = rows
    .filter((s) => (!q || `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase())) && (!club || String(s.club_id) === club))
    .sort((a, b) => b.batting_average - a.batting_average);

  const pool = rows.filter((s) => !club || String(s.club_id) === club);
  const leaders: { key: string; label: string; value: (s: PlayerStatRow) => number; show: (s: PlayerStatRow) => string; list: PlayerStatRow[] }[] = [
    { key: 'avg', label: translate('lbl.avg', lang), value: (s) => s.batting_average, show: (s) => fmt.avg(s.batting_average), list: pool.filter((s) => s.total_at_bats >= MIN_AB) },
    { key: 'hits', label: translate('lbl.hits', lang), value: (s) => s.total_hits, show: (s) => String(s.total_hits), list: pool },
    { key: 'runs', label: translate('lbl.runs', lang), value: (s) => s.total_runs, show: (s) => String(s.total_runs), list: pool },
    { key: 'rbi', label: translate('lbl.rbi', lang), value: (s) => s.total_rbi, show: (s) => String(s.total_rbi), list: pool },
  ];

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
      <div className="row between center" style={{ marginBottom: 14 }}>
        <h2 className="h-md">{translate('lead.title', lang)}</h2>
        <span className="stat-label muted">{translate('lead.minab', lang)}</span>
      </div>
      <div className="grid leaders-grid" style={{ marginBottom: 36 }}>
        {leaders.map((ld) => {
          const top = [...ld.list].filter((s) => ld.value(s) > 0).sort((a, b) => ld.value(b) - ld.value(a)).slice(0, 5);
          return (
            <div key={ld.key} className="card pad">
              <div className="stat-label" style={{ color: 'var(--clay)', marginBottom: 12 }}>
                {ld.label}
              </div>
              {top.length === 0 && <div className="muted" style={{ fontSize: 14 }}>—</div>}
              <ol className="leader-list">
                {top.map((s, i) => (
                  <li key={s.player_id}>
                    <Link href={`/players/${s.player_id}`} className="row center" style={{ gap: 10 }}>
                      <span className="muted tnum" style={{ width: 14, fontWeight: 800 }}>
                        {i + 1}
                      </span>
                      <span style={{ flex: 1, fontWeight: i === 0 ? 800 : 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.first_name} {s.last_name}
                      </span>
                      <span className={i === 0 ? 'display' : 'tnum'} style={{ fontSize: i === 0 ? 24 : 14, fontWeight: 800 }}>
                        {ld.show(s)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
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
