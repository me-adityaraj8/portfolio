/** The stand-in: the character in "Ask my stand-in" and the shelf of pages it answers from. */

/** One book per place an answer can cite. `h` is the spine's height in px, `lean` a tilt in degrees. */
export const SPINES = [
  { href: '/#work', label: 'Work', color: '#a78bfa', h: 100 },
  { href: '/#experience', label: 'Experience', color: '#f472b6', h: 112 },
  { href: '/#open-source', label: 'Open source', color: '#38bdf8', h: 120 },
  { href: '/#credentials', label: 'Credentials', color: '#4ade80', h: 118 },
  { href: '/#education', label: 'Education', color: '#818cf8', h: 108 },
  { href: '/#stack', label: 'Stack', color: '#fbbf24', h: 88 },
  { href: '/#problem-solving', label: 'DSA', color: '#fb7185', h: 82 },
  { href: '/#now', label: 'Now', color: '#2dd4bf', h: 78 },
  { href: '/personal', label: 'Life', color: '#c084fc', h: 92, lean: -9 },
  { href: '/resume.pdf', label: 'Resume', color: '#e2e8f0', h: 104, lean: -9 },
] as const;

/**
 * Where the eyes should point: a vector inside the unit circle, from the face at (cx, cy)
 * towards (tx, ty). Targets `reach` px away or more get a full-length look.
 */
export function gaze(cx: number, cy: number, tx: number, ty: number, reach = 320): { x: number; y: number } {
  const dx = tx - cx, dy = ty - cy;
  const d = Math.hypot(dx, dy);
  if (d === 0) return { x: 0, y: 0 };
  const k = Math.min(1, d / reach) / d;
  return { x: dx * k, y: dy * k };
}

/** Which books to pull out for an answer's sources. Case studies live in the work book. */
export function litSpines(sources: string[]): string[] {
  const shelf = new Set<string>(SPINES.map((s) => s.href));
  const out: string[] = [];
  for (const s of sources) {
    const href = s.startsWith('/work/') ? '/#work' : s;
    if (shelf.has(href) && !out.includes(href)) out.push(href);
  }
  return out;
}
