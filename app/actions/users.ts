'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

export async function updateUserRoleAction(userId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const role = String(formData.get('role') || 'user');
  const clubIdRaw = String(formData.get('club_id') || '');
  const clubId = clubIdRaw ? Number(clubIdRaw) : null;

  if (role === 'club_manager' && !clubId) {
    return { error: 'Pick a club to link this manager to.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('users')
    .update({ role, club_id: role === 'club_manager' ? clubId : null })
    .eq('user_id', userId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/users');
  return null;
}
