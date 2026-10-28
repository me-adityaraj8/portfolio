import { describe, expect, it } from 'vitest';
import { shortcutFor, wordWatcher } from './keys';

const key = (k: string, extra: Partial<{ meta: boolean; ctrl: boolean; alt: boolean; typing: boolean }> = {}) =>
  ({ key: k, meta: false, ctrl: false, alt: false, typing: false, ...extra });

describe('shortcutFor', () => {
  it('opens the command menu with cmd or ctrl K, even while typing', () => {
    expect(shortcutFor(key('k', { meta: true }))).toBe('palette');
    expect(shortcutFor(key('K', { ctrl: true, typing: true }))).toBe('palette');
  });
  it('maps single letters to their actions', () => {
    expect(shortcutFor(key('t'))).toBe('theme');
    expect(shortcutFor(key('v'))).toBe('recruiter');
    expect(shortcutFor(key('?'))).toBe('help');
    expect(shortcutFor(key('m'))).toBe('message');
  });
  it('ignores letters while the visitor is typing in a field', () => {
    expect(shortcutFor(key('t', { typing: true }))).toBeNull();
    expect(shortcutFor(key('?', { typing: true }))).toBeNull();
  });
  it('leaves browser shortcuts alone', () => {
    expect(shortcutFor(key('t', { meta: true }))).toBeNull();
    expect(shortcutFor(key('v', { ctrl: true }))).toBeNull();
    expect(shortcutFor(key('t', { alt: true }))).toBeNull();
  });
  it('returns null for keys with no action', () => {
    expect(shortcutFor(key('x'))).toBeNull();
  });
});

describe('wordWatcher', () => {
  it('fires once the word is typed in order', () => {
    const feed = wordWatcher(['hire']);
    expect(['h', 'i', 'r'].map(feed)).toEqual([null, null, null]);
    expect(feed('e')).toBe('hire');
  });
  it('is case-insensitive and ignores non-letter keys', () => {
    const feed = wordWatcher(['hire']);
    ['H', 'Shift', 'I', 'R'].forEach(feed);
    expect(feed('E')).toBe('hire');
  });
  it('recovers from a wrong letter mid-word', () => {
    const feed = wordWatcher(['hire']);
    ['h', 'h', 'i', 'r'].forEach(feed);
    expect(feed('e')).toBe('hire');
  });
  it('starts over after firing', () => {
    const feed = wordWatcher(['hire']);
    ['h', 'i', 'r', 'e'].forEach(feed);
    expect(feed('e')).toBeNull();
  });
});
