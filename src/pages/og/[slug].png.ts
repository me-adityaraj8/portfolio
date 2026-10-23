/**
 * Share images, one per page, drawn at build time: the hero's dot grid with the page's
 * title over it. Satori lays out the text, resvg turns the SVG into a PNG.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { dotField } from '../../lib/og';
import { site } from '../../data/site';
import cp from '../../data/cp.json';

const W = 1200, H = 630;
interface Card { kicker: string; title: string; text: string; foot: string }

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await getCollection('projects', (p) => p.data.kind !== 'early');
  return [
    { params: { slug: 'home' }, props: { kicker: `${site.role} · ${site.status}`, title: site.name, text: 'Full-stack products, shipped and live. Every project on the site runs in the page.', foot: `Codeforces ${cp.codeforces.maxRating} peak · ${cp.codolio.solved} problems solved · B.Tech CSE, IIIT Bhagalpur` } },
    { params: { slug: 'work' }, props: { kicker: 'Index', title: 'All the work', text: `Projects by ${site.name}, newest first.`, foot: site.github.replace('https://', '') } },
    ...projects.map((p) => ({
      params: { slug: p.id },
      props: { kicker: `Case study · ${p.data.stack.slice(0, 3).join(' · ')}`, title: p.data.title, text: p.data.summary, foot: `by ${site.name} · ${site.github.replace('https://', '')}` },
    })),
  ];
};

// Resolved through node, so it works however the build is started.
const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFile(require.resolve(`@fontsource/${pkg}/files/${file}`));
const fonts = Promise.all([
  font('unbounded', 'unbounded-latin-700-normal.woff'),
  font('barlow', 'barlow-latin-400-normal.woff'),
  font('barlow-condensed', 'barlow-condensed-latin-500-normal.woff'),
]);
const dots = `data:image/svg+xml;base64,${Buffer.from(dotField(W, H)).toString('base64')}`;

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: Array<El | string>): El => ({ type, props: { style: { display: 'flex', ...style }, children } });

export const GET: APIRoute = async ({ props }) => {
  const { kicker, title, text, foot } = props as Card;
  const [display, sans, cond] = await fonts;
  const tree = h('div', { width: W, height: H, display: 'flex', position: 'relative', background: '#07060d', color: '#f4f2ff', fontFamily: 'Barlow' },
    { type: 'img', props: { src: dots, width: W, height: H, style: { position: 'absolute', inset: 0 } } },
    h('div', { position: 'absolute', inset: 0, display: 'flex', background: 'radial-gradient(700px 480px at 30% 60%, rgba(108,92,231,0.18), transparent 70%)' }),
    h('div', { position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', padding: '64px 72px' },
      h('div', { display: 'flex', fontFamily: 'Barlow Condensed', fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: '#9a95c0' }, kicker),
      h('div', { display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 820 },
        h('div', { fontFamily: 'Unbounded', fontSize: title.length > 14 ? 76 : 104, lineHeight: 1, letterSpacing: -2, textTransform: 'uppercase' }, title),
        h('div', { fontSize: 32, lineHeight: 1.35, color: '#cdc9ea' }, text)),
      h('div', { display: 'flex', fontSize: 24, color: '#9a95c0' }, foot)));
  const svg = await satori(tree as never, { width: W, height: H, fonts: [
    { name: 'Unbounded', data: display, weight: 700, style: 'normal' },
    { name: 'Barlow', data: sans, weight: 400, style: 'normal' },
    { name: 'Barlow Condensed', data: cond, weight: 500, style: 'normal' },
  ] });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } });
};
