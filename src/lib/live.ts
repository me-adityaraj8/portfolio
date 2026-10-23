/** Live bits of the page: the GitHub contribution graph, the next contest and the latest commit. */

export interface Day { date: string; level: number; count: number }

/** Reads GitHub's public contribution calendar (github.com/users/<name>/contributions). */
export function parseContributions(html: string): Day[] {
  const tips = new Map<string, string>();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)</g)) tips.set(m[1], m[2]);
  const days: Day[] = [];
  for (const m of html.matchAll(/<td\b[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="([\d-]+)"/)?.[1];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    const level = tag.match(/data-level="(\d)"/)?.[1];
    if (!date || !id || level === undefined) continue;
    const count = Number(tips.get(id)?.match(/^(\d+) contributions?/)?.[1] ?? 0);
    days.push({ date, level: Number(level), count });
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

/** The current streak may still include today before anything has been pushed today. */
export function streaks(days: Array<{ date: string; count: number }>, today: string) {
  let longest = 0, run = 0, total = 0;
  for (const d of days) {
    total += d.count;
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  const upTo = days.filter((d) => d.date <= today);
  let i = upTo.length - 1;
  if (i >= 0 && upTo[i].count === 0) i--;
  let current = 0;
  while (i >= 0 && upTo[i].count > 0) { current++; i--; }
  return { current, longest, total };
}

/** The soonest Codeforces round that hasn't started yet. */
export function nextContest<T extends { phase: string; startTimeSeconds: number }>(list: T[], nowSeconds: number): T | null {
  return list.filter((c) => c.phase === 'BEFORE' && c.startTimeSeconds > nowSeconds).sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)[0] ?? null;
}

export function countdown(ms: number) {
  if (ms <= 0) return 'starting now';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d ? `${d}d ` : ''}${p(h)}:${p(m)}:${p(sec)}`;
}

/** The repo pushed to most recently, leaving out forks, hidden repos and the profile README. */
export function latestRepo<T extends { name: string; pushed_at: string; fork: boolean }>(repos: T[], hidden: string[], owner: string): T | null {
  return repos
    .filter((r) => !r.fork && r.name.toLowerCase() !== owner.toLowerCase() && !hidden.includes(r.name.toLowerCase()))
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))[0] ?? null;
}
