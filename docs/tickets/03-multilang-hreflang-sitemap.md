# 03 — Multi-language product content via cookie-based locale (no hreflang)

**What to build:** Two-locale support (Thai default, English) via `@nuxtjs/i18n`'s `no_prefix`
strategy, matching how the real production frontends currently do locale switching: a single
URL per page, with the active language read from the `i18n_redirected` cookie
(`detectBrowserLanguage`) rather than a `/en`/`/th` URL prefix.

**Revision note:** This ticket originally specified a `prefix_except_default` strategy (distinct
`/en/`-prefixed URLs) so that each product's sitemap entry could carry `hreflang` alternates. That
was changed to match the cookie-only pattern the real frontends already use. Because locale is no
longer part of the URL, there is only one crawlable URL per product — there's no second-locale URL
left for a `hreflang` alternate to point at, so this ticket no longer produces any. That's a real
SEO limitation of the cookie-only pattern (crawlers don't carry cookies, so they only ever see the
default-locale content), not an oversight — see the "Multi-language sites" section of
`docs/dynamic-sitemap-seo-article.md` for the write-up aimed at the knowledge-share audience.

**Blocked by:** 02 — Canonical per-product sitemap entries via custom hook

**Status:** done

- [x] The catalog and product detail pages render in Thai or English from the same URL, based on
      the `i18n_redirected` cookie (`@nuxtjs/i18n`'s `detectBrowserLanguage`, `no_prefix` strategy)
- [x] Product data in the mock API carries per-locale fields (at minimum a localized name) keyed by
      `th`/`en`
- [x] The language switcher in the UI sets the cookie and re-renders the current page in the new
      language, without changing the URL
- [x] `/sitemap.xml` continues to emit exactly one canonical entry per product (`loc` containing
      only `product_id`, per ticket 02) — no `hreflang`/`alternatives` are emitted, since there is
      no second URL for them to reference
- [x] The knowledge-share article explains why this pattern can't produce meaningful `hreflang`
      annotations, as a second, related SEO gap alongside the missing-product-URLs problem
