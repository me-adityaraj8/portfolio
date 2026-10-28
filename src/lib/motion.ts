/**
 * GSAP motion: the hero's entrance, titles that rise in letter by letter, cards and lists
 * that arrive in a stagger, and numbers that count up when they come into view.
 * With reduced motion, none of it runs and everything is simply there.
 */
import type Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

const EASE = 'expo.out';
// Transitions in the CSS would fight GSAP every frame, so they're off while a tween runs.
const settle = { transition: 'none' };
const clear = 'transform,opacity,transition';

export function motion(lenis: Lenis | null, pulse?: (x: number, y: number, pxPerSec: number, life: number) => void) {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.add('motion-ready'); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  lenis?.on('scroll', ScrollTrigger.update);

  hero(pulse);
  root.classList.add('motion-ready');
  titles();
  batches();
  counters();
  bars();
}

/**
 * The name is revealed by a BFS wave: one diamond-shaped front spreads from the start of
 * the name, the dots ripple with it, and the letters appear exactly where it has reached.
 */
function hero(pulse?: (x: number, y: number, pxPerSec: number, life: number) => void) {
  const h1 = document.querySelector<HTMLElement>('.hero h1');
  if (!h1) return;
  const r = h1.getBoundingClientRect();
  const SPEED = 1100; // px per second, the same for the dots and the clip
  const oy = r.height * 0.5, reach = r.width + oy;
  const front = { d: 0 };
  const clip = () => { h1.style.clipPath = `polygon(0px ${oy - front.d}px, ${front.d}px ${oy}px, 0px ${oy + front.d}px, ${-front.d}px ${oy}px)`; };
  clip();
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  tl.from('.hero .kicker', { opacity: 0, duration: 0.6 })
    .call(() => pulse?.(r.left, r.top + oy, SPEED, reach / SPEED + 0.6), [], 0.2)
    .to(front, { d: reach, duration: reach / SPEED, ease: 'none', onUpdate: clip, onComplete: () => { h1.style.clipPath = ''; } }, 0.2)
    .from(['.hero .lede', '.hero .meta', '.hero .actions > *'], { y: 14, opacity: 0, duration: 0.9, stagger: 0.05 }, '>-0.25')
    .from('.hero-deck', { x: 40, opacity: 0, duration: 1.2, clearProps: 'transform,opacity' }, '<0.1')
    .from(['.scroll-cue', '#scroll-down'], { opacity: 0, duration: 0.8 }, '<0.3');
}

/** The hero's stack of live projects: the front one rotates to the back every few seconds. */
export function deck(reduced: boolean) {
  const cards = gsap.utils.toArray<HTMLElement>('.deck-card');
  const dots = gsap.utils.toArray<HTMLButtonElement>('.deck-dot');
  const count = document.getElementById('deck-count');
  if (!cards.length) return;
  let front = 0, timer = 0, paused = false;
  const place = (instant = false) => {
    cards.forEach((c, i) => {
      const rank = (i - front + cards.length) % cards.length;
      const v = rank === 0 ? { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
        : rank === 1 ? { x: -28, y: -24, scale: 0.95, rotate: -2.5, opacity: 0.5 }
        : rank === 2 ? { x: -52, y: -46, scale: 0.9, rotate: -5, opacity: 0.22 }
        : { x: -70, y: -64, scale: 0.86, rotate: -6, opacity: 0 };
      c.style.zIndex = String(cards.length - rank);
      c.inert = rank !== 0;
      if (instant || reduced) gsap.set(c, v); else gsap.to(c, { ...v, duration: 0.9, ease: EASE });
    });
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === front)));
    if (count) count.textContent = `${String(front + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  };
  const go = (i: number) => { front = (i + cards.length) % cards.length; place(); };
  const tick = () => { clearTimeout(timer); if (!reduced) timer = window.setTimeout(() => { if (!paused && !document.hidden) go(front + 1); tick(); }, 4800); };
  place(true);
  tick();
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); tick(); }));
  const wrap = document.querySelector('.hero-deck')!;
  wrap.addEventListener('pointerenter', () => { paused = true; });
  wrap.addEventListener('pointerleave', () => { paused = false; });
  wrap.addEventListener('focusin', () => { paused = true; });
  wrap.addEventListener('focusout', () => { paused = false; });
}

function titles() {
  for (const el of document.querySelectorAll<HTMLElement>('.section-title, .connect-title')) {
    const split = SplitText.create(el, { type: 'words,chars', mask: 'words' });
    gsap.from(split.chars, {
      yPercent: 110, duration: 1.1, ease: EASE, stagger: 0.022,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  }
}

/** Groups that arrive together, each item a beat after the last. */
function batches() {
  const groups: Array<[string, gsap.TweenVars]> = [
    ['#work .card', { y: 70, opacity: 0, scale: 0.97 }],
    ['.timeline > li', { x: -30, opacity: 0 }],
    ['.stack > li', { y: 18, opacity: 0, scale: 0.92 }],
    ['.courses > li', { y: 12, opacity: 0 }],
    ['.ps-totals > div, .ps-cards > *', { y: 30, opacity: 0 }],
    ['.gh-grid > *, .langs', { y: 30, opacity: 0 }],
    ['.more li', { x: -20, opacity: 0 }],
    ['.pills > li', { y: 20, opacity: 0, scale: 0.94 }],
  ];
  for (const [selector, from] of groups) {
    const items = gsap.utils.toArray<HTMLElement>(selector).filter((el) => !el.hidden);
    if (!items.length) continue;
    gsap.set(items, { ...from, ...settle });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.1, ease: EASE, stagger: 0.09, clearProps: clear }),
    });
  }
}

/** Big numbers count up from zero, keeping their format ("#5,617", "1,557"). */
function counters() {
  for (const el of document.querySelectorAll<HTMLElement>('.ps-totals dd, .contrib-stats b, .lc-solved b')) {
    const text = el.textContent ?? '';
    const m = text.match(/^(\D*)([\d,]+)(\D*)$/);
    if (!m) continue;
    const [, pre, digits, post] = m, target = Number(digits.replace(/,/g, ''));
    const v = { n: 0 };
    el.textContent = `${pre}0${post}`;
    gsap.to(v, {
      n: target, duration: 1.6, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => { el.textContent = `${pre}${Math.round(v.n).toLocaleString('en-IN')}${post}`; },
      onComplete: () => { el.textContent = text; },
    });
  }
}

/** Topic bars grow out from the left. */
function bars() {
  const spans = gsap.utils.toArray<HTMLElement>('.topic-bar span');
  if (!spans.length) return;
  gsap.from(spans, {
    scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: EASE, stagger: 0.05,
    scrollTrigger: { trigger: spans[0].closest('section') ?? spans[0], start: 'top 75%', once: true },
  });
}
