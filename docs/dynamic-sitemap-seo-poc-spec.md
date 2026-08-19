# Spec: Dynamic Sitemap POC for E-commerce SEO Knowledge Share

> **Amendment (post-implementation):** every `hreflang` / `prefix_except_default` reference below
> describes the originally planned approach. The implementation was changed to use
> `@nuxtjs/i18n`'s `no_prefix` strategy with cookie-based locale switching (`i18n_redirected`),
> matching how the real production frontends currently work. See
> `docs/tickets/03-multilang-hreflang-sitemap.md` for the revised ticket and the "Multi-language
> sites" section of `docs/dynamic-sitemap-seo-article.md` for why that means no `hreflang`
> alternates are emitted.

## Problem Statement

Our Nuxt 3 e-commerce frontends generate `sitemap.xml` automatically via `@nuxtjs/sitemap`, but that automatic discovery only picks up static, file-based routes. Product detail pages that are addressed via query-string parameters (a routing pattern our frontends actually use, e.g. `/products/detail?product_id=123`) are invisible to the module's auto-discovery. The practical result: the sitemap lists a handful of top-level pages (home, listing, campaign pages) and **zero individual product URLs**.

This means search engines cannot reliably discover or index individual product pages through the sitemap — the single channel most e-commerce SEO strategies depend on for surfacing long-tail, high-intent product searches. Beyond missing entries, the query-string pattern also carries a latent duplicate-content risk: the same product is reachable through several superfluous query parameters (category, bundle, status flags), and a sitemap that reproduces those raw URLs would dilute ranking signal across near-duplicate addresses instead of consolidating it on one canonical URL.

The team (engineers and non-technical stakeholders alike) does not currently have a shared, concrete understanding of why this matters or what a fix looks like. There is no working example in the codebase showing how to make `@nuxtjs/sitemap` handle query-string-based dynamic routes, how to keep the emitted URLs canonical, or how to extend the same mechanism to multi-language (hreflang) URLs once locale-prefixed routes are introduced.

## Solution

Build a small, runnable, generic (not tied to any named client site or domain) proof-of-concept Nuxt 3 application that demonstrates:

1. A "before" state: the default `@nuxtjs/sitemap` output for a query-string-routed product catalog, showing the missing product URLs.
2. An "after" state: the same catalog with a custom `sitemap:urls` Nitro hook wired up, emitting one clean, canonical URL per product plus correct `hreflang` alternates for two locales (Thai default + English), sourced from a self-hosted mock product API.
3. A single Markdown article for the internal knowledge-share wiki that walks a mixed (technical + non-technical) audience through the problem, the fix, and why it matters for SEO — written generically, without naming or linking to any real client site.

The POC and the article are companion deliverables: the article references the POC's structure and findings but does not require the reader to run the code to follow the argument.

## User Stories

