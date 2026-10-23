import { describe, expect, test } from 'vitest';
import { hillsFromRepos, type Repo } from './github';

const repo = (over: Partial<Repo>): Repo => ({
  name: 'thing', createdAt: '2026-08-22T10:00:00Z', description: 'Does a thing', language: 'TypeScript',
  isFork: false, isPrivate: false, url: 'https://github.com/me/thing', homepage: null, commits: 12, ...over,
});

describe('hillsFromRepos', () => {
  test('new public work becomes a hill dated by when the repo was created', () => {
    expect(hillsFromRepos([repo({})], [], 'me')).toEqual([
      { slug: 'gh-thing', title: 'thing', date: '2026-08-22', summary: 'Does a thing', commits: 12, url: 'https://github.com/me/thing' },
    ]);
  });

  test('skips forks, private repos and the profile README repo', () => {
    const r = hillsFromRepos([repo({ name: 'a', isFork: true }), repo({ name: 'b', isPrivate: true }), repo({ name: 'Me', url: 'https://github.com/me/Me' })], [], 'me');
    expect(r).toEqual([]);
  });

  test('skips repos that already have a hand-written page', () => {
    const r = hillsFromRepos([repo({ url: 'https://github.com/me/Thing' })], ['https://github.com/me/thing/'], 'me');
    expect(r).toEqual([]);
  });

  test('skips empty repos with no description and no language', () => {
    expect(hillsFromRepos([repo({ description: null, language: null })], [], 'me')).toEqual([]);
  });

  test('describes a repo by its language when it has no description', () => {
    expect(hillsFromRepos([repo({ name: 'cp', description: null, language: 'C++' })], [], 'me')[0].summary).toBe('C++ repository');
  });
});
