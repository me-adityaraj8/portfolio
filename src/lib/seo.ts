/** A site-relative path as a full URL, which link previews need. */
export function absoluteUrl(path: string, site: string | URL | undefined) {
  return site ? new URL(path, site).href : path;
}

/** Coding profile URLs from the handles in cp.json. */
export function profileLinks(h: { codeforces: string; leetcode: string; codolio: string }) {
  return [
    `https://codeforces.com/profile/${h.codeforces}`,
    `https://leetcode.com/u/${h.leetcode}/`,
    `https://codolio.com/profile/${h.codolio}`,
  ];
}

/** Who this site is about, in the schema.org form search engines read. */
export function personJsonLd(p: { name: string; url: string; email: string; jobTitle: string; school: string; sameAs: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    url: p.url,
    email: `mailto:${p.email}`,
    jobTitle: p.jobTitle,
    alumniOf: { '@type': 'CollegeOrUniversity', name: p.school },
    sameAs: p.sameAs,
  };
}
