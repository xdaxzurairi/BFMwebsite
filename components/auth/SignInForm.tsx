'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signInAction } from '@/app/actions/auth';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { t as translate, type Lang } from '@/lib/i18n';

export function SignInForm({ lang }: { lang: Lang }) {
  const [state, formAction, pending] = useActionState(signInAction, null);

  return (
    <form action={formAction} className="col" style={{ gap: 18 }}>
      <Field label={translate('lbl.email', lang)}>
        <Input type="email" name="email" required autoComplete="email" />
      </Field>
      <Field label={translate('lbl.password', lang)} error={state?.error}>
        <Input type="password" name="password" required autoComplete="current-password" />
      </Field>
      <Button type="submit" variant="field" size="lg" block disabled={pending}>
        {translate('cta.signin', lang)}
      </Button>
      <p className="muted" style={{ textAlign: 'center', fontSize: 14 }}>
        {translate('signin.noaccount', lang)} <Link href="/sign-up" style={{ fontWeight: 700, color: 'var(--field)' }}>{translate('cta.signup', lang)}</Link>
      </p>
    </form>
  );
}
