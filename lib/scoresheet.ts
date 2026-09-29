/* Scoresheet columns and derived baseball stats, shared by the admin entry page and the
   public Match Centre. Column sets follow the DakStats "Baseball - Softball Stats Sheet". */

import type { BattingCounts, PitchingCounts, PitchingLine, PlayerMatchStat, InningLine, Match } from './types';
import type { Lang } from './i18n';

export type Col<K extends string> = { key: K; abbr: string; name: [string, string] };

export const BATTING_COLS: Col<keyof BattingCounts>[] = [
  { key: 'at_bats', abbr: 'AB', name: ['Pukulan rasmi', 'At bats'] },
  { key: 'runs', abbr: 'R', name: ['Larian', 'Runs'] },
  { key: 'hits', abbr: 'H', name: ['Pukulan kena', 'Hits'] },
  { key: 'rbi', abbr: 'RBI', name: ['Larian dijaringkan', 'Runs batted in'] },
  { key: 'doubles', abbr: '2B', name: ['Double', 'Doubles'] },
  { key: 'triples', abbr: '3B', name: ['Triple', 'Triples'] },
  { key: 'home_runs', abbr: 'HR', name: ['Home run', 'Home runs'] },
  { key: 'sac_hits', abbr: 'SH', name: ['Pukulan korban', 'Sacrifice hits'] },
  { key: 'sac_flies', abbr: 'SF', name: ['Fly korban', 'Sacrifice flies'] },
  { key: 'walks', abbr: 'BB', name: ['Walk', 'Base on balls'] },
  { key: 'hit_by_pitch', abbr: 'HBP', name: ['Kena pitch', 'Hit by pitch'] },
  { key: 'reached_on_error', abbr: 'ROE', name: ['Sampai atas ralat', 'Reached on error'] },
  { key: 'strikeouts_swinging', abbr: 'SOS', name: ['Strikeout (hayun)', 'Strikeouts swinging'] },
  { key: 'strikeouts_looking', abbr: 'SOL', name: ['Strikeout (tengok)', 'Strikeouts looking'] },
  { key: 'stolen_bases', abbr: 'SB', name: ['Curi base', 'Stolen bases'] },
  { key: 'caught_stealing', abbr: 'CS', name: ['Ditangkap curi', 'Caught stealing'] },
];

export const FIELDING_COLS: Col<keyof BattingCounts>[] = [
  { key: 'putouts', abbr: 'PO', name: ['Putout', 'Putouts'] },
  { key: 'assists', abbr: 'A', name: ['Assist', 'Assists'] },
  { key: 'errors', abbr: 'E', name: ['Ralat', 'Errors'] },
];

/* Catcher-only fielding columns. */
export const CATCHER_COLS: Col<keyof BattingCounts>[] = [
  { key: 'runners_caught_stealing', abbr: 'RCS', name: ['Tangkap pencuri base', 'Runners caught stealing'] },
  { key: 'stolen_bases_allowed', abbr: 'SBA', name: ['Curi base dibenarkan', 'Stolen bases allowed'] },
  { key: 'passed_balls', abbr: 'PB', name: ['Passed ball', 'Passed balls'] },
];

/* `outs` is entered and shown as innings pitched, so it is not in this list. */
export const PITCHING_COLS: Col<Exclude<keyof PitchingCounts, 'outs'>>[] = [
  { key: 'at_bats', abbr: 'AB', name: ['Pukulan rasmi lawan', 'At bats against'] },
  { key: 'hits', abbr: 'H', name: ['Pukulan dibenarkan', 'Hits allowed'] },
  { key: 'earned_runs', abbr: 'ER', name: ['Larian layak', 'Earned runs'] },
  { key: 'unearned_runs', abbr: 'UR', name: ['Larian tak layak', 'Unearned runs'] },
  { key: 'walks', abbr: 'BB', name: ['Walk', 'Base on balls'] },
  { key: 'strikeouts_swinging', abbr: 'SOS', name: ['Strikeout (hayun)', 'Strikeouts swinging'] },
  { key: 'strikeouts_looking', abbr: 'SOL', name: ['Strikeout (tengok)', 'Strikeouts looking'] },
  { key: 'wild_pitches', abbr: 'WP', name: ['Wild pitch', 'Wild pitches'] },
  { key: 'balks', abbr: 'BK', name: ['Balk', 'Balks'] },
];

export const BATTING_KEYS = [...BATTING_COLS, ...FIELDING_COLS, ...CATCHER_COLS].map((c) => c.key);
export const PITCHING_KEYS: (keyof PitchingCounts)[] = ['outs', ...PITCHING_COLS.map((c) => c.key)];

export const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'PH', 'PR'] as const;

export const colTitle = (c: Col<string>, lang: Lang) => `${c.abbr} — ${c.name[lang]}`;

/* ---------- derived numbers ---------- */

export const sum = <T,>(rows: T[], pick: (r: T) => number) => rows.reduce((n, r) => n + pick(r), 0);

/* 16 outs -> "5.1" (baseball notation: the decimal is thirds of an inning). */
export const ip = (outs: number) => `${Math.floor(outs / 3)}.${outs % 3}`;

