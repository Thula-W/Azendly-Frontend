import { SUPABASE_URL } from './supabasePublic';

export async function verifyWaitlistToken(
  token: string
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!anonKey) {
    return { ok: false, error: 'App configuration is missing.' };
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ token }),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string; email?: string };

  if (!res.ok) {
    return {
      ok: false,
      error: typeof data.error === 'string' ? data.error : 'Verification failed.',
    };
  }

  if (typeof data.email !== 'string' || !data.email) {
    return { ok: false, error: 'Verification response is missing email.' };
  }

  return { ok: true, email: data.email };
}
