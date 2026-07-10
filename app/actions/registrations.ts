'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';
import type { RegistrationStatus } from '@/lib/types';

export async function registerForTournamentAction(clubId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const tournamentId = Number(formData.get('tournament_id') || 0);
  const notes = String(formData.get('notes') || '') || null;
  if (!tournamentId) return { error: 'Please choose a tournament.' };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('registrations')
    .select('registration_id')
    .eq('tournament_id', tournamentId)
    .eq('club_id', clubId)
    .neq('status', 'withdrawn')
    .maybeSingle();
  if (existing) return { error: 'Club is already registered for this tournament.' };

  const { error } = await supabase.from('registrations').insert({ tournament_id: tournamentId, club_id: clubId, notes, status: 'pending' });
  if (error) return { error: error.message };
  revalidatePath('/dashboard/registrations');
  return null;
}

export async function withdrawRegistrationAction(registrationId: number) {
  const supabase = await createClient();
  await supabase.from('registrations').update({ status: 'withdrawn' }).eq('registration_id', registrationId);
  revalidatePath('/dashboard/registrations');
}

export async function setRegistrationStatusAction(registrationId: number, status: RegistrationStatus) {
  const supabase = await createClient();
  await supabase.from('registrations').update({ status }).eq('registration_id', registrationId);
  revalidatePath('/dashboard/registrations');
  revalidatePath('/dashboard');
}

export async function deleteRegistrationAction(registrationId: number) {
  const supabase = await createClient();
  await supabase.from('registrations').delete().eq('registration_id', registrationId);
  revalidatePath('/dashboard/registrations');
}
