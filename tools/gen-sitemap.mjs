// gen-sitemap.mjs
// Generates sitemap.xml + robots.txt at the repo root so search engines keep finding
// every page after agpt.co cuts over from Framer to this static site.
//
//   node tools/gen-sitemap.mjs
//
// Blog URLs (and their lastmod) come from blog/posts.json, so the sitemap can't drift
// from the actual posts. Static pages are listed below — add to STATIC_PAGES when you
// add a top-level page. All locs are absolute on the production domain.

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const ORIGIN = 'https://agpt.co';
const posts = JSON.parse(readFileSync(new URL('blog/posts.json', ROOT), 'utf8'));
const legal = JSON.parse(readFileSync(new URL('legal/pages.json', ROOT), 'utf8'));

// Top-level pages this repo serves (in priority order). Keep in sync with the nav.
const STATIC_PAGES = [
  { path: '/' },
  { path: '/pricing.html' },
  { path: '/blog' },
];

const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
function toISO(d) {
  const m = (d || '').match(/^([A-Z][a-z]{2})\.?\s+(\d{1,2}),\s*(\d{4})$/);
  return m ? `${m[3]}-${MONTHS[m[1]]}-${String(m[2]).padStart(2, '0')}` : null;
}

// newest post date -> lastmod for the /blog index
const postDates = posts.map((p) => toISO(p.date)).filter(Boolean).sort();
const blogLastmod = postDates[postDates.length - 1] || null;

const urls = [];
for (const s of STATIC_PAGES) {
  urls.push({ loc: ORIGIN + s.path, lastmod: s.path === '/blog' ? blogLastmod : null });
}
// every post (listed AND unlisted — they all have live, indexable URLs)
for (const p of posts) {
  urls.push({ loc: `${ORIGIN}/blog/${p.slug}`, lastmod: toISO(p.date) });
}
// legal pages
for (const l of legal) {
  urls.push({ loc: `${ORIGIN}/legal/${l.slug}`, lastmod: null });
}

const body = urls
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`)
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
writeFileSync(new URL('sitemap.xml', ROOT), sitemap, 'utf8');

const robots = `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;
writeFileSync(new URL('robots.txt', ROOT), robots, 'utf8');

console.log(`\n  ✓ sitemap.xml (${urls.length} URLs) + robots.txt written`);
console.log(`    ${urls.map((u) => u.loc.replace(ORIGIN, '')).join('\n    ')}\n`);
