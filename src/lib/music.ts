/**
 * "Last played" comes from Last.fm, which collects plays from Spotify, YouTube Music
 * and Apple Music once each is connected to it.
 */
export interface Played { title: string; artist: string; art: string; playing: boolean; at: number | null; url: string }

interface LfmImage { size: string; '#text': string }
interface LfmTrack {
  name: string;
  artist: { '#text': string };
  image?: LfmImage[];
  date?: { uts: string };
  url: string;
  '@attr'?: { nowplaying?: string };
}

export function parseRecent(json: unknown): Played | null {
  const t = (json as { recenttracks?: { track?: LfmTrack[] } })?.recenttracks?.track?.[0];
  if (!t) return null;
  const images = t.image ?? [];
  const art = images.find((i) => i.size === 'extralarge')?.['#text'] ?? images.at(-1)?.['#text'] ?? '';
  return {
    title: t.name,
    artist: t.artist['#text'],
    art,
    playing: t['@attr']?.nowplaying === 'true',
    at: t.date ? Number(t.date.uts) * 1000 : null,
    url: t.url,
  };
}

export function ago(ms: number) {
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

/** A hand-picked list that moves to the next song every `hours`; everyone sees the same one at a time. */
export function onRepeat<T>(list: T[], now: number, hours: number): T | null {
  if (!list.length) return null;
  return list[Math.floor(now / (hours * 3600_000)) % list.length];
}
export interface StoreTrack { trackName: string; artistName: string; previewUrl?: string; artworkUrl100?: string }

const VERSION = /\b(remix|cover|karaoke|instrumental|sped up|slowed|reverb|live|acoustic)\b/i;
const squash = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * The store's top result is often a cover or a remix. Only results credited to the
 * artist count, and the original recording beats any other version of it.
 */
export function bestMatch(results: StoreTrack[], title: string, artist: string): StoreTrack | null {
  const byArtist = results.filter((r) => squash(r.artistName).includes(squash(artist)));
  const score = (r: StoreTrack) =>
    (squash(r.trackName) === squash(title) ? 2 : squash(r.trackName).startsWith(squash(title)) ? 1 : 0) - (VERSION.test(r.trackName) ? 3 : 0);
  return byArtist.sort((a, b) => score(b) - score(a))[0] ?? null;
}
