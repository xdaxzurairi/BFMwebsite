'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

function textPayload(formData: FormData) {
  return {
    title_bm: String(formData.get('title_bm') || ''),
    title_en: String(formData.get('title_en') || ''),
    category_bm: String(formData.get('category_bm') || 'Pengumuman'),
    category_en: String(formData.get('category_en') || 'Announcement'),
    body_bm: String(formData.get('body_bm') || ''),
    body_en: String(formData.get('body_en') || ''),
    published_date: String(formData.get('published_date') || new Date().toISOString().slice(0, 10)),
  };
}

async function resolveCoverImage(supabase: SupabaseClient, formData: FormData): Promise<{ url?: string | null; error?: string }> {
  const file = formData.get('cover_image_file');
  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('news-images').upload(path, file, { contentType: file.type || undefined });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from('news-images').getPublicUrl(path);
    return { url: data.publicUrl };
  }
  const urlValue = String(formData.get('cover_image') || '').trim();
  return { url: urlValue || null };
}

export async function createNewsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const cover = await resolveCoverImage(supabase, formData);
  if (cover.error) return { error: cover.error };
  const { error } = await supabase.from('news').insert({ ...textPayload(formData), cover_image: cover.url ?? null });
  if (error) return { error: error.message };
  revalidatePath('/dashboard/news');
  revalidatePath('/news');
  revalidatePath('/');
  return null;
}

export async function updateNewsAction(newsId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const cover = await resolveCoverImage(supabase, formData);
  if (cover.error) return { error: cover.error };
  const { error } = await supabase
    .from('news')
    .update({ ...textPayload(formData), cover_image: cover.url ?? null })
    .eq('news_id', newsId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/news');
  revalidatePath('/news');
  revalidatePath('/');
  return null;
}

export async function deleteNewsAction(newsId: number) {
  const supabase = await createClient();
  await supabase.from('news').delete().eq('news_id', newsId);
  revalidatePath('/dashboard/news');
  revalidatePath('/news');
  revalidatePath('/');
}
