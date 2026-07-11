'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { t as translate, type Lang } from '@/lib/i18n';
import { I } from '@/components/ui/icons';
import { Button } from '@/components/ui/Button';
import { setLangAction } from '@/app/actions/lang';
import { signOutAction } from '@/app/actions/auth';
import type { AppUser } from '@/lib/auth';

export function Nav({ lang, appUser }: { lang: Lang; appUser: AppUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    h();
    return () => window.removeEventListener('scroll', h);
  }, []);
  const onHero = pathname === '/' && !scrolled;
  const links: [string, string][] = [
    ['/clubs', translate('nav.clubs', lang)],
    ['/players', translate('nav.players', lang)],
    ['/tournaments', translate('nav.tournaments', lang)],
    ['/standings', translate('nav.standings', lang)],
    ['/matches', translate('nav.matches', lang)],
    ['/news', translate('nav.news', lang)],
  ];

  const dashboardHref = appUser && (appUser.role === 'admin' || appUser.role === 'technical_admin' || appUser.role === 'club_manager') ? '/dashboard' : null;
  const registerClubHref = appUser && appUser.role === 'user' ? '/register-club' : null;

  const authActions = (block: boolean) =>
    !appUser ? (
      <Button size="sm" variant={onHero && !block ? 'ghost' : 'field'} className={onHero && !block ? 'on-dark' : ''} block={block} icon={I.user} onClick={() => router.push('/sign-in')}>
        {translate('nav.signin', lang)}
      </Button>
    ) : (
      <div className={block ? 'col' : 'row center'} style={{ gap: 8 }}>
        {dashboardHref && (
          <Button size="sm" variant={onHero && !block ? 'ghost' : 'field'} className={onHero && !block ? 'on-dark' : ''} block={block} icon={I.grid} onClick={() => router.push(dashboardHref)}>
            {translate('nav.dashboard', lang)}
          </Button>
        )}
        {registerClubHref && (
          <Button size="sm" variant={onHero && !block ? 'ghost' : 'field'} className={onHero && !block ? 'on-dark' : ''} block={block} icon={I.shield} onClick={() => router.push(registerClubHref)}>
            {translate('cta.registerclub', lang)}
          </Button>
        )}
        <button
          className={`btn btn-ghost btn-sm ${block ? 'btn-block' : 'btn-icon'}`}
          title={translate('nav.signout', lang)}
          style={onHero && !block ? { boxShadow: 'inset 0 0 0 2px oklch(1 0 0 / .3)', color: '#fff' } : {}}
          onClick={() => signOutAction()}
        >
          <I.logout />
          {block && translate('nav.signout', lang)}
        </button>
      </div>
    );

  return (
    <nav className={`nav ${onHero ? 'on-hero' : ''}`}>
      <div className="wrap nav-inner">
        <Link href="/" className="nav-logo">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: onHero ? '0 4px 14px rgba(0,0,0,.20)' : 'var(--shadow-sm)',
              transition: 'box-shadow .3s',
              flex: 'none',
            }}
          >
            <Image src="/assets/bfm-crest.png" alt="BFM" width={32} height={32} style={{ objectFit: 'contain' }} />
          </div>
          <div style={{ lineHeight: 1.05 }}>
            <div className="nav-logo-text" style={{ fontFamily: 'var(--display)', fontSize: 15, letterSpacing: '.03em', color: onHero ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.34)' }}>
              Baseball Federation Malaysia
            </div>
          </div>
        </Link>
        <div className="nav-links">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={`nav-link ${pathname === href ? 'active' : ''}`}>
              {label}
            </Link>
          ))}
        </div>
        <div className="spacer" />
        <div className="nav-actions row center" style={{ gap: 12 }}>
          <div className="lang-toggle">
            <button className={lang === 0 ? 'active' : ''} onClick={() => setLangAction(0)}>
              BM
            </button>
            <button className={lang === 1 ? 'active' : ''} onClick={() => setLangAction(1)}>
              EN
            </button>
          </div>
          {authActions(false)}
        </div>
        <button className="nav-burger" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <I.x /> : <I.menu />}
        </button>
      </div>
      {open && (
        <div className="nav-mobile-panel">
          <div className="nav-links-mobile">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className={`nav-link-mobile ${pathname === href ? 'active' : ''}`} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </div>
          <div className="lang-toggle" style={{ margin: '14px 0' }}>
            <button className={lang === 0 ? 'active' : ''} onClick={() => setLangAction(0)}>
              BM
            </button>
            <button className={lang === 1 ? 'active' : ''} onClick={() => setLangAction(1)}>
              EN
            </button>
          </div>
          <div onClick={() => setOpen(false)}>{authActions(true)}</div>
        </div>
      )}
    </nav>
  );
}
