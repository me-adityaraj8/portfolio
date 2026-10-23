// Pulls the public GitHub contribution calendar. Run with: npm run sync:contrib
import { writeFile } from 'node:fs/promises';
import { parseContributions, streaks } from '../src/lib/live.ts';

const owner = process.env.GITHUB_OWNER ?? 'me-adityaraj8';
try {
  const html = await (await fetch(`https://github.com/users/${owner}/contributions`, { headers: { 'User-Agent': 'portfolio-sync' } })).text();
  const days = parseContributions(html);
  if (!days.length) throw new Error('no days found');
  const today = new Date().toISOString().slice(0, 10);
  const out = { owner, fetched: new Date().toISOString(), ...streaks(days, today), days };
  await writeFile(new URL('../src/data/contrib.json', import.meta.url), JSON.stringify(out) + '\n');
  console.log(`contributions: ${days.length} days, ${out.total} total, current streak ${out.current}, longest ${out.longest}`);
} catch (e) {
  console.warn(`contributions skipped: ${e.message}`);
}
