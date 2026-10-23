export type Action = 'palette' | 'theme' | 'recruiter' | 'help';
export interface KeyPress { key: string; meta: boolean; ctrl: boolean; alt: boolean; typing: boolean }

const LETTERS: Record<string, Action> = { t: 'theme', v: 'recruiter', '?': 'help' };

/** Which site action a key press asks for. Single keys stay quiet while the visitor types or holds a modifier. */
export function shortcutFor(k: KeyPress): Action | null {
  if ((k.meta || k.ctrl) && k.key.toLowerCase() === 'k') return 'palette';
  if (k.meta || k.ctrl || k.alt || k.typing) return null;
  return LETTERS[k.key.toLowerCase()] ?? null;
}

/** Feed it key presses; it returns a word once that word has just been typed. */
export function wordWatcher(words: string[]) {
  const longest = Math.max(...words.map((w) => w.length));
  let typed = '';
  return (key: string): string | null => {
    if (!/^[a-z]$/i.test(key)) return null;
    typed = (typed + key.toLowerCase()).slice(-longest);
    const hit = words.find((w) => typed.endsWith(w));
    if (hit) typed = '';
    return hit ?? null;
  };
}
