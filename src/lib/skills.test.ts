import { describe, expect, test } from 'vitest';
import { languageShare, usesTool } from './skills';

describe('usesTool', () => {
  test.each([
    [['TypeScript', 'React 18', 'Node.js 22'], 'React', true],
    [['Next.js 14', 'Prisma'], 'Next.js', true],
    [['PostgreSQL (Neon)'], 'PostgreSQL', true],
    [['Tailwind'], 'Tailwind', true],
    [['React 19'], 'Next.js', false],
    [['JavaScript'], 'Java', false],
  ])('%j uses %s: %s', (stack, tool, want) => {
    expect(usesTool(stack, tool)).toBe(want);
  });
});

describe('languageShare', () => {
  test('adds bytes across repos and turns them into whole percentages, largest first', () => {
    const r = languageShare([{ TypeScript: 600, CSS: 100 }, { TypeScript: 200, 'C++': 100 }]);
    expect(r).toEqual([
      { name: 'TypeScript', pct: 80 },
      { name: 'CSS', pct: 10 },
      { name: 'C++', pct: 10 },
    ]);
  });

  test('folds anything under 2% into Other', () => {
    const r = languageShare([{ TypeScript: 980, Shell: 10, Dockerfile: 10 }]);
    expect(r).toEqual([{ name: 'TypeScript', pct: 98 }, { name: 'Other', pct: 2 }]);
  });

  test('leaves Other out when it rounds to nothing', () => {
    const r = languageShare([{ TypeScript: 9990, Shell: 4 }]);
    expect(r).toEqual([{ name: 'TypeScript', pct: 100 }]);
  });

  test('is empty with no data', () => {
    expect(languageShare([])).toEqual([]);
  });
});
