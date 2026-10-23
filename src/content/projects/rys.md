---
architecture:
  nodes:
    - { id: ui, label: React 18 client, sub: TanStack Query · Zustand, col: 0, row: 0, tone: client }
    - { id: mw, label: Express API, sub: auth → demo guard → Zod, col: 1, row: 0 }
    - { id: dal, label: Data layer, sub: typed raw SQL, col: 1, row: 1 }
    - { id: pg, label: PostgreSQL 16, col: 0, row: 1, tone: data }
    - { id: ai, label: AI gateway, sub: Gemini · Groq · OpenRouter, col: 2, row: 0, tone: ext }
  edges:
    - [ui, mw, JWT]
    - [mw, dal]
    - [dal, pg, SQL]
    - [mw, ai, optional]
order: 5
accent: ['#3b82f6', '#8b5cf6']
shot: /shots/rys.webp
demo: site
title: Rys
date: 2026-07-06
kind: project
summary: A keyboard-first job-search workspace, with a kanban pipeline, resume tracking and AI help.
role: Solo, end to end
stack: [TypeScript, React 18, Node.js 22, Express, PostgreSQL 16, TanStack Query, Zustand, Zod]
facts:
  - Every request passes the same pipeline (auth, demo guard, Zod validation) and every error returns one JSON shape
  - Typed raw SQL instead of an ORM
  - The AI layer is optional, with a mock mode when no key is set
commits: 57
links:
  live: https://rys-eight.vercel.app
  code: https://github.com/me-adityaraj8/career-os
---

## The problem

A job search lives in five places at once: a spreadsheet of applications, a folder of resume versions, interview notes and a list of people you've talked to. Rys puts it in one workspace you can drive from the keyboard.

## How it's built

A three-tier app: a React 18 frontend with TanStack Query for server state and Zustand for local state, an Express and TypeScript API, and PostgreSQL 16 underneath. In production one container serves both the frontend and the API.

Every request goes through the same gauntlet: `requireAuth`, a demo guard that keeps the public demo account read-safe, and Zod validation, before it reaches a controller. Errors at any layer are normalised into a single envelope, `{ error: { code, message, details? } }`, so the frontend handles failure in one place.

The data layer is typed raw SQL rather than an ORM, which keeps the queries visible and fast.

## AI without a hard dependency

The AI features (resume feedback and help with applications) go through a gateway that can talk to Gemini, Groq or OpenRouter. Without a key it falls back to a mock mode, so the app still runs end to end.
