# 03 — Multi-language product URLs + hreflang alternates

**What to build:** Two-locale support (Thai default, no URL prefix; English, `/en/` prefix) via `@nuxtjs/i18n`'s `prefix_except_default` strategy, extended to the product detail route. Each product's sitemap entry gains `hreflang` alternate links for both locales plus `x-default`, pointing at the Thai (default) URL.

**Blocked by:** 02 — Canonical per-product sitemap entries via custom hook

**Status:** ready-for-agent

- [ ] `/products/detail?product_id=<id>` (Thai, default, no prefix) and `/en/products/detail?product_id=<id>` (English) both render the product's localized name/content
- [ ] Product data in the mock API carries per-locale fields (at minimum a localized name) keyed by `th`/`en`
- [ ] Each `/sitemap.xml` product entry includes `hreflang` alternates for `th` and `en`, plus an `x-default` alternate pointing at the Thai (default, unprefixed) URL
- [ ] Unit tests (extending the pure function from ticket 02) cover: correct `/en/` prefixing on the English alternate, no prefix on the Thai alternate, and presence/correctness of `x-default`
- [ ] The canonical URL rule from ticket 02 (only `product_id`, no noise params) still holds for both locale variants
