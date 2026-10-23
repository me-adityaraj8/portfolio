// Pulls exact lines of code from public repos, pinned to a commit. Run with: npm run sync:snippets
import { writeFile } from 'node:fs/promises';

const owner = 'me-adityaraj8';
const wanted = [
  {
    repo: 'kairo', path: 'app/api/quests/[id]/complete/route.ts', from: 31, to: 42, lang: 'ts',
    title: 'Completing a quest can only pay out once',
    why: 'Two requests can race to complete the same quest. The claim is a guarded updateMany inside a transaction: only one request flips done from false to true, and the other sees count 0 and stops. No locks, no double XP.',
  },
];

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-sync' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
try {
  const out = [];
  for (const w of wanted) {
    const sha = (await (await fetch(`https://api.github.com/repos/${owner}/${w.repo}/commits?per_page=1&path=${encodeURIComponent(w.path)}`, { headers })).json())[0].sha;
    const raw = await (await fetch(`https://raw.githubusercontent.com/${owner}/${w.repo}/${sha}/${w.path}`)).text();
    const code = raw.split('\n').slice(w.from - 1, w.to).join('\n');
    const indent = Math.min(...code.split('\n').filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    out.push({ ...w, sha, code: code.split('\n').map((l) => l.slice(indent)).join('\n'), url: `https://github.com/${owner}/${w.repo}/blob/${sha}/${w.path}#L${w.from}-L${w.to}` });
  }
  await writeFile(new URL('../src/data/snippets.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
  console.log(`snippets: ${out.length}`);
} catch (e) { console.warn(`snippets skipped: ${e.message}`); }
