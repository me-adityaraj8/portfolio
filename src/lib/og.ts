import { ripple } from './atmosphere';

// The hero's colours, pink through teal.
const PALETTE = [[244, 114, 182], [192, 132, 252], [129, 140, 248], [56, 189, 248], [45, 212, 191]];
const colourAt = (t: number) => {
  const f = Math.max(0, Math.min(1, t)) * (PALETTE.length - 1), i = Math.min(PALETTE.length - 2, Math.floor(f)), k = f - i;
  return PALETTE[i].map((c, j) => Math.round(c + (PALETTE[i + 1][j] - c) * k));
};

/** The hero's dot grid as a still SVG, with two BFS waves caught mid-spread, for share images. */
export function dotField(w: number, h: number, step = 15) {
  const cols = Math.ceil(w / step), rows = Math.ceil(h / step);
  const cx = Math.round(cols * 0.76), cy = Math.round(rows * 0.45);
  let out = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = x - cx, dy = y - cy;
      const I = Math.max(ripple(dx, dy, 0.5, { speed: 26, life: 1.5, width: 3 }), ripple(dx, dy, 1.0, { speed: 26, life: 1.8, width: 3 }) * 0.9);
      const side = Math.min(1, Math.max(0.12, (x / cols - 0.12) * 1.5));
      const a = Math.min(1, (0.2 + 0.95 * I) * side);
      const [r, g, b] = colourAt((x / cols) * 0.75 + (y / rows) * 0.25 + I * 0.2);
      const size = I > 0.3 ? 3.6 : 2;
      out += `<rect x="${(x + 0.5) * step - size / 2}" y="${(y + 0.5) * step - size / 2}" width="${size}" height="${size}" fill="rgb(${r},${g},${b})" fill-opacity="${a.toFixed(2)}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${out}</svg>`;
}
