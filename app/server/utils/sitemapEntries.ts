export interface Product {
  id: string
  [key: string]: unknown
}

export interface SitemapEntry {
  loc: string
}

function buildProductPath(productId: string): string {
  return `/products/detail?product_id=${encodeURIComponent(productId)}`
}

// Locale is determined client-side via the i18n_redirected cookie, not the URL, so each product
// has exactly one crawlable URL - there is no second locale URL for a hreflang alternate to
// point at. See docs/dynamic-sitemap-seo-article.md for why that's a real SEO limitation of this
// pattern, not an oversight.
export function buildProductSitemapEntries(products: Product[]): SitemapEntry[] {
  return products.map(product => ({
    loc: buildProductPath(product.id),
  }))
}
