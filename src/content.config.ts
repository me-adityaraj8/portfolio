import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** When the work started. Distance from Bhagalpur on the map comes from this. */
    date: z.coerce.date().transform((d) => d.toISOString().slice(0, 10)),
    /** venture and project get a chapter on the route; early work appears as small hills. */
    kind: z.enum(['venture', 'project', 'early']),
    summary: z.string(),
    role: z.string().optional(),
    stack: z.array(z.string()).default([]),
    facts: z.array(z.string()).default([]),
    /** Spot height on the map. */
    commits: z.number().int().nonnegative().optional(),
    links: z.object({ live: z.string().url().optional(), code: z.string().url().optional() }).default({}),
    private: z.boolean().default(false),
    /** Position in the proof-of-work grid. Work without an order goes in "More on GitHub". */
    order: z.number().int().optional(),
    /** Two colours for the card's backdrop gradient. */
    accent: z.tuple([z.string(), z.string()]).optional(),
    /** Screenshot of the live app, in src/assets/shots. */
    shot: z.string().optional(),
    /** What opens when the card is clicked: the live site, or an in-page demo. */
    demo: z.enum(['site', 'qr']).optional(),
    /** An architecture diagram for the case study: boxes on a grid, and the arrows between them. */
    architecture: z.object({
      nodes: z.array(z.object({ id: z.string(), label: z.string(), sub: z.string().optional(), col: z.number(), row: z.number(), tone: z.enum(['client', 'server', 'data', 'ext']).optional() })),
      edges: z.array(z.tuple([z.string(), z.string()]).or(z.tuple([z.string(), z.string(), z.string()]))),
    }).optional(),
  }),
});

export const collections = { projects };
