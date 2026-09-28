'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAppUser } from '@/lib/auth';
import type { Player, PlayerMatchStat } from '@/lib/types';

export type StatLine = { player_id: number; at_bats: number; hits: number; runs: number; rbi: number };

async function requireAdmin() {
  const appUser = await getAppUser();
  return !!appUser && (appUser.role === 'admin' || appUser.role === 'technical_admin');
}

/* Both rosters plus any stats already recorded for this match. */
export async function loadMatchStatsAction(matchId: number): Promise<{ error?: string; players?: Player[]; stats?: PlayerMatchStat[] }> {
  if (!(await requireAdmin())) return { error: 'Admins only.' };
  const supabase = await createClient();
  const { data: match } = await supabase.from('matches').select('home_team_id, away_team_id').eq('match_id', matchId).single();
  if (!match) return { error: 'Match not found.' };

  const [{ data: players }, { data: stats }] = await Promise.all([
    supabase.from('players').select('*').in('club_id', [match.home_team_id, match.away_team_id]).eq('is_active', true).order('jersey_number'),
    supabase.from('player_match_stats').select('*').eq('match_id', matchId),
  ]);
  return { players: (players || []) as Player[], stats: (stats || []) as PlayerMatchStat[] };
}

/* Replaces the match's stat lines with `lines`. New rows go in before old ones are removed,
   so a failed insert leaves the previous stats intact. */
export async function saveMatchStatsAction(matchId: number, lines: StatLine[]): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: 'Admins only.' };

  for (const l of lines) {
    const nums = [l.at_bats, l.hits, l.runs, l.rbi];
    if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 99)) return { error: 'Stats must be whole numbers from 0 to 99.' };
    if (l.hits > l.at_bats) return { error: 'Hits cannot be more than at-bats.' };
  }
  if (new Set(lines.map((l) => l.player_id)).size !== lines.length) return { error: 'Each player can only have one stat line per match.' };

  const supabase = await createClient();
  const { data: match } = await supabase.from('matches').select('match_id, home_team_id, away_team_id').eq('match_id', matchId).single();
  if (!match) return { error: 'Match not found.' };

  if (lines.length) {
    const { data: players } = await supabase.from('players').select('player_id, club_id').in('player_id', lines.map((l) => l.player_id));
    const valid = new Set((players || []).filter((p) => p.club_id === match.home_team_id || p.club_id === match.away_team_id).map((p) => p.player_id));
    if (lines.some((l) => !valid.has(l.player_id))) return { error: 'A player does not belong to either team in this match.' };
  }

  const { data: old } = await supabase.from('player_match_stats').select('stat_id').eq('match_id', matchId);

  if (lines.length) {
    const { error } = await supabase.from('player_match_stats').insert(lines.map((l) => ({ ...l, match_id: matchId })));
    if (error) return { error: error.message };
  }
  const oldIds = (old || []).map((r) => r.stat_id);
  if (oldIds.length) {
    const { error } = await supabase.from('player_match_stats').delete().in('stat_id', oldIds);
    if (error) return { error: error.message };
  }

  revalidatePath('/dashboard/matches');
  revalidatePath(`/matches/${matchId}`);
  revalidatePath('/players');
  revalidatePath('/players/[id]', 'page');
  revalidatePath('/clubs/[id]', 'page');
  return {};
}
