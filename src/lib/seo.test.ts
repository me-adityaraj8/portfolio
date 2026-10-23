import { describe, expect, it } from 'vitest';
import { absoluteUrl, personJsonLd, profileLinks } from './seo';

describe('absoluteUrl', () => {
  it('joins a path onto the site address', () => {
    expect(absoluteUrl('/og/home.png', 'https://me-adityaraj8.vercel.app')).toBe('https://me-adityaraj8.vercel.app/og/home.png');
  });
  it('keeps the path when there is no site address', () => {
    expect(absoluteUrl('/og/home.png', undefined)).toBe('/og/home.png');
  });
});

describe('profileLinks', () => {
  it('builds the coding profile URLs from the handles', () => {
    expect(profileLinks({ codeforces: 'FierceSpartan', leetcode: 'me_adityaraj8', codolio: 'me.adityaraj8' })).toEqual([
      'https://codeforces.com/profile/FierceSpartan',
      'https://leetcode.com/u/me_adityaraj8/',
      'https://codolio.com/profile/me.adityaraj8',
    ]);
  });
});

describe('personJsonLd', () => {
  const ld = personJsonLd({
    name: 'Aditya Raj', url: 'https://me-adityaraj8.vercel.app', email: 'me.adityaraj8@gmail.com', jobTitle: 'Software engineer',
    school: 'Indian Institute of Information Technology, Bhagalpur', sameAs: ['https://github.com/me-adityaraj8'],
  });
  it('describes a schema.org Person', () => {
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Person');
    expect(ld.name).toBe('Aditya Raj');
  });
  it('links the profiles and the school', () => {
    expect(ld.sameAs).toEqual(['https://github.com/me-adityaraj8']);
    expect(ld.alumniOf).toEqual({ '@type': 'CollegeOrUniversity', name: 'Indian Institute of Information Technology, Bhagalpur' });
  });
  it('uses a mailto link and never a phone number', () => {
    expect(ld.email).toBe('mailto:me.adityaraj8@gmail.com');
    expect(JSON.stringify(ld)).not.toMatch(/telephone/);
  });
});
