// gen-legal.mjs
// Builds the legal pages from local source (legal/pages.json + legal/pages/<slug>.html),
// wrapping each in the shared AutoGPT shell (sticky glass nav + footer) using the design
// system tokens. Mirrors gen-blog.mjs.
//
//   node tools/gen-legal.mjs
//
// Writes clean URLs:  legal/<slug>/index.html  ->  /legal/<slug>
// Paths are RELATIVE (depth 2: '../../') so they work under the GitHub Pages sub-path now
// and at the agpt.co root later. canonical + og:image stay absolute on agpt.co.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const pages = JSON.parse(readFileSync(new URL('legal/pages.json', ROOT), 'utf8'));

const escAttr = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escText = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function headChrome(root) {
  return `  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap" rel="stylesheet">
  <style>
    :root {
      --paper: #ffffff; --paper-deep: #F3F4F6; --paper-line: rgba(31,31,32,0.10);
      --ink-dark: #1F1F20; --ink-mid: #505057; --ink-soft: #68686F;
      --accent: #7733f5; --accent-strong: #6c2edf;
    }
    html { scroll-behavior: smooth; }
    body { margin: 0; background-color: var(--paper); color: var(--ink-dark); font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-feature-settings: "cv11","ss01","ss03"; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

    /* ---------- Site header (sticky glass nav) — shared with index.html ---------- */
    .site-header { isolation: isolate; }
    .site-header__link { position: relative; display: inline-flex; align-items: center; padding: 0.625rem 0.875rem; border-radius: 8px; font-size: 15px; font-weight: 500; letter-spacing: -0.005em; color: rgba(255,255,255,0.72); transition: color 180ms ease, background-color 200ms ease; }
    .site-header__link[aria-current="page"] { color: #fff; }
    .site-header__link::after { content: ""; position: absolute; left: 0.875rem; right: 0.875rem; bottom: 0.4rem; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent); opacity: 0; transform: translateY(2px); transition: opacity 200ms ease, transform 200ms ease; pointer-events: none; }
    .site-header__link:hover { color: #fff; background-color: rgba(255,255,255,0.05); }
    .site-header__link:hover::after { opacity: 0.7; transform: translateY(0); }
    .site-header__link:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 4px rgba(10,10,14,0.95); }
    .site-header__glass { position: absolute; inset: 0; pointer-events: none; background: rgba(10,10,14,0); backdrop-filter: blur(0); -webkit-backdrop-filter: blur(0); transition: background-color 280ms ease, backdrop-filter 280ms ease, -webkit-backdrop-filter 280ms ease, box-shadow 280ms ease; z-index: -1; }
    .site-header__hairline { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; pointer-events: none; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 18%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.08) 82%, transparent 100%); opacity: 0; transition: opacity 280ms ease; z-index: -1; }
    .site-header.is-scrolled .site-header__glass { background-color: rgba(10,10,14,0.55); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%); box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.5); }
    .site-header.is-scrolled .site-header__hairline { opacity: 1; }
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { .site-header.is-scrolled .site-header__glass { background-color: rgba(10,10,14,0.92); } }
    .cta-pill { color: #1F1F20; font-size: 15px; font-weight: 600; letter-spacing: -0.005em; padding: 0.625rem 1.125rem; background-image: linear-gradient(180deg, #ffffff 0%, #f3f3f5 100%); box-shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,15,20,0.18), 0 8px 24px -12px rgba(15,15,20,0.35); transition: transform 200ms ease, background-image 200ms ease, box-shadow 200ms ease; }
    .cta-pill:hover { background-image: linear-gradient(180deg, #ffffff 0%, #e9e9ec 100%); transform: translateY(-0.5px); }
    .cta-pill:active { transform: translateY(0); }
    .nav-divider { width: 1px; height: 22px; background: linear-gradient(180deg, transparent, rgba(255,255,255,0.16), transparent); margin: 0 0.5rem; }
    .site-header__mobile { position: relative; border-top: 1px solid rgba(255,255,255,0.06); background: rgba(10,10,14,0.85); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%); }
    @media (prefers-reduced-motion: reduce) { .site-header__glass, .site-header__hairline, .cta-pill { transition: none; } .cta-pill:hover { transform: none; } }

    /* ---------- Dark hero band (matches the homepage hero) ---------- */
    .blog-band { position: relative; isolation: isolate; color: #fff; overflow: hidden; }
    .blog-band::before { content: ""; position: absolute; inset: 0; z-index: -2; background-image: url('${root}bg.png'); background-size: cover; background-position: center; }
    .blog-band::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(10,10,14,0.78) 0%, rgba(10,10,14,0.84) 60%, rgba(10,10,14,0.92) 100%); }
    .blog-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.62); }
    .blog-eyebrow::before, .blog-eyebrow::after { content: ""; width: 26px; height: 1px; background: rgba(255,255,255,0.25); }

    /* ---------- Legal pages ---------- */
    .legal-top { text-align: center; padding: 9rem 1.25rem 3.25rem; }
    .legal-body { max-width: 46rem; margin: 0 auto; padding: 3.25rem 1.25rem 4.5rem; font-size: 1.0625rem; line-height: 1.7; color: #2b2b30; }
    /* document title (terms/privacy = first h2; agent-jam = h1) */
    .legal-body > h1, .legal-body > h2:first-child { font-family: "Poppins", sans-serif; font-weight: 500; font-size: clamp(1.9rem, 3.6vw, 2.6rem); line-height: 1.14; letter-spacing: -0.02em; color: var(--ink-dark); text-align: center; margin: 0 0 2.25rem; }
    .legal-body > h1 strong, .legal-body > h2:first-child strong { font-weight: 500; }
    .legal-body > h1 br { display: none; }
    /* version subtitle (privacy: the <p> right after the title) */
    .legal-body > h2:first-child + p { text-align: center; color: var(--ink-soft); margin: -1.25rem 0 2.5rem; font-size: 0.95rem; }
    .legal-body > h2:first-child + p strong { font-weight: 500; color: var(--ink-soft); }
    /* clauses + paragraphs */
    .legal-body h2 { font-family: "Geist", sans-serif; font-weight: 400; font-size: 1.0625rem; line-height: 1.7; color: #2b2b30; margin: 0 0 1.05rem; }
    .legal-body p { margin: 0 0 1.05rem; }
    .legal-body strong { font-weight: 600; color: var(--ink-dark); }
    .legal-body a { color: var(--accent-strong); text-decoration: underline; text-underline-offset: 2px; font-weight: 500; word-break: break-word; }
    .legal-body a:hover { color: var(--accent); }
    .legal-body ul, .legal-body ol { margin: 0 0 1.05rem; padding-left: 1.5rem; }
    .legal-body ul { list-style: disc; } .legal-body ol { list-style: decimal; }
    .legal-body li { margin: 0 0 .5rem; }
    .legal-body li::marker { color: var(--accent); }

    /* ---------- Footer — shared with index.html ---------- */
    .site-footer { width: 100%; background-color: #0A0A0E; color: rgba(255,255,255,0.72); }
    .site-footer__hairline { height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 18%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.08) 82%, transparent 100%); }
    .site-footer__heading { font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.40); }
    .site-footer__link { position: relative; display: inline-flex; align-items: center; width: fit-content; font-size: 14px; font-weight: 500; letter-spacing: -0.005em; color: rgba(255,255,255,0.60); transition: color 180ms ease; }
    .site-footer__link::after { content: ""; position: absolute; left: 0; right: 0; bottom: -2px; height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.55), transparent); opacity: 0; transform: translateY(2px); transition: opacity 200ms ease, transform 200ms ease; pointer-events: none; }
    .site-footer__link:hover { color: #fff; }
    .site-footer__link:hover::after { opacity: 0.7; transform: translateY(0); }
    .site-footer__link:focus-visible { outline: none; border-radius: 4px; box-shadow: 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 4px #0A0A0E; }
    .site-footer__social { display: inline-flex; align-items: center; justify-content: center; height: 40px; width: 40px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.10); background-color: rgba(255,255,255,0.03); color: rgba(255,255,255,0.65); transition: color 180ms ease, background-color 200ms ease, border-color 200ms ease, transform 200ms ease; }
    .site-footer__social svg { height: 18px; width: 18px; }
    .site-footer__social:hover { color: #fff; background-color: rgba(255,255,255,0.06); border-color: rgba(146,92,247,0.45); transform: translateY(-1px); }
    .site-footer__social:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 4px #0A0A0E; }
    @media (prefers-reduced-motion: reduce) { .site-footer__link, .site-footer__link::after, .site-footer__social { transition: none; } .site-footer__social:hover { transform: none; } }
  </style>`;
}

