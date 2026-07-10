'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUpAction } from '@/app/actions/auth';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { t as translate, type Lang } from '@/lib/i18n';

export function SignUpForm({ lang }: { lang: Lang }) {
  const [state, formAction, pending] = useActionState(signUpAction, null);

  return (
    <form action={formAction} className="col" style={{ gap: 18 }}>
      <Field label={translate('lbl.fullname', lang)}>
        <Input type="text" name="full_name" required autoComplete="name" />
      </Field>
      <Field label={translate('lbl.email', lang)}>
        <Input type="email" name="email" required autoComplete="email" />
      </Field>
      <Field label={translate('lbl.password', lang)} error={state?.error} hint={lang === 0 ? 'Sekurang-kurangnya 6 aksara' : 'At least 6 characters'}>
        <Input type="password" name="password" required minLength={6} autoComplete="new-password" />
      </Field>
      <Button type="submit" variant="field" size="lg" block disabled={pending}>
        {translate('cta.signup', lang)}
      </Button>
      <p className="muted" style={{ textAlign: 'center', fontSize: 14 }}>
        {translate('signup.hasaccount', lang)} <Link href="/sign-in" style={{ fontWeight: 700, color: 'var(--field)' }}>{translate('cta.signin', lang)}</Link>
      </p>
    </form>
  );
}
