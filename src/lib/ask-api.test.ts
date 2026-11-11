import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../../api/ask';

const req = (body: unknown) => new Request('https://example.test/api/ask', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) });

describe('POST /api/ask', () => {
  beforeEach(() => { delete process.env.GEMINI_API_KEY; });
  it('rejects a malformed request', async () => {
    expect((await POST(req('not json'))).status).toBe(400);
    expect((await POST(req({ messages: [] }))).status).toBe(400);
  });
  it('says it is offline when no key is set, so the panel can fall back', async () => {
    const res = await POST(req({ messages: [{ role: 'user', content: 'What has he built?' }] }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'offline' });
  });
});
