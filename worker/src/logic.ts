/** The parts of the guestbook server that decide what's allowed. */

const MAX = 140;
const DAY = 86_400_000;
const COOLDOWN = 10 * 60_000;

export function cleanMessage(raw: string): { ok: true; text: string } | { ok: false; error: string } {
  // eslint-disable-next-line no-control-regex
  const text = raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return { ok: false, error: 'Write something first.' };
  if (text.length > MAX) return { ok: false, error: `Keep it under ${MAX} characters.` };
  if (/https?:\/\/|www\.|\.[a-z]{2,}\/\S/i.test(text)) return { ok: false, error: 'Links are not allowed.' };
  return { ok: true, text };
}

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
}

/** A day-long token proving who signed in with GitHub, so the server never keeps sessions. */
export async function signToken(user: object, secret: string, now: number) {
  const body = b64url(new TextEncoder().encode(JSON.stringify({ ...user, exp: now + DAY })));
  return `${body}.${b64url(await hmac(secret, body))}`;
}

export async function verifyToken(token: string, secret: string, now: number): Promise<Record<string, unknown> | null> {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = b64url(await hmac(secret, body));
  // Compare the whole signature without stopping at the first difference.
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    return typeof data.exp === 'number' && data.exp > now ? data : null;
  } catch {
    return null;
  }
}

/** One post per person every ten minutes. */
export function allowPost(lastAt: number | undefined, now: number) {
  return lastAt === undefined || now - lastAt >= COOLDOWN;
}
