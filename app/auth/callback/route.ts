import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/* Landing point for Supabase email links (password recovery). Handles both the default
   PKCE `?code=` link and a custom email template's `?token_hash=&type=` link. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const nextParam = url.searchParams.get('next') ?? '/';
  // Only same-site relative paths, so the link can't bounce users to another domain.
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

  const supabase = await createClient();
  let ok = false;
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && type) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;

  const dest = url.clone();
  dest.search = '';
  if (ok) {
    dest.pathname = next;
  } else {
    dest.pathname = '/forgot-password';
    dest.searchParams.set('error', 'link');
  }
  return NextResponse.redirect(dest);
}
