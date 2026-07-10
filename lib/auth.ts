import { createClient } from '@/lib/supabase/server';

export type AppUser = {
  user_id: number;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: 'user' | 'club_manager' | 'admin' | 'technical_admin';
  club_id: number | null;
};

export async function getAppUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('user_id, auth_user_id, full_name, email, role, club_id')
    .eq('auth_user_id', user.id)
    .single();

  return data as AppUser | null;
}
