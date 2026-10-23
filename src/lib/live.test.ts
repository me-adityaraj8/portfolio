import { describe, expect, test } from 'vitest';
import { countdown, latestRepo, nextContest, parseContributions, streaks } from './live';

const day = (id: string, date: string, level: number) => `<td tabindex="0" data-ix="0" aria-selected="false" data-date="${date}" id="${id}" data-level="${level}" class="ContributionCalendar-day"></td>`;
const tip = (id: string, text: string) => `<tool-tip id="t-${id}" for="${id}" popover="manual" class="sr-only">${text}</tool-tip>`;

describe('parseContributions', () => {
  test('reads each day with its level and count from the public calendar', () => {
    const html = day('c-0', '2026-10-01', 0) + day('c-1', '2026-10-02', 3) + tip('c-0', 'No contributions on October 1st.') + tip('c-1', '7 contributions on October 2nd.');
    expect(parseContributions(html)).toEqual([
      { date: '2026-10-01', level: 0, count: 0 },
      { date: '2026-10-02', level: 3, count: 7 },
    ]);
  });

  test('reads a single contribution', () => {
    const html = day('c-0', '2026-10-05', 1) + tip('c-0', '1 contribution on October 5th.');
    expect(parseContributions(html)[0].count).toBe(1);
  });

  test('sorts days by date even when the page lists them by weekday', () => {
    const html = day('a', '2026-10-08', 0) + day('b', '2026-10-01', 0) + tip('a', 'No contributions on October 8th.') + tip('b', 'No contributions on October 1st.');
    expect(parseContributions(html).map((d) => d.date)).toEqual(['2026-10-01', '2026-10-08']);
  });
});

describe('streaks', () => {
  const days = (counts: number[]) => counts.map((count, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, level: 0, count }));

  test('counts the longest run, the current run and the total', () => {
    expect(streaks(days([1, 2, 0, 1, 1, 1, 0, 3, 4]), '2026-10-09')).toEqual({ current: 2, longest: 3, total: 13 });
  });

  test('a streak still counts today if today has nothing yet but yesterday did', () => {
    expect(streaks(days([0, 1, 1, 0]), '2026-10-04').current).toBe(2);
  });

  test('two empty days in a row end the current streak', () => {
    expect(streaks(days([1, 1, 0, 0]), '2026-10-04').current).toBe(0);
  });
});

describe('nextContest', () => {
  const list = [
    { id: 1, name: 'Old Round', phase: 'FINISHED', startTimeSeconds: 100 },
    { id: 2, name: 'Later Round', phase: 'BEFORE', startTimeSeconds: 5_000 },
    { id: 3, name: 'Sooner Round', phase: 'BEFORE', startTimeSeconds: 2_000 },
  ];

  test('picks the soonest round that has not started', () => {
    expect(nextContest(list, 1_000)?.name).toBe('Sooner Round');
  });

  test('skips rounds whose start time has already passed', () => {
    expect(nextContest(list, 3_000)?.name).toBe('Later Round');
  });

  test('returns nothing when no round is scheduled', () => {
    expect(nextContest([list[0]], 1_000)).toBeNull();
  });
});

describe('countdown', () => {
  test.each([
    [(2 * 86400 + 4 * 3600 + 12 * 60 + 9) * 1000, '2d 04:12:09'],
    [(3 * 3600 + 5) * 1000, '03:00:05'],
    [-5000, 'starting now'],
  ])('%i ms reads as %s', (ms, text) => {
    expect(countdown(ms)).toBe(text);
  });
});

describe('latestRepo', () => {
  const repo = (name: string, pushed: string, fork = false) => ({ name, pushed_at: pushed, fork });

  test('picks the most recently pushed repo', () => {
    expect(latestRepo([repo('a', '2026-10-01T00:00:00Z'), repo('b', '2026-10-09T00:00:00Z')], [], 'me')?.name).toBe('b');
  });

  test('skips forks, hidden repos and the profile repo', () => {
    const r = latestRepo([repo('me', '2026-10-09T00:00:00Z'), repo('parley', '2026-10-08T00:00:00Z'), repo('fork', '2026-10-07T00:00:00Z', true), repo('kairo', '2026-10-01T00:00:00Z')], ['parley'], 'me');
    expect(r?.name).toBe('kairo');
  });
});
