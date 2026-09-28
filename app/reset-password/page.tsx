import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/lang';
import { t as translate } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const lang = await getLang();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthCard title={translate('reset.title', lang)} sub={user ? `${translate('reset.sub', lang)} ${user.email}` : undefined}>
      {user ? (
        <ResetPasswordForm lang={lang} />
      ) : (
        <div className="col" style={{ gap: 14, textAlign: 'center' }}>
          <p className="muted" style={{ fontSize: 14 }}>
            {translate('forgot.badlink', lang)}
          </p>
          <Link href="/forgot-password" className="btn btn-field btn-block">
            {translate('forgot.send', lang)}
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
