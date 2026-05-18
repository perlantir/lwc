import { env } from '../env';

export const verifyTurnstile = async (token: string | undefined, ip?: string): Promise<boolean> => {
  if (!env.TURNSTILE_SECRET_KEY) return true; // disabled => pass
  if (!token) return false;
  const params = new URLSearchParams();
  params.set('secret', env.TURNSTILE_SECRET_KEY);
  params.set('response', token);
  if (ip) params.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    return false;
  }
};
