'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

function newsPayload(formData: FormData) {
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

export async function createNewsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('news').insert(newsPayload(formData));
  if (error) return { error: error.message };
  revalidatePath('/dashboard/news');
  revalidatePath('/news');
  revalidatePath('/');
  return null;
}

export async function updateNewsAction(newsId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from('news').update(newsPayload(formData)).eq('news_id', newsId);
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
