// scrape-legal.mjs
// Migrates the legal pages VERBATIM from the live Framer site (https://agpt.co/legal/<slug>)
// into local source the generator consumes. Legal text is critical: this preserves every
// character. Output: legal/pages.json (metadata) + legal/pages/<slug>.html (body fragments).
//
//   node tools/scrape-legal.mjs
//
// Structure notes (differ from the blog):
//  - Each page's body lives in one or more large `RichTextContainer` divs between the title
//    `data-framer-name="Header"` block and the footer (`Footer banners` / `Sunset_BG_1`).
//  - The privacy policy renders every block TWICE (responsive SSR variants) — we de-dupe
//    consecutive identical containers so nothing is duplicated.
//  - The contact email is Cloudflare-obfuscated (`data-cfemail`); we decode it back to the
//    real address so the contact clause isn't lost.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

const ROOT = new URL('../', import.meta.url);
const CACHE = new URL('.cache/legal/', ROOT);
const IMG_BASE = new URL('images/legal/', ROOT);

const SLUGS = ['platform-terms-of-use', 'platform-privacy-policy', 'agent-jam-terms-and-conditions'];

const ensureDir = (url) => mkdirSync(typeof url === 'string' ? dirname(url) : url, { recursive: true });

async function getPage(slug) {
  ensureDir(CACHE);
  const cacheFile = new URL(`${slug}.fetch.html`, CACHE);
  if (existsSync(cacheFile)) return readFileSync(cacheFile, 'utf8');
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(`https://agpt.co/legal/${slug}`);
      if (!res.ok) throw new Error(`fetch ${slug} -> ${res.status}`);
      const html = await res.text();
      writeFileSync(cacheFile, html, 'utf8');
      return html;
    } catch (e) { lastErr = e; await new Promise((r) => setTimeout(r, 800 * attempt)); }
  }
  throw lastErr;
}

