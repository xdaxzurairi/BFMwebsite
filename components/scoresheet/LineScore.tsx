import type { InningLine } from '@/lib/types';
import type { LineTotals } from '@/lib/scoresheet';

type Row = { name: string; runs: (number | null)[]; totals: LineTotals };

/* Scoreboard-style line score for the green match hero: runs per inning, then R H E LOB.
   A team's biggest inning is highlighted; the trailing team's row is dimmed. */
export function LineScore({ innings, away, home }: { innings: InningLine[]; away: Omit<Row, 'runs'>; home: Omit<Row, 'runs'> }) {
  const cols = Math.max(9, innings.length ? Math.max(...innings.map((i) => i.inning)) : 0);
  const byInning = new Map(innings.map((i) => [i.inning, i]));
  const rows: Row[] = [
    { ...away, runs: Array.from({ length: cols }, (_, n) => byInning.get(n + 1)?.away_runs ?? null) },
    { ...home, runs: Array.from({ length: cols }, (_, n) => byInning.get(n + 1)?.home_runs ?? null) },
  ];
  const played = (n: number) => byInning.has(n + 1);
  const showLob = rows.some((r) => r.totals.lob != null);
  const trailing = away.totals.r === home.totals.r ? -1 : away.totals.r < home.totals.r ? 0 : 1;

  return (
    <div className="ls-wrap">
      <table className="ls">
        <thead>
          <tr>
            <th className="ls-team" />
            {Array.from({ length: cols }, (_, n) => (
              <th key={n}>{n + 1}</th>
            ))}
            <th className="ls-sep">R</th>
            <th>H</th>
            <th>E</th>
            {showLob && <th>LOB</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const peak = Math.max(0, ...row.runs.map((r) => r ?? 0));
            return (
              <tr key={i} className={i === trailing ? 'ls-trail' : undefined}>
                <td className="ls-team">{row.name}</td>
                {row.runs.map((r, n) =>
                  r == null ? (
                    <td key={n} className="ls-x">
                      {played(n) ? 'X' : ''}
                    </td>
                  ) : (
                    <td key={n} className={peak > 0 && r === peak ? 'ls-peak' : undefined}>
                      {r}
                    </td>
                  ),
                )}
                <td className="ls-sep ls-r">{row.totals.r}</td>
                <td>{row.totals.h}</td>
                <td>{row.totals.e}</td>
                {showLob && <td>{row.totals.lob ?? '—'}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
