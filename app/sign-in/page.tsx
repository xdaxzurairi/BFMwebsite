import Image from 'next/image';
import { SignInForm } from '@/components/auth/SignInForm';
import { getLang } from '@/lib/lang';
import { t as translate } from '@/lib/i18n';

export default async function SignInPage() {
  const lang = await getLang();
  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'grid', placeItems: 'center', padding: '60px 20px', background: 'var(--sand)' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Image src="/assets/bfm-crest.png" alt="BFM" width={64} height={64} style={{ objectFit: 'contain', margin: '0 auto 18px' }} />
          <div className="kicker" style={{ justifyContent: 'center', marginBottom: 14 }}>
            {translate('signin.title', lang)}
          </div>
          <p className="muted" style={{ fontSize: 15, marginTop: 6 }}>{translate('signin.sub', lang)}</p>
        </div>
        <div className="card pad">
          <SignInForm lang={lang} />
        </div>
      </div>
    </div>
  );
}
