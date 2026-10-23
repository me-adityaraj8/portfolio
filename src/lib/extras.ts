import type Lenis from 'lenis';
import { ago } from './music';
import { countdown, latestRepo, nextContest } from './live';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Session cache, so browsing the page doesn't spend a visitor's GitHub rate limit. */
async function cached<T>(key: string, minutes: number, load: () => Promise<T>): Promise<T> {
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) ?? 'null');
    if (hit && Date.now() - hit.t < minutes * 60_000) return hit.v as T;
  } catch { /* fall through */ }
  const v = await load();
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch { /* storage blocked */ }
  return v;
}

/** "Currently building": the latest public commit. */
export async function building(owner: string, hidden: string[]) {
  const card = $<HTMLAnchorElement>('building');
  try {
    const info = await cached('gh:latest', 10, async () => {
      const repos: Array<{ name: string; pushed_at: string; fork: boolean; html_url: string }> = await (await fetch(`https://api.github.com/users/${owner}/repos?sort=pushed&per_page=10`)).json();
      const repo = latestRepo(repos, hidden, owner);
      if (!repo) return null;
      const commit = (await (await fetch(`https://api.github.com/repos/${owner}/${repo.name}/commits?per_page=1`)).json())[0];
      return { repo: repo.name, url: repo.html_url, message: String(commit.commit.message).split('\n')[0], at: commit.commit.author.date as string, sha: String(commit.sha).slice(0, 7) };
    });
    if (!info) return;
    $('nb-repo').textContent = info.repo;
    $('nb-msg').textContent = `“${info.message}”`;
    $('nb-when').textContent = `${info.sha} · ${ago(Date.now() - Date.parse(info.at))}`;
    card.href = info.url;
    card.hidden = false;
  } catch { /* stays hidden */ }
}

/** A live countdown to the next Codeforces round. */
export async function contest() {
  const box = $('contest');
  try {
    type Round = { name: string; phase: string; startTimeSeconds: number; id: number };
    const list = await cached<Round[]>('cf:contests', 60, async () =>
      (await (await fetch('https://codeforces.com/api/contest.list?gym=false')).json()).result
        .filter((c: { phase: string }) => c.phase === 'BEFORE')
        .map((c: Round) => ({ name: c.name, phase: c.phase, startTimeSeconds: c.startTimeSeconds, id: c.id })));
    const next = nextContest(list, Date.now() / 1000);
    if (!next) return;
    $('contest-name').textContent = next.name.replace(/^Codeforces /, '');
    const time = $('contest-time');
    const tick = () => { time.textContent = countdown(next.startTimeSeconds * 1000 - Date.now()); };
    tick();
    setInterval(tick, 1000);
    box.hidden = false;
  } catch { /* stays hidden */ }
}

/** Visits (a free counter, counted once per browser session) and, with the worker, who's here now. */
export async function liveStats() {
  const el = $('live-stats');
  const { backend, counter, key } = el.dataset as Record<string, string>;
  try {
    // While developing, only read the count, so testing doesn't inflate it.
    const seen = sessionStorage.getItem('counted');
    const verb = import.meta.env.DEV || seen ? 'get' : 'hit';
    const res = await fetch(`${counter}/${verb}/${key}`);
    if (res.ok) {
      const { value } = await res.json();
      if (verb === 'hit') sessionStorage.setItem('counted', '1');
      $('visits').textContent = `${Number(value).toLocaleString('en-IN')} visits`;
    }
  } catch { /* no count */ }
  if (!backend) return;
  const connect = () => {
    const ws = new WebSocket(backend.replace(/^http/, 'ws') + '/presence');
    ws.onmessage = (e) => {
      const { here } = JSON.parse(String(e.data));
      $('here-n').textContent = String(here);
      $('here').hidden = false;
    };
    ws.onclose = () => setTimeout(connect, 5000);
  };
  connect();
}

/** The guestbook: sign in with GitHub in a popup, then leave a short note. */
export async function guestbook() {
  const backend = $('live-stats').dataset.backend;
  if (!backend) return;
  const section = $('guestbook'), list = $('gb-list'), msg = $('gb-msg');
  const write = $('gb-write'), signin = $('gb-signin'), input = $<HTMLInputElement>('gb-input');
  let token = sessionStorage.getItem('gb:token') ?? '';
  const render = (entries: Array<{ login: string; name: string; avatar: string; message: string; at: number }>) => {
    list.innerHTML = entries.length
      ? entries.map((e) => `<li><img src="${esc(e.avatar)}" alt="" width="36" height="36" loading="lazy"><div><p><b>${esc(e.name)}</b> <a href="https://github.com/${encodeURIComponent(e.login)}" rel="noopener" target="_blank">@${esc(e.login)}</a> <span>${ago(Date.now() - e.at)}</span></p><p>${esc(e.message)}</p></div></li>`).join('')
      : '<li class="gb-empty">Be the first to sign.</li>';
  };
  const showWriter = () => {
    if (!token) return;
    try {
      const user = JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
      if (user.exp < Date.now()) throw new Error('expired');
      $<HTMLImageElement>('gb-me').src = user.avatar;
      signin.hidden = true;
      write.hidden = false;
    } catch { token = ''; sessionStorage.removeItem('gb:token'); }
  };
  try { render(await (await fetch(`${backend}/guestbook`)).json()); } catch { return; }
  section.hidden = false;
  showWriter();
  signin.addEventListener('click', () => {
    window.open(`${backend}/auth/github`, 'gb-signin', 'width=520,height=680');
  });
  addEventListener('message', (e) => {
    if (e.origin !== new URL(backend).origin || !e.data?.guestbookToken) return;
    token = e.data.guestbookToken;
    sessionStorage.setItem('gb:token', token);
    showWriter();
    input.focus();
  });
  $('gb-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const res = await fetch(`${backend}/guestbook`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: input.value }) });
    const body = await res.json();
    if (!res.ok) { msg.textContent = body.error ?? 'That did not go through.'; return; }
    input.value = '';
    render(body);
    msg.textContent = 'Thanks for signing.';
  });
}

/** The 30-second view: everything a recruiter needs on one screen. */
export function recruiter(lenis: Lenis | null) {
  const dialog = $<HTMLDialogElement>('recruit');
  const open = () => { dialog.showModal(); lenis?.stop(); };
  const close = () => { dialog.close(); };
  $('recruit-open').addEventListener('click', open);
  $('recruit-close').addEventListener('click', close);
  dialog.addEventListener('close', () => lenis?.start());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  if (new URLSearchParams(location.search).has('recruiter')) open();
}

/** Grows a dialog out of the card that opened it, and shrinks it back on close. */
export function growFrom(dialog: HTMLElement, from: Element | null, reverse = false) {
  if (!from || matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
  const a = from.getBoundingClientRect(), b = dialog.getBoundingClientRect();
  const t = `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  const frames = [{ transform: t, opacity: 0.4, borderRadius: '18px' }, { transform: 'none', opacity: 1, borderRadius: '20px' }];
  return dialog.animate(reverse ? frames.reverse() : frames, { duration: reverse ? 320 : 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }).finished.then(() => undefined);
}