function header(root) {
  return `<header id="site-header" class="site-header fixed top-0 left-0 right-0 z-50 w-full">
  <div class="site-header__glass" aria-hidden="true"></div>
  <div class="site-header__hairline" aria-hidden="true"></div>
  <nav aria-label="Primary" class="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    <a href="${root}index.html" aria-label="AutoGPT home" class="relative flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-950">
      <img src="${root}logo.png" alt="AutoGPT" width="790" height="356" class="h-10 w-auto" decoding="async" />
    </a>
    <ul role="list" class="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5">
      <li><a href="${root}index.html" class="site-header__link">Home</a></li>
      <li><a href="${root}blog/" class="site-header__link">Blog</a></li>
      <li><a href="${root}pricing.html" class="site-header__link">Pricing</a></li>
      <li><a href="https://agpt.co/docs" class="site-header__link">Docs</a></li>
      <li><a href="https://agpt.co/docs/platform/changelog/changelog" class="site-header__link">Changelog</a></li>
    </ul>
    <div class="flex items-center">
      <a href="https://platform.agpt.co/login" class="site-header__link hidden sm:inline-flex">Sign in</a>
      <span aria-hidden="true" class="nav-divider hidden sm:block"></span>
      <a href="https://platform.agpt.co/signup" class="cta-pill inline-flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">Get started</a>
      <button id="mobile-menu-button" type="button" aria-controls="mobile-menu" aria-expanded="false" class="lg:hidden ml-1 inline-flex items-center justify-center rounded-md p-2.5 text-white/85 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
        <span class="sr-only">Toggle main menu</span>
        <svg id="mobile-menu-icon-open" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
        <svg id="mobile-menu-icon-close" class="hidden h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" /></svg>
      </button>
    </div>
  </nav>
  <div id="mobile-menu" class="site-header__mobile lg:hidden hidden">
    <ul role="list" class="relative space-y-0.5 px-3 py-3">
      <li><a href="${root}index.html" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Home</a></li>
      <li><a href="${root}blog/" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Blog</a></li>
      <li><a href="${root}pricing.html" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Pricing</a></li>
      <li><a href="https://agpt.co/docs" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Docs</a></li>
      <li><a href="https://agpt.co/docs/platform/changelog/changelog" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Changelog</a></li>
      <li class="mt-2 border-t border-white/[0.06] pt-2"><a href="https://platform.agpt.co/login" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Sign in</a></li>
      <li class="mt-2"><a href="https://platform.agpt.co/signup" class="cta-pill block text-center rounded-full mx-3 py-3">Get started</a></li>
    </ul>
  </div>
</header>`;
}

