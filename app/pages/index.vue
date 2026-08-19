<script setup lang="ts">
import type { ProductRecord } from '../server/api/products'

const { t, locale } = useI18n()

const { data: products } = await useFetch<ProductRecord[]>('/api/products')
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-semibold">
      {{ t('catalog.title') }}
    </h1>
    <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <li
        v-for="product in products"
        :key="product.id"
        class="rounded-lg border border-slate-200 bg-white p-4"
      >
        <NuxtLink
          :to="{ path: '/products/detail', query: { product_id: product.id } }"
          class="font-medium hover:underline"
        >
          {{ product.name[locale as 'th' | 'en'] }}
        </NuxtLink>
        <p class="mt-1 text-sm text-slate-500">
          {{ product.category }}
        </p>
      </li>
    </ul>
  </div>
</template>
