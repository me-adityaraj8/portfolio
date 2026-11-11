import { describe, it, expect } from 'vitest';
import { gaze, litSpines, SPINES } from './standin';

describe('gaze', () => {
  it('looks straight ahead when the target is on the face', () => {
    expect(gaze(100, 100, 100, 100)).toEqual({ x: 0, y: 0 });
  });
  it('points towards the target', () => {
    const g = gaze(0, 0, 160, 0, 320);
    expect(g.x).toBeCloseTo(0.5);
    expect(g.y).toBeCloseTo(0);
  });
  it('never looks further than the edge of the eye', () => {
    const g = gaze(0, 0, -3000, 4000, 320);
    expect(Math.hypot(g.x, g.y)).toBeCloseTo(1);
    expect(g.x).toBeLessThan(0);
    expect(g.y).toBeGreaterThan(0);
  });
});

describe('litSpines', () => {
  it('lights the book a source link belongs to', () => {
    expect(litSpines(['/#open-source', '/resume.pdf'])).toEqual(['/#open-source', '/resume.pdf']);
  });
  it('sends case studies to the work book, once', () => {
    expect(litSpines(['/work/rys', '/#work', '/work/kairo'])).toEqual(['/#work']);
  });
  it('ignores links that are not on the shelf', () => {
    expect(litSpines(['https://example.com', '/nope'])).toEqual([]);
  });
  it('has a book for every source an answer can cite', async () => {
    const { SOURCES } = await import('./ask');
    expect(SPINES.map((s) => s.href).sort()).toEqual(SOURCES.map((s) => s.href).sort());
  });
});
