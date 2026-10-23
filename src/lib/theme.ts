import { shortcutFor } from './keys';

/**
 * Light and dark. The new theme spreads out in a circle from the button, using the
 * View Transitions API where the browser has it, and switches instantly where it doesn't.
 */
export function themeToggle() {
  const btn = document.getElementById('theme');
  if (!btn) return;
  const root = document.documentElement;
  const apply = (t: string) => {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch { /* storage blocked */ }
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  btn.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  addEventListener('keydown', (e) => {
    const el = e.target as HTMLElement;
    const typing = el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    if (shortcutFor({ key: e.key, meta: e.metaKey, ctrl: e.ctrlKey, alt: e.altKey, typing }) === 'theme') btn.click();
  });
  btn.addEventListener('click', (e) => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vt = (document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }).startViewTransition;
    if (!vt || reduced) return apply(next);
    const x = e.clientX || innerWidth - 40, y = e.clientY || 32;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = vt.call(document, () => apply(next));
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  });
}
