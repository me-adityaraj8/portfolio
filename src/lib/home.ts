import Lenis from 'lenis';
import QRCode from 'qrcode';
import { assessContrast, MIN_CONTRAST_RATIO } from '../demos/contrast';
import { describeWeather, ripple, type WeatherIcon } from './atmosphere';
import { ago, bestMatch, onRepeat, parseRecent, type Played } from './music';
import { rank } from './palette';
import { beat, listen, onBeat } from './beat';
import { building, contest, growFrom, guestbook, liveStats, recruiter } from './extras';
import { backToTop, glow, health, hirer, keyboard, perf, stackFilter, toMessage } from './more';
import { deck, motion } from './motion';
import { dm } from './dm';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function start() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) document.documentElement.classList.add('fine');
  const lenis = reduced ? null : new Lenis({ lerp: 0.09, anchors: true });
  const raf = (t: number) => { lenis?.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  const { spell, pulse } = field(reduced, fine);
  const hire = hirer(spell);
  if (fine) { cursor(); spotlights(); }
  scrollEffects();
  motion(lenis, pulse);
  deck(reduced);
  palette(lenis, [
    { label: 'Keyboard shortcuts', group: 'Help', run: () => $<HTMLDialogElement>('keys').showModal() },
    { label: 'Hire Aditya', group: 'Links', run: hire },
    { label: 'Send a message', group: 'Links', run: () => toMessage(lenis) },
  ]);
  recruiter(lenis);
  keyboard(lenis, hire);
  stackFilter(lenis);
  health();
  perf();
  backToTop(lenis);
  glow();
  const b = document.getElementById('building')!;
  building(b.dataset.owner!, (b.dataset.hidden ?? '').split(',').filter(Boolean));
  contest();
  liveStats();
  guestbook();
  demos(lenis);
  lastPlayed();
  connect();
  dm();
  // Links like "Say hi" on other pages land here and open the message form.
  if (location.hash === '#message') {
    history.replaceState(null, '', location.pathname + location.search);
    setTimeout(() => toMessage(lenis), 400);
  }
}

