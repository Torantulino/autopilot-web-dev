// scrape-blog.mjs
// One-off, re-runnable migration tool: pulls the AutoGPT blog VERBATIM from the live
// Framer site (https://agpt.co/blog/<slug>) into local source the generator consumes.
//
//   node tools/scrape-blog.mjs
//
// For each post it captures the SEO surface (title, description, og/twitter, canonical,
// robots) + display meta (date, read time, author) and the article body, converting
// Framer's markup into clean semantic HTML. Images are downloaded into images/blog/<slug>/.
// Output: blog/posts.json (metadata) + blog/posts/<slug>.html (body fragments).
//
// Re-running is safe: raw pages are cached under .cache/blog/ so we don't re-hit the site.
// posts.json is hand-editable source of truth afterwards (tags especially — see TAGS below).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

const ROOT = new URL('../', import.meta.url);
const CACHE = new URL('.cache/blog/', ROOT);
const IMG_BASE = new URL('images/blog/', ROOT);

// Order matters: this is the reverse-chronological order shown on the live /blog index.
// `listed:false` posts exist at their URL + in the sitemap but are NOT shown on the index
// (we mirror that — the page still gets built so the URL keeps resolving).
const POSTS = [
  { slug: 'autogpt-partners-with-github-for-ai-security', listed: true },
  { slug: 'ai-writing-assistants', listed: true },
  { slug: '4-ways-to-make-money-with-ai', listed: true },
  { slug: 'how-to-integrate-ai-assistants-business-workflows-guide', listed: true },
  { slug: '10-tasks-to-automate-with-an-ai-assistant', listed: true },
  { slug: 'what-is-an-ai-assistant', listed: true },
  { slug: 'agentic-ai-explained', listed: true },
  { slug: 'ai-agents-explained', listed: true },
  { slug: 'introducing-agent-blocks', listed: false },
  { slug: 'introducing-the-autogpt-platform', listed: false },
];

// Category pills shown on each card, transcribed from the live /blog index (the two
// unlisted posts take the tags shown on their own pages). Kept here so re-runs are stable.
const TAGS = {
  'autogpt-partners-with-github-for-ai-security': ['News', 'Open Source', 'AI Agents', 'Governance'],
  'ai-writing-assistants': ['Education', 'AI Assistants', 'Automation', 'AI Tools'],
  '4-ways-to-make-money-with-ai': ['Education', 'AI and Business', 'Automation', 'AI Agents'],
  'how-to-integrate-ai-assistants-business-workflows-guide': ['Education', 'AI Assistants', 'Automation', 'Governance'],
  '10-tasks-to-automate-with-an-ai-assistant': ['Education', 'AI Assistants', 'AI Fundamentals', 'Automation'],
  'what-is-an-ai-assistant': ['Education', 'AI Assistants', 'AI Fundamentals', 'Automation'],
  'agentic-ai-explained': ['Education', 'AI Agents', 'Future of AI', 'Automation'],
  'ai-agents-explained': ['Education', 'AI Agents', 'AI Fundamentals', 'Future of AI'],
  'introducing-agent-blocks': ['News', 'AI Agents', 'Automation'],
  'introducing-the-autogpt-platform': ['News', 'AI Agents'],
};

const ensureDir = (url) => mkdirSync(typeof url === 'string' ? dirname(url) : url, { recursive: true });

async function getPage(slug) {
  ensureDir(CACHE);
  const cacheFile = new URL(`${slug}.html`, CACHE);
  if (existsSync(cacheFile)) return readFileSync(cacheFile, 'utf8');
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(`https://agpt.co/blog/${slug}`);
      if (!res.ok) throw new Error(`fetch ${slug} -> ${res.status}`);
      const html = await res.text();
      writeFileSync(cacheFile, html, 'utf8');
      return html;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  throw lastErr;
}

// ---------- head / SEO metadata ----------
const decode = (s) =>
  (s ?? '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

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
    twitterImage: meta(head, 'name', 'twitter:image'),
    robots: meta(head, 'name', 'robots'),
    canonical: canon ? canon[1] : null,
  };
}

