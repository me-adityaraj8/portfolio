import { describe, expect, it } from 'vitest';
import { hangAngle, restY, stepBob, type Bob } from './swing';

const run = (b: Bob, len: number, seconds: number) => {
  for (let i = 0; i < seconds * 60; i++) b = stepBob(b, len, 1 / 60);
  return b;
};

describe('the badge on its lanyard', () => {
  it('comes to rest straight below the anchor', () => {
    const b = run({ x: -180, y: 40, vx: 0, vy: 0 }, 220, 12);
    expect(Math.abs(b.x)).toBeLessThan(1);
    expect(Math.abs(b.y - restY(220))).toBeLessThan(1);
    expect(Math.hypot(b.vx, b.vy)).toBeLessThan(2);
  });

  it('swings past the middle when let go from one side', () => {
    let b: Bob = { x: -150, y: 160, vx: 0, vy: 0 };
    let maxX = -Infinity;
    for (let i = 0; i < 120; i++) { b = stepBob(b, 220, 1 / 60); maxX = Math.max(maxX, b.x); }
    expect(maxX).toBeGreaterThan(40);
  });

  it('never lets the strap stretch far, even on a slow frame', () => {
    let b: Bob = { x: 0, y: 20, vx: 2400, vy: -600 };
    for (let i = 0; i < 200; i++) {
      b = stepBob(b, 220, 1 / 12);
      expect(Math.hypot(b.x, b.y)).toBeLessThan(220 * 1.35);
      expect(Number.isFinite(b.x) && Number.isFinite(b.y)).toBe(true);
    }
  });

  it('hangs along the strap', () => {
    expect(hangAngle({ x: 0, y: 200, vx: 0, vy: 0 })).toBeCloseTo(0);
    expect(hangAngle({ x: 200, y: 200, vx: 0, vy: 0 })).toBeCloseTo(-45);
    expect(hangAngle({ x: -200, y: 200, vx: 0, vy: 0 })).toBeCloseTo(45);
  });
});
