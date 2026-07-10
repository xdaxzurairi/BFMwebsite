import Link from 'next/link';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Empty } from '@/components/ui/Empty';
import { t as translate, type Lang } from '@/lib/i18n';
import type { StandingRow } from '@/lib/types';

export function StandingsTable({ standings, lang }: { standings: StandingRow[]; lang: Lang }) {
  if (!standings.length) {
    return <Empty>{lang === 0 ? 'Kedudukan akan dikemas kini selepas perlawanan dimainkan.' : 'Standings update once matches are played.'}</Empty>;
  }
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>{translate('tbl.pos', lang)}</th>
            <th>{translate('tbl.team', lang)}</th>
            <th className="num">{translate('tbl.p', lang)}</th>
            <th className="num">{translate('tbl.w', lang)}</th>
            <th className="num">{translate('tbl.l', lang)}</th>
            <th className="num">{translate('tbl.d', lang)}</th>
            <th className="num">{translate('tbl.rd', lang)}</th>
            <th className="num">{translate('tbl.pts', lang)}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.club_id} className="clickable">
              <td>
                <Link href={`/clubs/${s.club_id}`} style={{ display: 'contents' }}>
                  <span className="display" style={{ fontSize: 22, color: i === 0 ? 'var(--clay)' : 'var(--ink-faint)' }}>
                    {i + 1}
                  </span>
                </Link>
              </td>
              <td>
                <Link href={`/clubs/${s.club_id}`} className="row center" style={{ gap: 10 }}>
                  <ClubLogo club={{ club_name: s.club_name }} size={30} />
                  <span style={{ fontWeight: 700 }}>{s.club_name}</span>
                </Link>
              </td>
              <td className="num">{s.mp}</td>
              <td className="num">{s.w}</td>
              <td className="num">{s.l}</td>
              <td className="num">{s.d}</td>
              <td className="num" style={{ color: s.run_diff >= 0 ? 'var(--field)' : 'var(--bad)' }}>
                {s.run_diff > 0 ? '+' : ''}
                {s.run_diff}
              </td>
              <td className="num" style={{ fontWeight: 800, fontSize: 16 }}>
                {s.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
