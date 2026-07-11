'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionState } from '@/lib/actionState';

export async function recordPaymentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const tournamentId = Number(formData.get('tournament_id') || 0);
  const clubId = Number(formData.get('club_id') || 0);
  const amount = Number(formData.get('payment_amount') || 0);
  if (!tournamentId || !clubId || !amount) return { error: 'Please choose a registration and enter an amount.' };

  const supabase = await createClient();
  const { error } = await supabase.from('payments').insert({
    tournament_id: tournamentId,
    club_id: clubId,
    payment_amount: amount,
    payment_method: String(formData.get('payment_method') || 'bank_transfer'),
    payment_reference: String(formData.get('payment_reference') || '') || null,
    payment_status: 'completed',
  });
  if (error) return { error: error.message };
  revalidatePath('/dashboard/payments');
  return null;
}

export async function deletePaymentAction(paymentId: number) {
  const supabase = await createClient();
  await supabase.from('payments').delete().eq('payment_id', paymentId);
  revalidatePath('/dashboard/payments');
}
