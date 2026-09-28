import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { ClubLogo } from '@/components/ui/ClubLogo';
import { Empty } from '@/components/ui/Empty';
import { FormPills } from '@/components/FormPills';
import { getLang } from '@/lib/lang';
import { getClubs, getMatches } from '@/lib/queries';
import { computeRankings } from '@/lib/rankings';
import { t as translate } from '@/lib/i18n';

export const revalidate = 60;

export default async function RankingsPage() {
  const lang = await getLang();
  const [clubs, matches] = await Promise.all([getClubs(), getMatches()]);
  const rows = computeRankings(clubs, matches);

  return (
    <div className="section wrap">
      <PageHead
        kicker={translate('nav.rankings', lang)}
        title={lang === 0 ? 'Ranking Kelab Kebangsaan' : 'National Club Rankings'}
        sub={
          lang === 0
            ? 'Setiap perlawanan rasmi BFM dikira, merentas semua kejohanan. Menang 3 mata, seri 1.'
            : 'Every official BFM match counts, across all tournaments. Win 3 points, draw 1.'
        }
      />
      {rows.length === 0 ? (
        <Empty>{lang === 0 ? 'Ranking akan muncul selepas perlawanan pertama selesai.' : 'Rankings appear once the first match is completed.'}</Empty>
      ) : (
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
                <th className="num">{translate('tbl.pct', lang)}</th>
                <th className="num">{translate('tbl.rd', lang)}</th>
                <th>{translate('tbl.form', lang)}</th>
                <th className="num">{translate('tbl.strk', lang)}</th>
                <th className="num">{translate('tbl.pts', lang)}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.club.club_id}>
                  <td>
                    <span className="display" style={{ fontSize: 22, color: i < 3 ? 'var(--clay)' : 'var(--ink-faint)' }}>
                      {i + 1}
                    </span>
                  </td>
                  <td>
                    <Link href={`/clubs/${r.club.club_id}`} className="row center" style={{ gap: 10 }}>
                      <ClubLogo club={r.club} size={30} />
                      <span style={{ fontWeight: 700 }}>{r.club.club_name}</span>
                    </Link>
                  </td>
                  <td className="num">{r.mp}</td>
                  <td className="num">{r.w}</td>
                  <td className="num">{r.l}</td>
                  <td className="num">{r.d}</td>
                  <td className="num">{r.win_pct.toFixed(3).replace(/^0/, '')}</td>
                  <td className="num" style={{ color: r.run_diff >= 0 ? 'var(--field)' : 'var(--bad)' }}>
                    {r.run_diff > 0 ? '+' : ''}
                    {r.run_diff}
                  </td>
                  <td>
                    <FormPills form={r.form} />
                  </td>
                  <td className="num">{r.streak}</td>
                  <td className="num" style={{ fontWeight: 800, fontSize: 16 }}>
                    {r.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
