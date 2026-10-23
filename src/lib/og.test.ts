import { describe, expect, it } from 'vitest';
import { dotField } from './og';

const dots = (svg: string) => [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"[^>]*fill-opacity="([\d.]+)"/g)]
  .map((m) => ({ x: +m[1], y: +m[2], size: +m[3], a: +m[4] }));

describe('dotField', () => {
  it('draws one dot per grid cell at the given size', () => {
    const svg = dotField(300, 150, 15);
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150"')).toBe(true);
    expect(dots(svg)).toHaveLength(20 * 10);
  });
  it('keeps the left side dim, so text over it stays readable', () => {
    const d = dots(dotField(1200, 630, 15));
    const mean = (xs: typeof d) => xs.reduce((s, p) => s + p.a, 0) / xs.length;
    expect(mean(d.filter((p) => p.x < 300))).toBeLessThan(mean(d.filter((p) => p.x > 900)) / 2);
  });
  it('freezes a wave in place: some dots are drawn larger', () => {
    const d = dots(dotField(1200, 630, 15));
    expect(d.some((p) => p.size > 3)).toBe(true);
    expect(d.filter((p) => p.size > 3).length).toBeLessThan(d.length / 4);
  });
});
