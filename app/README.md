# Dynamic Sitemap SEO POC

A small Nuxt 3 app demonstrating how to make `@nuxtjs/sitemap` emit correct, canonical URLs
for product pages that are routed via a query string (`/products/detail?product_id=<id>`)
instead of a file-based dynamic segment — a routing pattern that `@nuxtjs/sitemap`'s
auto-discovery cannot see on its own.

This is a generic proof-of-concept only. No real client name, domain, or production URL
appears anywhere in this repo. See `../docs/dynamic-sitemap-seo-poc-spec.md` for the full spec.

## Running it

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:3000/` — the product catalog (Thai by default)
- `http://localhost:3000/products/detail?product_id=sku-001` — a product detail page
- `http://localhost:3000/sitemap.xml` — the generated sitemap

The language switcher in the header sets the `i18n_redirected` cookie and re-renders the
current page in the new language — the URL doesn't change. This matches how the real
production frontends currently switch locale (see "What this doesn't cover" below for the
SEO tradeoff that implies).

## The problem, reproduced ("before")

By default the app's custom sitemap logic (`server/plugins/sitemap-urls.ts`) is **enabled**,
so `/sitemap.xml` already shows the fixed, "after" state. To see the original, broken
"before" state — the state you'd get from `@nuxtjs/sitemap` alone, with no custom hook —
start the dev server with the hook toggled off:

```bash
NUXT_PUBLIC_ENABLE_PRODUCT_SITEMAP=false npm run dev
```

Then reload `/sitemap.xml`. You'll see only the static, file-based routes (`/` and the bare
`/products/detail` route shell) — **zero individual product URLs**, because the sitemap
module has no way to discover `product_id` query-string values on its own.

Stop the server and run `npm run dev` again (or unset the env var) to go back to the "after"
state.

## The fix ("after")

With the toggle on (the default), `server/plugins/sitemap-urls.ts` hooks into `@nuxtjs/sitemap`'s
`sitemap:input` Nitro hook, fetches the mock product catalog from `server/api/products.ts`, and
adds one sitemap entry per product via the pure function in `server/utils/sitemapEntries.ts`.

Each entry has a canonical `loc` containing **only** the `product_id` query parameter — any
other fields a product record carries (`category`, `bundleId`, `statusFlag`, ...) are
deliberately excluded, even though a real detail page might accept them as extra query params.
This is what keeps the same product from being indexed under several near-duplicate URLs.

```xml
<url>
    <loc>http://localhost:3000/products/detail?product_id=sku-001</loc>
</url>
```

The URL-building logic lives in a pure function (`buildProductSitemapEntries` in
`server/utils/sitemapEntries.ts`), kept separate from the Nitro hook and the mock API route, so
it's covered by unit tests (`server/utils/sitemapEntries.test.ts`) without booting a Nuxt/Nitro
server. Run them with:

```bash
npm test
```

## SSR vs SSG: sitemap freshness

This app runs in **SSR mode** (matching the real production frontends). That means
`/sitemap.xml` is computed fresh on every request — edit `server/api/products.ts` (add, remove,
or rename a product) and reload `/sitemap.xml` in `nuxt dev`; the change appears immediately,
with no server restart needed.

`nuxt generate` (SSG) behaves differently: it only **snapshots** `/sitemap.xml` at build time. If
the product catalog changes after that, the static sitemap goes stale until the next build/deploy
— an SSG deployment of this pattern would need a rebuild trigger (e.g. a webhook fired on catalog
changes) to stay accurate. That rebuild-trigger tooling is out of scope for this POC.

## Out of scope

- Sitemap chunking / sitemap index files for large catalogs.
- Non-detail product routes (attribute/variant pages, flash-sale pages, etc.).
- Any real backend integration — `server/api/products.ts` is a permanent mock, not a
  placeholder to swap out.
- Deployment to any hosting platform.
- SSG rebuild-trigger tooling.
- Locales beyond Thai and English.
- `<link rel="canonical">` meta tags on the product page itself (this POC covers sitemap-side
  canonicalization only).
- **`hreflang` / per-language URLs.** Locale here is read from the `i18n_redirected` cookie on
  a single URL per page, matching the real production frontends. That means there's no
  second URL for a `hreflang` alternate to point at, so none are emitted — see the
  "Multi-language sites" section of `../docs/dynamic-sitemap-seo-article.md` for why that's a
  real (separate) SEO gap, not a bug in this fix.
