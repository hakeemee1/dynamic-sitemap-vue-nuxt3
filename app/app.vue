<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

const availableLocales = computed(() => locales.value.filter(l => l.code !== locale.value))
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <NuxtLink :to="localePath('/')" class="font-semibold">
          {{ t('nav.catalog') }}
        </NuxtLink>
        <nav class="flex gap-3 text-sm">
          <NuxtLink
            v-for="l in availableLocales"
            :key="l.code"
            :to="switchLocalePath(l.code)"
            class="text-slate-500 hover:text-slate-900"
          >
            {{ l.name }}
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-4xl px-4 py-8">
      <NuxtPage />
    </main>
  </div>
</template>
