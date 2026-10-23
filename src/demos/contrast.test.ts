import { describe, expect, test } from 'vitest';
import { assessContrast, contrastRatio } from './contrast';

describe('QR contrast rule (as in QRGen)', () => {
  test('computes WCAG contrast ratios', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  test('blocks low contrast and flags light-on-dark codes', () => {
    expect(assessContrast('#000000', '#ffffff').level).toBe('ok');
    expect(assessContrast('#bbbbbb', '#ffffff').level).toBe('too-low');
    expect(assessContrast('#ffffff', '#000000').level).toBe('inverted');
  });
});
