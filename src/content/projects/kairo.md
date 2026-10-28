---
architecture:
  nodes:
    - { id: ui, label: Next.js client, sub: sends a quest ID only, col: 0, row: 0, tone: client }
    - { id: route, label: Route handler, sub: session → Zod → owner, col: 1, row: 0 }
    - { id: tx, label: Reward transaction, sub: guarded updateMany, col: 1, row: 1 }
    - { id: db, label: Postgres on Neon, sub: via Prisma, col: 2, row: 1, tone: data }
    - { id: after, label: After commit, sub: chests · achievements · bond, col: 0, row: 1 }
    - { id: auth, label: NextAuth, sub: Google · GitHub · email, col: 2, row: 0, tone: ext }
  edges:
    - [ui, route]
    - [route, auth]
    - [route, tx]
    - [tx, db]
    - [tx, after, then]
order: 5
accent: ['#a855f7', '#f59e0b']
shot: /shots/kairo.webp
demo: site
title: Kairo
date: 2026-09-12
kind: project
summary: A task tracker built as a game, where real tasks become quests that pay out XP and gold.
role: Solo, end to end
stack: [TypeScript, Next.js 14, Prisma, PostgreSQL (Neon), NextAuth, Tailwind]
facts:
  - All reward maths runs on the server, and the completion endpoint takes no request body
  - Quests are claimed atomically, so double completion is impossible even under concurrent requests
  - Focus-session time is verified on the server
commits: 43
links:
  live: https://kairo-olive-beta.vercel.app
  code: https://github.com/me-adityaraj8/kairo
---

## The idea

Your to-do list, but it keeps score. Tasks become quests with XP, gold, streaks, chests and a companion that reacts to what you do.

## Rewards you can't forge

A game layer is only motivating if it can't be cheated, so every reward is computed on the server. The completion endpoint takes no request body at all: the client sends only a quest ID and can't submit XP, gold, level or difficulty.

A quest is claimed with a guarded `updateMany`, which makes double completion impossible even when requests race. Only the reward itself runs inside the transaction. Challenges, achievements, chests and companion progress are derived afterwards, so a slow database can't cost a player their XP.

Every protected route follows the same order: session check (401), Zod parse (400), ownership check (403), transaction, response. Errors never leak a stack trace.

## Try it

The live app has a one-click demo account that starts at level 4 and cleans itself up after a day.
