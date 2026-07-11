'use client';

import { useRouter } from 'next/navigation';
import { Empty } from '@/components/ui/Empty';
import { fmt } from '@/lib/format';
import { t as translate, type Lang } from '@/lib/i18n';
import type { Player, PlayerStatRow } from '@/lib/types';

export function RosterTable({ players, stats, lang }: { players: Player[]; stats: Map<number, PlayerStatRow>; lang: Lang }) {
  const router = useRouter();
  const emptyStat: PlayerStatRow = {
    player_id: 0,
    club_id: 0,
    first_name: '',
    last_name: '',
    jersey_number: 0,
    position: '',
    total_matches: 0,
    total_at_bats: 0,
    total_hits: 0,
    total_runs: 0,
    total_rbi: 0,
    batting_average: 0,
  };
  const rows = players.map((p) => ({ p, s: stats.get(p.player_id) ?? emptyStat })).sort((a, b) => b.s.batting_average - a.s.batting_average);
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>{translate('lbl.jersey', lang)}</th>
            <th>{lang === 0 ? 'Nama' : 'Name'}</th>
            <th>{translate('lbl.position', lang)}</th>
            <th className="num">{translate('lbl.avg', lang)}</th>
            <th className="num">{translate('lbl.hits', lang)}</th>
            <th className="num">{translate('lbl.runs', lang)}</th>
            <th className="num">{translate('lbl.rbi', lang)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ p, s }) => (
            <tr key={p.player_id} className="clickable" onClick={() => router.push(`/players/${p.player_id}`)}>
              <td>
                <span className="display" style={{ fontSize: 22, color: 'var(--clay)' }}>
                  {p.jersey_number}
                </span>
              </td>
              <td style={{ fontWeight: 700 }}>
                {p.first_name} {p.last_name}
              </td>
              <td className="muted">{p.position}</td>
              <td className="num">{fmt.avg(s.batting_average)}</td>
              <td className="num">{s.total_hits}</td>
              <td className="num">{s.total_runs}</td>
              <td className="num">{s.total_rbi}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <Empty>{lang === 0 ? 'Tiada pemain lagi.' : 'No players yet.'}</Empty>}
    </div>
  );
}
