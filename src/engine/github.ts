export interface Repo {
  name: string;
  createdAt: string;
  description: string | null;
  language: string | null;
  isFork: boolean;
  isPrivate: boolean;
  url: string;
  homepage: string | null;
  commits: number | null;
}

export interface Hill {
  slug: string;
  title: string;
  date: string;
  summary: string;
  commits?: number;
  url: string;
  homepage?: string;
}

const norm = (url: string) => url.toLowerCase().replace(/\/+$/, '');

/**
 * Public repos that don't have a hand-written page yet become small hills on the
 * map, placed by the day the repo was created. Ship something and it appears.
 */
export function hillsFromRepos(repos: Repo[], knownCodeUrls: string[], owner: string): Hill[] {
  const known = new Set(knownCodeUrls.map(norm));
  return repos
    .filter((r) => !r.isFork && !r.isPrivate && r.name.toLowerCase() !== owner.toLowerCase())
    .filter((r) => !known.has(norm(r.url)))
    .filter((r) => r.description || r.language)
    .map((r) => {
      const hill: Hill = {
        slug: `gh-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: r.name,
        date: r.createdAt.slice(0, 10),
        summary: r.description ?? `${r.language} repository`,
        url: r.url,
      };
      if (r.commits != null) hill.commits = r.commits;
      if (r.homepage) hill.homepage = r.homepage;
      return hill;
    });
}
