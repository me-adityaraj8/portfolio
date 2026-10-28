import { describe, expect, it } from 'vitest';
import { MAX_MESSAGE, validateMessage } from './message';

const ok = { name: 'Priya', email: 'priya@example.com', message: 'Loved Kairo. Are you free for a chat about an internship?' };

describe('validateMessage', () => {
  it('accepts a complete message', () => {
    expect(validateMessage(ok)).toEqual({});
  });
  it('asks for a name', () => {
    expect(validateMessage({ ...ok, name: '   ' }).name).toBe('Add your name, so I know who wrote.');
  });
  it('asks for a reply address and checks its shape', () => {
    expect(validateMessage({ ...ok, email: '' }).email).toBe('Add an email so I can reply.');
    expect(validateMessage({ ...ok, email: 'priya@' }).email).toBe("That email doesn't look complete.");
  });
  it('wants a message of at least a few words', () => {
    expect(validateMessage({ ...ok, message: 'hi' }).message).toBe('Write a little more, at least 10 characters.');
  });
  it('caps the length', () => {
    expect(validateMessage({ ...ok, message: 'a'.repeat(MAX_MESSAGE + 1) }).message).toBe(`Keep it under ${MAX_MESSAGE} characters.`);
    expect(validateMessage({ ...ok, message: 'a'.repeat(MAX_MESSAGE) }).message).toBeUndefined();
  });
});
