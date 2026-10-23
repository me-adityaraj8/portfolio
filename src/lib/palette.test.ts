import { describe, expect, test } from 'vitest';
import { rank } from './palette';

const items = [
  { label: 'Copy email address' },
  { label: 'Open Kairo' },
  { label: 'Go to Problem solving' },
  { label: 'Open resume' },
  { label: 'Go to Education' },
];
const labels = (q: string) => rank(items, q).map((i) => i.label);

describe('rank', () => {
  test('shows everything, in order, for an empty query', () => {
    expect(labels('')).toEqual(items.map((i) => i.label));
  });

  test('matches letters in order even with gaps', () => {
    expect(labels('kro')).toEqual(['Open Kairo']);
  });

  test('ignores case', () => {
    expect(labels('EMAIL')).toEqual(['Copy email address']);
  });

  test('puts matches at the start of a word ahead of matches inside one', () => {
    expect(labels('res')[0]).toBe('Open resume');
  });

  test('returns nothing when the letters are not all there', () => {
    expect(labels('zzz')).toEqual([]);
  });
});
