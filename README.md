# Aditya Raj, portfolio

My portfolio site. Every card in the proof-of-work grid opens the real app live, or runs its core idea right in the page.

Astro and TypeScript, no UI framework. The hero's dot field, the cursor and the demos are plain TypeScript.

## Run it

```sh
npm install
npm run dev        # http://localhost:4321
npm test
npm run build
```

## Add a project

Add a Markdown file to `src/content/projects/`. The body is the case study. In the frontmatter:

- `order` puts it in the grid. Without it, the project goes under "More on GitHub".
- `accent` is two colours for the card's backdrop, and `shot` is a screenshot in `public/shots/`.
- `demo` is what opens on click: `site` embeds `links.live`, `qr` runs the QR demo.
- `architecture` draws the boxes-and-arrows diagram on the case study page.

## Keep the data fresh

```sh
GITHUB_TOKEN=$(gh auth token) npm run sync   # public repos and languages
npm run sync:cp        # Codeforces and LeetCode ratings
npm run sync:contrib   # contribution calendar
npm run sync:snippets  # the code under "Code I'm proud of", pinned to a commit
npm run resume:pdf     # prints /resume to public/resume.pdf (dev server running)
```

Private repos are never written to the synced files. The Codolio totals in `src/data/cp.json` are a dated snapshot, updated by hand.

## Live bits

- The visit count works as is.
- The guestbook and "here now" need the Cloudflare Worker in `worker/` deployed. Set `PUBLIC_LIVE_URL` to its address and they switch on.
- "Last played" reads from Last.fm once `lastfm.user` and `lastfm.apiKey` are set in `src/data/site.ts`. Until then it rotates through a list of songs.

## Shortcuts

`⌘K` search, `T` theme, `V` the 30-second view, `?` the list. There's also a word worth typing.