/** The hero: a dense dot grid in shifting colour, where the pointer sends out BFS waves. */
function field(reduced: boolean, fine: boolean) {
  const canvas = $<HTMLCanvasElement>('field');
  const ctx = canvas.getContext('2d')!;
  const S = 13;
  // Pink, violet, indigo, cyan: each dot takes its colour from where it sits.
  const palette = [[244, 114, 182], [192, 132, 252], [129, 140, 248], [56, 189, 248], [45, 212, 191]];
  const BANDS = 12;
  const bandColour = Array.from({ length: BANDS }, (_, b) => {
    const t = (b / (BANDS - 1)) * (palette.length - 1), i = Math.min(palette.length - 2, Math.floor(t)), f = t - i;
    return palette[i].map((c, k) => Math.round(c + (palette[i + 1][k] - c) * f));
  });
  let w = 0, h = 0, dpr = 1, cols = 0, rows = 0;
  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    cols = Math.ceil(w / S); rows = Math.ceil(h / S);
  };
  size();
  addEventListener('resize', size);
  type Wave = { x: number; y: number; t0: number; speed: number; life: number; width: number; k: number };
  const waves: Wave[] = [];
  const add = (x: number, y: number, o: Partial<Wave> = {}) => {
    waves.push({ x, y, t0: performance.now(), speed: 26, life: 1.5, width: 2.6, k: 0.95, ...o });
    if (waves.length > 10) waves.shift();
  };
  const cellOf = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return [Math.floor((e.clientX - r.left) / S), Math.floor((e.clientY - r.top) / S)];
  };
  let last = '', lastAt = 0;
  canvas.parentElement!.addEventListener('pointermove', (e) => {
    const [x, y] = cellOf(e), key = `${x},${y}`;
    if (key !== last && performance.now() - lastAt > 90) { last = key; lastAt = performance.now(); add(x, y); }
  });
  canvas.parentElement!.addEventListener('pointerdown', (e) => {
    const [x, y] = cellOf(e);
    add(x, y, { speed: 40, life: 2.6, width: 4, k: 1.4 });
  });
  // A word spelled in the dots. It spreads out from its first letter like the other waves,
  // holds for a few seconds, then fades.
  const HOLD = 6;
  let msg: { mask: Uint8Array; cols: number; ox: number; oy: number; t0: number } | null = null;
  const spell = async (lines: string[]) => {
    await document.fonts.load('700 40px Unbounded').catch(() => undefined);
    const off = document.createElement('canvas');
    off.width = cols; off.height = rows;
    const o = off.getContext('2d', { willReadFrequently: true })!;
    const wide = cols >= 70;
    // Right of the name on wide screens; in the empty space above it on phones.
    const areaW = cols * (wide ? 0.4 : 0.86), left = cols * (wide ? 0.56 : 0.07);
    o.font = '700 100px Unbounded, sans-serif';
    const widest = Math.max(...lines.map((t) => o.measureText(t).width));
    const fs = Math.min((100 * areaW) / widest, (rows * (wide ? 0.7 : 0.3)) / (lines.length * 1.1));
    o.font = `700 ${fs}px Unbounded, sans-serif`;
    o.textBaseline = 'middle';
    o.fillStyle = '#fff';
    const lh = fs * 1.1, top = rows * (wide ? 0.5 : 0.24) - (lh * (lines.length - 1)) / 2;
    lines.forEach((t, i) => o.fillText(t, left, top + i * lh));
    const px = o.getImageData(0, 0, cols, rows).data;
    const mask = new Uint8Array(cols * rows);
    for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4 + 3] > 110 ? 1 : 0;
    const now = performance.now();
    msg = { mask, cols, ox: Math.round(left), oy: Math.round(top - lh / 2), t0: reduced ? now - 3000 : now };
    add(msg.ox, msg.oy, { speed: 40, life: 2.6, width: 4, k: 1.4 });
    if (reduced) { requestAnimationFrame(draw); setTimeout(() => requestAnimationFrame(draw), (HOLD - 3) * 1000 + 50); }
  };
  let idle = 0;
  // When the song preview plays, every kick sends a wave from somewhere new.
  onBeat((strength) => {
    if (reduced) return;
    add(Math.floor(cols * (0.4 + Math.random() * 0.55)), Math.floor(rows * (0.15 + Math.random() * 0.7)), { speed: 34, life: 1.6, width: 3.2, k: 0.8 + strength * 0.7 });
  });
  const draw = (now: number) => {
    // The field keeps breathing on its own, on phones and when the pointer is still.
    if (!reduced && now - idle > (fine ? 2400 : 1600)) {
      idle = now;
      add(Math.floor(cols * (0.45 + Math.random() * 0.5)), Math.floor(rows * Math.random()), { speed: 20, life: 2.4, width: 3, k: 0.7 });
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const live = waves.filter((v) => (now - v.t0) / 1000 < v.life);
    const buckets = new Map<number, number[]>();
    const t = now / 4000;
    const age = msg ? (now - msg.t0) / 1000 : 0;
    if (msg && (age > HOLD || msg.cols !== cols)) msg = null;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let I = 0;
        for (const v of live) {
          const dx = x - v.x, dy = y - v.y;
          if (Math.abs(dx) + Math.abs(dy) > v.speed * v.life + v.width) continue;
          I = Math.max(I, ripple(dx, dy, (now - v.t0) / 1000, v) * v.k);
        }
        let lit = 0;
        if (msg && msg.mask[y * cols + x]) {
          const d = Math.abs(x - msg.ox) + Math.abs(y - msg.oy);
          lit = Math.min(1, Math.max(0, (age * 45 - d) / 4)) * Math.min(1, Math.max(0, (HOLD - age) / 0.8));
          I = Math.max(I, lit * 1.05);
        }
        // Brighter toward the right, so the grid never fights the name on the left.
        // Waves still show on the dim side, so the opening sweep across the name is visible.
        const side = lit > 0 ? 1 : Math.max(Math.min(1, I) * 0.85, Math.min(1, Math.max(0.18, (x / cols - 0.1) * 1.5)));
        const b = Math.round(Math.min(1, (0.24 + beat.level * 0.35 + 0.9 * Math.min(1, I)) * side) * 10);
        if (!b) continue;
        const hue = (x / cols) * 0.75 + (y / rows) * 0.25 + Math.sin(t + x * 0.05 + y * 0.04) * 0.18 + I * 0.25;
        const band = Math.max(0, Math.min(BANDS - 1, Math.round(hue * (BANDS - 1))));
        const big = lit > 0.5 ? 2 : I > 0.35 ? 1 : 0;
        const key = (band * 11 + b) * 3 + big;
        let arr = buckets.get(key);
        if (!arr) buckets.set(key, (arr = []));
        arr.push((x + 0.5) * S * dpr, (y + 0.5) * S * dpr);
      }
    }
    for (const [key, pts] of buckets) {
      const big = key % 3, b = Math.floor(key / 3) % 11, band = Math.floor(Math.floor(key / 3) / 11);
      const [r, g, bl] = bandColour[band];
      ctx.fillStyle = `rgb(${r} ${g} ${bl} / ${b / 10})`;
      const ds = [1.8, 3.2, 5.6][big] * dpr;
      for (let i = 0; i < pts.length; i += 2) ctx.fillRect(pts[i] - ds / 2, pts[i + 1] - ds / 2, ds, ds);
    }
    if (!reduced) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  /** One strong wave from a point on screen, moving `pxPerSec` pixels a second. */
  const pulse = (clientX: number, clientY: number, pxPerSec: number, life: number) => {
    const r = canvas.getBoundingClientRect();
    add(Math.floor((clientX - r.left) / S), Math.floor((clientY - r.top) / S), { speed: pxPerSec / S, life, width: 4, k: 1.5 });
  };
  return { spell, pulse };
}

