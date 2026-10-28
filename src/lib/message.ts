export const MAX_MESSAGE = 2000;
export interface Draft { name: string; email: string; message: string }

/** Field errors for the message form; an empty object means it's ready to send. */
export function validateMessage(d: Draft) {
  const e: Partial<Record<keyof Draft, string>> = {};
  if (!d.name.trim()) e.name = 'Add your name, so I know who wrote.';
  const email = d.email.trim();
  if (!email) e.email = 'Add an email so I can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "That email doesn't look complete.";
  const m = d.message.trim();
  if (m.length < 10) e.message = 'Write a little more, at least 10 characters.';
  else if (m.length > MAX_MESSAGE) e.message = `Keep it under ${MAX_MESSAGE} characters.`;
  return e;
}
