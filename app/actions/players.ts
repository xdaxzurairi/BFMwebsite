'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

function playerPayload(formData: FormData) {
  return {
    first_name: String(formData.get('first_name') || ''),
    last_name: String(formData.get('last_name') || ''),
    jersey_number: Number(formData.get('jersey_number') || 0),
    position: String(formData.get('position') || ''),
    medical_clearance: formData.get('medical_clearance') === 'on',
  };
}

export async function addPlayerAction(clubId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('players').insert({ ...playerPayload(formData), club_id: clubId });
  if (error) return { error: error.message };
  revalidatePath('/dashboard/players');
  revalidatePath(`/clubs/${clubId}`);
  return null;
}

export async function updatePlayerAction(playerId: number, clubId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('players').update(playerPayload(formData)).eq('player_id', playerId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/players');
  revalidatePath(`/clubs/${clubId}`);
  revalidatePath(`/players/${playerId}`);
  return null;
}

export async function deletePlayerAction(playerId: number, clubId: number) {
  const supabase = await createClient();
  await supabase.from('players').update({ is_active: false }).eq('player_id', playerId);
  revalidatePath('/dashboard/players');
  revalidatePath(`/clubs/${clubId}`);
}
