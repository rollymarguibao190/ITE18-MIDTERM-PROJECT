<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  icon?: 'compass' | 'map' | 'calendar' | 'pin' | 'info' | 'mail' | 'book' | 'user' | 'shield' | 'tag';
}>();
</script>

<template>
  <div class="container-page py-16">
    <div class="max-w-2xl mx-auto text-center">
      <div class="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary mb-5">
        <svg v-if="icon === 'compass'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="m16 8-2 6-6 2 2-6 6-2z" /></svg>
        <svg v-else-if="icon === 'map'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" /><path d="M9 3v15M15 6v15" /></svg>
        <svg v-else-if="icon === 'calendar'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
        <svg v-else-if="icon === 'pin'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
        <svg v-else-if="icon === 'mail'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
        <svg v-else-if="icon === 'book'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
        <svg v-else-if="icon === 'user'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
        <svg v-else-if="icon === 'shield'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4z" /></svg>
        <svg v-else-if="icon === 'tag'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12 12 20l-9-9V3h8l9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>
        <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
      </div>
      <h1 class="font-display font-bold text-3xl text-ink">{{ title }}</h1>
      <p v-if="subtitle" class="mt-3 text-ink/70">{{ subtitle }}</p>
      <div class="mt-6">
        <slot />
      </div>
    </div>
  </div>
</template>
