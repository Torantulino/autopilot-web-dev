// gen-feature-wall.mjs
// Parses ../pricing-features.md and injects the generated feature-wall content
// (highlight cards, category jump chips, and the 12 category rowgroups) into
// ../pricing.html between the CMP_* START/END markers.
//
//   node tools/gen-feature-wall.mjs
//
// The .md is the single source of truth. Edit it and re-run this script;
// never hand-edit the generated rows in pricing.html.

import { readFileSync, writeFileSync } from 'node:fs';

const MD = new URL('../pricing-features.md', import.meta.url);
const HTML = new URL('../pricing.html', import.meta.url);

// --- unicode literals (use escapes so this file is encoding-agnostic) ---
const STAR = '⭐';   // ⭐
const CHECK = '✓';  // ✓
const DASH = '—';   // —
const MIDDOT = '·'; // ·

const EXPECTED_COUNTS = [22, 20, 18, 21, 18, 17, 18, 8, 6, 5, 7, 13];
const SPLIT_NAMES = ['AutoPilot Chat Allowance', 'Support Level'];

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const stripCode = (s) => String(s).replace(/`/g, '');

function fail(msg) {
  console.error('\n  ✗ ' + msg + '\n');
  process.exit(1);
}

const usedSlugs = new Map();
function slugify(name) {
  let base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!base) base = 'feature';
  const n = (usedSlugs.get(base) || 0) + 1;
  usedSlugs.set(base, n);
  return n === 1 ? base : `${base}-${n}`;
}

// ---------- parse the markdown ----------
const md = readFileSync(MD, 'utf8');
const lines = md.split(/\r?\n/);

const catHeader = /^## (\d+)\.\s+(.+?)\s*$/;
const featLine = new RegExp(`^- (${STAR} )?\\*\\*(.+?)\\*\\* ${DASH} (.+?)\\s*$`);
const cellLine = new RegExp(
  '`Pro`\\s+(.+?)\\s*' + MIDDOT + '\\s*`Max`\\s+(.+?)\\s*' + MIDDOT + '\\s*`Self-Host`\\s+(.+?)\\s*$'
);

const categories = [];
let cur = null;

for (let n = 0; n < lines.length; n++) {
  const line = lines[n];
  if (/^## Appendix/.test(line)) break;

  const cm = line.match(catHeader);
  if (cm) {
    cur = { num: Number(cm[1]), id: `cat-${cm[1]}`, name: cm[2], note: '', features: [] };
    categories.push(cur);
    continue;
  }
  if (!cur) continue;

  if (/^>/.test(line)) {
    const t = line.replace(/^>\s?/, '').replace(/\*\*/g, '').trim();
    if (t) cur.note += (cur.note ? ' ' : '') + t;
    continue;
  }

  const fm = line.match(featLine);
  if (fm) {
    const cl = (lines[n + 1] || '').match(cellLine);
    if (!cl) fail(`No tier line for feature "${fm[2]}" (md line ${n + 1})`);
    cur.features.push({
      highlight: Boolean(fm[1]),
      name: fm[2],
      desc: stripCode(fm[3]).trim(),
      pro: cl[1].trim(),
      max: cl[2].trim(),
      self: cl[3].trim(),
    });
    n++; // consume the tier line
  }
}

// ---------- cell parsing / rendering ----------
function parseCell(raw) {
  raw = String(raw).trim();
  let note = null;
  const m = raw.match(/\*\((.+?)\)\*\s*$/); // trailing *(...)*
  if (m) {
    note = m[1].trim();
    raw = raw.slice(0, m.index).trim();
  }
  if (raw === CHECK) return { kind: 'check', note };
  if (raw === DASH || raw === '-') return { kind: 'dash', note };
  return { kind: 'value', value: raw, note };
}

const CHECK_SVG =
  '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>';

function valueInner(p, smallPill) {
  if (p.kind === 'check') return `<span class="cmp__check" role="img" aria-label="Included">${CHECK_SVG}</span>`;
  if (p.kind === 'dash') return `<span class="cmp__dash" role="img" aria-label="Not included">${DASH}</span>`;
  const cls = smallPill ? 'cmp__pill cmp__pill--sm' : 'cmp__pill';
  return `<span class="${cls}">${esc(p.value)}</span>`;
}

function noteSpan(p) {
  return p.note ? `<span class="cmp__note">(${esc(p.note)})</span>` : '';
}

function renderValueCell(raw) {
  const p = parseCell(raw);
  const inner = p.note
    ? `<span class="cmp__valwrap">${valueInner(p)}${noteSpan(p)}</span>`
    : valueInner(p);
  return `<div class="cmp__cell cmp__cell--val" role="cell">${inner}</div>`;
}

function renderCloudCell(pro, max) {
  if (pro === max) return renderValueCell(pro);
  // split (only the 2 differing rows)
  const splitRow = (tier, raw) => {
    const p = parseCell(raw);
    return `<span class="cmp__split-row"><span class="cmp__split-tier">${tier}</span>${valueInner(p, true)}${noteSpan(p)}</span>`;
  };
  return (
    `<div class="cmp__cell cmp__cell--val cmp__cell--split" role="cell">` +
    `<span class="cmp__split">${splitRow('Pro', pro)}${splitRow('Max', max)}</span>` +
    `</div>`
  );
}

// ---------- row / group / card rendering ----------
let rowIndex = 1; // plan header is aria-rowindex 1

function renderRow(f) {
  const slug = slugify(f.name);
  f.slug = slug;
  rowIndex++;
  const nameLower = stripCode(f.name).toLowerCase();
  const descLower = f.desc.toLowerCase();
  const star = f.highlight
    ? `<span class="cmp__star" aria-hidden="true">${STAR}</span><span class="cmp__sr-only">Highlighted feature. </span>`
    : '';
  const info =
    `<button type="button" class="cmp__info" aria-label="About ${attr(f.name)}" ` +
    `aria-expanded="false" aria-describedby="tip-${slug}" title="${attr(f.desc)}">` +
    `<svg class="cmp__info-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">` +
    `<circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
    `<path d="M10 9.2v4.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>` +
    `<circle cx="10" cy="6.5" r="1.05" fill="currentColor"/></svg></button>`;
  const feature =
    `<div class="cmp__cell cmp__cell--feature" role="rowheader">` +
    `<span class="cmp__feat">${star}<span class="cmp__feat-name">${esc(f.name)}</span>${info}</span>` +
    `<span role="tooltip" id="tip-${slug}" class="cmp__tip" hidden>${esc(f.desc)}</span>` +
    `</div>`;
  return (
    `<div class="cmp__row" role="row" id="row-${slug}" data-cat="${f.cat}" ` +
    `data-highlight="${f.highlight}" data-name="${attr(nameLower)}" data-desc="${attr(descLower)}" ` +
    `aria-rowindex="${rowIndex}">` +
    feature +
    renderCloudCell(f.pro, f.max) +
    renderValueCell(f.self) +
    `</div>`
  );
}

