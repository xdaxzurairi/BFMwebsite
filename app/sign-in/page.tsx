import { AuthCard } from '@/components/auth/AuthCard';
import { SignInForm } from '@/components/auth/SignInForm';
import { getLang } from '@/lib/lang';
import { t as translate } from '@/lib/i18n';

export default async function SignInPage() {
  const lang = await getLang();
  return (
    <AuthCard title={translate('signin.title', lang)} sub={translate('signin.sub', lang)}>
      <SignInForm lang={lang} />
    </AuthCard>
  );
}
