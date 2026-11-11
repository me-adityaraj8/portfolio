/**
 * The hero's ID badge. It hangs from a lanyard pinned to the top of the hero, swings in when
 * the page opens, can be dragged and thrown, tilts under the pointer and flips over on a
 * click to show the numbers. With reduced motion it simply hangs there and still flips.
 */
import type Lenis from 'lenis';
import { atRest, hangAngle, restY, stepBob, type Bob } from './swing';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function badge(lenis: Lenis | null, reduced: boolean, pulse?: (x: number, y: number, pxPerSec: number, life: number) => void) {
  const wrap = document.getElementById('badge');
  const hang = document.getElementById('badge-hang');
  const tilt = document.getElementById('badge-tilt');
  const card = document.getElementById('badge-card');
  const left = document.getElementById('strap-l');
  const right = document.getElementById('strap-r');
  if (!wrap || !hang || !tilt || !card || !left || !right) return;

  const SPREAD = 56; // how far apart the two straps are pinned
  let ax = 0, len = 220, scale = 1;
  let bob: Bob = { x: 0, y: restY(len), vx: 0, vy: 0 };
  let rot = 0, held = false, running = false, visible = true, last = 0, moved = 0, lastKick = 0;
  let grab = { dx: 0, dy: 0 };

  const shown = () => wrap.offsetParent !== null;
  const layout = () => {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    ax = w / 2;
    // Beside the name on a wide screen; above it, shorter and smaller, on a narrow one.
    const wide = matchMedia('(min-width: 1100px)').matches;
    len = wide ? clamp(h * 0.3, 150, 270) : clamp(h * 0.26, 84, 130);
    scale = clamp((h - len - (wide ? 104 : 14)) / 434, 0.5, 1);
  };
  const render = () => {
    const px = ax + bob.x, py = bob.y;
    hang.style.transform = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    // A slack strap sags; a tight one is straight.
    const sag = Math.max(0, len - Math.hypot(bob.x, bob.y)) * 0.6;
    const strap = (from: number) => `M ${from} -8 Q ${(from + px) / 2} ${py / 2 + sag} ${px} ${py + 6}`;
    left.setAttribute('d', strap(ax - SPREAD));
    right.setAttribute('d', strap(ax + SPREAD));
  };
  const frame = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    if (!held) bob = stepBob(bob, len, dt);
    const want = clamp(hangAngle(bob) - bob.vx * 0.004, -70, 70);
    rot += (want - rot) * Math.min(1, dt * 14);
    render();
    if (!visible || (!held && atRest(bob, len) && Math.abs(rot) < 0.05)) { running = false; return; }
    requestAnimationFrame(frame);
  };
  const wake = () => {
    if (running || reduced || !shown()) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };
  const settle = () => { bob = { x: 0, y: restY(len), vx: 0, vy: 0 }; rot = 0; render(); };

  const flip = () => {
    const back = card.getAttribute('aria-pressed') !== 'true';
    card.setAttribute('aria-pressed', String(back));
    wrap.classList.add('used');
    bob.vx += back ? 260 : -260;
    wake();
  };
  card.addEventListener('click', () => { if (moved < 6) flip(); moved = 0; });

  card.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || reduced) return;
    const r = wrap.getBoundingClientRect();
    grab = { dx: e.clientX - r.left - ax - bob.x, dy: e.clientY - r.top - bob.y };
    held = true; moved = 0;
    card.setPointerCapture(e.pointerId);
    card.classList.add('grabbing');
    tilt.style.transform = '';
    wake();
  });
  card.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    if (held) {
      let x = e.clientX - r.left - ax - grab.dx, y = Math.max(24, e.clientY - r.top - grab.dy);
      const d = Math.hypot(x, y), max = len * 1.25;
      if (d > max) { x *= max / d; y *= max / d; }
      const dt = Math.max(0.008, (performance.now() - lastKick) / 1000);
      lastKick = performance.now();
      moved += Math.hypot(x - bob.x, y - bob.y);
      bob = { x, y, vx: clamp((x - bob.x) / dt, -3000, 3000) * 0.6 + bob.vx * 0.4, vy: clamp((y - bob.y) / dt, -3000, 3000) * 0.6 + bob.vy * 0.4 };
      if (moved > 6) wrap.classList.add('used');
      return;
    }
    if (reduced || e.pointerType !== 'mouse') return;
    const c = card.getBoundingClientRect();
    const u = clamp((e.clientX - c.left) / c.width, 0, 1), v = clamp((e.clientY - c.top) / c.height, 0, 1);
    tilt.style.transform = `rotateX(${((0.5 - v) * 14).toFixed(2)}deg) rotateY(${((u - 0.5) * 18).toFixed(2)}deg)`;
    card.style.setProperty('--mx', (u * 100).toFixed(1));
    card.style.setProperty('--my', (v * 100).toFixed(1));
  });
  const release = () => {
    if (!held) return;
    held = false;
    card.classList.remove('grabbing');
    wake();
  };
  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);
  card.addEventListener('pointerleave', () => { if (!held) tilt.style.transform = ''; });

  // Scrolling gives it a nudge, and so does a long quiet spell.
  lenis?.on('scroll', (l: Lenis) => {
    if (held || !visible || Math.abs(l.velocity) < 4) return;
    bob.vx += clamp(l.velocity, -40, 40) * 2.2;
    wake();
  });
  if (!reduced) window.setInterval(() => {
    if (running || held || !visible || document.hidden || !shown()) return;
    bob.vx += (Math.random() < 0.5 ? -1 : 1) * 120;
    wake();
  }, 7000);

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); }).observe(wrap);
  addEventListener('resize', () => { layout(); if (reduced || !running) settle(); wake(); });

  layout();
  if (reduced || !shown()) { settle(); wrap.classList.add('on'); return; }
  // Let go from up on the left, so it swings into place.
  bob = { x: -len * 0.9, y: len * 0.25, vx: 0, vy: 0 };
  rot = hangAngle(bob);
  render();
  window.setTimeout(() => {
    wrap.classList.add('on');
    const r = wrap.getBoundingClientRect();
    pulse?.(r.left + ax, r.top + len, 900, 1.5);
    wake();
  }, 650);
}
