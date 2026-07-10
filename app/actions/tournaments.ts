'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

function tournamentPayload(formData: FormData) {
  return {
    tournament_name: String(formData.get('tournament_name') || ''),
    description: String(formData.get('description') || '') || null,
    tournament_level: String(formData.get('tournament_level') || 'local'),
    tournament_category: String(formData.get('tournament_category') || 'adult'),
    start_date: String(formData.get('start_date') || ''),
    end_date: String(formData.get('end_date') || ''),
    registration_end: String(formData.get('registration_end') || '') || null,
    status: String(formData.get('status') || 'upcoming'),
    max_teams: Number(formData.get('max_teams') || 8),
    entry_fee: Number(formData.get('entry_fee') || 0),
    prize_pool: Number(formData.get('prize_pool') || 0),
    location: String(formData.get('location') || '') || null,
  };
}

export async function createTournamentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('tournaments').insert(tournamentPayload(formData));
  if (error) return { error: error.message };
  revalidatePath('/dashboard/tournaments');
  revalidatePath('/tournaments');
  return null;
}

export async function updateTournamentAction(tournamentId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('tournaments').update(tournamentPayload(formData)).eq('tournament_id', tournamentId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/tournaments');
  revalidatePath('/tournaments');
  revalidatePath(`/tournaments/${tournamentId}`);
  return null;
}

export async function deleteTournamentAction(tournamentId: number): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('tournaments').delete().eq('tournament_id', tournamentId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/tournaments');
  revalidatePath('/tournaments');
  return null;
}