const decode = (s) =>
  (s ?? '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&rsquo;|&#8217;/g, '’').replace(/&lsquo;/g, '‘').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// ---------- head / SEO metadata ----------
function meta(html, attr, name) {
  const re = new RegExp(`<meta[^>]*\\b${attr}=["']${name}["'][^>]*\\bcontent=["']([^"']*)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]*\\bcontent=["']([^"']*)["'][^>]*\\b${attr}=["']${name}["']`, 'i');
  const m = html.match(re) || html.match(re2);
  return m ? decode(m[1]) : null;
}
function extractHead(html) {
  const head = html.slice(0, html.indexOf('</head>'));
  const titleM = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const canon = head.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  return {
    title: decode(titleM ? titleM[1].trim() : ''),
    description: meta(head, 'name', 'description'),
    ogType: meta(head, 'property', 'og:type'),
    ogTitle: meta(head, 'property', 'og:title'),
    ogDescription: meta(head, 'property', 'og:description'),
    ogImage: meta(head, 'property', 'og:image'),
    twitterCard: meta(head, 'name', 'twitter:card'),
    robots: meta(head, 'name', 'robots'),
    canonical: canon ? canon[1] : null,
  };
}

// ---------- content extraction ----------
function matchDiv(html, openIdx) {
  const openEnd = html.indexOf('>', openIdx) + 1;
  let depth = 1; const re = /<div\b|<\/div>/g; re.lastIndex = openEnd; let m, end = html.length;
  while ((m = re.exec(html))) { if (m[0] === '</div>') { if (--depth === 0) { end = m.index; break; } } else depth++; }
  return html.slice(openEnd, end);
}
const stripText = (h) => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function extractContentHtml(html) {
  const headerPos = html.indexOf('data-framer-name="Header"');
  if (headerPos < 0) throw new Error('no Header');
  const footerPos = Math.min(...['data-framer-name="Footer banners"', 'data-framer-name="Sunset_BG_1"', 'data-framer-name="Footer"']
    .map((s) => html.indexOf(s, headerPos)).filter((i) => i > 0));
  const re = /<div\b[^>]*data-framer-component-type="RichTextContainer"[^>]*>/g;
  let m; const blocks = [];
  while ((m = re.exec(html))) {
    if (m.index < headerPos || m.index >= footerPos) continue;
    blocks.push(matchDiv(html, m.index));
  }
  // de-dupe consecutive identical (responsive SSR variants)
  const kept = [];
  let prevText = null;
  for (const b of blocks) { const t = stripText(b); if (t === prevText) continue; kept.push(b); prevText = t; }
  return kept.join('\n');
}

// ---------- cleaning (preserve every character of text) ----------
function cfDecode(hex) {
  const k = parseInt(hex.slice(0, 2), 16);
  let s = '';
  for (let i = 2; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ k);
  return s;
}

const KEEP_ATTR = new Set(['href', 'rel', 'src', 'alt', 'loading', 'title', 'colspan', 'rowspan', 'start', 'type']);

function clean(content) {
  let h = content;
  h = h.replace(/<!--[\s\S]*?-->/g, '');
  // restore Cloudflare-obfuscated emails -> real mailto
  h = h.replace(/<(a|span)\b[^>]*\bdata-cfemail="([0-9a-fA-F]+)"[^>]*>[\s\S]*?<\/\1>/gi,
    (m, tag, hex) => { const e = cfDecode(hex); return `<a href="mailto:${e}">${e}</a>`; });
  h = h.replace(/href="\/cdn-cgi\/l\/email-protection[^"]*"/gi, ''); // stray cf hrefs
  h = h.replace(/<span\b[^>]*>/gi, '').replace(/<\/span>/gi, '');     // unwrap inline spans
  h = h.replace(/<div\b[^>]*>/gi, '').replace(/<\/div>/gi, '');       // flatten wrappers
  // strip attributes only inside opening tags (never touch body text)
  h = h.replace(/<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^<>]*)?)\s*\/?>/g, (m, tag, attrs) => {
    if (!attrs) return `<${tag}>`;
    let kept = ''; const re = /\s([a-zA-Z_:][\w:.-]*)(="[^"]*"|='[^']*'|)/g; let a;
    while ((a = re.exec(attrs))) if (KEEP_ATTR.has(a[1].toLowerCase())) kept += ` ${a[1]}${a[2]}`;
    return `<${tag}${kept}>`;
  });
  h = h.replace(/<br\s*\/?>\s*(<\/(?:h[1-6]|p|li)>)/gi, '$1');        // trailing line breaks
  h = h.replace(/<(h[1-6]|p)>\s*(?:<br\s*\/?>)?\s*<\/\1>/gi, '');     // empty spacer blocks
  // internal legal cross-links -> migrated relative paths; other ./ links -> root-relative
  h = h.replace(/href="\.\/(platform-terms-of-use|platform-privacy-policy|agent-jam-terms-and-conditions)"/g, 'href="../$1/"');
  h = h.replace(/href="\.\/blog\//g, 'href="../../blog/"').replace(/href="\.\//g, 'href="../../');
  h = h.replace(/>\s+</g, '><').trim();
  return h;
}

// ---------- run ----------
const out = [];
for (const slug of SLUGS) {
  const html = await getPage(slug);
  const head = extractHead(html);
  const contentRaw = extractContentHtml(html);
  const body = clean(contentRaw);

  // self-host og image
  let ogImage = head.ogImage;
  if (head.ogImage) {
    const idm = head.ogImage.match(/framerusercontent\.com\/(?:images|assets)\/([^/?"]+)/);
    if (idm) {
      ensureDir(IMG_BASE);
      const dest = new URL(idm[1], IMG_BASE);
      if (!existsSync(dest)) {
        const r = await fetch(`https://framerusercontent.com/images/${idm[1]}?scale-down-to=1200`);
        if (r.ok) writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
      }
      ogImage = `https://agpt.co/images/legal/${idm[1]}`;
    }
  }

  ensureDir(new URL('legal/pages/', ROOT));
  writeFileSync(new URL(`legal/pages/${slug}.html`, ROOT), body + '\n', 'utf8');

  out.push({
    slug,
    title: head.ogTitle || head.title,
    htmlTitle: head.title,
    description: head.description,
    ogType: head.ogType || 'website',
    ogImage,
    twitterCard: head.twitterCard,
    robots: head.robots,
    canonical: head.canonical || `https://agpt.co/legal/${slug}`,
  });

  const txt = stripText(body);
  console.log(`  ✓ ${slug}  body ${txt.length} chars`);
}

writeFileSync(new URL('legal/pages.json', ROOT), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`\n  Wrote legal/pages.json (${out.length} pages)\n`);
