'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

function clubPayload(formData: FormData) {
  return {
    club_name: String(formData.get('club_name') || ''),
    state: String(formData.get('state') || ''),
    club_category: String(formData.get('club_category') || 'club'),
    manager_name: String(formData.get('manager_name') || ''),
    phone: String(formData.get('phone') || '') || null,
    email: String(formData.get('email') || '') || null,
    color: String(formData.get('color') || '#1f6f43'),
  };
}

export async function updateClubAction(clubId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('clubs').update(clubPayload(formData)).eq('club_id', clubId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/profile');
  revalidatePath(`/clubs/${clubId}`);
  revalidatePath('/clubs');
  return null;
}

export async function createClubAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('clubs').insert(clubPayload(formData));
  if (error) return { error: error.message };
  revalidatePath('/dashboard/clubs');
  revalidatePath('/clubs');
  return null;
}

export async function deactivateClubAction(clubId: number) {
  const supabase = await createClient();
  await supabase.from('clubs').update({ is_active: false }).eq('club_id', clubId);
  revalidatePath('/dashboard/clubs');
  revalidatePath('/clubs');
}
