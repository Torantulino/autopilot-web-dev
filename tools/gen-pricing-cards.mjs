// gen-pricing-cards.mjs
// Injects the shared pricing-cards partial (../partials/pricing-cards.html) into
// BOTH ../pricing.html and ../index.html between the PRICING_CARDS:START/END markers,
// so the Pro/Max/Team cards on the home page stay in sync with the pricing page from
// a single source.
//
//   node tools/gen-pricing-cards.mjs
//
// partials/pricing-cards.html is the single source of truth. Edit it and re-run this
// script; never hand-edit the cards between the markers in the HTML files.
//
// (Mirrors tools/gen-feature-wall.mjs: same marker-replace inject() and fail-loud style.)

import { readFileSync, writeFileSync } from 'node:fs';

const PARTIAL = new URL('../partials/pricing-cards.html', import.meta.url);
const TARGETS = [
  { name: 'pricing.html', url: new URL('../pricing.html', import.meta.url) },
  { name: 'index.html', url: new URL('../index.html', import.meta.url) },
];

function fail(msg) {
  console.error('\n  ✗ ' + msg + '\n');
  process.exit(1);
}

// ---------- load + validate the partial ----------
// Keep the leading indentation (the markup sits at an 8-space base indent); only drop
// trailing whitespace so the END marker isn't preceded by a blank line.
const cards = readFileSync(PARTIAL, 'utf8').replace(/\s+$/, '');

const billingButtons = (cards.match(/data-billing=/g) || []).length;
if (billingButtons !== 2) fail(`Expected 2 billing-toggle buttons in the partial, got ${billingButtons}`);
['>Pro<', '>Max<', '>Team<'].forEach((needle) => {
  if (!cards.includes(needle)) fail(`Partial is missing the ${needle} card heading`);
});

// ---------- inject (marker-replace; mirrors tools/gen-feature-wall.mjs) ----------
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function inject(html, key, content, eol) {
  const start = `<!-- ${key}:START -->`;
  const end = `<!-- ${key}:END -->`;
  // Capture the indentation in front of START so END lines up with it. Use a function
  // replacer (not a string) so the "$" in the card prices isn't treated as a $n ref.
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
  const next = inject(html, 'PRICING_CARDS', cards, eol);
  if (next == null) fail(`Marker PRICING_CARDS not found in ${t.name}`);
  writeFileSync(t.url, next, 'utf8');
  updated.push(t.name);
}

// ---------- report ----------
console.log('\n  ✓ Pricing cards injected from partials/pricing-cards.html\n');
console.log('    Updated: ' + updated.join(', '));
console.log('');
