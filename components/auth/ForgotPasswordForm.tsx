'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordResetAction } from '@/app/actions/auth';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { I } from '@/components/ui/icons';
import { t as translate, type Lang } from '@/lib/i18n';

export function ForgotPasswordForm({ lang }: { lang: Lang }) {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, null);

  if (state?.sent) {
    return (
      <div className="col" style={{ gap: 14, textAlign: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <span className="badge badge-approved" style={{ padding: 10, borderRadius: '50%' }}>
            <I.check style={{ width: 20, height: 20 }} />
          </span>
        </div>
        <p style={{ fontWeight: 700 }}>{translate('forgot.sent.title', lang)}</p>
        <p className="muted" style={{ fontSize: 14 }}>{translate('forgot.sent.sub', lang)}</p>
        <Link href="/sign-in" className="btn btn-ghost btn-block">
          {translate('forgot.back', lang)}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="col" style={{ gap: 18 }}>
      <Field label={translate('lbl.email', lang)} error={state?.error}>
        <Input type="email" name="email" required autoComplete="email" autoFocus />
      </Field>
      <Button type="submit" variant="field" size="lg" block disabled={pending}>
        {translate('forgot.send', lang)}
      </Button>
      <p className="muted" style={{ textAlign: 'center', fontSize: 14 }}>
        <Link href="/sign-in" style={{ fontWeight: 700, color: 'var(--field)' }}>
          {translate('forgot.back', lang)}
        </Link>
      </p>
    </form>
  );
}
