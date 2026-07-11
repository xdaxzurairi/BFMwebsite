import Image from 'next/image';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { getLang } from '@/lib/lang';
import { t as translate } from '@/lib/i18n';

export default async function SignUpPage() {
  const lang = await getLang();
  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'grid', placeItems: 'center', padding: '60px 20px', background: 'var(--sand)' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Image src="/assets/bfm-crest.png" alt="BFM" width={64} height={64} style={{ objectFit: 'contain', margin: '0 auto 18px' }} />
          <div className="kicker" style={{ justifyContent: 'center', marginBottom: 14 }}>
            {translate('signup.title', lang)}
          </div>
          <p className="muted" style={{ fontSize: 15, marginTop: 6 }}>{translate('signup.sub', lang)}</p>
        </div>
        <div className="card pad">
          <SignUpForm lang={lang} />
        </div>
      </div>
    </div>
  );
}
