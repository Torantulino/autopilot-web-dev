// gen-footer.mjs
// Injects the shared site footer (../partials/footer.html) into BOTH ../index.html and
// ../pricing.html between the FOOTER:START/END markers, so the footer (brand, socials, nav)
// stays in sync across both pages from a single source.
//
//   node tools/gen-footer.mjs
//
// partials/footer.html is the single source of truth. Edit it and re-run this script;
// never hand-edit the footer between the markers in the HTML files.
//
// (Mirrors tools/gen-pricing-cards.mjs: same marker-replace inject() and fail-loud style.)

import { readFileSync, writeFileSync } from 'node:fs';

const PARTIAL = new URL('../partials/footer.html', import.meta.url);
const TARGETS = [
  { name: 'index.html', url: new URL('../index.html', import.meta.url) },
  { name: 'pricing.html', url: new URL('../pricing.html', import.meta.url) },
];

function fail(msg) {
  console.error('\n  ✗ ' + msg + '\n');
  process.exit(1);
}

// ---------- load + validate the partial ----------
// The footer sits at column 0 (it's a direct child of <body>); only drop trailing
// whitespace so the END marker isn't preceded by a blank line.
const footer = readFileSync(PARTIAL, 'utf8').replace(/\s+$/, '');

if (!/<footer[\s>]/.test(footer)) fail('Partial is missing its <footer> root element');
[
  'https://github.com/Significant-Gravitas/AutoGPT',
  'https://x.com/Auto_GPT',
  'https://discord.com/invite/autogpt',
  'https://www.reddit.com/r/AutoGPT/',
].forEach((url) => {
  if (!footer.includes(url)) fail(`Partial is missing the social link ${url}`);
});

// ---------- inject (marker-replace; mirrors tools/gen-pricing-cards.mjs) ----------
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function inject(html, key, content, eol) {
  const start = `<!-- ${key}:START -->`;
  const end = `<!-- ${key}:END -->`;
  // Capture the indentation in front of START so END lines up with it. Use a function
  // replacer (not a string) so any "$" inside the content isn't treated as a $n ref.
  const re = new RegExp('([ \\t]*)' + escRe(start) + '[\\s\\S]*?' + escRe(end));
  const m = html.match(re);
  if (!m) return null;
  const indent = m[1] || '';
  return html.replace(re, () => `${indent}${start}${eol}${content}${eol}${indent}${end}`);
}

// ---------- write each target ----------
const updated = [];
for (const t of TARGETS) {
  const html = readFileSync(t.url, 'utf8');
  const eol = html.includes('\r\n') ? '\r\n' : '\n';
  const next = inject(html, 'FOOTER', footer, eol);
  if (next == null) fail(`Marker FOOTER not found in ${t.name}`);
  writeFileSync(t.url, next, 'utf8');
  updated.push(t.name);
}

// ---------- report ----------
console.log('\n  ✓ Footer injected from partials/footer.html\n');
console.log('    Updated: ' + updated.join(', '));
console.log('');
