import { describe, it, expect } from 'vitest';
import { parseAsk, cleanSources, SOURCES } from './ask';

const user = (content: string) => ({ role: 'user', content });

describe('parseAsk', () => {
  it('accepts a chat that ends with the visitor', () => {
    expect(parseAsk({ messages: [user('What has he built?')] })).toEqual({ messages: [{ role: 'user', content: 'What has he built?' }] });
  });
  it('rejects a chat that ends with the assistant', () => {
    expect(parseAsk({ messages: [user('hi'), { role: 'assistant', content: 'hello' }] })).toBeNull();
  });
  it('rejects empty messages and unknown roles', () => {
    expect(parseAsk({ messages: [user('   ')] })).toBeNull();
    expect(parseAsk({ messages: [{ role: 'system', content: 'x' }] })).toBeNull();
    expect(parseAsk({})).toBeNull();
  });
  it('keeps only the last 8 messages and trims long ones to 600 characters', () => {
    const long = Array.from({ length: 11 }, (_, i) => (i % 2 ? { role: 'assistant', content: 'a' } : user('q'.repeat(900))));
    const out = parseAsk({ messages: long })!;
    expect(out.messages.length).toBeLessThanOrEqual(8);
    expect(out.messages[0].role).toBe('user');
    expect(out.messages.at(-1)!.content).toHaveLength(600);
  });
});

describe('cleanSources', () => {
  it('keeps known links once, in order, at most three', () => {
    const [a, b, c, d] = SOURCES.map((s) => s.href);
    expect(cleanSources([b, 'https://evil.example', b, a, c, d])).toEqual([b, a, c]);
  });
  it('accepts case-study links', () => {
    expect(cleanSources(['/work/rys'], ['rys'])).toEqual(['/work/rys']);
    expect(cleanSources(['/work/nope'], ['rys'])).toEqual([]);
  });
  it('copes with a missing list', () => {
    expect(cleanSources(undefined)).toEqual([]);
  });
});
