// gen-blog.mjs
// Builds the static blog from local source (blog/posts.json + blog/posts/<slug>.html),
// wrapping each post in the shared AutoGPT shell (sticky glass nav + footer) so the
// migrated content matches THIS site's design while staying verbatim + SEO-identical.
//
//   node tools/gen-blog.mjs
//
// Writes (clean, extension-less URLs via directory index files):
//   blog/<slug>/index.html   ->  /blog/<slug>     (one per post)
//   blog/index.html          ->  /blog            (reverse-chronological listing)
//
// Source of truth: blog/posts.json (metadata, hand-editable) + blog/posts/*.html (bodies).
// Regenerate after editing either. The footer is injected from partials/footer.html so it
// stays in sync with the rest of the site (links rewritten to root-relative for /blog/*).

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

// ---------- shared footer (single source of truth), links made root-relative ----------
const footer = readFileSync(new URL('partials/footer.html', ROOT), 'utf8')
  .replace(/\s+$/, '')
  .replace(/href="index\.html"/g, 'href="/"')
  .replace(/href="pricing\.html"/g, 'href="/pricing.html"')
  .replace(/href="how-it-works\.html"/g, 'href="/"')
  .replace(/src="logo\.png"/g, 'src="/logo.png"')
  .replace(/href="blog\/"/g, 'href="/blog"');

