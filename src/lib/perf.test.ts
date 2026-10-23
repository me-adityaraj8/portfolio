import { describe, expect, it } from 'vitest';
import { latencyLabel, perfSummary } from './perf';

describe('perfSummary', () => {
  it('adds the document and every resource it can measure', () => {
    const s = perfSummary({ transferSize: 20_000, encodedBodySize: 18_000, domInteractive: 412, startTime: 0 }, [
      { transferSize: 100_000, encodedBodySize: 98_000 },
      { transferSize: 40_000, encodedBodySize: 39_000 },
    ]);
    expect(s).toEqual({ kb: 160, ms: 412, cached: false });
  });
  it('counts cached files by their size on disk, and says the load was cached', () => {
    const s = perfSummary({ transferSize: 0, encodedBodySize: 18_000, domInteractive: 90, startTime: 0 }, [{ transferSize: 0, encodedBodySize: 52_000 }]);
    expect(s).toEqual({ kb: 70, ms: 90, cached: true });
  });
  it('returns null without a navigation entry', () => {
    expect(perfSummary(undefined, [])).toBeNull();
  });
});

describe('latencyLabel', () => {
  it('reports a fast answer as live with its time', () => {
    expect(latencyLabel(184)).toEqual({ state: 'up', text: 'Live · 184 ms' });
  });
  it('rounds slow answers to seconds and calls them waking', () => {
    expect(latencyLabel(4_250)).toEqual({ state: 'slow', text: 'Waking up · 4.3 s' });
  });
  it('reports no answer as asleep', () => {
    expect(latencyLabel(null)).toEqual({ state: 'down', text: 'May be asleep' });
  });
});
