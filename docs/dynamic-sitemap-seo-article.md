# Why "no product URLs in the sitemap" is an SEO problem (and how to fix it)

*Internal knowledge-share article. Generic examples only — no real client, domain, or production
URL is referenced anywhere below. A runnable proof-of-concept accompanies this article; you don't
need to run it to follow the argument here.*

## The problem, in plain terms

A sitemap is a list of URLs a site hands to search engines, saying: "here is everything worth
indexing." Search engines don't trust it blindly, but they use it heavily to prioritize what to
crawl — especially for pages that are hard to discover by following links alone.

Several of our Nuxt-based e-commerce frontends generate `sitemap.xml` automatically using a
sitemap module that scans the app's file-based routes. That works well for pages like the
homepage, category listings, or campaign pages, because each of those has its own dedicated file
and URL path.

It does **not** work for product detail pages that are addressed through a query string —
something like `/products/detail?product_id=123` instead of `/products/123`. This is a routing
pattern already in use on some of our real frontends. From the sitemap module's point of view,
`/products/detail` is a single route; it has no way to know that `product_id=123`,
`product_id=456`, and thousands of other values are all separate, indexable products. The result:
the sitemap lists a handful of top-level pages and **zero individual product URLs**.

### Why that matters for SEO

Individual product pages are exactly the pages most likely to rank for specific, high-intent
searches ("navy crew neck t-shirt size M", not "clothing store"). If a search engine can't
discover those URLs through the sitemap — the one channel explicitly designed for surfacing pages
a crawler might otherwise miss — it may take much longer to index them, or never index some of
them at all, especially on a large catalog. Fewer indexed product pages means fewer chances to
show up in search results for the specific things people are actually searching for.

## Before / after: what the fix looks like

Here's a simplified "before" sitemap for a small catalog using the query-string pattern above,
generated with no custom handling — the default output of a file-route-scanning sitemap module:

```xml
<url><loc>https://example-shop.test/</loc></url>
<url><loc>https://example-shop.test/products</loc></url>
<url><loc>https://example-shop.test/campaigns/summer-sale</loc></url>
```

Three URLs, none of them a product. Every product on the site is invisible to this sitemap.

Here's the same catalog with a small amount of custom logic added — a hook that fetches the
product catalog and emits one sitemap entry per product:

```xml
<url><loc>https://example-shop.test/products/detail?product_id=42</loc></url>
<url><loc>https://example-shop.test/products/detail?product_id=43</loc></url>
```

Now every product has its own entry. The mechanism is a hook into the sitemap module's
URL-building step: fetch the product list from the same backend the site already uses, map each
product to a canonical URL, and hand the results to the sitemap module alongside its usual
auto-discovered routes.

## It's not just "add more URLs" — canonical URLs matter too

A real product detail page rarely takes just one query parameter. It might legitimately accept
`category`, a `bundle` id used for a promotional link, or a `status` flag for an internal preview.
Someone can reach the *same* product through several different URLs:

```text
/products/detail?product_id=42
/products/detail?product_id=42&category=shirts
/products/detail?product_id=42&category=shirts&bundle=summer-promo
```

If a naive fix simply reproduced whatever parameters happen to be present on the product record,
the sitemap could end up listing several near-duplicate URLs for the same underlying page. That's
a real cost, not a harmless redundancy: search engines split ranking signals — links, clicks,
relevance — across whichever URLs they've seen for a page. Spread across three near-duplicate
URLs instead of consolidated on one, each version looks weaker than the product actually is,
which can hurt how well it ranks.

The fix, then, isn't just "list the products" — it's "list each product exactly once, at its one
canonical URL." In the query-string case, that means the sitemap entry keeps only the parameter
that actually identifies the product (`product_id`) and drops everything else, regardless of what
extra fields happen to be sitting on the underlying product data. Coverage and canonicalization
are both part of a correct sitemap; fixing one without the other leaves value on the table.

## A second, related gap: multi-language sites without language-specific URLs

