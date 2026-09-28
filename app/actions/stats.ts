'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAppUser } from '@/lib/auth';
import type { Player, PlayerMatchStat } from '@/lib/types';

export type StatLine = { player_id: number; at_bats: number; hits: number; runs: number; rbi: number };

type MatchTeams = { match_id: number; home_team_id: number; away_team_id: number; status: string };

/* Admins edit both teams in any match. A club manager edits only their own club's players,
   and only in live or completed matches their club played. Returns the club ids in scope. */
async function editableClubs(matchId: number): Promise<{ error: string } | { clubIds: number[] }> {
  const appUser = await getAppUser();
  if (!appUser) return { error: 'Please sign in.' };
  const supabase = await createClient();
  const { data } = await supabase.from('matches').select('match_id, home_team_id, away_team_id, status').eq('match_id', matchId).single();
  const match = data as MatchTeams | null;
  if (!match) return { error: 'Match not found.' };

  if (appUser.role === 'admin' || appUser.role === 'technical_admin') return { clubIds: [match.home_team_id, match.away_team_id] };
  if (appUser.role === 'club_manager' && appUser.club_id) {
    if (appUser.club_id !== match.home_team_id && appUser.club_id !== match.away_team_id) return { error: 'Your club did not play in this match.' };
    if (match.status !== 'completed' && match.status !== 'live') return { error: 'Stats can be entered once the match is live or completed.' };
    return { clubIds: [appUser.club_id] };
  }
  return { error: 'You do not have permission to enter stats.' };
}

/* Rosters in scope plus any stats already recorded for them in this match. */
export async function loadMatchStatsAction(matchId: number): Promise<{ error?: string; players?: Player[]; stats?: PlayerMatchStat[] }> {
  const scope = await editableClubs(matchId);
  if ('error' in scope) return { error: scope.error };
  const supabase = await createClient();
  const { data: players } = await supabase.from('players').select('*').in('club_id', scope.clubIds).eq('is_active', true).order('jersey_number');
  const roster = (players || []) as Player[];
  const { data: stats } = await supabase
    .from('player_match_stats')
    .select('*')
    .eq('match_id', matchId)
    .in('player_id', roster.map((p) => p.player_id));
  return { players: roster, stats: (stats || []) as PlayerMatchStat[] };
}

/* Replaces the in-scope stat lines for this match with `lines`. New rows go in before old ones
   are removed, so a failed insert leaves the previous stats intact. */
export async function saveMatchStatsAction(matchId: number, lines: StatLine[]): Promise<{ error?: string }> {
  for (const l of lines) {
    const nums = [l.at_bats, l.hits, l.runs, l.rbi];
    if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 99)) return { error: 'Stats must be whole numbers from 0 to 99.' };
    if (l.hits > l.at_bats) return { error: 'Hits cannot be more than at-bats.' };
  }
  if (new Set(lines.map((l) => l.player_id)).size !== lines.length) return { error: 'Each player can only have one stat line per match.' };

  const scope = await editableClubs(matchId);
  if ('error' in scope) return { error: scope.error };

  const supabase = await createClient();
  // The form lists active players only, so only their rows are replaced; stats of deactivated players stay.
  const { data: players } = await supabase.from('players').select('player_id').in('club_id', scope.clubIds).eq('is_active', true);
  const active = new Set((players || []).map((p) => p.player_id));
  if (lines.some((l) => !active.has(l.player_id))) return { error: 'You can only enter stats for active players on your team.' };

  const { data: old } = await supabase.from('player_match_stats').select('stat_id, player_id').eq('match_id', matchId);
  const oldIds = (old || []).filter((r) => active.has(r.player_id)).map((r) => r.stat_id);

  if (lines.length) {
    const { error } = await supabase.from('player_match_stats').insert(lines.map((l) => ({ ...l, match_id: matchId })));
    if (error) return { error: error.message };
  }
  if (oldIds.length) {
    const { error } = await supabase.from('player_match_stats').delete().in('stat_id', oldIds);
    if (error) return { error: error.message };
  }

  revalidatePath('/dashboard/matches');
  revalidatePath('/dashboard/stats');
  revalidatePath(`/matches/${matchId}`);
  revalidatePath('/players');
  revalidatePath('/players/[id]', 'page');
  revalidatePath('/clubs/[id]', 'page');
  return {};
}
