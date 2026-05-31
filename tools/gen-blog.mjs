// gen-blog.mjs
// Builds the static blog from local source (blog/posts.json + blog/posts/<slug>.html),
// wrapping each post in the shared AutoGPT shell (sticky glass nav + footer) using the
// AutoGPT Design System tokens (see design/ PDFs + index.html :root vars).
//
//   node tools/gen-blog.mjs
//
// Writes clean, extension-less URLs via directory index files:
//   blog/<slug>/index.html   ->  /blog/<slug>     (one per post)
//   blog/index.html          ->  /blog            (reverse-chronological listing)
//
// IMPORTANT — paths are RELATIVE, computed per page depth (`root`), because the site is
// served from a sub-path on GitHub Pages (…/autopilot-web-dev/) today and from the domain
// root at agpt.co later. Absolute "/foo" paths would 404 under the sub-path. canonical and
// og:image stay ABSOLUTE on the production domain (https://agpt.co/...) for SEO/social.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const posts = JSON.parse(readFileSync(new URL('blog/posts.json', ROOT), 'utf8'));

// /blog index page metadata (verbatim from the live site).
const INDEX_META = {
  title: 'AutoGPT Blog',
  description: 'Stay updated on the latest AI trends, breakthroughs, and industry transformations.',
  ogImage: 'https://agpt.co/images/blog/blog-cover.png',
  canonical: 'https://agpt.co/blog',
};

