import { MAX_MESSAGE, validateMessage, type Draft } from './message';

/** The message form: checks fields as you go, sends without leaving the page, and says what happened. */
export function dm() {
  const form = document.getElementById('dm') as HTMLFormElement | null;
  if (!form) return;
  const send = document.getElementById('dm-send') as HTMLButtonElement;
  const status = document.getElementById('dm-status')!;
  const count = document.getElementById('dm-count')!;
  const field = (n: keyof Draft) => form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement;
  const draft = (): Draft => ({ name: field('name').value, email: field('email').value, message: field('message').value });
  const touched = new Set<keyof Draft>();
  const show = (all = false) => {
    const errs = validateMessage(draft());
    for (const n of ['name', 'email', 'message'] as const) {
      const msg = all || touched.has(n) ? errs[n] ?? '' : '';
      document.getElementById(`dm-${n}-err`)!.textContent = msg;
      field(n).setAttribute('aria-invalid', String(!!msg));
    }
    return errs;
  };
  for (const n of ['name', 'email', 'message'] as const) {
    field(n).addEventListener('blur', () => { touched.add(n); show(); });
    field(n).addEventListener('input', () => { if (touched.has(n)) show(); });
  }
  field('message').addEventListener('input', () => {
    const len = field('message').value.length;
    count.textContent = `${len} / ${MAX_MESSAGE}`;
    count.classList.toggle('near', len > MAX_MESSAGE * 0.9);
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errs = show(true);
    const first = (['name', 'email', 'message'] as const).find((n) => errs[n]);
    if (first) { field(first).focus(); return; }
    if ((form.elements.namedItem('_honey') as HTMLInputElement).value) return;
    const d = draft();
    send.disabled = true;
    form.dataset.state = 'sending';
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: d.name.trim(), email: d.email.trim(), message: d.message.trim(), _subject: `Portfolio message from ${d.name.trim()}`, _replyto: d.email.trim(), _template: 'table' }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === 'false' || body.success === false) throw new Error(body.message ?? 'failed');
      form.reset();
      touched.clear();
      count.textContent = `0 / ${MAX_MESSAGE}`;
      form.dataset.state = 'sent';
      status.textContent = `Sent. Thanks, ${d.name.trim().split(/\s+/)[0]}, I'll reply to ${d.email.trim()}.`;
    } catch {
      form.dataset.state = 'error';
      const mail = form.dataset.mail ?? '';
      status.innerHTML = '';
      status.append("That didn't go through. ");
      const a = document.createElement('a');
      a.href = `mailto:${mail}?subject=${encodeURIComponent('Hello from your portfolio')}&body=${encodeURIComponent(d.message)}`;
      a.textContent = 'Send it by email instead';
      status.append(a, '.');
    } finally {
      send.disabled = false;
    }
  });
}