/**
 * The cursor: a small ring that follows the pointer, and on anything clickable stretches
 * smoothly into that element's border, rounded corners and all. Small controls also lean
 * a little toward the pointer.
 */
const TARGETS = 'a, button, .chip, .topic, .tl-org, [data-cursor]';
function cursor() {
  const el = $('cursor'), ring = el.querySelector<HTMLElement>('.cursor-ring')!, label = el.querySelector<HTMLElement>('.cursor-label')!;
  const dot = el.querySelector<HTMLElement>('.cursor-dot')!;
  const p = { x: -100, y: -100 };
  const r = { x: -100, y: -100, w: 32, h: 32, rad: 16 };
  let target: HTMLElement | null = null;
  let magnet: HTMLElement | null = null;

  addEventListener('pointermove', (e) => { p.x = e.clientX; p.y = e.clientY; el.classList.add('on'); });
  document.addEventListener('pointerleave', () => el.classList.remove('on'));
  document.addEventListener('pointerover', (e) => {
    const t = (e.target as Element).closest<HTMLElement>(TARGETS);
    if (t === target) return;
    if (magnet) { magnet.style.transform = ''; magnet = null; }
    target = t && !t.closest('dialog') ? t : null;
    const card = target?.classList.contains('card-hit');
    label.textContent = card ? (target!.dataset.demo ? 'Try it' : 'Read') : '';
    el.classList.toggle('wrap', !!target && !card);
    el.classList.toggle('big', !!card);
    // Only small controls lean toward the pointer; cards and long rows stay put.
    if (target && !card) {
      const b = target.getBoundingClientRect();
      if (b.width < 260 && b.height < 80) magnet = target;
    }
  });

  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const tick = () => {
    if (target && el.classList.contains('wrap')) {
      const b = target.getBoundingClientRect();
      const pad = 6;
      const radius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 8;
      const tx = b.left + b.width / 2, ty = b.top + b.height / 2;
      r.x = lerp(r.x, tx, 0.22); r.y = lerp(r.y, ty, 0.22);
      r.w = lerp(r.w, b.width + pad * 2, 0.22); r.h = lerp(r.h, b.height + pad * 2, 0.22);
      r.rad = lerp(r.rad, Math.min(radius + pad, (b.height + pad * 2) / 2), 0.22);
      if (magnet) {
        const mx = (p.x - tx) * 0.18, my = (p.y - ty) * 0.25;
        magnet.style.transform = `translate(${mx}px, ${my}px)`;
      }
    } else {
      const size = el.classList.contains('big') ? 84 : 32;
      r.x = lerp(r.x, p.x, 0.25); r.y = lerp(r.y, p.y, 0.25);
      r.w = lerp(r.w, size, 0.2); r.h = lerp(r.h, size, 0.2); r.rad = lerp(r.rad, size / 2, 0.2);
    }
    ring.style.transform = `translate(${r.x - r.w / 2}px, ${r.y - r.h / 2}px)`;
    ring.style.width = `${r.w}px`;
    ring.style.height = `${r.h}px`;
    ring.style.borderRadius = `${r.rad}px`;
    label.style.transform = `translate(${r.x}px, ${r.y}px)`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
    requestAnimationFrame(tick);
  };
  tick();
}

