import { describe, expect, test } from 'vitest';
import { cfRank, sparkline } from './cp';

describe('sparkline', () => {
  test('lowest rating sits on the bottom edge and highest on the top', () => {
    const { points } = sparkline([1000, 1500, 1200], 100, 40);
    expect(points).toEqual([[0, 40], [50, 0], [100, 24]]);
  });

  test('a single contest draws a flat line through the middle', () => {
    expect(sparkline([1398], 100, 40).points).toEqual([[0, 20], [100, 20]]);
  });

  test('writes the points as SVG path data', () => {
    expect(sparkline([1000, 2000], 10, 10).d).toBe('M0 10L10 0');
  });
});

describe('cfRank', () => {
  test.each([
    [1000, 'Newbie'], [1200, 'Pupil'], [1398, 'Pupil'], [1400, 'Specialist'], [1407, 'Specialist'], [1600, 'Expert'], [1900, 'Candidate Master'],
  ])('%i is %s', (rating, title) => {
    expect(cfRank(rating).title).toBe(title);
  });
});
