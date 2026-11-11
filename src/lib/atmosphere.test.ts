import { describe, expect, test } from 'vitest';
import { aurora, describeWeather, lens, phaseOf, ring, ripple, waveDelay, weatherKind } from './atmosphere';

describe('phaseOf', () => {
  test.each([
    [5, 'dawn'], [7, 'dawn'], [8, 'day'], [16, 'day'], [17, 'dusk'], [19, 'dusk'], [20, 'night'], [0, 'night'], [4, 'night'],
  ])('hour %i is %s', (hour, phase) => {
    expect(phaseOf(hour)).toBe(phase);
  });
});

describe('weatherKind', () => {
  test.each([
    [0, 'clear'], [2, 'cloud'], [45, 'fog'], [48, 'fog'], [53, 'rain'], [63, 'rain'], [81, 'rain'], [95, 'storm'], [99, 'storm'], [71, 'cloud'],
  ])('WMO code %i reads as %s', (code, kind) => {
    expect(weatherKind(code)).toBe(kind);
  });
});

describe('ripple', () => {
  // A BFS wave on a grid: a diamond whose edge is `age * speed` cells from the source.
  const opts = { speed: 10, life: 1, width: 1.5 };

  test('is brightest right on the wave front', () => {
    expect(ripple(3, 2, 0.5, opts)).toBeCloseTo(0.5, 6); // front at 5 cells, cell at Manhattan 5, half-way through life
  });

  test('is dark ahead of the wave', () => {
    expect(ripple(4, 3, 0.5, opts)).toBe(0);
  });

  test('is dark once the wave has passed', () => {
    expect(ripple(1, 1, 0.5, opts)).toBe(0);
  });

  test('fades out completely at the end of its life', () => {
    expect(ripple(10, 0, 1, opts)).toBe(0);
  });
});

describe('ring', () => {
  // A round wave: its edge is `age * speed` cells from the source, the same in every direction.
  const opts = { speed: 10, life: 1, width: 1.5 };

  test('is brightest right on the wave front, measured in a straight line', () => {
    expect(ring(3, 4, 0.5, opts)).toBeCloseTo(0.5, 6); // front at 5 cells, cell 5 away, half-way through life
  });

  test('is the same in every direction', () => {
    expect(ring(5, 0, 0.5, opts)).toBeCloseTo(ring(0, -5, 0.5, opts), 6);
    expect(ring(5, 0, 0.5, opts)).toBeCloseTo(ring(-3, 4, 0.5, opts), 6);
  });

  test('is dark ahead of the wave and once it has passed', () => {
    expect(ring(4, 4, 0.5, opts)).toBe(0);
    expect(ring(1, 1, 0.5, opts)).toBe(0);
  });

  test('fades out completely at the end of its life', () => {
    expect(ring(10, 0, 1, opts)).toBe(0);
  });
});

describe('aurora', () => {
  test('stays between 0 and 1 everywhere', () => {
    for (let x = 0; x < 120; x += 7) for (let y = 0; y < 70; y += 5) for (const t of [0, 3.3, 41]) {
      const a = aurora(x, y, t);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(1);
    }
  });

  test('is smooth: neighbouring dots are close in brightness', () => {
    for (let x = 0; x < 120; x += 3) expect(Math.abs(aurora(x + 1, 20, 5) - aurora(x, 20, 5))).toBeLessThan(0.12);
  });

  test('moves with time and has both dark and bright stretches', () => {
    const row = (t: number) => Array.from({ length: 120 }, (_, x) => aurora(x, 30, t));
    expect(row(0)).not.toEqual(row(2));
    expect(Math.max(...row(0))).toBeGreaterThan(0.5);
    expect(Math.min(...row(0))).toBeLessThan(0.05);
  });
});

describe('lens', () => {
  test('is full strength at the pointer and falls away smoothly', () => {
    expect(lens(0, 6)).toBe(1);
    expect(lens(6, 6)).toBeLessThan(lens(3, 6));
    expect(lens(3, 6)).toBeLessThan(1);
    expect(lens(30, 6)).toBeLessThan(0.001);
  });
});

describe('waveDelay', () => {
  test('cells further from the source clear later, in Manhattan steps', () => {
    expect(waveDelay(5, 5, 5, 5, 4)).toBe(0);
    expect(waveDelay(5, 5, 8, 9, 4)).toBe(28);
  });
});

describe('describeWeather', () => {
  test.each([
    [0, true, 'Clear sky', 'sun'], [0, false, 'Clear night', 'moon'], [2, true, 'Partly cloudy', 'cloud-sun'], [2, false, 'Partly cloudy', 'cloud-moon'],
    [3, true, 'Overcast', 'cloud'], [45, true, 'Fog', 'fog'], [53, false, 'Drizzle', 'rain'], [63, true, 'Rain', 'rain'], [81, true, 'Showers', 'rain'], [95, false, 'Thunderstorm', 'storm'],
  ])('code %i, day %s reads as %s with a %s icon', (code, day, label, icon) => {
    expect(describeWeather(code, day)).toEqual({ label, icon });
  });
});
