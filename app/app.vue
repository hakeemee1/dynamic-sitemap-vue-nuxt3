<script setup lang="ts">
const { locale, locales, t, setLocale } = useI18n()

const availableLocales = computed(() => locales.value.filter(l => l.code !== locale.value))
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <NuxtLink to="/" class="font-semibold">
          {{ t('nav.catalog') }}
        </NuxtLink>
        <nav class="flex gap-3 text-sm">
          <button
            v-for="l in availableLocales"
            :key="l.code"
            type="button"
            class="text-slate-500 hover:text-slate-900"
            @click="setLocale(l.code)"
          >
            {{ l.name }}
          </button>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-4xl px-4 py-8">
      <NuxtPage />
    </main>
  </div>
</template>
