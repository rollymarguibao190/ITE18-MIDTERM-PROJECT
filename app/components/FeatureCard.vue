<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon: 'compass' | 'map' | 'calendar' | 'pin';
}>();
</script>

<template>
  <div class="card p-6 text-center sm:text-left">
    <div class="mx-auto sm:mx-0 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary mb-4">
      <svg v-if="icon === 'compass'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="m16 8-2 6-6 2 2-6 6-2z" /></svg>
      <svg v-else-if="icon === 'map'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" /><path d="M9 3v15M15 6v15" /></svg>
      <svg v-else-if="icon === 'calendar'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
      <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
    </div>
    <h3 class="font-display font-semibold text-lg text-ink">{{ title }}</h3>
    <p class="mt-2 text-sm text-ink/70 leading-relaxed">{{ description }}</p>
  </div>
</template>
