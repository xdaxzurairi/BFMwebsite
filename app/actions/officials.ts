'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

function officialPayload(formData: FormData) {
  return {
    first_name: String(formData.get('first_name') || ''),
    last_name: String(formData.get('last_name') || ''),
    position: String(formData.get('position') || ''),
    role: String(formData.get('role') || '') || null,
    phone: String(formData.get('phone') || '') || null,
    email: String(formData.get('email') || '') || null,
  };
}

export async function addOfficialAction(clubId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('officials').insert({ ...officialPayload(formData), club_id: clubId });
  if (error) return { error: error.message };
  revalidatePath('/dashboard/officials');
  revalidatePath(`/clubs/${clubId}`);
  return null;
}

export async function updateOfficialAction(officialId: number, clubId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('officials').update(officialPayload(formData)).eq('official_id', officialId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/officials');
  revalidatePath(`/clubs/${clubId}`);
  return null;
}

export async function deleteOfficialAction(officialId: number, clubId: number) {
  const supabase = await createClient();
  await supabase.from('officials').update({ is_active: false }).eq('official_id', officialId);
  revalidatePath('/dashboard/officials');
  revalidatePath(`/clubs/${clubId}`);
}
