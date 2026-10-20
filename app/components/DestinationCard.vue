<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  description: string;
  image: string;
  alt: string;
  to: string;
}>();
</script>

<template>
  <NuxtLink :to="to" class="card group flex flex-col">
    <div class="relative h-52 overflow-hidden">
      <img
        :src="image"
        :alt="alt"
        loading="lazy"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-teal-deep/40 to-transparent" />
    </div>
    <div class="p-5 flex flex-1 flex-col">
      <h3 class="font-display font-semibold text-lg text-ink">{{ title }}</h3>
      <p class="text-sm text-primary font-medium">{{ subtitle }}</p>
      <p class="mt-2 text-sm text-ink/70 leading-relaxed flex-1">{{ description }}</p>
      <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
        Explore Destination
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </span>
    </div>
  </NuxtLink>
</template>