// ---------- visible display meta (read time / date / author) from the hero ----------
// The read-time / date / author / author-title sit just AFTER the hero title (a big TOC
// block separates them from the article container). Anchor on an entity-safe prefix of the
// title so encoded characters (&amp; etc.) don't break the match.
function extractHeroMeta(html, title) {
  const safe = title.split(/[&<>"]/)[0].trim();
  const at = html.indexOf(safe, html.indexOf('</head>'));
  const contentStart = html.indexOf('id="scrollbartracker"');
  let region = at >= 0 ? html.slice(at, contentStart) : '';
  region = region.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '');
  const toks = decode(region.replace(/<[^>]+>/g, '|')).split('|').map((s) => s.trim()).filter(Boolean);
  const readTime = toks.find((t) => /\bread\b/i.test(t)) || null;
  const dateIdx = toks.findIndex((t) => /^[A-Z][a-z]{2,9}\.?\s+\d{1,2},\s*\d{4}$/.test(t));
  const date = dateIdx >= 0 ? toks[dateIdx] : null;
  const author = dateIdx >= 0 ? toks[dateIdx + 1] || null : null;
  const atRaw = dateIdx >= 0 ? toks[dateIdx + 2] || null : null;
  const authorTitle = atRaw && !/Table of contents/i.test(atRaw) ? atRaw : null;
  return { readTime, date, author, authorTitle };
}

// ---------- article body: balance-match the rich-text container, then clean ----------
function extractBodyInner(html) {
  const aIdx = html.indexOf('id="scrollbartracker"');
  if (aIdx < 0) throw new Error('no scrollbartracker container');
  const openEnd = html.indexOf('>', aIdx) + 1;
  let depth = 1;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = openEnd;
  let m, end = html.length;
  while ((m = re.exec(html))) {
    if (m[0] === '</div>') { if (--depth === 0) { end = m.index; break; } }
    else depth++;
  }
  return html.slice(openEnd, end);
}

const norm = (s) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim().toLowerCase();

function cleanBody(inner, slug, imageJobs, title) {
  let h = inner;
  h = h.replace(/<!--[\s\S]*?-->/g, '');                 // framer SSR comments
  // Drop a leading h1/h2 that just repeats the title (it's already rendered in the hero).
  h = h.replace(/^\s*<(h[12])\b[^>]*>([\s\S]*?)<\/\1>/i, (m, _tag, inner2) =>
    norm(inner2) === norm(title) ? '' : m);

  // images -> download + local path, replacing the whole <img ...> tag
  h = h.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcset = (tag.match(/srcset=["']([^"']+)["']/i) || [])[1];
    const src = (tag.match(/\bsrc=["']([^"']+)["']/i) || [])[1];
    let url = src;
    if (srcset) { // pick the largest candidate
      const cands = srcset.split(',').map((s) => s.trim());
      url = cands[cands.length - 1].split(/\s+/)[0];
    }
    url = decode(url || '');
    const idm = url.match(/framerusercontent\.com\/images\/([^/?]+)/);
    const alt = decode((tag.match(/\balt=["']([^"']*)["']/i) || [])[1] || '');
    if (!idm) return alt ? `<img alt="${alt}" loading="lazy">` : '';
    const file = idm[1];
    imageJobs.set(file, `https://framerusercontent.com/images/${file}?scale-down-to=1600`);
    return `<img src="/images/blog/${slug}/${file}" alt="${alt}" loading="lazy">`;
  });

  h = h.replace(/<span[^>]*>/gi, '').replace(/<\/span>/gi, '');     // unwrap inline style spans
  h = h.replace(/<div[^>]*>/gi, '').replace(/<\/div>/gi, '');       // flatten image wrappers
  // Strip Framer attributes — but ONLY inside opening tags, never in body text. (A global
  // ` data-[\w-]+` strip would silently eat words like "data-driven"/"data-heavy" from prose.)
  const KEEP = new Set(['href', 'rel', 'src', 'alt', 'loading', 'title', 'colspan', 'rowspan', 'start', 'type']);
  h = h.replace(/<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^<>]*)?)\s*\/?>/g, (m, tag, attrs) => {
    if (!attrs) return `<${tag}>`;
    let kept = '';
    const re = /\s([a-zA-Z_:][\w:.-]*)(="[^"]*"|='[^']*'|)/g;
    let a;
    while ((a = re.exec(attrs))) if (KEEP.has(a[1].toLowerCase())) kept += ` ${a[1]}${a[2]}`;
    return `<${tag}${kept}>`;
  });
  h = h.replace(/<br\s*\/?>\s*<\/p>/gi, '</p>');                    // trailing line breaks
  h = h.replace(/<p>\s*(?:<br\s*\/?>)?\s*<\/p>/gi, '');             // empty spacer paragraphs
  h = h.replace(/<(h[1-6])>\s*<strong>([\s\S]*?)<\/strong>\s*<\/\1>/gi, '<$1>$2</$1>'); // unwrap heading bold
  h = h.replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li>$1</li>');                 // li>p -> li
  h = h.replace(/href="\.\/blog\//g, 'href="/blog/');              // internal links absolute
  h = h.replace(/href="\.\//g, 'href="/');
  h = h.replace(/>\s+</g, '><').trim();                            // collapse inter-tag whitespace
  return h;
}

const visibleText = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

async function downloadImages(imageJobs, slug) {
  const dir = new URL(`${slug}/`, IMG_BASE);
  ensureDir(dir);
  for (const [file, url] of imageJobs) {
    const dest = new URL(file, dir);
    if (existsSync(dest)) continue;
    const res = await fetch(url);
    if (!res.ok) { console.warn(`  ! image ${file} -> ${res.status}`); continue; }
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
}

// ---------- run ----------
const out = [];
for (const { slug, listed } of POSTS) {
  const html = await getPage(slug);
  const head = extractHead(html);
  const hero = extractHeroMeta(html, head.ogTitle || head.title);
  const imageJobs = new Map();

  // hero/OG image -> self-host
  let heroImage = null;
  if (head.ogImage) {
    const idm = head.ogImage.match(/framerusercontent\.com\/images\/([^/?]+)/);
    if (idm) {
      imageJobs.set(idm[1], `https://framerusercontent.com/images/${idm[1]}?scale-down-to=1600`);
      heroImage = `images/blog/${slug}/${idm[1]}`;
    }
  }

  const bodyRaw = extractBodyInner(html);
  const body = cleanBody(bodyRaw, slug, imageJobs, head.ogTitle || head.title);
  await downloadImages(imageJobs, slug);

  // verbatim sanity: characters of visible text preserved (allowing the dropped <h1>)
  const srcText = visibleText(bodyRaw);
  const outText = visibleText(body);

  ensureDir(new URL('blog/posts/', ROOT));
  writeFileSync(new URL(`blog/posts/${slug}.html`, ROOT), body + '\n', 'utf8');

  out.push({
    slug, listed,
    title: head.ogTitle || head.title,
    htmlTitle: head.title,
    description: head.description,
    ogType: head.ogType,
    ogImage: heroImage ? `https://agpt.co/${heroImage}` : head.ogImage,
    twitterCard: head.twitterCard,
    robots: head.robots,
    canonical: head.canonical,
    date: hero.date,
    readTime: hero.readTime,
    author: hero.author,
    authorTitle: hero.authorTitle,
    heroImage,
    tags: TAGS[slug] || [],
  });

  console.log(`  ✓ ${slug}  (${outText.length} chars, +${srcText.length - outText.length} dropped, ${imageJobs.size} imgs)  ${hero.date} · ${hero.readTime} · ${hero.author}`);
}

writeFileSync(new URL('blog/posts.json', ROOT), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`\n  Wrote blog/posts.json (${out.length} posts)\n`);