1. As a Nuxt developer on an e-commerce frontend, I want to see a working example of a custom `sitemap:urls` hook, so that I can replicate the pattern on a codebase that uses query-string product routing.
2. As a Nuxt developer, I want the mock product data served from a Nitro server route (`server/api/...`), so that the example mirrors how a real backend integration would be wired in production.
3. As a Nuxt developer, I want the sitemap entry for each product to contain only the query parameter that identifies the product (`product_id`), so that I understand how to strip non-canonical noise parameters when generating sitemap URLs.
4. As a Nuxt developer, I want to see `hreflang` alternate links generated per product for both locales (including `x-default`), so that I have a template for multi-language sitemap support.
5. As a Nuxt developer, I want to run `nuxt dev`, edit the mock product dataset, and see `/sitemap.xml` reflect the change on the next request without restarting the server, so that I understand SSR-mode sitemap generation is computed live per-request.
6. As a Nuxt developer, I want a short written note contrasting SSR vs SSG behavior for `/sitemap.xml`, so that I know static generation only snapshots the sitemap at build time and would need a rebuild trigger in that mode.
7. As a PM or non-technical stakeholder, I want a plain-language explanation (in the knowledge-share article) of why "no product URLs in the sitemap" hurts SEO, so that I can evaluate the priority of fixing this on our real frontends.
8. As a PM or non-technical stakeholder, I want a concrete before/after comparison of sitemap output, so that the impact is visible without needing to read code.
9. As a reader of the knowledge-share article, I want the examples to be generic (no real client name, domain, or production URL referenced), so that the article is safe to keep in the internal wiki without exposing a client's technical weaknesses.
10. As a reader of the article, I want the duplicate-content / canonical URL angle explained alongside the missing-URL angle, so that I understand sitemap correctness is not just about coverage but also about not fragmenting SEO signal across near-duplicate URLs.
11. As a maintainer of this POC repo, I want the URL-building logic covered by unit tests, so that future changes to the canonicalization or hreflang logic don't silently break without needing a running Nuxt server to catch it.
12. As a knowledge-share attendee, I want the article to state clearly what was deliberately left out of scope (e.g. sitemap chunking for large catalogs, non-detail product routes, production deployment), so that I don't assume the POC is a complete production-ready solution.

## Implementation Decisions

