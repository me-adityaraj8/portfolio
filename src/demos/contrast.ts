// The same rule QRGen uses before it lets you export a code.
export const MIN_CONTRAST_RATIO = 3;

function luminance(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** WCAG 2 contrast ratio, from 1 to 21. */
export function contrastRatio(a: string, b: string) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Low contrast blocks the code; light-on-dark is allowed but flagged, since some older scanners can't read it. */
export function assessContrast(fg: string, bg: string): { level: 'ok' | 'inverted' | 'too-low'; ratio: number } {
  const ratio = contrastRatio(fg, bg);
  if (ratio < MIN_CONTRAST_RATIO) return { level: 'too-low', ratio };
  if (luminance(fg) > luminance(bg)) return { level: 'inverted', ratio };
  return { level: 'ok', ratio };
}