Sites with more than one language add another layer: a French-speaking visitor and a
Thai-speaking visitor searching for the same product should each land on the version of the page
in their language, not on a mismatched or duplicate-looking result. Search engines determine this
in large part through `hreflang` annotations — a link, per language, that tells the crawler "this
page has a version in language X at this other URL." Crucially, that only works when each language
actually has its *own* URL for the crawler to point at.

Our frontends currently switch language a different way: one URL per page, with the active
language read back from a cookie (`i18n_redirected`) rather than from the URL itself. That's a
perfectly reasonable choice for the browsing experience — a returning visitor gets their language
automatically, no `/en/` prefix cluttering the address bar. But it has a consequence that's easy to
miss: a crawler doesn't carry cookies between requests. It has no language preference to remember,
so every time it requests `/products/detail?product_id=42`, it gets whatever the *default* language
renders. The non-default-language content on that same URL is, for indexing purposes, invisible —
there's no separate URL for it to be indexed *at*.

Concretely, that means this pattern can't emit `hreflang` annotations at all: there's no second
URL for an alternate to point to. This is a real, second SEO gap sitting right alongside the
missing-product-URLs problem — not a bug in the sitemap fix, but a limitation of the underlying
routing choice that the sitemap fix can't paper over. Solving it for real would mean giving each
language its own URL (a prefix, a subdomain, or a query parameter) — a bigger routing change than
this POC's scope, but worth knowing about before assuming "the sitemap is fixed" means "the
multi-language site is fully indexable."

## A note on freshness: SSR vs. static generation

How "live" the sitemap is depends on how the site is rendered. In server-rendered (SSR) mode —
which is how the POC and most of our production frontends run — `/sitemap.xml` is computed fresh
on every request. Add or remove a product, and the very next request for the sitemap reflects
that change immediately.

A statically generated (SSG) site behaves differently: the sitemap is a snapshot taken at build
time. If the catalog changes afterward, the sitemap doesn't know until the site is rebuilt and
redeployed. That's a legitimate approach, but it needs something SSR doesn't: a way to trigger a
rebuild when the catalog changes (e.g., a webhook from the backend), or the sitemap silently goes
stale. This article doesn't cover how to build that — it's a separate piece of infrastructure —
but it's worth knowing the tradeoff exists before choosing SSG for a catalog that changes often.

## What this doesn't cover

This proof-of-concept and this article deliberately leave out several things a production rollout
of this pattern would eventually need to address:

- **Sitemap chunking / sitemap index files.** Sitemaps have a per-file size/entry limit. A
  catalog with tens of thousands of products needs to be split across multiple sitemap files
  referenced from a sitemap index — a real concern for large catalogs, but not modeled here.
- **Other query-string route types.** Only the primary product detail page is covered. Real
  catalogs often have additional query-routed pages (product variant/attribute pages, flash-sale
  pages, etc.) that would need the same treatment.
- **Any real backend integration.** The POC uses a small, static mock product list standing in
  for a real product API.
- **Deployment or live validation** against tools like Google Search Console or the URL
  Inspection tool — this POC is demonstrated locally only.
- **On-page canonical tags.** This article and the POC address sitemap-side canonicalization
  only. A `<link rel="canonical">` tag on the product page itself is a related, separate fix.
- **Giving each language its own URL.** As covered above, this POC deliberately keeps the
  cookie-based, single-URL-per-page locale pattern our frontends already use, and doesn't
  implement `hreflang` or any other fix for the indexability gap that creates.

## Takeaway

If a frontend routes any indexable content through query strings, don't assume the sitemap module
is seeing it — check. And when you do add it, make sure the fix produces one canonical URL per
page, not just "more URLs" — coverage without canonicalization can trade one SEO problem for
another. Then check the next layer up: if the site also switches language without switching the
URL, be aware that non-default-language content on that page is effectively invisible to search
engines, no matter how correct the sitemap is underneath it.
