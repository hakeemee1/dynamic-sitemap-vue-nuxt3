# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A proof-of-concept Nuxt 3 app demonstrating how to fix `@nuxtjs/sitemap`'s blind spot for
query-string-routed product pages (e.g. `/products/detail?product_id=123`), which the module's
auto-discovery cannot see. The POC is a companion to a knowledge-share article for the internal
wiki. **Nothing in this repo may reference a real client's name, domain, or production URL** —
all product/catalog data must be generic and fictional.

Full spec: `docs/dynamic-sitemap-seo-poc-spec.md` (has a post-implementation amendment note at the
top — the i18n approach changed after the spec was written; see below). Original build plan is
tracked as five tickets in `docs/tickets/01-...` through `05-...`; ticket 03 carries a revision
note explaining the i18n change. All five are implemented. A Thai onboarding guide lives at the
repo-root `README.md`; the English app-running guide is `app/README.md`.

## Commands

All commands run from inside `app/`, not the repo root.

```bash
cd app
npm install          # first-time setup / after pulling dependency changes
npm run dev           # nuxt dev - start the dev server
npm test               # vitest run - unit tests for sitemapEntries.ts
npm run typecheck        # nuxt typecheck
npm run build              # nuxt build (SSR production build)
npm run generate             # nuxt generate (SSG)
```

To reproduce the "before" (stock sitemap, zero product URLs) state instead of the default
"after" state:

```bash
NUXT_PUBLIC_ENABLE_PRODUCT_SITEMAP=false npm run dev
```

## Architecture

- **`server/utils/sitemapEntries.ts`** — the pure function at the center of the POC:
  `buildProductSitemapEntries(products) → SitemapEntry[]`. Maps each product to a canonical
  `loc` containing only `product_id` — any other fields on the product record (`category`,
  `bundleId`, `statusFlag`, ...) are deliberately dropped, even though a real detail page might
  accept them as extra query params. This is the seam covered by unit tests
  (`sitemapEntries.test.ts`), kept independent of Nitro/Nuxt so it runs under plain `vitest`.
- **`server/plugins/sitemap-urls.ts`** — a Nitro plugin hooking `@nuxtjs/sitemap`'s
  `sitemap:input` event: fetches `/api/products`, maps through `buildProductSitemapEntries`, and
  pushes the results into `ctx.urls`. Gated by `runtimeConfig.public.enableProductSitemap` (the
  before/after toggle) and wrapped in try/catch so a failed product fetch degrades to the static
  routes instead of 500ing `/sitemap.xml`.
- **`server/api/products.ts`** — the single mock data source: ~25 generic products, each with a
  per-locale `name` (`{ th, en }`) and some carrying noise fields (`category`, `bundleId`,
  `statusFlag`) specifically to prove the canonicalization above strips them. This is a permanent
  stand-in for a real backend, not a placeholder meant to be swapped later.
- **`pages/products/detail.vue`** — the product detail page, reading `product_id` from the query
  string (`route.query.product_id`, normalized to take the first value if duplicated) rather than
  a file-based dynamic route segment. This route-via-query-param pattern is the whole reason
  `@nuxtjs/sitemap`'s auto-discovery misses product URLs. Unknown `product_id` renders a
  "not found" state rather than crashing.
- **i18n — cookie-based, not URL-based.** `@nuxtjs/i18n` uses `strategy: 'no_prefix'` with
  `detectBrowserLanguage` reading/writing the `i18n_redirected` cookie. There is **no** `/en`
  route prefix; the language switcher (`app.vue`) calls `setLocale()` directly rather than
  navigating. This intentionally matches how the real production frontends currently switch
  locale — it was changed from an originally-planned `prefix_except_default` (URL-prefixed)
  approach specifically to match that reality.
  - **Consequence: no `hreflang`.** Since locale isn't part of the URL, each product has exactly
    one crawlable URL — there's no second-locale URL for a `hreflang` alternate to point at, so
    `sitemapEntries.ts` doesn't emit any. This is documented as a real, second SEO gap (crawlers
    don't carry cookies, so they only ever see default-locale content) in the "Multi-language
    sites" section of `docs/dynamic-sitemap-seo-article.md` — not an oversight, don't try to
    "fix" it by re-adding hreflang without discussing the URL-strategy tradeoff first.
- **`sitemap: { autoI18n: false }`** in `nuxt.config.ts` — `@nuxtjs/sitemap` auto-detects
  `@nuxtjs/i18n` and by default splits into a sitemap index with one sub-sitemap per locale; this
  is turned off so `/sitemap.xml` stays a single flat file (there's nothing per-locale to split,
  given the cookie-based approach above).
- **Rendering mode**: SSR, matching the real frontends. `/sitemap.xml` is computed per-request —
  editing `server/api/products.ts` and reloading shows the change immediately, no restart needed.
  Contrast with `nuxt generate` (SSG), which only snapshots the sitemap at build time.

## Demonstrating before/after

- **Before**: `NUXT_PUBLIC_ENABLE_PRODUCT_SITEMAP=false` — stock `@nuxtjs/sitemap` output, lists
  only static/top-level routes, zero product URLs.
- **After** (default): the custom hook active — one canonical entry per product.

The header UI also has a direct link to `/sitemap.xml` for the live demo.

## Out of scope (do not implement)

Per the spec/tickets, these are deliberately excluded — don't add them even if they seem like
natural extensions:

- Sitemap chunking / sitemap index files for large catalogs
- Non-detail product routes (attribute/variant pages, flash-sale pages, etc.)
- Any real backend integration (the mock Nitro route is permanent, not a placeholder)
- Deployment to any hosting platform
- SSG rebuild-trigger tooling (webhook-triggered rebuilds) — mention only in the article, don't build
- Locales beyond Thai and English
- `<link rel="canonical">` meta tag on the product page component itself (sitemap-side
  canonicalization only)
- Giving each locale its own URL / implementing `hreflang` (see i18n note above — this is a
  documented, deliberate gap, not something to silently patch)
