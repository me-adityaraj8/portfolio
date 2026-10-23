import { getCollection, type CollectionEntry } from 'astro:content';
import github from '../data/github.json';
import { hillsFromRepos } from '../engine/github';
import { site } from '../data/site';

export type Project = CollectionEntry<'projects'>;

export interface MoreItem { title: string; year: string; summary: string; href: string }

/** The proof-of-work grid, and everything else on GitHub. */
export async function getWork() {
  const all = await getCollection('projects');
  const featured = all.filter((p) => p.data.order !== undefined).sort((a, b) => a.data.order! - b.data.order!);
  const rest = all.filter((p) => p.data.order === undefined);
  const known = all.flatMap((p) => (p.data.links.code ? [p.data.links.code] : []));
  const more: MoreItem[] = [
    ...rest.map((p) => ({ title: p.data.title, year: p.data.date.slice(0, 4), summary: p.data.summary, href: p.data.links.code ?? p.data.links.live ?? '/work' })),
    ...hillsFromRepos(github.repos.filter((r) => !site.hiddenRepos.includes(r.name.toLowerCase())), known, github.owner).map((h) => ({ title: h.title, year: h.date.slice(0, 4), summary: h.summary, href: h.url })),
  ].sort((a, b) => b.year.localeCompare(a.year) || a.title.localeCompare(b.title));
  return { featured, more };
}

export const monthYear = (date: string) =>
  new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