// ---------- shared <head>: Tailwind + DS tokens + reused header/footer CSS + blog CSS ----------
const HEAD_CHROME = `  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: {
        colors: {
          purple: { 50:'#f1ebfe', 100:'#d5c0fc', 200:'#c0a1fa', 300:'#a476f8', 400:'#925cf7', 500:'#7733f5', 600:'#6c2edf', 700:'#5424ae', 800:'#411c87', 900:'#321567' },
          zinc:   { 50:'#F9F9FA', 100:'#EFEFF0', 200:'#DADADC', 300:'#C5C5C9', 400:'#ADADB3', 500:'#83838C', 600:'#68686F', 700:'#8E98A8', 800:'#3E3E43', 900:'#2C2C30' },
        },
        fontFamily: {
          sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
          poppins: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        },
        borderRadius: { xs:'4px', s:'8px', m:'12px', l:'16px', xl:'20px' },
      } },
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Poppins:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=swap" rel="stylesheet">
  <style>
    html { scroll-behavior: smooth; }
    body { margin: 0; background-color: #ffffff; color: #18181b; font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

    /* ---------- Site header (sticky glass nav) — shared with index.html ---------- */
    .site-header { isolation: isolate; font-feature-settings: "cv11", "ss01", "ss03"; }
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

    /* ---------- Blog post ---------- */
    .post-hero { position: relative; background: radial-gradient(120% 120% at 50% -10%, #1b1430 0%, #0A0A0E 60%); color: #fff; padding: 9rem 1.25rem 5rem; }
    .post-hero__inner { max-width: 46rem; margin: 0 auto; }
    .post-hero__back { display: inline-flex; align-items: center; gap: .4rem; font-size: .9rem; font-weight: 500; color: rgba(255,255,255,0.6); margin-bottom: 1.5rem; transition: color 160ms ease; }
    .post-hero__back:hover { color: #fff; }
    .post-tags { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1.25rem; }
    .post-tag { font-size: 12px; font-weight: 500; letter-spacing: .02em; padding: .3rem .7rem; border-radius: 999px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); color: rgba(255,255,255,.82); }
    .post-hero h1 { font-family: "Poppins", sans-serif; font-weight: 700; font-size: clamp(1.9rem, 4vw, 2.8rem); line-height: 1.12; letter-spacing: -0.02em; margin: 0 0 1.4rem; }
    .post-meta { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem .8rem; color: rgba(255,255,255,.6); font-size: .95rem; }
    .post-meta__author { color: #fff; font-weight: 600; }
    .post-meta__dot { opacity: .4; }
    .post-figure { position: relative; z-index: 1; max-width: 60rem; margin: -3.5rem auto 0; padding: 0 1.25rem; }
    .post-figure img { width: 100%; height: auto; border-radius: 20px; box-shadow: 0 30px 60px -30px rgba(0,0,0,.45); border: 1px solid rgba(255,255,255,.08); }
    .post-body { max-width: 46rem; margin: 0 auto; padding: 3rem 1.25rem 4rem; font-size: 1.0625rem; line-height: 1.75; color: #27272a; }
    .post-body > *:first-child { margin-top: 0; }
    .post-body p { margin: 0 0 1.25rem; }
    .post-body h2 { font-family: "Poppins", sans-serif; font-weight: 600; font-size: 1.6rem; line-height: 1.25; letter-spacing: -0.01em; color: #111114; margin: 2.75rem 0 1rem; }
    .post-body h3 { font-family: "Poppins", sans-serif; font-weight: 600; font-size: 1.25rem; line-height: 1.3; color: #111114; margin: 2rem 0 .75rem; }
    .post-body h4 { font-weight: 600; font-size: 1.05rem; color: #111114; margin: 1.5rem 0 .5rem; }
    .post-body ul, .post-body ol { margin: 0 0 1.25rem; padding-left: 1.4rem; }
    .post-body ul { list-style: disc; } .post-body ol { list-style: decimal; }
    .post-body li { margin: 0 0 .5rem; }
    .post-body li::marker { color: #925cf7; }
    .post-body a { color: #6c2edf; text-decoration: underline; text-underline-offset: 2px; font-weight: 500; }
    .post-body a:hover { color: #5424ae; }
    .post-body strong { font-weight: 600; color: #18181b; }
    .post-body blockquote { margin: 1.75rem 0; padding: .25rem 0 .25rem 1.25rem; border-left: 3px solid #c0a1fa; color: #3f3f46; font-style: italic; }
    .post-body img { display: block; width: 100%; height: auto; border-radius: 16px; margin: 1.75rem 0; border: 1px solid #ececf1; }
    .post-body hr { border: 0; border-top: 1px solid #ececf1; margin: 2.5rem 0; }

    /* ---------- Blog listing ---------- */
    .blog-hero { background: radial-gradient(120% 120% at 50% -10%, #1b1430 0%, #0A0A0E 60%); color: #fff; padding: 9.5rem 1.25rem 4rem; text-align: center; }
    .blog-hero h1 { font-family: "Poppins", sans-serif; font-weight: 700; font-size: clamp(2.2rem, 5vw, 3.2rem); letter-spacing: -0.02em; margin: 0 0 1rem; }
    .blog-hero p { max-width: 38rem; margin: 0 auto; color: rgba(255,255,255,.62); font-size: 1.1rem; line-height: 1.6; }
    .blog-main { max-width: 75rem; margin: 0 auto; padding: 3.5rem 1.25rem 5rem; }
    .blog-grid { display: grid; gap: 1.75rem; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
    .blog-card { display: flex; flex-direction: column; border: 1px solid #ececf1; border-radius: 16px; overflow: hidden; background: #fff; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
    .blog-card:hover { transform: translateY(-3px); box-shadow: 0 22px 44px -26px rgba(15,15,20,.28); border-color: #e0d6fb; }
    .blog-card:focus-visible { outline: none; box-shadow: 0 0 0 2px #925cf7, 0 0 0 4px #fff; }
    .blog-card__imgwrap { aspect-ratio: 16/9; overflow: hidden; background: #f4f4f6; }
    .blog-card__imgwrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
    .blog-card:hover .blog-card__imgwrap img { transform: scale(1.035); }
    .blog-card__body { display: flex; flex-direction: column; flex: 1; padding: 1.25rem; }
    .blog-card__tags { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: .75rem; }
    .blog-card__tag { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: #6c2edf; background: #f1ebfe; border-radius: 999px; padding: .25rem .55rem; }
    .blog-card__date { font-size: .8rem; color: #83838c; margin-bottom: .4rem; }
    .blog-card__title { font-family: "Poppins", sans-serif; font-weight: 600; font-size: 1.15rem; line-height: 1.3; color: #18181b; margin: 0 0 .5rem; }
    .blog-card__desc { font-size: .92rem; line-height: 1.55; color: #52525b; margin: 0 0 1rem; flex: 1; }
    .blog-card__more { font-size: .9rem; font-weight: 600; color: #6c2edf; }

    /* ---------- Footer — shared with index.html ---------- */
    .site-footer { width: 100%; background-color: #0A0A0E; font-feature-settings: "cv11", "ss01", "ss03"; color: rgba(255,255,255,0.72); }
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

// ---------- shared header markup (root-relative links; Blog active) ----------
const HEADER = `<header id="site-header" class="site-header fixed top-0 left-0 right-0 z-50 w-full">
  <div class="site-header__glass" aria-hidden="true"></div>
  <div class="site-header__hairline" aria-hidden="true"></div>
  <nav aria-label="Primary" class="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    <a href="/" aria-label="AutoGPT home" class="relative flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-950">
      <img src="/logo.png" alt="AutoGPT" width="790" height="356" class="h-10 w-auto" decoding="async" />
    </a>
    <ul role="list" class="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5">
      <li><a href="/" class="site-header__link">Home</a></li>
      <li><a href="/blog" class="site-header__link" aria-current="page">Blog</a></li>
      <li><a href="/pricing.html" class="site-header__link">Pricing</a></li>
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
      <li><a href="/" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Home</a></li>
      <li><a href="/blog" aria-current="page" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white hover:bg-white/[0.06] transition-colors">Blog</a></li>
      <li><a href="/pricing.html" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Pricing</a></li>
      <li><a href="https://agpt.co/docs" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Docs</a></li>
      <li><a href="https://agpt.co/docs/platform/changelog/changelog" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Changelog</a></li>
      <li class="mt-2 border-t border-white/[0.06] pt-2"><a href="https://platform.agpt.co/login" class="block rounded-lg px-3 py-3 text-[17px] font-medium tracking-[-0.005em] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors">Sign in</a></li>
      <li class="mt-2"><a href="https://platform.agpt.co/signup" class="cta-pill block text-center rounded-full mx-3 py-3">Get started</a></li>
    </ul>
  </div>
