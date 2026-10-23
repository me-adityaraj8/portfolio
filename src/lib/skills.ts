const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]/g, '');

/** Does a project's stack include this tool? "React 18" and "PostgreSQL (Neon)" count; "JavaScript" is not "Java". */
export function usesTool(stack: string[], tool: string) {
  const t = norm(tool);
  return stack.some((s) => {
    const base = s.replace(/\(.*?\)/g, '').replace(/\s+\d[\d.]*$/, '').trim();
    return norm(base) === t || norm(base.split(/\s+/)[0]) === t;
  });
}

/** Bytes per language across repos, as whole percentages; anything under 2% becomes Other. */
export function languageShare(repos: Array<Record<string, number>>) {
  const total: Record<string, number> = {};
  for (const r of repos) for (const [k, v] of Object.entries(r)) total[k] = (total[k] ?? 0) + v;
  const sum = Object.values(total).reduce((a, b) => a + b, 0);
  if (!sum) return [];
  const rows = Object.entries(total).map(([name, b]) => ({ name, pct: (b / sum) * 100 })).sort((a, b) => b.pct - a.pct);
  const big = rows.filter((r) => r.pct >= 2);
  const other = rows.filter((r) => r.pct < 2).reduce((a, r) => a + r.pct, 0);
  const out = big.map((r) => ({ name: r.name, pct: Math.round(r.pct) }));
  if (Math.round(other) > 0) out.push({ name: "Other", pct: Math.round(other) });
  return out;
}
