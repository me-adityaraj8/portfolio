import { describe, expect, it } from 'vitest';
import { SCENE_MS, clock, reelAt } from './reel';

describe('reelAt', () => {
  it('starts on the first scene with the whole clock left', () => {
    expect(reelAt(0, 5)).toEqual({ scene: 0, fill: 0, left: 5 * SCENE_MS, done: false });
  });
  it('moves to the next scene when one runs out', () => {
    const r = reelAt(SCENE_MS * 1.5, 5);
    expect(r.scene).toBe(1);
    expect(r.fill).toBeCloseTo(0.5);
    expect(r.left).toBe(SCENE_MS * 3.5);
  });
  it('holds on the last scene, full, when time is up', () => {
    expect(reelAt(SCENE_MS * 5, 5)).toEqual({ scene: 4, fill: 1, left: 0, done: true });
    expect(reelAt(SCENE_MS * 9, 5)).toEqual({ scene: 4, fill: 1, left: 0, done: true });
  });
  it('treats time before the start as the start', () => {
    expect(reelAt(-50, 5).scene).toBe(0);
  });
});

describe('clock', () => {
  it('counts down in whole seconds, rounding up', () => {
    expect(clock(30000)).toBe('0:30');
    expect(clock(29999)).toBe('0:30');
    expect(clock(9001)).toBe('0:10');
    expect(clock(9000)).toBe('0:09');
    expect(clock(0)).toBe('0:00');
  });
});
