import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://me-adityaraj8.vercel.app',
  devToolbar: { enabled: false },
  // The old resume page now points at the PDF.
  redirects: { '/resume': '/resume.pdf' },
  integrations: [sitemap({ filter: (page) => !page.includes('/og/') })],
  // Astro dev can't run the Vercel function in /api, so in dev the assistant talks to the live one.
  vite: { server: { proxy: { '/api': { target: 'https://me-adityaraj8.vercel.app', changeOrigin: true } } } },
});