</header>`;

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

function headBlock(meta) {
  const canonical = meta.canonical;
  const ogType = meta.ogType || 'website';
  const ogImage = meta.ogImage || '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escText(meta.title)}</title>
  <meta name="description" content="${escAttr(meta.description)}">
  <link rel="canonical" href="${escAttr(canonical)}">
  <meta name="robots" content="${escAttr(meta.robots || 'max-image-preview:large')}">
  <meta property="og:type" content="${escAttr(ogType)}">
  <meta property="og:title" content="${escAttr(meta.ogTitle || meta.title)}">
  <meta property="og:description" content="${escAttr(meta.description)}">
  <meta property="og:url" content="${escAttr(canonical)}">
  <meta property="og:image" content="${escAttr(ogImage)}">
  <meta name="twitter:card" content="${escAttr(meta.twitterCard || 'summary_large_image')}">
  <meta name="twitter:title" content="${escAttr(meta.ogTitle || meta.title)}">
  <meta name="twitter:description" content="${escAttr(meta.description)}">
  <meta name="twitter:image" content="${escAttr(ogImage)}">
${HEAD_CHROME}
</head>`;
}

function metaRow(post) {
  const bits = [];
  if (post.author) bits.push(`<span class="post-meta__author">${escText(post.author)}</span>`);
  if (post.authorTitle) bits.push(escText(post.authorTitle));
  if (post.date) bits.push(escText(post.date));
  if (post.readTime) bits.push(escText(post.readTime));
  return bits.join('<span class="post-meta__dot" aria-hidden="true">&middot;</span>');
}

function renderPost(post) {
  const body = readFileSync(new URL(`blog/posts/${post.slug}.html`, ROOT), 'utf8').trim();
  const tags = (post.tags || []).map((t) => `<span class="post-tag">${escText(t)}</span>`).join('');
  const figure = post.heroImage
    ? `\n    <figure class="post-figure"><img src="/${escAttr(post.heroImage)}" alt="${escAttr(post.title)}" width="1600" height="900" decoding="async"></figure>`
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
  })}
<body>
<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-900 focus:shadow-lg">Skip to content</a>
${HEADER}
<main id="main-content">
  <article>
    <header class="post-hero">
      <div class="post-hero__inner">
        <a href="/blog" class="post-hero__back">&larr; All articles</a>
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
${footer}
${HEADER_JS}
</body>
</html>
`;
}

function renderCard(post) {
  const tags = (post.tags || []).slice(0, 2).map((t) => `<span class="blog-card__tag">${escText(t)}</span>`).join('');
  const img = post.heroImage
    ? `<div class="blog-card__imgwrap"><img src="/${escAttr(post.heroImage)}" alt="${escAttr(post.title)}" loading="lazy" decoding="async"></div>`
    : '';
  return `      <a class="blog-card" href="/blog/${escAttr(post.slug)}">
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
  const cards = listed.map(renderCard).join('\n');
  return `${headBlock({
    title: INDEX_META.title,
    ogTitle: INDEX_META.title,
    description: INDEX_META.description,
    canonical: INDEX_META.canonical,
    ogType: 'website',
    ogImage: INDEX_META.ogImage,
    twitterCard: 'summary_large_image',
  })}
<body>
<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-900 focus:shadow-lg">Skip to content</a>
${HEADER}
<main id="main-content">
  <header class="blog-hero">
    <h1>${escText(INDEX_META.title)}</h1>
    <p>${escText(INDEX_META.description)}</p>
  </header>
  <div class="blog-main">
    <div class="blog-grid">
${cards}
    </div>
  </div>
</main>
${footer}
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
  written.push(`/blog/${post.slug}`);
}
const listed = posts.filter((p) => p.listed);
writeFileSync(new URL('blog/index.html', ROOT), renderListing(listed), 'utf8');

console.log(`\n  ✓ Blog generated from blog/posts.json`);
console.log(`    /blog            (listing, ${listed.length} cards)`);
console.log(`    ${written.length} post pages: ${written.map((w) => w.replace('/blog/', '')).join(', ')}`);
console.log('');
