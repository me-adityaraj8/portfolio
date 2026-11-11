import { describe, it, expect } from 'vitest';
import { ringText } from './credentials';

describe('ringText', () => {
  it('repeats the label with a separator until it reaches the length', () => {
    expect(ringText('CF', 10)).toBe('CF · CF · ');
  });
  it('never cuts a repeat in half', () => {
    const t = ringText('LEETCODE', 30);
    expect(t.length).toBeLessThanOrEqual(30);
    expect(t.endsWith(' · ')).toBe(true);
  });
  it('keeps one copy when the label is longer than the ring', () => {
    expect(ringText('A LONG LABEL', 4)).toBe('A LONG LABEL · ');
  });
});
