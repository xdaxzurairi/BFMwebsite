'use client';

import { useEffect, useRef } from 'react';
import { toast } from '@/lib/toast';
import type { ActionState } from '@/lib/actionState';

export function useActionToast(state: ActionState, pending: boolean, successMsg: string, onSuccess?: () => void) {
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state?.error) toast(state.error, true);
      else {
        toast(successMsg);
        onSuccess?.();
      }
    }
    wasPending.current = pending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);
}