/** Cards catch a soft light where the pointer is, and tilt toward it a touch. */
function spotlights() {
  document.querySelectorAll<HTMLElement>('.spot').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const b = card.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 4}deg) rotateY(${(x - 0.5) * 5}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/** Sections rise into place as you reach them; the header shows how far down you are and where. */
function scrollEffects() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((s) => io.observe(s));

  const bar = $('progress'), down = $('scroll-down');
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.masthead [data-section]')];
  const sections = links.map((l) => document.getElementById(l.dataset.section!)).filter(Boolean) as HTMLElement[];
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    down.classList.toggle('gone', scrollY > 80);
    let current = '';
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s.id;
    links.forEach((l) => l.classList.toggle('active', l.dataset.section === current));
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

/** ⌘K: jump to any section or project, or open a link, from one search box. */
type Item = { label: string; group: string; run: () => void };
function palette(lenis: Lenis | null, extra: Item[]) {
  const dialog = $<HTMLDialogElement>('palette'), input = $<HTMLInputElement>('palette-input'), list = $('palette-list'), status = $('palette-status');
  const go = (id: string) => () => { const t = document.getElementById(id); if (t) { if (lenis) lenis.scrollTo(t, { offset: -72 }); else t.scrollIntoView({ behavior: 'smooth' }); } };
  const open = (url: string) => () => window.open(url, '_blank', 'noopener');
  const linkOf = (sel: string) => document.querySelector<HTMLAnchorElement>(sel)?.href ?? '';
  const items: Item[] = [
    ...[['work', 'Proof of work'], ['experience', 'Experience'], ['education', 'Education'], ['stack', 'Stack'], ['problem-solving', 'Problem solving'], ['now', 'Now'], ['contact', 'Contact']]
      .map(([id, name]) => ({ label: `Go to ${name}`, group: 'Sections', run: go(id) })),
    ...[...document.querySelectorAll<HTMLAnchorElement>('.card-hit')].map((c) => ({ label: `Open ${c.dataset.title}`, group: 'Projects', run: () => c.click() })),
    { label: 'Copy email address', group: 'Links', run: async () => { const a = document.querySelector<HTMLAnchorElement>('[data-copy]'); if (a) await navigator.clipboard.writeText(a.dataset.copy!).catch(() => {}); } },
    { label: 'Open resume', group: 'Links', run: open(linkOf('.pill[href="/resume.pdf"]')) },
    { label: 'Open GitHub', group: 'Links', run: open(linkOf('.pill[href*="github.com"]')) },
    { label: 'Open LinkedIn', group: 'Links', run: open(linkOf('.pill[href*="linkedin.com"]')) },
    { label: 'Open Codolio profile', group: 'Links', run: open(linkOf('.ps-link')) },
    ...extra,
  ];
  let shown: Item[] = items, sel = 0;
  const render = () => {
    shown = rank(items, input.value);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length
      ? shown.map((it, i) => `<li role="option" aria-selected="${i === sel}" data-i="${i}"><span>${esc(it.label)}</span><em>${it.group}</em></li>`).join('')
      : '<li class="empty">Nothing matches that.</li>';
    status.textContent = shown.length ? `${shown.length} result${shown.length === 1 ? '' : 's'}` : 'No results';
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  };
  const show = () => { input.value = ''; sel = 0; render(); dialog.showModal(); input.focus(); lenis?.stop(); };
  const hide = () => { dialog.close(); lenis?.start(); };
  const runSel = () => { const it = shown[sel]; if (!it) return; hide(); setTimeout(it.run, 60); };
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dialog.open ? hide() : show(); }
  });
  $('palette-open').addEventListener('click', show);
  input.addEventListener('input', () => { sel = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); runSel(); }
  });
  list.addEventListener('click', (e) => { const li = (e.target as Element).closest<HTMLElement>('[data-i]'); if (li) { sel = Number(li.dataset.i); runSel(); } });
  list.addEventListener('pointermove', (e) => { const li = (e.target as Element).closest<HTMLElement>('[data-i]'); if (li && Number(li.dataset.i) !== sel) { sel = Number(li.dataset.i); render(); } });
  dialog.addEventListener('close', () => lenis?.start());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) hide(); });
}

