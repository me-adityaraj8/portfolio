interface Sized { transferSize: number; encodedBodySize: number }

/**
 * What this page cost to load. Files served from cache report no transfer size,
 * so they're counted by their size on disk instead.
 */
export function perfSummary(nav: (Sized & { domInteractive: number; startTime: number }) | undefined, resources: Sized[]) {
  if (!nav) return null;
  const bytes = [nav, ...resources].reduce((sum, r) => sum + (r.transferSize || r.encodedBodySize), 0);
  return { kb: Math.round(bytes / 1000), ms: Math.round(nav.domInteractive - nav.startTime), cached: nav.transferSize === 0 };
}

/** How a live demo answered a ping. Free hosts sleep when idle and take a few seconds to wake. */
export function latencyLabel(ms: number | null) {
  if (ms === null) return { state: 'down', text: 'May be asleep' } as const;
  if (ms >= 2500) return { state: 'slow', text: `Waking up · ${(ms / 1000).toFixed(1)} s` } as const;
  return { state: 'up', text: `Live · ${Math.round(ms)} ms` } as const;
}
