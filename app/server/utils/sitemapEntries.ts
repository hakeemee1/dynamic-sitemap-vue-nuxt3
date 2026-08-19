export interface Product {
  id: string
  [key: string]: unknown
}

export interface LocaleConfig {
  code: string
  /** URL path prefix for this locale, e.g. '' for the unprefixed default locale, '/en' otherwise. */
  prefix: string
  isDefault: boolean
}

export interface SitemapAlternative {
  hreflang: string
  href: string
}

export interface SitemapEntry {
  loc: string
  alternatives: SitemapAlternative[]
}

export const DEFAULT_LOCALES: LocaleConfig[] = [
  { code: 'th', prefix: '', isDefault: true },
  { code: 'en', prefix: '/en', isDefault: false },
]

function buildProductPath(productId: string, prefix: string): string {
  return `${prefix}/products/detail?product_id=${encodeURIComponent(productId)}`
}

export function buildProductSitemapEntries(
  products: Product[],
  locales: LocaleConfig[] = DEFAULT_LOCALES,
): SitemapEntry[] {
  const defaultLocale = locales.find(locale => locale.isDefault) ?? locales[0]
  if (!defaultLocale) return []

  return products.map((product) => {
    const alternatives: SitemapAlternative[] = locales.map(locale => ({
      hreflang: locale.code,
      href: buildProductPath(product.id, locale.prefix),
    }))

    alternatives.push({
      hreflang: 'x-default',
      href: buildProductPath(product.id, defaultLocale.prefix),
    })

    return {
      loc: buildProductPath(product.id, defaultLocale.prefix),
      alternatives,
    }
  })
}