/* "5.1" -> 16; null when the text is not valid innings-pitched notation. */
export function parseIp(text: string): number | null {
  const m = text.trim().match(/^(\d{1,2})(?:\.([0-2]))?$/);
  if (!m) return null;
  return Number(m[1]) * 3 + Number(m[2] ?? 0);
}

/* .333-style average; a leading-zero-free three-decimal string, or "—" with no at-bats. */
export function avg(hits: number, atBats: number) {
  if (!atBats) return '—';
  return (hits / atBats).toFixed(3).replace(/^0/, '');
}

/* ERA scaled to the number of scheduled innings in a game. */
export function era(earnedRuns: number, outs: number, gameInnings = 9) {
  if (!outs) return earnedRuns ? '∞' : '—';
  return ((earnedRuns * gameInnings * 3) / outs).toFixed(2);
}

export const strikeouts = (r: { strikeouts_swinging: number; strikeouts_looking: number }) => r.strikeouts_swinging + r.strikeouts_looking;

/* Zeros render as a centred dot so the real numbers stand out in dense tables. */
export const dot = (n: number) => (n ? String(n) : '·');

/* ---------- balance check (DakStats "Balance Stats") ---------- */

export type Check = { ok: boolean; text: [string, string] };

type Side = { clubId: number; name: string; score: number | null; batting: BattingCounts[]; pitching: PitchingCounts[] };

/* Cross-checks a scoresheet the way a scorer balances a box score. Checks with nothing to compare are skipped. */
export function balance(match: Pick<Match, 'status'>, innings: Pick<InningLine, 'away_runs' | 'home_runs'>[], away: Side, home: Side, decisions: PitchingLine['decision'][]): Check[] {
  const out: Check[] = [];
  const lineRuns = { away: sum(innings, (i) => i.away_runs ?? 0), home: sum(innings, (i) => i.home_runs ?? 0) };

  for (const [side, opp, key] of [[away, home, 'away'], [home, away, 'home']] as const) {
    if (innings.length && side.score != null) {
      const ok = lineRuns[key] === side.score;
      out.push({ ok, text: [`${side.name}: line score ${lineRuns[key]} ${ok ? '=' : '≠'} skor ${side.score}`, `${side.name}: line score ${lineRuns[key]} ${ok ? '=' : '≠'} score ${side.score}`] });
    }
    if (side.batting.length && side.score != null) {
      const r = sum(side.batting, (b) => b.runs);
      const ok = r === side.score;
      out.push({ ok, text: [`${side.name}: R pemain ${r} ${ok ? '=' : '≠'} skor ${side.score}`, `${side.name}: player R ${r} ${ok ? '=' : '≠'} score ${side.score}`] });
    }
    if (side.batting.length && opp.pitching.length) {
      const h = sum(side.batting, (b) => b.hits);
      const allowed = sum(opp.pitching, (p) => p.hits);
      const ok = h === allowed;
      out.push({ ok, text: [`${side.name}: H ${h} ${ok ? '=' : '≠'} H dibenarkan pitcher ${opp.name} (${allowed})`, `${side.name}: H ${h} ${ok ? '=' : '≠'} hits allowed by ${opp.name} pitchers (${allowed})`] });
      const ab = sum(side.batting, (b) => b.at_bats);
      const abAgainst = sum(opp.pitching, (p) => p.at_bats);
      const okAb = ab === abAgainst;
      out.push({ ok: okAb, text: [`${side.name}: AB ${ab} ${okAb ? '=' : '≠'} AB pitcher ${opp.name} (${abAgainst})`, `${side.name}: AB ${ab} ${okAb ? '=' : '≠'} AB against ${opp.name} pitchers (${abAgainst})`] });
    }
    if (side.batting.length && side.pitching.length) {
      const po = sum(side.batting, (b) => b.putouts);
      const outs = sum(side.pitching, (p) => p.outs);
      const ok = po === outs;
      out.push({ ok, text: [`${side.name}: PO ${po} ${ok ? '=' : '≠'} outs pitcher sendiri (${outs})`, `${side.name}: PO ${po} ${ok ? '=' : '≠'} own pitchers' outs (${outs})`] });
    }
    if (side.batting.some((b) => b.doubles + b.triples + b.home_runs > b.hits)) {
      out.push({ ok: false, text: [`${side.name}: 2B+3B+HR melebihi H bagi seorang pemain`, `${side.name}: a player has more 2B+3B+HR than H`] });
    }
  }

  if (match.status === 'completed' && decisions.some(Boolean)) {
    const wins = decisions.filter((d) => d === 'win').length;
    const losses = decisions.filter((d) => d === 'loss').length;
    const saves = decisions.filter((d) => d === 'save').length;
    const ok = wins === 1 && losses === 1 && saves <= 1;
    out.push({ ok, text: [`Keputusan pitcher: ${wins} W · ${losses} L · ${saves} S`, `Pitching decisions: ${wins} W · ${losses} L · ${saves} S`] });
  }
  return out;
}

/* ---------- line score helpers ---------- */

export type LineTotals = { r: number; h: number; e: number; lob: number | null };

export function lineTotals(score: number | null, batting: Pick<PlayerMatchStat, 'hits'>[], fielding: Pick<PlayerMatchStat, 'errors'>[], lob: number | null): LineTotals {
  return { r: score ?? 0, h: sum(batting, (b) => b.hits), e: sum(fielding, (f) => f.errors), lob };
}
