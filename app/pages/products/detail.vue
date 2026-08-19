<script setup lang="ts">
import type { ProductRecord } from '../../server/api/products'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const productId = computed(() => {
  const raw = route.query.product_id
  return Array.isArray(raw) ? (raw[0] ?? undefined) : (raw ?? undefined)
})

const { data: products } = await useFetch<ProductRecord[]>('/api/products')

const product = computed(() =>
  products.value?.find(p => p.id === productId.value) ?? null,
)
</script>

<template>
  <div>
    <template v-if="product">
      <h1 class="text-2xl font-semibold">
        {{ product.name[locale as 'th' | 'en'] }}
      </h1>
      <dl class="mt-4 space-y-2 text-sm">
        <div class="flex gap-2">
          <dt class="text-slate-500">
            {{ t('detail.categoryLabel') }}:
          </dt>
          <dd>{{ product.category }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="text-slate-500">
            {{ t('detail.priceLabel') }}:
          </dt>
          <dd>{{ product.price }}</dd>
        </div>
      </dl>
    </template>
    <template v-else>
      <h1 class="text-2xl font-semibold">
        {{ t('detail.notFoundTitle') }}
      </h1>
      <p class="mt-2 text-slate-500">
        {{ t('detail.notFoundBody') }}
      </p>
    </template>
    <NuxtLink :to="localePath('/')" class="mt-6 inline-block text-sm text-slate-500 hover:underline">
      &larr; {{ t('detail.backToCatalog') }}
    </NuxtLink>
  </div>
</template>