function renderGroup(cat) {
  const note = cat.note ? `\n        <p class="cmp__cat-note">${esc(cat.note)}</p>` : '';
  const rows = cat.features.map(renderRow).join('\n        ');
  return (
    `      <div class="cmp__group" role="rowgroup" id="${cat.id}" aria-labelledby="${cat.id}-h">\n` +
    `        <div class="cmp__cat" role="presentation">\n` +
    `          <div class="cmp__cat-head">\n` +
    `            <h3 class="cmp__cat-name" id="${cat.id}-h">${esc(cat.name)}</h3>\n` +
    `            <span class="cmp__cat-count">${cat.features.length}</span>\n` +
    `          </div>${note}\n` +
    `        </div>\n` +
    `        ${rows}\n` +
    `      </div>`
  );
}

function renderHighlightCard(f) {
  let vals = '';
  if (f.pro !== f.max) {
    const pp = parseCell(f.pro);
    const mp = parseCell(f.max);
    vals =
      `<span class="cmp__hl-vals">` +
      `<span class="cmp__pill cmp__pill--sm">Pro ${MIDDOT} ${esc(pp.value)}</span>` +
      `<span class="cmp__pill cmp__pill--sm">Max ${MIDDOT} ${esc(mp.value)}</span>` +
      `</span>`;
  }
  return (
    `<a class="cmp__hl-card" href="#row-${f.slug}" title="${attr(f.desc)}">` +
    `<span class="cmp__hl-star" aria-hidden="true">${STAR}</span>` +
    `<span class="cmp__hl-name">${esc(f.name)}</span>${vals}</a>`
  );
}

