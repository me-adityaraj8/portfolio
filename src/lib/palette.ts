/**
 * Command-menu search: every letter of the query must appear in order. A match at
 * the start of a word beats one inside a word, which beats letters scattered apart.
 */
export function rank<T extends { label: string }>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const scored: Array<[number, number, T]> = [];
  items.forEach((item, i) => {
    const l = item.label.toLowerCase();
    let score: number;
    if (l.split(/\s+/).some((w) => w.startsWith(q))) score = 0;
    else if (l.includes(q)) score = 1;
    else {
      let at = -1, gaps = 0;
      for (const ch of q) {
        const next = l.indexOf(ch, at + 1);
        if (next < 0) return;
        gaps += next - at - 1;
        at = next;
      }
      score = 2 + gaps / 100;
    }
    scored.push([score, i, item]);
  });
  return scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([, , item]) => item);
}
