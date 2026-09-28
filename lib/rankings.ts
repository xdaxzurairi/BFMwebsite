/* National club rankings across every tournament, computed from completed matches.
   Same points system as v_standings (win 3, draw 1, loss 0), plus win % and recent form. */

import type { Club, Match } from './types';

export type FormResult = 'W' | 'L' | 'D';

export type RankingRow = {
  club: Club;
  mp: number;
  w: number;
  l: number;
  d: number;
  runs_for: number;
  runs_against: number;
  run_diff: number;
  points: number;
  win_pct: number;
  form: FormResult[]; // most recent first, max 5
  streak: string; // e.g. "W3", "L1", "—"
};

export function computeRankings(clubs: Club[], matches: Match[]): RankingRow[] {
  const rows = new Map<number, RankingRow>();
  for (const club of clubs) {
    rows.set(club.club_id, { club, mp: 0, w: 0, l: 0, d: 0, runs_for: 0, runs_against: 0, run_diff: 0, points: 0, win_pct: 0, form: [], streak: '—' });
  }

  const results = new Map<number, FormResult[]>();
  const completed = matches
    .filter((m) => m.status === 'completed' && m.home_score != null && m.away_score != null)
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());

  for (const m of completed) {
    const sides: [number, number, number][] = [
      [m.home_team_id, m.home_score!, m.away_score!],
      [m.away_team_id, m.away_score!, m.home_score!],
    ];
    for (const [id, rf, ra] of sides) {
      const r = rows.get(id);
      if (!r) continue;
      const res: FormResult = rf > ra ? 'W' : rf < ra ? 'L' : 'D';
      r.mp += 1;
      r.runs_for += rf;
      r.runs_against += ra;
      if (res === 'W') r.w += 1;
      else if (res === 'L') r.l += 1;
      else r.d += 1;
      const list = results.get(id) ?? [];
      list.push(res);
      results.set(id, list);
    }
  }

  for (const r of rows.values()) {
    r.run_diff = r.runs_for - r.runs_against;
    r.points = r.w * 3 + r.d;
    r.win_pct = r.mp ? (r.w + r.d / 2) / r.mp : 0;
    const list = results.get(r.club.club_id) ?? [];
    r.form = list.slice(0, 5);
    if (list.length) {
      let n = 1;
      while (n < list.length && list[n] === list[0]) n++;
      r.streak = `${list[0]}${n}`;
    }
  }

  return [...rows.values()]
    .filter((r) => r.mp > 0)
    .sort((a, b) => b.points - a.points || b.run_diff - a.run_diff || b.win_pct - a.win_pct || a.club.club_name.localeCompare(b.club.club_name));
}
