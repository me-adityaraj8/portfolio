// Fetches public repos for the map. Run with: GITHUB_TOKEN=… npm run sync
// Without a token it still works, within GitHub's anonymous rate limit.
import { writeFile } from 'node:fs/promises';

const owner = process.env.GITHUB_OWNER ?? 'me-adityaraj8';
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-sync' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res;
}

// The commit count is the page number of the last page when asking for one commit per page.
async function commits(name) {
  try {
    const res = await gh(`/repos/${owner}/${name}/commits?per_page=1`);
    const last = res.headers.get('link')?.match(/page=(\d+)>; rel="last"/);
    return last ? Number(last[1]) : (await res.json()).length;
  } catch {
    return null;
  }
}

try {
  const u = await (await gh(`/users/${owner}`)).json();
  const profile = { login: u.login, name: u.name, avatar: u.avatar_url, bio: u.bio, followers: u.followers, following: u.following, repos: u.public_repos, since: u.created_at };
  const list = await (await gh(`/users/${owner}/repos?per_page=100&type=owner`)).json();
  const repos = [];
  // Private repos never reach this file: the site's own repository is public.
  for (const r of list.filter((r) => !r.private)) {
    repos.push({
      name: r.name,
      createdAt: r.created_at,
      description: r.description,
      language: r.language,
      isFork: r.fork,
      isPrivate: r.private,
      url: r.html_url,
      homepage: r.homepage || null,
      commits: r.fork ? null : await commits(r.name),
      languages: r.fork ? {} : await gh(`/repos/${owner}/${r.name}/languages`).then((x) => x.json()).catch(() => ({})),
    });
  }
  await writeFile(new URL('../src/data/github.json', import.meta.url), JSON.stringify({ owner, fetched: new Date().toISOString(), profile, repos }, null, 2) + '\n');
  console.log(`synced ${repos.length} repos for ${owner}`);
} catch (e) {
  // A failed sync keeps the last good file, so a build never breaks over GitHub being down.
  console.warn(`sync skipped: ${e.message}`);
}
