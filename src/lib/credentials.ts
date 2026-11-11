/** Repeats a label round a badge's ring, as many whole times as fit in `len` characters (at least once). */
export function ringText(label: string, len: number): string {
  const unit = `${label} · `;
  return unit.repeat(Math.max(1, Math.floor(len / unit.length)));
}
