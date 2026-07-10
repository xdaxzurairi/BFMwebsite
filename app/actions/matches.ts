'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

export async function createMatchAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const tournamentId = Number(formData.get('tournament_id') || 0);
  const homeId = Number(formData.get('home_team_id') || 0);
  const awayId = Number(formData.get('away_team_id') || 0);
  const matchDate = String(formData.get('match_date') || '');
  if (!tournamentId || !homeId || !awayId || homeId === awayId || !matchDate) {
    return { error: 'Please fill in all required fields with two different teams.' };
  }

  const supabase = await createClient();
  const { count } = await supabase.from('matches').select('match_id', { count: 'exact', head: true }).eq('tournament_id', tournamentId);
  const matchNumber = `M-${String((count || 0) + 1).padStart(2, '0')}`;

  const { error } = await supabase.from('matches').insert({
    tournament_id: tournamentId,
    home_team_id: homeId,
    away_team_id: awayId,
    match_date: matchDate,
    venue: String(formData.get('venue') || '') || null,
    round_name: String(formData.get('round_name') || '') || null,
    match_type: String(formData.get('match_type') || 'group'),
    match_number: matchNumber,
    status: 'scheduled',
  });
  if (error) return { error: error.message };
  revalidatePath('/dashboard/matches');
  revalidatePath('/matches');
  return null;
}

export async function updateMatchAction(matchId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const status = String(formData.get('status') || 'scheduled');
  const patch: { status: string; home_score?: number; away_score?: number } = { status };
  if (status === 'completed') {
    patch.home_score = Number(formData.get('home_score') || 0);
    patch.away_score = Number(formData.get('away_score') || 0);
  }
  const supabase = await createClient();
  const { error } = await supabase.from('matches').update(patch).eq('match_id', matchId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/matches');
  revalidatePath('/matches');
  revalidatePath('/standings');
  return null;
}

export async function deleteMatchAction(matchId: number) {
  const supabase = await createClient();
  await supabase.from('matches').delete().eq('match_id', matchId);
  revalidatePath('/dashboard/matches');
  revalidatePath('/matches');
  revalidatePath('/standings');
}
