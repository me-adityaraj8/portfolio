/** Fits a rating history into a w × h box: lowest on the bottom edge, highest on the top. */
export function sparkline(ratings: number[], w: number, h: number) {
  const series = ratings.length === 1 ? [ratings[0], ratings[0]] : ratings;
  const lo = Math.min(...series), hi = Math.max(...series);
  const points = series.map((r, i) => [
    Math.round(((i / (series.length - 1)) * w) * 10) / 10,
    hi === lo ? h / 2 : Math.round((h - ((r - lo) / (hi - lo)) * h) * 10) / 10,
  ]);
  return { points, d: points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('') };
}

/** Codeforces titles and their official colours. */
const RANKS: Array<[number, string, string]> = [
  [3000, 'Legendary Grandmaster', '#ff0000'], [2600, 'International Grandmaster', '#ff0000'], [2400, 'Grandmaster', '#ff0000'],
  [2300, 'International Master', '#ff8c00'], [2100, 'Master', '#ff8c00'], [1900, 'Candidate Master', '#aa00aa'],
  [1600, 'Expert', '#0000ff'], [1400, 'Specialist', '#03a89e'], [1200, 'Pupil', '#008000'], [-Infinity, 'Newbie', '#808080'],
];
export function cfRank(rating: number) {
  const [, title, color] = RANKS.find(([min]) => rating >= min)!;
  return { title, color };
}
