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

  // @nuxtjs/sitemap auto-detects @nuxtjs/i18n and, by default, splits into a sitemap index
  // with one sub-sitemap per locale. This POC instead hand-builds hreflang `alternatives` on
  // a single flat /sitemap.xml (see server/plugins/sitemap-urls.ts), so that auto-splitting
  // is turned off here.
  sitemap: {
    autoI18n: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      // Toggle to reproduce the "before" (stock, no product URLs) vs "after" (canonical +
      // hreflang product URLs) sitemap states without editing code - see README.
      enableProductSitemap: true,
    },
  },

  i18n: {
    locales: [
      { code: 'th', language: 'th-TH', name: 'ไทย', file: 'th.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'th',
    strategy: 'prefix_except_default',
  },
})
