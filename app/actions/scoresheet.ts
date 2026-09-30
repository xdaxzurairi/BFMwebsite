'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAppUser } from '@/lib/auth';
import { BATTING_KEYS, PITCHING_KEYS, POSITIONS } from '@/lib/scoresheet';
import type { BattingCounts, PitchingCounts, PitchingDecision } from '@/lib/types';

export type BatLineInput = BattingCounts & { player_id: number; started: boolean; batting_order: number | null; position_played: string | null };
export type PitchLineInput = PitchingCounts & { player_id: number; pitch_order: number; started: boolean; decision: PitchingDecision | null };
export type InningInput = { inning: number; away_runs: number | null; home_runs: number | null };

export type ScoresheetInput = {
  batting: BatLineInput[];
  pitching: PitchLineInput[];
  innings: InningInput[];
  away_lob: number | null;
  home_lob: number | null;
  ended_at: string | null;
};

const count = (n: unknown, max = 99) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= max;
const optCount = (n: unknown, max = 99) => n === null || count(n, max);

function validate(s: ScoresheetInput): string | null {
  for (const l of s.batting) {
    if (BATTING_KEYS.some((k) => !count(l[k]))) return 'Batting and fielding stats must be whole numbers from 0 to 99.';
    if (l.hits > l.at_bats) return 'Hits cannot be more than at-bats.';
    if (l.doubles + l.triples + l.home_runs > l.hits) return 'Doubles, triples and home runs cannot add up to more than hits.';
    if (!optCount(l.batting_order, 20) || l.batting_order === 0) return 'Batting order must be from 1 to 20.';
    if (l.position_played && !(POSITIONS as readonly string[]).includes(l.position_played)) return 'Unknown fielding position.';
  }
  for (const p of s.pitching) {
    if (PITCHING_KEYS.some((k) => !count(p[k], k === 'outs' ? 150 : 99))) return 'Pitching stats must be whole numbers.';
    if (p.hits > p.at_bats) return 'A pitcher cannot allow more hits than at-bats.';
    if (!count(p.pitch_order, 20) || p.pitch_order === 0) return 'Pitching order must be from 1 to 20.';
    if (p.decision && !['win', 'loss', 'save'].includes(p.decision)) return 'Unknown pitching decision.';
  }
  const dup = (ids: number[]) => new Set(ids).size !== ids.length;
  if (dup(s.batting.map((l) => l.player_id))) return 'Each player can only have one batting line.';
  if (dup(s.pitching.map((p) => p.player_id))) return 'Each pitcher can only have one pitching line.';
  if (dup(s.innings.map((i) => i.inning))) return 'Each inning can only appear once.';
  for (const i of s.innings) {
    if (!count(i.inning, 30) || i.inning === 0) return 'Innings must be numbered 1 to 30.';
    if (!optCount(i.away_runs) || !optCount(i.home_runs)) return 'Runs per inning must be from 0 to 99.';
  }
  if (!optCount(s.away_lob) || !optCount(s.home_lob)) return 'Left on base must be from 0 to 99.';
  if (s.ended_at && Number.isNaN(Date.parse(s.ended_at))) return 'End time is not a valid date.';
  return null;
}

/* Saves the whole official scoresheet atomically through the save_scoresheet() SQL function. */
export async function saveScoresheetAction(matchId: number, sheet: ScoresheetInput): Promise<{ error?: string }> {
  const appUser = await getAppUser();
  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'technical_admin')) return { error: 'Only an admin can save the official scoresheet.' };
  const invalid = validate(sheet);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const { error } = await supabase.rpc('save_scoresheet', {
    p_match_id: matchId,
    p_batting: sheet.batting,
    p_pitching: sheet.pitching,
    p_innings: sheet.innings,
    p_away_lob: sheet.away_lob,
    p_home_lob: sheet.home_lob,
    p_ended_at: sheet.ended_at,
  });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/matches');
  revalidatePath(`/dashboard/matches/${matchId}/scoresheet`);
  revalidatePath(`/matches/${matchId}`);
  revalidatePath('/players');
  revalidatePath('/players/[id]', 'page');
  revalidatePath('/clubs/[id]', 'page');
  revalidatePath('/rankings');
  return {};
}
