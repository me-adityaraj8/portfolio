/**
 * GSAP motion: the hero's entrance, titles that rise in letter by letter, cards and lists
 * that arrive in a stagger, and numbers that count up when they come into view.
 * With reduced motion, none of it runs and everything is simply there.
 */
import type Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { polish } from './polish';

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
  polish(matchMedia('(hover: hover) and (pointer: fine)').matches);
}

/**
 * The hero's entrance: the name's letters rise out of their own masks one after another
 * while the dots ripple out from where the name starts, then the rest of the column follows.
 */
function hero(pulse?: (x: number, y: number, pxPerSec: number, life: number) => void) {
  const h1 = document.querySelector<HTMLElement>('.hero h1');
  if (!h1) return;
  const r = h1.getBoundingClientRect();
  const split = SplitText.create(h1, { type: 'chars', mask: 'chars' });
  // The masks would crop the name's glow into boxes, so it is off until the letters have landed.
  h1.style.textShadow = 'none';
  const land = () => { split.revert(); h1.style.textShadow = ''; };
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  tl.from('.hero .kicker', { opacity: 0, duration: 0.6 })
    .call(() => pulse?.(r.left, r.top + r.height / 2, 1100, r.width / 1100 + 0.8), [], 0.15)
    .from(split.chars, { yPercent: 118, rotate: 7, duration: 1.15, stagger: 0.05, onComplete: land }, 0.15)
    .from('.hero .roller', { y: 18, opacity: 0, duration: 0.9 }, '>-0.75')
    .from(['.hero .lede', '.hero .meta', '.hero .hero-cta > *'], { y: 14, opacity: 0, duration: 0.9, stagger: 0.05 }, '<0.12')
    .from(['.scroll-cue', '#scroll-down'], { opacity: 0, duration: 0.8 }, '<0.3')
    .call(roller);
}

/** "I build ___": the words roll up through a one-line window, one every few seconds. */
function roller() {
  const words = gsap.utils.toArray<HTMLElement>('.roll-w');
  if (words.length < 2) return;
  let at = 0;
  gsap.set(words, { yPercent: (i) => (i === 0 ? 0 : 110), y: 0 });
  window.setInterval(() => {
    if (document.hidden) return;
    const next = (at + 1) % words.length;
    gsap.to(words[at], { yPercent: -110, duration: 0.7, ease: 'expo.inOut' });
    gsap.fromTo(words[next], { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' });
    words[at].setAttribute('aria-hidden', 'true');
    words[next].removeAttribute('aria-hidden');
    at = next;
  }, 2600);
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
    ['.os:not(.os--extra) > .os-repo', { y: 30, opacity: 0 }],
    ['.now-grid > *', { y: 30, opacity: 0 }],
    ['.connect-grid > *', { y: 44, opacity: 0 }],
    ['.foot-brand, .foot-nav > div, .foot-main > .wx', { y: 24, opacity: 0 }],
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
