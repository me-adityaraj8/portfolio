// Downloads the posters and song covers the personal page uses, so the live page
// never depends on Wikipedia or iTunes. Run it after changing src/data/personal.ts.
import { mkdir, writeFile } from 'node:fs/promises';
import { personal } from '../src/data/personal.ts';
import { bestMatch } from '../src/lib/music.ts';

const root = new URL('../', import.meta.url);
const UA = { 'User-Agent': 'aditya-portfolio build (me.adityaraj8@gmail.com)' };
const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const save = async (url, path) => {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await writeFile(new URL(path, root), Buffer.from(await res.arrayBuffer()));
};

await mkdir(new URL('src/assets/posters/', root), { recursive: true });
await mkdir(new URL('src/assets/covers/', root), { recursive: true });

for (const t of personal.movies.titles) {
  if (!t.wiki) { console.log('no poster source:', t.title); continue; }
  const sum = await (await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${t.wiki}`, { headers: UA })).json();
  const src = sum.originalimage?.source;
  if (!src) { console.log('no poster found:', t.title); continue; }
  await save(src, `src/assets/posters/${t.id}.jpg`);
  console.log('poster', t.title, `${sum.originalimage.width}x${sum.originalimage.height}`);
}

const songs = [];
for (const s of personal.music.songs) {
  const q = encodeURIComponent(`${s.title} ${s.artist}`);
  const results = (await (await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=15&country=in`)).json()).results ?? [];
  const hit = bestMatch(results, s.title, s.artist);
  if (!hit) { console.log('no match:', s.title); continue; }
  const id = slug(`${s.artist}-${s.title}`);
  await save(hit.artworkUrl100.replace('100x100bb', '600x600bb'), `src/assets/covers/${id}.jpg`);
  songs.push({ id, title: s.title, artist: s.artist, preview: hit.previewUrl ?? '', link: hit.trackViewUrl ?? '' });
  console.log('song', s.title, '·', hit.trackName, '·', hit.artistName);
}
await writeFile(new URL('src/data/personal-media.json', root), JSON.stringify({ fetched: new Date().toISOString(), songs }, null, 2) + '\n');
