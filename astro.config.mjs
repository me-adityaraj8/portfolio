import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://me-adityaraj8.vercel.app',
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (page) => !page.includes('/og/') })],
});
