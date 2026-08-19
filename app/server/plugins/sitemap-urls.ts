import type { Product } from '../utils/sitemapEntries'
import { buildProductSitemapEntries } from '../utils/sitemapEntries'

// Query-string-routed product pages (/products/detail?product_id=...) are invisible to
// @nuxtjs/sitemap's auto-discovery, so product URLs are added explicitly via this hook.
//
// Toggle NUXT_PUBLIC_ENABLE_PRODUCT_SITEMAP=false to reproduce the "before" state
// (stock sitemap, zero product URLs) without removing this file — see README.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('sitemap:input', async (ctx) => {
    const { enableProductSitemap } = useRuntimeConfig().public

    if (!enableProductSitemap) return

    try {
      const products = await $fetch<Product[]>('/api/products')
      ctx.urls.push(...buildProductSitemapEntries(products))
    }
    catch (error) {
      // Degrade to the static routes rather than failing the whole /sitemap.xml request.
      console.error('[sitemap-urls] failed to fetch products, omitting product URLs', error)
    }
  })
})
