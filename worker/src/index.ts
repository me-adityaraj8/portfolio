import { DurableObject } from 'cloudflare:workers';
import { allowPost, cleanMessage, signToken, verifyToken } from './logic';

export interface Env {
  ROOM: DurableObjectNamespace<Room>;
  /** The portfolio's address, e.g. https://adityaraj.dev. Nothing else may call this worker. */
  ALLOWED_ORIGIN: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  TOKEN_SECRET: string;
}

interface Entry { login: string; name: string; avatar: string; message: string; at: number }

/**
 * One room for the whole site. Live connections are WebSockets held with the
 * hibernation API, so an idle room costs nothing; the guestbook lives in the
 * room's own storage, which keeps it consistent without a separate database.
 */
export class Room extends DurableObject<Env> {
  async fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname === '/presence') {
      const [client, server] = Object.values(new WebSocketPair());
      this.ctx.acceptWebSocket(server);
      this.broadcast();
      return new Response(null, { status: 101, webSocket: client });
    }
    if (url.pathname === '/guestbook' && request.method === 'GET') {
      return Response.json((await this.ctx.storage.get<Entry[]>('entries')) ?? []);
    }
    if (url.pathname === '/guestbook' && request.method === 'POST') {
      const entry = (await request.json()) as Entry;
      const last = await this.ctx.storage.get<number>(`last:${entry.login}`);
      if (!allowPost(last, entry.at)) return Response.json({ error: 'You can sign again in a few minutes.' }, { status: 429 });
      const entries = [entry, ...((await this.ctx.storage.get<Entry[]>('entries')) ?? []).filter((e) => e.login !== entry.login)].slice(0, 100);
      await this.ctx.storage.put({ entries, [`last:${entry.login}`]: entry.at });
      return Response.json(entries);
    }
    return new Response('Not found', { status: 404 });
  }

  /** Tells everyone how many people are here, not counting a socket that's on its way out. */
  broadcast(leaving?: WebSocket) {
    const sockets = this.ctx.getWebSockets().filter((ws) => ws !== leaving && ws.readyState === WebSocket.OPEN);
    for (const ws of sockets) ws.send(JSON.stringify({ here: sockets.length }));
  }
  webSocketClose(ws: WebSocket, code: number) {
    try { ws.close(code === 1005 ? 1000 : code, 'bye'); } catch { /* already closed */ }
    this.broadcast(ws);
  }
  webSocketError(ws: WebSocket) { this.broadcast(ws); }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cors = { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', Vary: 'Origin' };
    const room = env.ROOM.get(env.ROOM.idFromName('site'));
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS') return new Response(null, { headers: { ...cors, 'Access-Control-Allow-Methods': 'GET, POST' } });

    if (url.pathname === '/presence') {
      if (origin !== env.ALLOWED_ORIGIN) return new Response('Forbidden', { status: 403 });
      return room.fetch(request);
    }

    if (url.pathname === '/guestbook' && request.method === 'GET') {
      const res = await room.fetch(new Request(new URL('/guestbook', url)));
      return new Response(res.body, { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/guestbook' && request.method === 'POST') {
      if (origin !== env.ALLOWED_ORIGIN) return new Response('Forbidden', { status: 403 });
      const user = await verifyToken((request.headers.get('Authorization') ?? '').replace(/^Bearer /, ''), env.TOKEN_SECRET, Date.now());
      if (!user) return Response.json({ error: 'Sign in with GitHub again.' }, { status: 401, headers: cors });
      const cleaned = cleanMessage(String(((await request.json().catch(() => ({}))) as { message?: string }).message ?? ''));
      if (!cleaned.ok) return Response.json({ error: cleaned.error }, { status: 400, headers: cors });
      const entry: Entry = { login: String(user.login), name: String(user.name ?? user.login), avatar: String(user.avatar), message: cleaned.text, at: Date.now() };
      const res = await room.fetch(new Request(new URL('/guestbook', url), { method: 'POST', body: JSON.stringify(entry) }));
      return new Response(res.body, { status: res.status, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Sign in with GitHub: a popup comes here, goes to GitHub, and returns a token to the site.
    if (url.pathname === '/auth/github') {
      const state = crypto.randomUUID();
      const to = new URL('https://github.com/login/oauth/authorize');
      to.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      to.searchParams.set('redirect_uri', new URL('/auth/callback', url).toString());
      to.searchParams.set('state', state);
      to.searchParams.set('scope', 'read:user');
      return new Response(null, { status: 302, headers: { Location: to.toString(), 'Set-Cookie': `gb_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/auth; Max-Age=600` } });
    }

    if (url.pathname === '/auth/callback') {
      const state = url.searchParams.get('state');
      const cookie = request.headers.get('Cookie')?.match(/gb_state=([^;]+)/)?.[1];
      if (!state || state !== cookie) return new Response('Sign-in expired. Close this window and try again.', { status: 400 });
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code: url.searchParams.get('code') }),
      });
      const { access_token } = (await tokenRes.json()) as { access_token?: string };
      if (!access_token) return new Response('GitHub did not sign you in. Close this window and try again.', { status: 400 });
      const gh = (await (await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'portfolio-guestbook' } })).json()) as { login: string; name?: string; avatar_url: string };
      const token = await signToken({ login: gh.login, name: gh.name ?? gh.login, avatar: gh.avatar_url }, env.TOKEN_SECRET, Date.now());
      // Only the portfolio's own window may receive the token.
      const html = `<!doctype html><meta charset="utf-8"><title>Signed in</title><script>window.opener&&window.opener.postMessage({guestbookToken:${JSON.stringify(token)}},${JSON.stringify(env.ALLOWED_ORIGIN)});window.close();</script><p>Signed in. You can close this window.</p>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Not found', { status: 404 });
  },
};
