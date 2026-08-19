# 02 — Canonical per-product sitemap entries via custom hook

**What to build:** A custom `sitemap:urls` Nitro hook that fetches the mock product catalog and emits one canonical sitemap entry per product, containing only the `product_id` query parameter — stripping any other noise parameters a real detail page might carry (category, bundle, status flags, etc.). The URL-building logic is a pure function, separate from the Nitro hook wiring, so it is unit-testable without booting a Nuxt/Nitro server.

**Blocked by:** 01 — POC scaffold: product catalog + query-string detail route + mock API

**Status:** ready-for-agent

- [ ] `vitest` is added as a `devDependency` and a test script/config is in place
- [ ] A pure function exists that maps `(products) → sitemap entries`, independent of the Nitro hook and the mock API route
- [ ] `/sitemap.xml` now includes one entry per product, with `loc` containing only `product_id` as a query parameter (no other params leak through even if present on the input product record)
- [ ] Unit tests cover: correct canonical `loc` per product, and that extraneous query parameters present on a product record are excluded from the generated URL
- [ ] An empty product list produces a well-defined result (no entries, no throw) — covered by a unit test
- [ ] The "before" state from ticket 01 remains reproducible for comparison (e.g. by describing how to temporarily disable the custom hook), so the canonicalization fix can be demonstrated as an explicit before/after
