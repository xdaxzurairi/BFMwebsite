import { redirect } from 'next/navigation';
import { RegisterClubForm } from '@/components/RegisterClubForm';
import { getLang } from '@/lib/lang';
import { getAppUser } from '@/lib/auth';
import { t as translate } from '@/lib/i18n';

export default async function RegisterClubPage() {
  const lang = await getLang();
  const appUser = await getAppUser();
  if (!appUser) redirect('/sign-in');
  if (appUser.role !== 'user') redirect('/dashboard');

  return (
    <div className="section wrap" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="kicker" style={{ marginBottom: 14 }}>
        {translate('nav.clubs', lang)}
      </div>
      <h1 className="h-lg" style={{ marginBottom: 8 }}>
        {translate('regclub.title', lang)}
      </h1>
      <p className="muted" style={{ fontSize: 16, marginBottom: 28, maxWidth: 560 }}>
        {translate('regclub.sub', lang)}
      </p>
      <RegisterClubForm lang={lang} defaultManagerName={appUser.full_name} />
    </div>
  );
}