/** Clicking a card opens it live: the real deployed app, or the core idea running in the page. */
function demos(lenis: Lenis | null) {
  const dialog = $<HTMLDialogElement>('demo');
  const body = $('demo-body'), title = $('demo-title');
  const caseLink = $<HTMLAnchorElement>('demo-case'), newTab = $<HTMLAnchorElement>('demo-newtab');

  const open = async (hit: HTMLAnchorElement, push: boolean) => {
    const { open: slug, demo, live, title: name } = hit.dataset as Record<string, string>;
    title.textContent = name;
    caseLink.href = `/work/${slug}`;
    newTab.hidden = !live;
    if (live) newTab.href = live;
    body.replaceChildren();
    if (demo === 'site' && live) site(body, live);
    else if (demo === 'qr') await qr(body);
    else await caseStudy(body, `/work/${slug}`);
    caseLink.hidden = !demo;
    if (push) history.pushState({ demo: slug }, '', `#${slug}`);
    if (!dialog.open) { dialog.showModal(); opener = hit.closest('.card, .deck-card'); void growFrom(dialog, opener); }
    body.focus({ preventScroll: true });
    lenis?.stop();
  };
  let opener: Element | null = null;
  const close = async () => {
    if (!dialog.open) return;
    await growFrom(dialog, opener, true);
    dialog.close();
    body.replaceChildren(); // stops any embedded app, camera or audio
    lenis?.start();
  };

  document.addEventListener('click', (e) => {
    const hit = (e.target as Element).closest<HTMLAnchorElement>('.card-hit, .deck-hit');
    if (!hit || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    open(hit, true);
  });
  caseLink.addEventListener('click', async (e) => {
    e.preventDefault();
    caseLink.hidden = true;
    body.replaceChildren();
    await caseStudy(body, caseLink.getAttribute('href')!);
  });
  $('demo-close').addEventListener('click', () => history.back());
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); history.back(); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) history.back(); });
  addEventListener('popstate', () => {
    const hit = location.hash && document.querySelector<HTMLAnchorElement>(`.card-hit[data-open="${CSS.escape(location.hash.slice(1))}"]`);
    if (hit) open(hit, false); else close();
  });
  // A shared link straight to a project opens it.
  const direct = location.hash && document.querySelector<HTMLAnchorElement>(`.card-hit[data-open="${CSS.escape(location.hash.slice(1))}"]`);
  if (direct) {
    // Put the plain page underneath, so closing the demo lands on the site rather than leaving it.
    history.replaceState(null, '', location.pathname);
    history.pushState({}, '', `#${direct.dataset.open}`);
    open(direct, false);
  }
}

