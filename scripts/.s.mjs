import puppeteer from 'puppeteer-core';
const [,, path, sel, out, w = '1440'] = process.argv;
const browser = await puppeteer.launch({ executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', headless: 'new', args: ['--hide-scrollbars'] });
const page = await browser.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
await page.setViewport({ width: +w, height: 900, deviceScaleFactor: 2, isMobile: +w < 768 });
await page.goto('http://localhost:4330' + path, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 3000));
if (sel !== '-') { await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await new Promise((r) => setTimeout(r, 2500)); }
await page.screenshot({ path: '/private/tmp/claude-501/-Users-adityaraj-Library-Application-Support-Claude-scratch-workspaces-43612a00-3743-4c5a-b1d8-13a2db013aeb-de2f2215-e911-4de7-b2b9-c499f4ae9f5a-scratch-2026-10-20-4e702f/155386e2-98d7-4919-9022-0e616beb68f6/scratchpad/' + out });
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
