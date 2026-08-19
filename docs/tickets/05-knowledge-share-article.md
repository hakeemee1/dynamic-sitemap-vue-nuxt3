# 05 — Knowledge-share article

**What to build:** A single Markdown article for the internal knowledge-share wiki, written for a mixed technical/non-technical audience, walking through the problem (missing product URLs in the sitemap), the fix (canonical URLs + custom hook + hreflang), and why it matters for SEO. Generic throughout — no real client name, domain, or production URL referenced anywhere.

**Blocked by:** 04 — Before/after demo walkthrough in POC README

**Status:** ready-for-agent

- [ ] Article opens with the problem framed in SEO-impact terms a non-technical reader can follow (why missing product URLs in a sitemap hurts discoverability/indexing)
- [ ] Article includes a concrete before/after `sitemap.xml` comparison, using generic example data drawn from the POC
- [ ] Article explains the canonical-URL / duplicate-content angle (why stripping noise query parameters matters, not just adding more URLs)
- [ ] Article includes a brief SSR-vs-SSG note on sitemap freshness, consistent with the README from ticket 04
- [ ] Article explicitly states what's out of scope / not covered by the POC (e.g. sitemap chunking for large catalogs, non-detail product routes, deployment) so readers don't assume it's a complete production solution
- [ ] No real client name, domain, or production URL appears anywhere in the article
- [ ] Article is saved as a single Markdown file suitable for the internal wiki (no public/semi-public blog platform formatting requirements)
