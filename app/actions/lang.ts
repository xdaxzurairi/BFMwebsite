'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function setLangAction(lang: 0 | 1) {
  const store = await cookies();
  store.set('bfm_lang', String(lang), { path: '/', maxAge: 60 * 60 * 24 * 365 });
  revalidatePath('/', 'layout');
}
