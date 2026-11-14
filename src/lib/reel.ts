/** The 30-second view plays like a short reel: a few scenes, each on screen for the same time. */
export const SCENE_MS = 6000;

/** Where the reel is after `elapsed` ms: which scene, how far through it, and how long is left. */
export function reelAt(elapsed: number, scenes: number, sceneMs = SCENE_MS) {
  const total = scenes * sceneMs, t = Math.max(0, Math.min(total, elapsed));
  if (t >= total) return { scene: scenes - 1, fill: 1, left: 0, done: true };
  const scene = Math.floor(t / sceneMs);
  return { scene, fill: (t - scene * sceneMs) / sceneMs, left: total - t, done: false };
}

/** Time left as the clock shows it, e.g. "0:24". */
export function clock(ms: number) {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
