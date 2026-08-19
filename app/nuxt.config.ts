import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  ssr: true,

  modules: [
    '@nuxtjs/sitemap',
    '@nuxtjs/i18n',
  ],

  css: ['~/assets/css/main.css'],

  // @nuxtjs/sitemap auto-detects @nuxtjs/i18n and, by default, splits into a sitemap index with
  // one sub-sitemap per locale. Locale here is cookie-based, not URL-based (see i18n.strategy
  // below), so there's nothing per-locale for it to split - keep it off and let
  // server/plugins/sitemap-urls.ts emit a single flat /sitemap.xml.
  sitemap: {
    autoI18n: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      // Toggle to reproduce the "before" (stock, no product URLs) vs "after" (canonical
      // product URLs) sitemap states without editing code - see README.
      enableProductSitemap: true,
    },
  },

  // Matches how the real production frontends currently do locale switching: a single URL per
  // page, with the active language read back from the `i18n_redirected` cookie rather than a
  // /en /th URL prefix. See docs/dynamic-sitemap-seo-article.md for the SEO tradeoff this
  // implies (a crawler, which doesn't carry cookies, only ever sees the default-locale content).
  i18n: {
    locales: [
      { code: 'th', language: 'th-TH', name: 'ไทย', file: 'th.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'th',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
  },
})