function renderChip(cat) {
  return (
    `<li><a class="cmp__chip" href="#${cat.id}" data-jump="${cat.id}">` +
    `${esc(cat.name)}<span class="cmp__chip-count">${cat.features.length}</span></a></li>`
  );
}

// ---------- assign cat + render ----------
categories.forEach((c) => c.features.forEach((f) => (f.cat = c.id)));

const groupsHtml = categories.map(renderGroup).join('\n');
const chipsHtml = categories.map(renderChip).join('\n          ');

const highlightFeats = [];
categories.forEach((c) => c.features.forEach((f) => { if (f.highlight) highlightFeats.push(f); }));
const highlightsHtml = highlightFeats.map(renderHighlightCard).join('\n        ');

// ---------- assertions (fail loud) ----------
const total = categories.reduce((a, c) => a + c.features.length, 0);
if (categories.length !== 12) fail(`Expected 12 categories, got ${categories.length}`);
categories.forEach((c, i) => {
  if (c.features.length !== EXPECTED_COUNTS[i])
    fail(`Category ${c.num} "${c.name}": expected ${EXPECTED_COUNTS[i]} rows, got ${c.features.length}`);
});
if (total !== 173) fail(`Expected 173 total rows, got ${total}`);
if (highlightFeats.length !== 16) fail(`Expected 16 highlight (${STAR}) rows, got ${highlightFeats.length}`);

const splitFeats = [];
categories.forEach((c) => c.features.forEach((f) => { if (f.pro !== f.max) splitFeats.push(f.name); }));
if (splitFeats.length !== 2) fail(`Expected exactly 2 Pro/Max split rows, got ${splitFeats.length}: ${splitFeats.join(', ')}`);
SPLIT_NAMES.forEach((nm) => { if (!splitFeats.includes(nm)) fail(`Expected split row "${nm}" not found (got: ${splitFeats.join(', ')})`); });

categories.forEach((c) => c.features.forEach((f) => {
  if (!f.pro || !f.max || !f.self) fail(`Row "${f.name}" has an empty tier cell`);
}));

const slugSet = new Set();
categories.forEach((c) => c.features.forEach((f) => {
  if (slugSet.has(f.slug)) fail(`Duplicate slug: ${f.slug}`);
  slugSet.add(f.slug);
}));

// soft cross-check vs the Highlights table at the top of the .md
const tableNames = [];
for (const line of lines) {
  if (/^## 1\./.test(line)) break;
  const m = line.match(/^\|\s*\d+\s*\|\s*\*\*(.+?)\*\*\s*\|/);
  if (m) tableNames.push(m[1].trim());
}
const bodyStarNames = new Set(highlightFeats.map((f) => f.name));
const tableMismatch = tableNames.filter((n) => !bodyStarNames.has(n));
if (tableNames.length && tableMismatch.length) {
  console.warn(`  ! Highlights-table names not matched by a body ${STAR} row (ok if wording differs): ${tableMismatch.join('; ')}`);
}

// ---------- inject into pricing.html ----------
function inject(html, key, content) {
  const start = `<!-- ${key}:START -->`;
  const end = `<!-- ${key}:END -->`;
  const re = new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!re.test(html)) fail(`Marker ${key} not found in pricing.html`);
  return html.replace(re, `${start}\n${content}\n        ${end}`);
}

let html = readFileSync(HTML, 'utf8');
html = inject(html, 'CMP_HIGHLIGHTS', '        ' + highlightsHtml);
html = inject(html, 'CMP_JUMP', '          ' + chipsHtml);
html = inject(html, 'CMP_GROUPS', groupsHtml);
writeFileSync(HTML, html, 'utf8');

// ---------- report ----------
console.log('\n  ✓ Feature wall generated and injected into pricing.html\n');
console.log('    Categories: 12   Rows: ' + total + '   Highlights: ' + highlightFeats.length + '   Split rows: ' + splitFeats.length);
categories.forEach((c) => {
  console.log('      ' + String(c.num).padStart(2) + '. ' + c.name.padEnd(34) + ' ' + String(c.features.length).padStart(3) + ' rows');
});
console.log('');
