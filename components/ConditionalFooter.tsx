'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';
import type { Lang } from '@/lib/i18n';

export function ConditionalFooter({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  if (pathname === '/sign-in' || pathname === '/sign-up') return null;
  return <Footer lang={lang} />;
}
