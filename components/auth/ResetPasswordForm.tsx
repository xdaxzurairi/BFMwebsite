'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { updatePasswordAction } from '@/app/actions/auth';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { t as translate, type Lang } from '@/lib/i18n';

export function ResetPasswordForm({ lang }: { lang: Lang }) {
  const [state, formAction, pending] = useActionState(updatePasswordAction, null);
  const router = useRouter();
  useEffect(() => {
    if (state?.sent) {
      toast(translate('reset.done', lang));
      router.push('/dashboard');
    }
  }, [state, lang, router]);

  return (
    <form action={formAction} className="col" style={{ gap: 18 }}>
      <Field label={translate('reset.new', lang)}>
        <Input type="password" name="password" required minLength={8} autoComplete="new-password" autoFocus />
      </Field>
      <Field label={translate('reset.confirm', lang)} error={state?.error}>
        <Input type="password" name="confirm" required minLength={8} autoComplete="new-password" />
      </Field>
      <Button type="submit" variant="field" size="lg" block disabled={pending}>
        {translate('reset.save', lang)}
      </Button>
    </form>
  );
}
