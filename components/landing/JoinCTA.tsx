import Link from 'next/link';
import { Diamond } from '@/components/ui/icons';
import { I } from '@/components/ui/icons';
import { t as translate, type Lang } from '@/lib/i18n';
import type { AppUser } from '@/lib/auth';

export function JoinCTA({ lang, appUser }: { lang: Lang; appUser: AppUser | null }) {
  if (appUser && appUser.role !== 'user') return null;
  const href = appUser ? '/register-club' : '/sign-up';
  const label = appUser ? translate('cta.registerclub', lang) : translate('cta.signup', lang);

  return (
    <section className="section">
      <div className="wrap">
        <div className="card" style={{ background: 'var(--clay)', color: '#fff', padding: '60px 7vw', textAlign: 'center', position: 'relative', overflow: 'hidden', borderColor: 'transparent' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 30px, oklch(1 0 0 / .05) 30px 31px)' }} />
          <div style={{ position: 'relative' }}>
            <Diamond style={{ background: '#fff', width: 18, height: 18, margin: '0 auto 22px' }} />
            <h2 className="h-xl" style={{ color: '#fff', maxWidth: 720, margin: '0 auto 16px' }}>
              {translate('sec.join.title', lang)}
            </h2>
            <p style={{ color: 'oklch(1 0 0 / .9)', fontSize: 19, maxWidth: 560, margin: '0 auto 30px', lineHeight: 1.5 }}>{translate('sec.join.sub', lang)}</p>
            <Link href={href} className="btn btn-lg" style={{ background: '#fff', color: 'var(--clay-deep)' }}>
              <I.shield /> {label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