const escAttr = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escText = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- per-page <head>: Tailwind + DS tokens + reused chrome CSS + blog CSS ----------
// `root` is the relative prefix back to the site root ('../' for /blog, '../../' for posts).
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

    /* ---------- Shared dark hero band (matches the homepage hero) ---------- */
    .blog-band { position: relative; isolation: isolate; color: #fff; overflow: hidden; }
    .blog-band::before { content: ""; position: absolute; inset: 0; z-index: -2; background-image: url('${root}bg.png'); background-size: cover; background-position: center; }
    .blog-band::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(10,10,14,0.78) 0%, rgba(10,10,14,0.84) 60%, rgba(10,10,14,0.92) 100%); }
    .blog-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.62); }
    .blog-eyebrow::before, .blog-eyebrow::after { content: ""; width: 26px; height: 1px; background: rgba(255,255,255,0.25); }

    /* ---------- Blog listing ---------- */
    .blog-hero { text-align: center; padding: 9.5rem 1.25rem 4.5rem; }
    .blog-hero h1 { font-family: "Poppins", sans-serif; font-weight: 500; font-size: clamp(2.4rem, 5.4vw, 3.6rem); line-height: 1.05; letter-spacing: -0.022em; margin: 1.25rem 0 1.1rem; }
    .blog-hero p { max-width: 40rem; margin: 0 auto; color: rgba(255,255,255,0.66); font-size: clamp(1rem, 1.4vw, 1.15rem); line-height: 1.6; }
    .blog-main { max-width: 78rem; margin: 0 auto; padding: 3.5rem 1.25rem 6rem; }
    .blog-grid { display: grid; gap: 1.75rem; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); }
    .blog-card { display: flex; flex-direction: column; background: var(--paper); border: 1px solid var(--paper-line); border-radius: 16px; overflow: hidden; text-decoration: none; box-shadow: 0 1px 2px rgba(24,24,27,0.04), 0 4px 12px rgba(24,24,27,0.05); transition: transform .22s ease, box-shadow .28s ease; }
    .blog-card:hover { transform: translateY(-4px); box-shadow: 0 1px 2px rgba(24,24,27,0.04), 0 4px 12px rgba(24,24,27,0.06), 0 16px 40px rgba(24,24,27,0.08), 0 40px 90px rgba(24,24,27,0.13); }
    .blog-card:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--accent), 0 0 0 4px #fff; }
    .blog-card__imgwrap { aspect-ratio: 16/9; overflow: hidden; background: var(--paper-deep); }
    .blog-card__imgwrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
    .blog-card:hover .blog-card__imgwrap img { transform: scale(1.04); }
    .blog-card__body { display: flex; flex-direction: column; flex: 1; padding: 1.35rem 1.4rem 1.5rem; }
    .blog-card__tags { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: .85rem; }
    .blog-card__tag { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--accent-strong); background: #f1ebfe; border-radius: 999px; padding: .28rem .6rem; }
    .blog-card__date { font-size: .8rem; color: var(--ink-soft); margin-bottom: .45rem; }
    .blog-card__title { font-family: "Poppins", sans-serif; font-weight: 500; font-size: 1.2rem; line-height: 1.3; letter-spacing: -0.015em; color: var(--ink-dark); margin: 0 0 .55rem; }
    .blog-card__desc { font-size: .93rem; line-height: 1.6; color: var(--ink-mid); margin: 0 0 1.15rem; flex: 1; }
    .blog-card__more { font-size: .9rem; font-weight: 600; color: var(--accent-strong); }
    .blog-card:hover .blog-card__more { color: var(--accent); }

    /* ---------- Blog post ---------- */
    .post-hero { padding: 9rem 1.25rem 6rem; }
    .post-hero__inner { max-width: 48rem; margin: 0 auto; }
    .post-hero__back { display: inline-flex; align-items: center; gap: .45rem; font-size: .875rem; font-weight: 500; color: rgba(255,255,255,0.6); margin-bottom: 1.75rem; transition: color 160ms ease; }
    .post-hero__back:hover { color: #fff; }
    .post-tags { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1.4rem; }
    .post-tag { font-size: 12px; font-weight: 500; letter-spacing: .02em; padding: .32rem .72rem; border-radius: 999px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16); color: rgba(255,255,255,.84); }
    .post-hero h1 { font-family: "Poppins", sans-serif; font-weight: 500; font-size: clamp(2rem, 4.4vw, 3rem); line-height: 1.08; letter-spacing: -0.022em; margin: 0 0 1.6rem; }
    .post-meta { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem .85rem; color: rgba(255,255,255,.62); font-size: .95rem; }
    .post-meta__author { color: #fff; font-weight: 600; }
    .post-meta__dot { opacity: .42; }
    .post-figure { position: relative; z-index: 1; max-width: 62rem; margin: -4rem auto 0; padding: 0 1.25rem; }
    .post-figure img { width: 100%; height: auto; border-radius: 20px; box-shadow: 0 1px 2px rgba(24,24,27,0.06), 0 16px 40px rgba(24,24,27,0.12), 0 48px 120px rgba(24,24,27,0.18); border: 1px solid var(--paper-line); background: var(--paper-deep); }
    .post-body { max-width: 44rem; margin: 0 auto; padding: 3.25rem 1.25rem 4.5rem; font-size: 1.075rem; line-height: 1.75; color: #2b2b30; }
    .post-body > *:first-child { margin-top: 0; }
    .post-body p { margin: 0 0 1.3rem; }
    .post-body h2 { font-family: "Poppins", sans-serif; font-weight: 500; font-size: 1.65rem; line-height: 1.22; letter-spacing: -0.02em; color: var(--ink-dark); margin: 3rem 0 1.1rem; }
    .post-body h3 { font-family: "Poppins", sans-serif; font-weight: 500; font-size: 1.3rem; line-height: 1.3; letter-spacing: -0.015em; color: var(--ink-dark); margin: 2.1rem 0 .8rem; }
    .post-body h4 { font-weight: 600; font-size: 1.075rem; color: var(--ink-dark); margin: 1.6rem 0 .5rem; }
    .post-body ul, .post-body ol { margin: 0 0 1.3rem; padding-left: 1.45rem; }
    .post-body ul { list-style: disc; } .post-body ol { list-style: decimal; }
    .post-body li { margin: 0 0 .55rem; padding-left: .2rem; }
    .post-body li::marker { color: var(--accent); }
    .post-body a { color: var(--accent-strong); text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 1px; font-weight: 500; }
    .post-body a:hover { color: var(--accent); }
    .post-body strong { font-weight: 600; color: var(--ink-dark); }
    .post-body blockquote { margin: 1.9rem 0; padding: .35rem 0 .35rem 1.4rem; border-left: 3px solid var(--accent); color: var(--ink-mid); font-style: italic; }
    .post-body img { display: block; width: 100%; height: auto; border-radius: 16px; margin: 2rem 0; border: 1px solid var(--paper-line); }
    .post-body hr { border: 0; border-top: 1px solid var(--paper-line); margin: 2.75rem 0; }

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

// ---------- shared header markup (relative links via `root`; Blog active) ----------
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
      <li><a href="${root}blog/" class="site-header__link" aria-current="page">Blog</a></li>
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
      <li><a href="${root}blog/" aria-current="page" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white hover:bg-white/[0.06] transition-colors">Blog</a></li>
      <li><a href="${root}pricing.html" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Pricing</a></li>
      <li><a href="https://agpt.co/docs" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Docs</a></li>
      <li><a href="https://agpt.co/docs/platform/changelog/changelog" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Changelog</a></li>
      <li class="mt-2 border-t border-white/[0.06] pt-2"><a href="https://platform.agpt.co/login" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Sign in</a></li>
      <li class="mt-2"><a href="https://platform.agpt.co/signup" class="cta-pill block text-center rounded-full mx-3 py-3">Get started</a></li>
    </ul>
  </div>
</header>`;
}

// ---------- shared footer (single source of truth), links made relative via `root` ----------
function footerFor(root) {
  return readFileSync(new URL('partials/footer.html', ROOT), 'utf8')
    .replace(/\s+$/, '')
    .replace(/href="index\.html"/g, `href="${root}index.html"`)
    .replace(/href="pricing\.html"/g, `href="${root}pricing.html"`)
    .replace(/href="how-it-works\.html"/g, `href="${root}index.html"`)
    .replace(/src="logo\.png"/g, `src="${root}logo.png"`)
    .replace(/href="blog\/"/g, `href="${root}blog/"`);
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
  const ogType = meta.ogType || 'website';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escText(meta.title)}</title>
  <meta name="description" content="${escAttr(meta.description)}">
  <link rel="canonical" href="${escAttr(meta.canonical)}">
  <meta name="robots" content="${escAttr(meta.robots || 'max-image-preview:large')}">
  <meta property="og:type" content="${escAttr(ogType)}">
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

function metaRow(post) {
  const bits = [];
  if (post.author) bits.push(`<span class="post-meta__author">${escText(post.author)}</span>`);
  if (post.authorTitle) bits.push(escText(post.authorTitle));
  if (post.date) bits.push(escText(post.date));
  if (post.readTime) bits.push(escText(post.readTime));
  return bits.join('<span class="post-meta__dot" aria-hidden="true">&middot;</span>');
}

function renderPost(post) {
  const root = '../../';
  // body fragment image srcs are stored root-relative ("/images/…") -> make relative
  const body = readFileSync(new URL(`blog/posts/${post.slug}.html`, ROOT), 'utf8').trim()
    .replace(/src="\/images\//g, `src="${root}images/`);
  const tags = (post.tags || []).map((t) => `<span class="post-tag">${escText(t)}</span>`).join('');
  const figure = post.heroImage
    ? `\n    <figure class="post-figure"><img src="${root}${escAttr(post.heroImage)}" alt="${escAttr(post.title)}" width="1600" height="900" decoding="async"></figure>`
    : '';
  return `${headBlock({
    title: post.htmlTitle || post.title,
    ogTitle: post.title,
    description: post.description,
    canonical: post.canonical,
    robots: post.robots,
    ogType: post.ogType,
    ogImage: post.ogImage,
    twitterCard: post.twitterCard,
  }, root)}
<body>
${SKIP_LINK}
${header(root)}
<main id="main-content">
  <article>
    <header class="post-hero blog-band">
      <div class="post-hero__inner">
        <a href="${root}blog/" class="post-hero__back">&larr; All articles</a>
        <div class="post-tags">${tags}</div>
        <h1>${escText(post.title)}</h1>
        <div class="post-meta">${metaRow(post)}</div>
      </div>
    </header>${figure}
    <div class="post-body">
${body}
    </div>
  </article>
</main>
${footerFor(root)}
${HEADER_JS}
</body>
</html>
`;
}

function renderCard(post, root) {
  const tags = (post.tags || []).slice(0, 2).map((t) => `<span class="blog-card__tag">${escText(t)}</span>`).join('');
  const img = post.heroImage
    ? `<div class="blog-card__imgwrap"><img src="${root}${escAttr(post.heroImage)}" alt="${escAttr(post.title)}" loading="lazy" decoding="async"></div>`
    : '';
  return `      <a class="blog-card" href="${root}blog/${escAttr(post.slug)}/">
        ${img}
        <div class="blog-card__body">
          <div class="blog-card__tags">${tags}</div>
          ${post.date ? `<div class="blog-card__date">${escText(post.date)}</div>` : ''}
          <h2 class="blog-card__title">${escText(post.title)}</h2>
          <p class="blog-card__desc">${escText(post.description)}</p>
          <span class="blog-card__more">Read more &rarr;</span>
        </div>
      </a>`;
}

function renderListing(listed) {
  const root = '../';
  const cards = listed.map((p) => renderCard(p, root)).join('\n');
  return `${headBlock({
    title: INDEX_META.title,
    ogTitle: INDEX_META.title,
    description: INDEX_META.description,
    canonical: INDEX_META.canonical,
    ogType: 'website',
    ogImage: INDEX_META.ogImage,
    twitterCard: 'summary_large_image',
  }, root)}
<body>
${SKIP_LINK}
${header(root)}
<main id="main-content">
  <header class="blog-hero blog-band">
    <span class="blog-eyebrow">Blog</span>
    <h1>${escText(INDEX_META.title)}</h1>
    <p>${escText(INDEX_META.description)}</p>
  </header>
  <div class="blog-main">
    <div class="blog-grid">
${cards}
    </div>
  </div>
</main>
${footerFor(root)}
${HEADER_JS}
</body>
</html>
`;
}

// ---------- write ----------
const written = [];
for (const post of posts) {
  mkdirSync(new URL(`blog/${post.slug}/`, ROOT), { recursive: true });
  writeFileSync(new URL(`blog/${post.slug}/index.html`, ROOT), renderPost(post), 'utf8');
  written.push(post.slug);
}
const listed = posts.filter((p) => p.listed);
writeFileSync(new URL('blog/index.html', ROOT), renderListing(listed), 'utf8');

console.log(`\n  ✓ Blog generated (relative paths)`);
console.log(`    /blog            (listing, ${listed.length} cards)`);
console.log(`    ${written.length} post pages\n`);