function footerFor(root) {
  return readFileSync(new URL('partials/footer.html', ROOT), 'utf8')
    .replace(/\s+$/, '')
    .replace(/href="index\.html"/g, `href="${root}index.html"`)
    .replace(/href="pricing\.html"/g, `href="${root}pricing.html"`)
    .replace(/href="how-it-works\.html"/g, `href="${root}index.html"`)
    .replace(/src="logo\.png"/g, `src="${root}logo.png"`)
    .replace(/href="blog\/"/g, `href="${root}blog/"`)
    .replace(/href="legal\/([a-z-]+)\/"/g, `href="${root}legal/$1/"`);
}

const HEADER_JS = `  <script>
    (function () {
      const btn = document.getElementById('mobile-menu-button');
      const menu = document.getElementById('mobile-menu');
      const iconOpen = document.getElementById('mobile-menu-icon-open');
      const iconClose = document.getElementById('mobile-menu-icon-close');
      if (!btn || !menu) return;
      const setOpen = (open) => { btn.setAttribute('aria-expanded', String(open)); menu.classList.toggle('hidden', !open); iconOpen.classList.toggle('hidden', open); iconClose.classList.toggle('hidden', !open); };
      btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
      menu.addEventListener('click', (e) => { if (e.target instanceof HTMLAnchorElement) setOpen(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); } });
      const mq = window.matchMedia('(min-width: 1024px)');
      mq.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
    })();
    (function () {
      const header = document.getElementById('site-header');
      if (!header) return;
      let ticking = false;
      const update = () => { header.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; };
      const onScroll = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
    })();
  </script>`;

function headBlock(meta, root) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escText(meta.title)}</title>
  <meta name="description" content="${escAttr(meta.description)}">
  <link rel="canonical" href="${escAttr(meta.canonical)}">
  <meta name="robots" content="${escAttr(meta.robots || 'max-image-preview:large')}">
  <meta property="og:type" content="${escAttr(meta.ogType || 'website')}">
  <meta property="og:title" content="${escAttr(meta.ogTitle || meta.title)}">
  <meta property="og:description" content="${escAttr(meta.description)}">
  <meta property="og:url" content="${escAttr(meta.canonical)}">
  <meta property="og:image" content="${escAttr(meta.ogImage || '')}">
  <meta name="twitter:card" content="${escAttr(meta.twitterCard || 'summary_large_image')}">
  <meta name="twitter:title" content="${escAttr(meta.ogTitle || meta.title)}">
  <meta name="twitter:description" content="${escAttr(meta.description)}">
  <meta name="twitter:image" content="${escAttr(meta.ogImage || '')}">
${headChrome(root)}
</head>`;
}

const SKIP_LINK = `<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-900 focus:shadow-lg">Skip to content</a>`;

function renderPage(page) {
  const root = '../../';
  const body = readFileSync(new URL(`legal/pages/${page.slug}.html`, ROOT), 'utf8').trim();
  return `${headBlock({
    title: page.htmlTitle || page.title,
    ogTitle: page.title,
    description: page.description,
    canonical: page.canonical,
    robots: page.robots,
    ogType: page.ogType,
    ogImage: page.ogImage,
    twitterCard: page.twitterCard,
  }, root)}
<body>
${SKIP_LINK}
${header(root)}
<main id="main-content">
  <header class="legal-top blog-band">
    <span class="blog-eyebrow">Legal</span>
  </header>
  <article class="legal-body">
${body}
  </article>
</main>
${footerFor(root)}
${HEADER_JS}
</body>
</html>
`;
}

const written = [];
for (const page of pages) {
  mkdirSync(new URL(`legal/${page.slug}/`, ROOT), { recursive: true });
  writeFileSync(new URL(`legal/${page.slug}/index.html`, ROOT), renderPage(page), 'utf8');
  written.push(page.slug);
}
console.log(`\n  ✓ Legal pages generated (relative paths)\n    ${written.map((w) => '/legal/' + w).join('\n    ')}\n`);
