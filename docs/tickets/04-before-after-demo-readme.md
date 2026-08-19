# 04 — Before/after demo walkthrough in POC README

**What to build:** A README that lets anyone reproduce the full before/after comparison live during a demo or knowledge-share session: the default (broken) sitemap from ticket 01 versus the fixed, canonical, multi-language sitemap from tickets 02–03. Includes a short explanatory note on SSR vs SSG sitemap freshness.

**Blocked by:** 03 — Multi-language product URLs + hreflang alternates

**Status:** ready-for-agent

- [ ] README documents how to run the app (`nuxt dev`) and view `/sitemap.xml`
- [ ] README documents a concrete step-by-step to reproduce the "before" state (missing product URLs) and the "after" state (canonical + hreflang entries), e.g. via a documented way to toggle the custom hook off/on
- [ ] README includes a short note that editing the mock product dataset and reloading `/sitemap.xml` in dev/SSR mode reflects the change immediately (computed per-request), contrasted with `nuxt generate` (SSG) only snapshotting the sitemap at build time
- [ ] No real client name, domain, or production URL appears anywhere in the README
