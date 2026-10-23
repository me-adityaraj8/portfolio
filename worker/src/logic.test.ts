import { describe, expect, test } from 'vitest';
import { allowPost, cleanMessage, signToken, verifyToken } from './logic';

describe('cleanMessage', () => {
  test('trims and collapses whitespace', () => {
    expect(cleanMessage('  hello \n\n  there  ')).toEqual({ ok: true, text: 'hello there' });
  });

  test('rejects an empty message', () => {
    expect(cleanMessage('   ').ok).toBe(false);
  });

  test('rejects messages longer than 140 characters', () => {
    expect(cleanMessage('a'.repeat(141)).ok).toBe(false);
    expect(cleanMessage('a'.repeat(140)).ok).toBe(true);
  });

  test('rejects links, the usual shape of guestbook spam', () => {
    expect(cleanMessage('great site, visit https://spam.example').ok).toBe(false);
    expect(cleanMessage('see www.spam.example').ok).toBe(false);
  });

  test('strips control characters', () => {
    expect(cleanMessage('hi\u0000\u0007 there')).toEqual({ ok: true, text: 'hi there' });
  });
});

describe('tokens', () => {
  const user = { login: 'octocat', name: 'Octo', avatar: 'https://a/x.png' };

  test('a signed token verifies and returns the user', async () => {
    const t = await signToken(user, 'secret', 1_000);
    expect(await verifyToken(t, 'secret', 1_500)).toEqual(expect.objectContaining(user));
  });

  test('a token signed with another secret is rejected', async () => {
    const t = await signToken(user, 'secret', 1_000);
    expect(await verifyToken(t, 'other', 1_500)).toBeNull();
  });

  test('a tampered token is rejected', async () => {
    const t = await signToken(user, 'secret', 1_000);
    const [body, sig] = t.split('.');
    const forged = btoa(JSON.stringify({ ...JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/'))), login: 'admin' })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    expect(await verifyToken(`${forged}.${sig}`, 'secret', 1_500)).toBeNull();
  });

  test('a token expires after a day', async () => {
    const t = await signToken(user, 'secret', 0);
    expect(await verifyToken(t, 'secret', 86_400_000 + 1)).toBeNull();
  });
});

describe('allowPost', () => {
  test('lets someone post the first time', () => {
    expect(allowPost(undefined, 10_000)).toBe(true);
  });

  test('blocks a second post within ten minutes', () => {
    expect(allowPost(10_000, 10_000 + 9 * 60_000)).toBe(false);
  });

  test('allows another post after ten minutes', () => {
    expect(allowPost(10_000, 10_000 + 10 * 60_000)).toBe(true);
  });
});
