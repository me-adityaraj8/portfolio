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

export function motion(lenis: Lenis | null) {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.add('motion-ready'); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  lenis?.on('scroll', ScrollTrigger.update);

  hero();
  root.classList.add('motion-ready');
  titles();
  batches();
  counters();
  bars();
}

function hero() {
  // Whole words, not letters: splitting letters drops the font's kerning and the name would rewrap.
  // No masks either, so the glow isn't clipped into boxes.
  const name = SplitText.create('.hero h1', { type: 'words' });
  gsap.timeline({ defaults: { ease: EASE } })
    .from('.hero .kicker', { y: 16, opacity: 0, duration: 0.9 })
    .from(name.words, { yPercent: 45, opacity: 0, rotateX: -60, filter: 'blur(14px)', transformOrigin: '50% 100%', transformPerspective: 900, duration: 1.5, stagger: 0.16, onComplete: () => name.revert() }, '<0.1')
    .from(['.hero .lede', '.hero .meta', '.hero .actions > *'], { y: 22, opacity: 0, duration: 1, stagger: 0.07 }, '<0.45')
    .from(['.scroll-cue', '#scroll-down'], { opacity: 0, duration: 1 }, '<0.3');
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
