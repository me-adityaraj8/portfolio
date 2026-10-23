// Prints /resume to public/resume.pdf. Needs the dev or preview server running,
// and a Chromium-based browser (set CHROME_PATH if it isn't in the usual place).
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const candidates = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) { console.error('No Chromium-based browser found. Set CHROME_PATH.'); process.exit(1); }
const url = process.env.RESUME_URL ?? 'http://localhost:4321/resume';
const browser = await puppeteer.launch({ executablePath, headless: 'new' });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle0' });
await page.pdf({ path: fileURLToPath(new URL('../public/resume.pdf', import.meta.url)), format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('wrote public/resume.pdf');
