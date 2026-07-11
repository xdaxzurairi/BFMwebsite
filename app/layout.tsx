import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { ConditionalFooter } from '@/components/ConditionalFooter';
import { ToastHost } from '@/components/ToastHost';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Baseball Federation Malaysia · BFM 2026',
  description: 'One home for clubs, players, tournaments and league standings across Malaysia.',
  icons: { icon: '/assets/bfm-crest.png' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const appUser = await getAppUser();

  return (
    <html lang={lang === 0 ? 'ms' : 'en'}>
      <body>
        <Nav lang={lang} appUser={appUser} />
        <div style={{ minHeight: '60vh' }}>{children}</div>
        <ConditionalFooter lang={lang} />
        <ToastHost />
      </body>
    </html>
  );
}