function site(body: HTMLElement, url: string) {
  const host = new URL(url).host;
  body.innerHTML = `<div class="browser"><div class="browser-bar"><span></span><span></span><span></span><p>${esc(host)}</p></div>
    <iframe src="${esc(url)}" title="${esc(host)}, live" allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen" referrerpolicy="no-referrer"></iframe></div>
    <p class="demo-note">This is the real deployed app, running inside the page. If something needs a sign-in, open it in a new tab.</p>`;
}

async function caseStudy(body: HTMLElement, href: string) {
  try {
    const html = await (await fetch(href)).text();
    const article = new DOMParser().parseFromString(html, 'text/html').querySelector('article.case');
    if (!article) throw new Error('missing');
    article.querySelector('.back')?.remove();
    body.replaceChildren(article);
  } catch {
    location.href = href;
  }
}

/** QRGen's generator, live, with the same library and the same contrast rule. */
async function qr(body: HTMLElement) {
  body.innerHTML = `<div class="qrdemo">
    <div class="qr-controls">
      <label>Text or link<textarea id="qr-text" rows="3">https://github.com/me-adityaraj8</textarea></label>
      <div class="qr-colors"><label>Code<input type="color" id="qr-fg" value="#1d1b2f"></label><label>Background<input type="color" id="qr-bg" value="#ffffff"></label></div>
      <p class="qr-msg" id="qr-msg" role="status"></p>
    </div>
    <div class="qr-out" id="qr-out"></div></div>
    <p class="demo-note">Built with qrcode, the library QRGen uses, and QRGen's rule: below ${MIN_CONTRAST_RATIO}:1 contrast the code is blocked.</p>`;
  const text = $<HTMLTextAreaElement>('qr-text'), fg = $<HTMLInputElement>('qr-fg'), bg = $<HTMLInputElement>('qr-bg');
  const out = $('qr-out'), msg = $('qr-msg');
  const render = async () => {
    const c = assessContrast(fg.value, bg.value);
    const value = text.value.trim() || ' ';
    try {
      out.innerHTML = await QRCode.toString(value, { type: 'svg', margin: 2, color: { dark: fg.value, light: bg.value } });
    } catch {
      out.innerHTML = '';
      msg.textContent = 'That is too long for one QR code.';
      return;
    }
    out.classList.toggle('blocked', c.level === 'too-low');
    msg.className = `qr-msg ${c.level}`;
    msg.textContent = c.level === 'too-low'
      ? `Contrast is ${c.ratio.toFixed(1)}:1. Use at least ${MIN_CONTRAST_RATIO}:1 so scanners can read the code.`
      : c.level === 'inverted' ? `Contrast ${c.ratio.toFixed(1)}:1. Light on dark works, but some older scanners can't read it.` : `Contrast ${c.ratio.toFixed(1)}:1. Scans fine.`;
  };
  [text, fg, bg].forEach((el) => el.addEventListener('input', render));
  await render();
}

