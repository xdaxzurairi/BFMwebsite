'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

function textPayload(formData: FormData) {
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

async function resolveLogo(supabase: SupabaseClient, formData: FormData): Promise<{ url?: string | null; error?: string }> {
  const file = formData.get('logo_file');
  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('club-logos').upload(path, file, { contentType: file.type || undefined });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
    return { url: data.publicUrl };
  }
  return {};
}

export async function updateClubAction(clubId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const logo = await resolveLogo(supabase, formData);
  if (logo.error) return { error: logo.error };
  const payload: Record<string, unknown> = textPayload(formData);
  if (logo.url) payload.logo_url = logo.url;
  const { error } = await supabase.from('clubs').update(payload).eq('club_id', clubId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard/clubs');
  revalidatePath(`/clubs/${clubId}`);
  revalidatePath('/clubs');
  revalidatePath('/');
  return null;
}

export async function createClubAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const logo = await resolveLogo(supabase, formData);
  if (logo.error) return { error: logo.error };
  const { error } = await supabase.from('clubs').insert({ ...textPayload(formData), logo_url: logo.url ?? null });
  if (error) return { error: error.message };
  revalidatePath('/dashboard/clubs');
  revalidatePath('/clubs');
  return null;
}

export async function registerClubAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const logo = await resolveLogo(supabase, formData);
  if (logo.error) return { error: logo.error };
  const p = textPayload(formData);
  const { error } = await supabase.rpc('register_own_club', {
    p_club_name: p.club_name,
    p_state: p.state,
    p_club_category: p.club_category,
    p_manager_name: p.manager_name,
    p_phone: p.phone,
    p_email: p.email,
    p_color: p.color,
    p_logo_url: logo.url ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function deactivateClubAction(clubId: number) {
  const supabase = await createClient();
  await supabase.from('clubs').update({ is_active: false }).eq('club_id', clubId);
  revalidatePath('/dashboard/clubs');
  revalidatePath('/clubs');
}
