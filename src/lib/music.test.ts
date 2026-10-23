import { describe, expect, test } from 'vitest';
import { ago, bestMatch, onRepeat, parseRecent } from './music';

const track = (over: Record<string, unknown> = {}) => ({
  name: 'Blush', artist: { '#text': 'Prateek Kuhad' }, album: { '#text': 'Blush' },
  image: [{ size: 'small', '#text': 'https://img/s.jpg' }, { size: 'extralarge', '#text': 'https://img/xl.jpg' }],
  date: { uts: '1760000000' }, url: 'https://www.last.fm/music/x', ...over,
});

describe('parseRecent', () => {
  test('reads the most recent track with its largest artwork', () => {
    expect(parseRecent({ recenttracks: { track: [track()] } })).toEqual({
      title: 'Blush', artist: 'Prateek Kuhad', art: 'https://img/xl.jpg', playing: false, at: 1760000000000, url: 'https://www.last.fm/music/x',
    });
  });

  test('marks a track that is playing right now', () => {
    const r = parseRecent({ recenttracks: { track: [track({ '@attr': { nowplaying: 'true' }, date: undefined })] } });
    expect(r?.playing).toBe(true);
    expect(r?.at).toBeNull();
  });

  test('returns nothing for an empty or broken response', () => {
    expect(parseRecent({ recenttracks: { track: [] } })).toBeNull();
    expect(parseRecent({ error: 10, message: 'Invalid API key' })).toBeNull();
  });
});

describe('ago', () => {
  test.each([
    [30_000, 'just now'], [5 * 60_000, '5 min ago'], [3 * 3600_000, '3 h ago'], [2 * 86400_000, '2 days ago'], [86400_000, 'yesterday'],
  ])('%i ms reads as %s', (ms, text) => {
    expect(ago(ms)).toBe(text);
  });
});

describe('onRepeat', () => {
  const songs = ['a', 'b', 'c'];
  const H = 3600_000;

  test('everyone sees the same song for the whole slot', () => {
    expect(onRepeat(songs, 6 * H, 6)).toBe(onRepeat(songs, 6 * H + 5 * H, 6));
  });

  test('moves to the next song when the slot changes, and wraps around', () => {
    expect(onRepeat(songs, 0, 6)).toBe('a');
    expect(onRepeat(songs, 6 * H, 6)).toBe('b');
    expect(onRepeat(songs, 18 * H, 6)).toBe('a');
  });

  test('has nothing to show for an empty list', () => {
    expect(onRepeat([], Date.now(), 6)).toBeNull();
  });
});

describe('bestMatch', () => {
  const r = (trackName: string, artistName: string) => ({ trackName, artistName, previewUrl: `p/${trackName}`, artworkUrl100: '' });

  test('prefers the right artist over a cover that ranks higher', () => {
    const hit = bestMatch([r('Husn', 'Nishant Das Choudhury'), r('Husn', 'Anuv Jain')], 'Husn', 'Anuv Jain');
    expect(hit?.artistName).toBe('Anuv Jain');
  });

  test('prefers the original over a remix by the same artist', () => {
    const hit = bestMatch([r('Blinding Lights (Remix)', 'The Weeknd & ROSALÍA'), r('Blinding Lights', 'The Weeknd')], 'Blinding Lights', 'The Weeknd');
    expect(hit?.trackName).toBe('Blinding Lights');
  });

  test('accepts a collaboration that credits the artist', () => {
    const hit = bestMatch([r('Kho Gaye Hum Kahan', 'Jasleen Royal & Prateek Kuhad')], 'Kho Gaye Hum Kahan', 'Prateek Kuhad');
    expect(hit?.trackName).toBe('Kho Gaye Hum Kahan');
  });

  test('finds nothing when no result is by the artist', () => {
    expect(bestMatch([r('Husn', 'Someone Else')], 'Husn', 'Anuv Jain')).toBeNull();
  });
});