/** "Last played": from Last.fm, with artwork and a 30-second preview from Apple's public search. */
async function lastPlayed() {
  const card = $('played');
  const { user, key } = card.dataset;
  let played: Played | null = null;
  try {
    if (user && key) {
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(key)}&format=json&limit=1`;
      played = parseRecent(await (await fetch(url)).json());
    } else {
      // No Last.fm yet: rotate through the hand-picked list, a new song every 6 hours.
      const pick = onRepeat<{ title: string; artist: string }>(JSON.parse(card.dataset.songs ?? '[]'), Date.now(), 6);
      if (pick) played = { ...pick, art: '', playing: false, at: null, url: '' };
    }
  } catch { /* leave the card hidden */ }
  if (!played) return;

  let preview = '';
  try {
    const q = encodeURIComponent(`${played.title} ${played.artist}`);
    const results = (await (await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=15`)).json()).results ?? [];
    const hit = bestMatch(results, played.title, played.artist);
    if (hit) { preview = hit.previewUrl ?? ''; if (!played.art) played.art = (hit.artworkUrl100 ?? '').replace('100x100', '300x300'); }
  } catch { /* no artwork or preview */ }

  $('played-title').textContent = played.title;
  $('played-artist').textContent = played.artist;
  $('played-when').textContent = (played.playing ? 'Playing now' : `Last played${played.at ? ' · ' + ago(Date.now() - played.at) : ''}`);
  const art = $<HTMLImageElement>('played-art');
  if (played.art) art.src = played.art; else art.hidden = true;
  card.hidden = false;

  if (!preview) return;
  const btn = $<HTMLButtonElement>('played-btn'), ring = $('played-ring'), glyph = $('played-glyph');
  const audio = new Audio();
  audio.preload = 'none';
  listen(audio);
  audio.src = preview;
  const C = 2 * Math.PI * 20;
  ring.setAttribute('stroke-dasharray', String(C));
  ring.setAttribute('stroke-dashoffset', String(C));
  const PLAY = 'M8 5.5v13l11-6.5-11-6.5Z', PAUSE = 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z';
  btn.hidden = false;
  btn.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));
  audio.addEventListener('play', () => { glyph.setAttribute('d', PAUSE); btn.setAttribute('aria-label', 'Pause the preview'); card.classList.add('is-playing'); });
  audio.addEventListener('pause', () => { glyph.setAttribute('d', PLAY); btn.setAttribute('aria-label', 'Play a preview'); card.classList.remove('is-playing'); });
  audio.addEventListener('timeupdate', () => ring.setAttribute('stroke-dashoffset', String(C * (1 - audio.currentTime / (audio.duration || 30)))));
  audio.addEventListener('ended', () => ring.setAttribute('stroke-dashoffset', String(C)));
}

/** The footer: Shift-click copies the email address, and the weather where I live sits beside it. */
function connect() {
  document.querySelectorAll<HTMLAnchorElement>('[data-copy]').forEach((a) => {
    a.addEventListener('click', async (e) => {
      if (!e.shiftKey) return;
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(a.dataset.copy!);
        const hint = a.parentElement?.querySelector('[data-copy-hint]');
        if (hint) { hint.textContent = 'Copied'; setTimeout(() => (hint.textContent = 'Click to write, or hold Shift and click to copy'), 1800); }
      } catch { location.href = a.href; }
    });
  });
  weather();
}

