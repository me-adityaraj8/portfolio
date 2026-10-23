import type Lenis from 'lenis';
import { shortcutFor, wordWatcher } from './keys';
import { latencyLabel, perfSummary } from './perf';
import { usesTool } from './skills';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The easter egg: the hero spells HIRE ME, and a note with my email slides up. */
export function hirer(spell: (lines: string[]) => Promise<void>) {
  const toast = $('toast'), copy = $<HTMLButtonElement>('toast-copy');
  let timer = 0;
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(copy.dataset.email!); copy.textContent = 'Copied'; } catch { copy.textContent = 'Copy failed'; }
  });
  return () => {
    scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    void spell(['HIRE', 'ME']);
    copy.textContent = 'Copy';
    clearTimeout(timer);
    setTimeout(() => { toast.hidden = false; }, 500);
    timer = window.setTimeout(() => { toast.hidden = true; }, 9000);
  };
}

/** Single-key shortcuts, a list of them on "?", and one word that does something. */
export function keyboard(lenis: Lenis | null, hire: () => void) {
  const help = $<HTMLDialogElement>('keys'), recruit = $<HTMLDialogElement>('recruit');
  const feed = wordWatcher(['hire']);
  help.addEventListener('close', () => lenis?.start());
  help.addEventListener('click', (e) => { if (e.target === help) help.close(); });
  addEventListener('keydown', (e) => {
    const el = e.target as HTMLElement;
    const typing = el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    const action = shortcutFor({ key: e.key, meta: e.metaKey, ctrl: e.ctrlKey, alt: e.altKey, typing });
    if (action === 'help') { if (help.open) help.close(); else { help.showModal(); lenis?.stop(); } }
    else if (action === 'recruiter') { if (recruit.open) recruit.close(); else $('recruit-open').click(); }
    if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && feed(e.key)) hire();
  });
}

/** Clicking a tool in the stack shows which projects use it. */
export function stackFilter(lenis: Lenis | null) {
  const chips = [...document.querySelectorAll<HTMLButtonElement>('.chip--filter')];
  const cards = [...document.querySelectorAll<HTMLElement>('#work .card')];
  const bar = $('filter-bar'), name = $('filter-name');
  let current = '';
  const apply = (tool: string) => {
    current = tool;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.tool === tool)));
    for (const c of cards) {
      const hit = usesTool((c.dataset.stack ?? '').split('|'), tool);
      c.classList.toggle('is-dim', !!tool && !hit);
      c.classList.toggle('is-match', !!tool && hit);
    }
    name.textContent = tool;
    bar.hidden = !tool;
  };
  for (const c of chips) {
    c.addEventListener('click', () => {
      const tool = current === c.dataset.tool ? '' : c.dataset.tool!;
      apply(tool);
      if (!tool) return;
      const work = $('work');
      if (lenis) lenis.scrollTo(work, { offset: -72 });
      else work.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    });
  }
  $('filter-clear').addEventListener('click', () => {
    const was = chips.find((c) => c.dataset.tool === current);
    apply('');
    was?.focus({ preventScroll: true });
  });
}

/** Pings each live demo as its card comes into view, and shows how fast it answered. */
export function health() {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      io.unobserve(en.target);
      const pill = en.target as HTMLElement;
      const t0 = performance.now();
      fetch(pill.dataset.ping!, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(10_000) })
        .then(() => performance.now() - t0, () => null)
        .then((ms) => {
          const l = latencyLabel(ms);
          pill.dataset.state = l.state;
          pill.querySelector('em')!.textContent = l.text;
          pill.title = ms === null ? "It didn't answer from your browser just now" : 'Round trip from your browser, measured just now';
        });
    }
  }, { rootMargin: '200px' });
  document.querySelectorAll('.live-pill[data-ping]').forEach((p) => io.observe(p));
}

/** What this page cost to load, measured in the visitor's own browser. */
export function perf() {
  const el = $('perf');
  const show = () => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const s = perfSummary(nav, performance.getEntriesByType('resource') as PerformanceResourceTiming[]);
    if (!s) return;
    el.textContent = `${s.kb} kB · ready in ${s.ms} ms${s.cached ? ' (cached)' : ''}`;
    el.title = "Measured in your browser just now with the Performance API: this page's own files, and the time until it was interactive.";
    el.hidden = false;
  };
  if (document.readyState === 'complete') setTimeout(show, 0);
  else addEventListener('load', () => setTimeout(show, 0), { once: true });
}
