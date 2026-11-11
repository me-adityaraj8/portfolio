/**
 * The second layer of motion, on top of motion.ts: the hero drifts away as you scroll,
 * paragraphs rise in line by line, project previews wipe open, the open source log pops in,
 * and buttons lean towards the pointer. Also the entrance for the /work pages.
 * None of it runs with reduced motion.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

const EASE = 'expo.out';

export function polish(fine: boolean) {
  heroScroll();
  previews();
  openSource();
  if (fine) magnetic();
  // Line breaks are only right once the fonts are in.
  void document.fonts.ready.then(() => lines('.os-sum, .now .lede, .now-text, .dm-head p'));
}

/** Scrolling away from the hero: the text lifts and fades, the badge sinks, the dots dim. */
function heroScroll() {
  const at = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero-inner', { yPercent: -14, opacity: 0.1, ease: 'none', scrollTrigger: at });
  gsap.to('#badge', { y: 110, ease: 'none', scrollTrigger: at });
  gsap.to('#field', { opacity: 0.25, ease: 'none', scrollTrigger: at });
}

/** Paragraphs arrive a line at a time, each rising out of its own mask. */
function lines(selector: string) {
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    if (el.closest('[hidden]')) continue;
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, ease: EASE, stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onComplete: () => split.revert(),
    });
  }
}

/** A project's screenshot wipes open from the top while it settles back from a slight zoom. */
function previews() {
  for (const box of document.querySelectorAll<HTMLElement>('#work .preview')) {
    const at = { trigger: box, start: 'top 90%', once: true };
    gsap.fromTo(box, { clipPath: 'inset(0% 0% 100% 0% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1.4, ease: EASE, scrollTrigger: at, clearProps: 'clipPath' });
    const img = box.querySelector('img');
    if (img) gsap.from(img, { scale: 1.14, yPercent: 8, duration: 1.6, ease: EASE, scrollTrigger: at, clearProps: 'transform' });
  }
}

/** Open source: each repository's badges pop and its diff squares fill in one by one. */
function openSource() {
  for (const repo of document.querySelectorAll<HTMLElement>('.os:not(.os--extra) > .os-repo')) {
    const at = { trigger: repo, start: 'top 88%', once: true };
    gsap.from(repo.querySelectorAll('.os-state'), { scale: 0.5, opacity: 0, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.12, scrollTrigger: at, clearProps: 'transform,opacity' });
    gsap.from(repo.querySelectorAll('.os-bar i'), { scale: 0, duration: 0.5, ease: 'back.out(3)', stagger: 0.045, delay: 0.25, scrollTrigger: at, clearProps: 'transform' });
    gsap.from(repo.querySelectorAll('.os-title'), { x: -18, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.1, scrollTrigger: at, clearProps: 'transform,opacity' });
  }
}

/** Buttons lean towards the pointer and spring back when it leaves. */
function magnetic() {
  for (const el of document.querySelectorAll<HTMLElement>('.hero .cta, .glow-btn, .os-toggle, .dm-send')) {
    const toX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const toY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      toX((e.clientX - (r.left + r.width / 2)) * 0.28);
      toY((e.clientY - (r.top + r.height / 2)) * 0.36);
    });
    el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' }); });
  }
}

/** /work and each case study: the title rises letter by letter and the rest follows down the page. */
export function subpage() {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.add('motion-ready'); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const h1 = document.querySelector<HTMLElement>('main h1');
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  tl.from('main .kicker', { opacity: 0, y: 10, duration: 0.7 });
  if (h1) {
    const split = SplitText.create(h1, { type: 'chars', mask: 'chars' });
    tl.from(split.chars, { yPercent: 115, rotate: 6, duration: 1.1, stagger: 0.035, onComplete: () => split.revert() }, 0.1);
  }
  tl.from('main .lede', { y: 18, opacity: 0, duration: 0.9 }, '>-0.7')
    .from('.case-meta > div', { y: 16, opacity: 0, duration: 0.8, stagger: 0.08 }, '<0.15');
  root.classList.add('motion-ready');

  const groups: Array<[string, gsap.TweenVars]> = [
    ['.case > .facts li', { x: -18, opacity: 0 }],
    ['.case .diagram, .case figure', { y: 30, opacity: 0, scale: 0.98 }],
    ['.prose > *', { y: 22, opacity: 0 }],
    ['.index-table tbody tr', { y: 20, opacity: 0 }],
    ['main .back', { opacity: 0 }],
  ];
  for (const [selector, from] of groups) {
    const items = gsap.utils.toArray<HTMLElement>(selector);
    if (!items.length) continue;
    gsap.set(items, from);
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: (batch) => gsap.to(batch, { x: 0, y: 0, scale: 1, opacity: 1, duration: 1, ease: EASE, stagger: 0.07, clearProps: 'transform,opacity' }),
    });
  }
}
