import { cookies } from 'next/headers';
import type { Lang } from './i18n';

const COOKIE = 'bfm_lang';

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(COOKIE)?.value;
  return v === '1' ? 1 : 0;
}
