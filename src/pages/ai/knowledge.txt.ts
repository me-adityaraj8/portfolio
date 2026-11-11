import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../../data/site';
import { personal } from '../../data/personal';
import cp from '../../data/cp.json';

/**
 * Everything the "Ask about Aditya" assistant may say, as plain text. Built with the site,
 * so it always matches the pages. /api/ask reads it from here. Public data only.
 */
export const GET: APIRoute = async () => {
  const projects = (await getCollection('projects')).filter((p) => !p.data.private)
    .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
  const l: string[] = [];
  const h = (t: string) => l.push('', `## ${t}`);

  h('Who');
  l.push(`${site.name}. ${site.role}. ${site.status}.`, site.line);
  l.push(`Email ${site.email}. GitHub ${site.github}. LinkedIn ${site.linkedin}. Resume /resume.pdf.`);

  h('Education');
  for (const e of site.education) {
    l.push(`- ${e.full}: ${e.detail}, ${e.years}, ${e.place}.${e.note ? ' ' + e.note : ''}`);
    if (e.courses.length) l.push(`  Courses: ${e.courses.map((c) => c.name + (c.now ? ' (this semester)' : '')).join(', ')}.`);
  }

  h('Experience');
  for (const x of site.experience) l.push(`- ${x.role}, ${x.org} (${x.years}, ${x.place}). ${x.points.join(' ')} Site: ${x.href}`);

  h('Projects (case study link in brackets)');
  for (const p of projects) {
    const d = p.data;
    l.push(`- ${d.title} [/work/${p.id}] (${d.kind}, started ${d.date.slice(0, 7)}${d.role ? ', ' + d.role : ''}): ${d.summary}`);
    if (d.stack.length) l.push(`  Stack: ${d.stack.join(', ')}.`);
    if (d.facts.length) l.push(`  Facts: ${d.facts.join('; ')}.`);
    if (d.links.live || d.links.code) l.push(`  Links: ${[d.links.live, d.links.code].filter(Boolean).join(' ')}`);
    const body = (p.body ?? '').replace(/\s+/g, ' ').trim();
    if (body) l.push(`  Write-up: ${body}`);
  }

  h('Open source (pull requests to other people\'s repos)');
  for (const r of site.openSource) {
    l.push(`- ${r.repo} (${r.stars.toLocaleString('en-US')} stars)${r.about ? ': ' + r.about : ''}`);
    for (const pr of r.prs) l.push(`  PR #${pr.n}, ${pr.state}, ${pr.date}, +${pr.add}/-${pr.del}: ${pr.title}`);
  }

  h('Certificates');
  for (const c of site.certificates) l.push(`- ${c.title}, ${c.issuer}, issued ${c.issued}, credential ID ${c.id}${c.verify ? ', verifiable at ' + c.verify : ''}.`);

  h('Problem solving');
  const { codolio: co, codeforces: cf, leetcode: lc } = cp;
  l.push(`As of ${co.asOf}: ${co.solved} problems solved across Codeforces and LeetCode, ${co.contests} rated contests, ${co.activeDays} active days, longest streak ${co.maxStreak} days.`);
  l.push(`Codeforces (${cp.handles.codeforces}): rating ${cf.rating} (${cf.rank}), peak ${cf.maxRating} (${cf.maxRank}), ${cf.contests} contests.`);
  l.push(`LeetCode (${cp.handles.leetcode}): contest rating ${lc.rating}, top ${lc.top}% , ${lc.contests} contests.`);

  h('Stack');
  l.push(site.stack.map((s) => s.name).join(', ') + '.');

  h('Outside work (from the personal page)');
  const { movies, music, singing, sports, cooking, photography, reading, coding, side } = personal;
  for (const s of [movies, music, singing, sports, cooking, photography, reading, coding, side]) l.push(`- ${s.title}: ${s.body.join(' ')}`);
  l.push(`- Favourite films and shows: ${movies.titles.map((t) => t.title).join(', ')}.`);
  l.push(`- Music: ${music.genres.join(', ')}. Songs he likes: ${music.songs.map((s) => `${s.title} by ${s.artist}`).join(', ')}.`);
  l.push(`- Favourite food: ${cooking.favourite.name}. ${cooking.favourite.note} Also cooks ${cooking.also.join(', ')}.`);
  l.push(`- Side quests: ${side.list.join(', ')}.`);

  return new Response(l.join('\n').trim() + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