- **Stack**: Nuxt 3 (already scaffolded via existing `package.json`), using `@nuxtjs/sitemap` (already a dependency) and `@nuxtjs/i18n` (already a dependency) — no new core dependencies beyond a test runner.
- **Mock backend**: A Nitro server route (e.g. `server/api/products.ts`) returns a small in-memory/static JSON dataset of ~20–30 products. Each product carries per-locale fields (at minimum a localized name) keyed by locale code (`th`, `en`). This route stands in for a real backend and is the only "data source" the sitemap logic talks to.
- **Routing pattern under test**: Product detail pages are addressed as `/products/detail?product_id=<id>` — a single Nuxt page (`pages/products/detail.vue`) that reads `product_id` from the query string. This intentionally mirrors a real-world pattern already in use on our production frontends, generalized so no specific site is identifiable.
- **Sitemap URL generation**: Because query-string routes are not auto-discoverable by `@nuxtjs/sitemap`, URLs are produced via a custom `sitemap:urls` Nitro hook that fetches the mock product list and maps each product to a sitemap entry.
- **Canonical URL rule**: Each sitemap entry's `loc` includes only `product_id` as a query parameter. Any other parameters a real detail page might carry (category, bundle, status flags, etc.) are explicitly excluded from the generated sitemap URL — this is a deliberate canonicalization decision, not an oversight, and the article calls it out as the fix for the duplicate-content risk.
- **Extracted seam (see Testing Decisions)**: The mapping from `(products, locale config) → sitemap entries` is implemented as a pure function, separate from the Nitro hook and from the mock API route, so it can be unit tested without booting a Nuxt/Nitro server.
- **Internationalization**: Two locales — Thai (`th`, default, no URL prefix) and English (`en`, `/en/` prefix) — matching `@nuxtjs/i18n`'s `prefix_except_default` strategy. Each product's sitemap entry includes `hreflang` alternates for both locales plus `x-default` pointing at the Thai (default) URL.
- **Rendering mode**: SSR (matches the real production frontends' PRD). The POC demonstrates that `/sitemap.xml` is computed per-request in dev/SSR mode — editing the mock dataset and reloading the sitemap URL shows the change immediately, no rebuild needed.
- **Out-of-the-box comparison**: The repo should make it easy to see both states — e.g. a documented step of temporarily disabling the custom hook (or a `before`/`after` note in the README) — so the "before" sitemap (missing product URLs) and "after" sitemap (full canonical + hreflang entries) can both be shown during the demo.
- **Deployment**: None. The POC is demoed locally via `nuxt dev`; no deployment to Vercel/Netlify/etc. is part of this spec.
- **Scope of routes**: Only the product detail page is covered. Other route types that a real catalog might have (attribute/variant pages, campaign/flash-sale pages) are explicitly not modeled in this POC.
- **Anonymization constraint**: Nothing in the POC code, comments, README, or the knowledge-share article may reference a real client's domain, company name, or production URL. All example data (product names, categories) must be generic/fictional.
- **Knowledge-share article**: A single Markdown file (destination: internal wiki, exact location TBD by the author outside this spec) aimed at a mixed technical/non-technical audience. It must include: the problem framed in SEO-impact terms a non-technical reader can follow, a before/after sitemap.xml comparison (generic data), an explanation of the canonical-URL/duplicate-content angle, and a brief SSR-vs-SSG note on sitemap freshness.

## Testing Decisions

- **What makes a good test here**: Test the sitemap-entry-building logic as a pure function of its inputs (product list + locale config) and assert on the shape/content of its output (`loc`, `hreflang` alternates, `x-default`). Do not test framework wiring (the Nitro hook registration itself, the HTTP round-trip to `/sitemap.xml`, or Nuxt's rendering pipeline) — that is demonstrated live during the walkthrough instead, not unit tested.
- **Module under test**: The extracted pure function that maps `(products, locales) → sitemap entries` (see Implementation Decisions). This is the single seam for automated testing in this POC.
- **Cases to cover**:
  - A product maps to a canonical `loc` containing only `product_id` (no extraneous query params leak through even if present on the input product record).
  - Each product entry includes `hreflang` alternates for both `th` and `en`, plus `x-default`.
  - Locale URL prefixing is correct: `en` alternate is prefixed with `/en/`, `th` (default) alternate has no prefix.
  - An empty product list produces an empty (or otherwise well-defined) result rather than throwing.
- **Test runner**: `vitest` — not currently a dependency; add it under `devDependencies` as part of this work, since no test framework exists in the repo yet.
- **Prior art**: None in this repo (it is a fresh scaffold with only `package.json`). No existing test conventions to follow; `vitest` is chosen as the Nuxt ecosystem's standard rather than because of precedent in this codebase.

## Out of Scope

- Sitemap chunking / sitemap index files for large catalogs (tens of thousands of products) — acknowledged as a real concern for production catalogs but not part of this POC's narrative.
- Non-detail product routes (`/products/detail_att`, `/products/FlashSale`, or equivalents) — only the primary product detail page is modeled.
- Any real backend integration — the mock Nitro route is a permanent stand-in for this POC, not a placeholder to be swapped for a real API as part of this work.
- Deployment to any hosting platform; live validation against Google Search Console / Rich Results Test / URL Inspection tooling.
- SSG (`nuxt generate`) rebuild-trigger tooling (e.g. webhook-triggered rebuilds on product change) — only discussed as a note in the article, not implemented.
- Locales beyond Thai and English.
- Referencing, naming, or linking any real client site, domain, or production sitemap.
- Publishing the knowledge-share article anywhere other than the internal wiki (no public/semi-public blog platform).
- `<link rel="canonical">` meta tag implementation on the actual product page component — this spec covers sitemap-side canonicalization only; on-page canonical tags are a related but separate concern the article may mention but this POC does not implement.

## Further Notes

- The routing pattern, sitemap gap, and duplicate-content risk described here were confirmed against a real production sitemap during discovery, but per the anonymization constraint, no identifying detail from that investigation should appear in the POC repo or the article — only the generalized pattern.
- This spec assumes a single knowledge-share session is the immediate goal; a possible but explicitly deferred follow-up (not part of this spec) is a second session covering sitemap chunking/index files for large catalogs, since that was raised and consciously deprioritized during scoping.
- No issue-tracker integration was set up for this repo (`/setup-matt-pocock-skills` has not been run; the repo is not yet a git repository). This spec is filed as a plain Markdown file under `docs/` at the user's explicit direction, rather than published to an issue tracker.
