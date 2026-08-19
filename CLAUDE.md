# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A proof-of-concept Nuxt 3 app demonstrating how to fix `@nuxtjs/sitemap`'s blind spot for
query-string-routed product pages (e.g. `/products/detail?product_id=123`), which the module's
auto-discovery cannot see. The POC is a companion to a knowledge-share article for the internal
wiki. **Nothing in this repo may reference a real client's name, domain, or production URL** —
all product/catalog data must be generic and fictional.

Full spec: `docs/dynamic-sitemap-seo-poc-spec.md`. Build is tracked as five sequential tickets in
`docs/tickets/01-...` through `05-...`, each blocked on the previous one — read a ticket before
picking up its work, since acceptance criteria live there, not in this file.

As of the last update, only `app/package.json` exists — the Nuxt app itself (`nuxt.config.ts`,
`pages/`, `server/`, etc.) has not been scaffolded yet. Ticket 01 is what creates it.

## Commands

All Nuxt/npm commands run from inside `app/`, not the repo root.

```bash
cd app
npm install       # first-time setup / after pulling dependency changes
npm run dev        # nuxt dev — start the dev server
npm run build       # nuxt build
npm run generate     # nuxt generate (SSG)
npm run preview      # preview a built app
```

`vitest` is not yet a dependency — ticket 02 adds it as part of extracting the sitemap
entry-building logic into a unit-testable pure function. Once added, run it the standard way
(`npx vitest` / `npx vitest run`) from `app/`.

## Architecture (target shape per the spec/tickets)

- **`app/`** — the Nuxt 3 application. Kept as a full representative dependency set (Tailwind v4,
  `@nuxtjs/i18n`, `@pinia/nuxt`, etc.) intentionally, not trimmed to a bare-bones sandbox — the
  point of the POC is to mirror the real production frontends' stack.
- **`server/api/products.ts`** (Nitro server route) — the single mock data source: an
  in-memory/static JSON dataset of ~20-30 generic products, each carrying per-locale fields (at
  minimum a localized name) keyed by locale (`th`, `en`). This is a permanent stand-in for a real
  backend, not a placeholder meant to be swapped later.
- **`pages/products/detail.vue`** — the product detail page, reading `product_id` from the query
  string rather than a file-based dynamic route segment. This route-via-query-param pattern is the
  whole reason `@nuxtjs/sitemap`'s auto-discovery misses product URLs, and is deliberately kept
  generic (not a real production pattern's exact shape).
- **Sitemap entry generation** — a pure function `(products, locale config) → sitemap entries`,
  kept separate from both the Nitro `sitemap:urls` hook and the mock API route specifically so it
  is unit-testable without booting a Nuxt/Nitro server. This function is the single seam covered
  by automated tests in this repo; the hook wiring and the `/sitemap.xml` HTTP round-trip are
  demonstrated live during the walkthrough instead, not unit tested.
- **Canonicalization rule**: each generated sitemap `loc` includes only the `product_id` query
  param — any other params a real detail page might carry (category, bundle, status flags) must
  be stripped even if present on the input product record. This is the fix for the
  duplicate-content/ranking-dilution risk described in the spec, not an incidental detail.
- **i18n**: two locales, Thai (`th`, default, unprefixed) and English (`en`, `/en/` prefix), via
  `@nuxtjs/i18n`'s `prefix_except_default` strategy. Each sitemap entry needs `hreflang`
  alternates for both locales plus `x-default` pointing at the Thai (default) URL.
- **Rendering mode**: SSR, matching the real frontends. `/sitemap.xml` is computed per-request in
  dev/SSR — editing the mock dataset and reloading shows the change immediately. Contrast this
  with `nuxt generate` (SSG), which only snapshots the sitemap at build time.

## Demonstrating before/after

The repo is meant to show two states of the same sitemap side by side:

- **Before**: stock `@nuxtjs/sitemap` config, no custom hook — lists only static/top-level routes,
  zero product URLs.
- **After**: the custom `sitemap:urls` hook wired up — one canonical, hreflang-complete entry per
  product.

Toggling between the two (e.g. temporarily disabling the custom hook) should stay easy — this is
load-bearing for the live demo and for ticket 04's README, not just a nice-to-have.

## Out of scope (do not implement)

Per the spec, these are deliberately excluded — don't add them even if they seem like natural
extensions:

- Sitemap chunking / sitemap index files for large catalogs
- Non-detail product routes (attribute/variant pages, flash-sale pages, etc.)
- Any real backend integration (the mock Nitro route is permanent, not a placeholder)
- Deployment to any hosting platform
- SSG rebuild-trigger tooling (webhook-triggered rebuilds) — mention only in the article, don't build
- Locales beyond Thai and English
- `<link rel="canonical">` meta tag on the product page component itself (sitemap-side
  canonicalization only)
