import { describe, expect, it } from 'vitest'
import { buildProductSitemapEntries } from './sitemapEntries'

describe('buildProductSitemapEntries', () => {
  it('returns an empty array for an empty product list', () => {
    expect(buildProductSitemapEntries([])).toEqual([])
  })

  it('builds a canonical loc containing only product_id, ignoring other fields on the record', () => {
    const entries = buildProductSitemapEntries([
      {
        id: 'sku-42',
        category: 'apparel',
        bundleId: 'bundle-9',
        statusFlag: 'clearance',
        name: { th: 'เสื้อ', en: 'Shirt' },
      },
    ])

    expect(entries).toHaveLength(1)
    expect(entries[0].loc).toBe('/products/detail?product_id=sku-42')
  })
})
