import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { contrastRatio } from '../demos/contrast';

// Reads the colour tokens straight from the stylesheet, so this fails if someone dims text too far.
const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
const block = (selector: string) => css.slice(css.indexOf(selector)).split('}')[0];
const token = (b: string, name: string) => b.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];

describe.each([
  ['dark', ':root {'],
  ['light', "html[data-theme='light'] {"],
])('%s theme text contrast', (_name, selector) => {
  const b = block(selector);
  const bg = token(b, '--bg')!, card = token(b, '--card')!;

  test.each(['--ink', '--ink-2', '--ink-3', '--ink-4'])('%s is readable (WCAG AA, 4.5:1) on the page and on cards', (t) => {
    const fg = token(b, t)!;
    expect(fg).toBeDefined();
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(fg, card)).toBeGreaterThanOrEqual(4.5);
  });
});

// The custom cursor ring can't paint above an open <dialog> (top layer) and is hidden there,
// so dialogs have to bring the system pointer back or it vanishes.
test('dialogs show the system pointer', () => {
  const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({ sel: sel.trim(), body }));
  const cursorFor = (sel: string) => rules.find((r) => r.sel === sel)?.body.match(/cursor:\s*([\w-]+)/)?.[1];
  expect(cursorFor('html.fine dialog')).toBe('auto');
  expect(cursorFor('html.fine dialog :is(a, button)')).toBe('pointer');
});
