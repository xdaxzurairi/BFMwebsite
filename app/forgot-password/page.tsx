import { AuthCard } from '@/components/auth/AuthCard';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { getLang } from '@/lib/lang';
import { t as translate } from '@/lib/i18n';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const lang = await getLang();
  const { error } = await searchParams;
  return (
    <AuthCard title={translate('forgot.title', lang)} sub={translate('forgot.sub', lang)}>
      {error === 'link' && (
        <p className="review-note" style={{ marginTop: 0, marginBottom: 18 }}>
          {translate('forgot.badlink', lang)}
        </p>
      )}
      <ForgotPasswordForm lang={lang} />
    </AuthCard>
  );
}