/** Hand-drawn weather icons; their moving parts are animated in CSS. */
const ICONS: Record<WeatherIcon, string> = {
  sun: '<svg viewBox="0 0 64 64"><g class="wx-rays">' + Array.from({ length: 8 }, (_, i) => `<line x1="32" y1="6" x2="32" y2="14" transform="rotate(${i * 45} 32 32)"/>`).join('') + '</g><circle class="wx-sun" cx="32" cy="32" r="11"/></svg>',
  moon: '<svg viewBox="0 0 64 64"><circle class="wx-star s1" cx="14" cy="16" r="1.6"/><circle class="wx-star s2" cx="50" cy="12" r="1.2"/><circle class="wx-star s3" cx="54" cy="40" r="1.4"/><path class="wx-moon" d="M40 14a18 18 0 1 0 10 32A20 20 0 0 1 40 14Z"/></svg>',
  'cloud-sun': '<svg viewBox="0 0 64 64"><g class="wx-rays wx-rays--small">' + Array.from({ length: 8 }, (_, i) => `<line x1="22" y1="6" x2="22" y2="11" transform="rotate(${i * 45} 22 22)"/>`).join('') + '</g><circle class="wx-sun" cx="22" cy="22" r="8"/><path class="wx-cloud" d="M20 50h26a10 10 0 0 0 0-20 14 14 0 0 0-26 4 8 8 0 0 0 0 16Z"/></svg>',
  'cloud-moon': '<svg viewBox="0 0 64 64"><path class="wx-moon" d="M28 8a14 14 0 1 0 8 25A16 16 0 0 1 28 8Z"/><path class="wx-cloud" d="M20 52h26a10 10 0 0 0 0-20 14 14 0 0 0-26 4 8 8 0 0 0 0 16Z"/></svg>',
  cloud: '<svg viewBox="0 0 64 64"><path class="wx-cloud wx-cloud--back" d="M30 34h20a8 8 0 0 0 0-16 11 11 0 0 0-20 3 6.5 6.5 0 0 0 0 13Z"/><path class="wx-cloud" d="M16 50h28a11 11 0 0 0 0-22 15 15 0 0 0-28 4 9 9 0 0 0 0 18Z"/></svg>',
  fog: '<svg viewBox="0 0 64 64"><path class="wx-cloud" d="M18 34h26a10 10 0 0 0 0-20 14 14 0 0 0-26 4 8 8 0 0 0 0 16Z"/><line class="wx-fog f1" x1="10" y1="44" x2="46" y2="44"/><line class="wx-fog f2" x1="18" y1="52" x2="54" y2="52"/></svg>',
  rain: '<svg viewBox="0 0 64 64"><path class="wx-cloud" d="M16 38h28a11 11 0 0 0 0-22 15 15 0 0 0-28 4 9 9 0 0 0 0 18Z"/>' + [18, 28, 38, 48].map((x, i) => `<line class="wx-drop d${i}" x1="${x}" y1="44" x2="${x - 3}" y2="52"/>`).join('') + '</svg>',
  storm: '<svg viewBox="0 0 64 64"><path class="wx-cloud" d="M16 36h28a11 11 0 0 0 0-22 15 15 0 0 0-28 4 9 9 0 0 0 0 18Z"/><path class="wx-bolt" d="M33 38l-7 12h6l-3 10 10-14h-6l4-8Z"/>' + [18, 46].map((x, i) => `<line class="wx-drop d${i}" x1="${x}" y1="42" x2="${x - 3}" y2="50"/>`).join('') + '</svg>',
};

/** The weather right now where I live, refreshed every 15 minutes. */
async function weather() {
  const box = $('wx');
  const { place, lat, lon } = box.dataset;
  const time = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date());
  let now: { code: number; temp: number; feels: number; humidity: number; wind: number; day: boolean } | null = null;
  const load = async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,is_day&timezone=Asia%2FKolkata`;
      const c = (await (await fetch(url)).json()).current;
      now = { code: c.weather_code, temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature), humidity: Math.round(c.relative_humidity_2m), wind: Math.round(c.wind_speed_10m), day: c.is_day === 1 };
    } catch { /* keep whatever we had */ }
    render();
  };
  const render = () => {
    if (!now) return;
    const d = describeWeather(now.code, now.day);
    box.dataset.icon = d.icon;
    $('wx-icon').innerHTML = ICONS[d.icon];
    $('wx-temp').textContent = `${now.temp}°`;
    $('wx-label').textContent = d.label;
    $('wx-sub').textContent = `${place} · ${time()} · feels ${now.feels}° · ${now.humidity}% humidity · ${now.wind} km/h wind`;
    box.hidden = false;
  };
  await load();
  setInterval(load, 15 * 60_000);
  setInterval(render, 30_000);
}
