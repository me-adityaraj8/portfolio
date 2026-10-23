import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/shots/*.{webp,png,jpg}', { eager: true });

/** A screenshot named like "/shots/kairo.webp", as an image Astro can resize. Fails the build if it's missing. */
export function shot(path: string) {
  const name = path.split('/').pop()!;
  const hit = Object.entries(files).find(([file]) => file.endsWith(`/${name}`));
  if (!hit) throw new Error(`No screenshot called ${name} in src/assets/shots`);
  return hit[1].default;
}
