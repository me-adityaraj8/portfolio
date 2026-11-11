/** Shared by the "Ask about Aditya" panel and the /api/ask function. No Astro imports here. */

export type Msg = { role: 'user' | 'assistant'; content: string };

/** Places on the site an answer can point to. Case studies (/work/<slug>) are allowed too. */
export const SOURCES = [
  { href: '/#work', label: 'Proof of work' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#open-source', label: 'Open source' },
  { href: '/#credentials', label: 'Credentials' },
  { href: '/#education', label: 'Education' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#problem-solving', label: 'Problem solving' },
  { href: '/#now', label: 'Now' },
  { href: '/personal', label: 'Personal' },
  { href: '/resume.pdf', label: 'Resume' },
] as const;

const MAX_MESSAGES = 8;
const MAX_CHARS = 600;

/** Validates what the browser sent. Null means a bad request. */
export function parseAsk(body: unknown): { messages: Msg[] } | null {
  if (!body || typeof body !== 'object') return null;
  const raw = (body as Record<string, unknown>).messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 40) return null;
  const clean: Msg[] = [];
  for (const m of raw) {
    if (!m || typeof m !== 'object') return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim().slice(0, MAX_CHARS);
    if (!text) return null;
    clean.push({ role, content: text });
  }
  const recent = clean.slice(-MAX_MESSAGES);
  while (recent.length && recent[0].role !== 'user') recent.shift();
  if (!recent.length || recent.at(-1)!.role !== 'user') return null;
  return { messages: recent };
}

/** Keeps the model's source links only when they point somewhere real on the site. */
export function cleanSources(list: unknown, slugs: string[] = []): string[] {
  if (!Array.isArray(list)) return [];
  const ok = new Set<string>([...SOURCES.map((s) => s.href), ...slugs.map((s) => `/work/${s}`)]);
  const out: string[] = [];
  for (const s of list) if (typeof s === 'string' && ok.has(s) && !out.includes(s)) out.push(s);
  return out.slice(0, 3);
}
