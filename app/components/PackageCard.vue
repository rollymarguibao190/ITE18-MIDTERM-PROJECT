<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  title: string;
  destination: string;
  durationDays: number;
  price: number;
  image: string;
  alt: string;
  to: string;
}>();

const priceLabel = computed(() =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(props.price),
);
const durationLabel = computed(() =>
  props.durationDays === 1 ? '1 day' : `${props.durationDays} days`,
);
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
      <span class="absolute top-3 left-3 rounded-full bg-white/90 text-teal text-xs font-semibold px-3 py-1">
        {{ durationLabel }}
      </span>
    </div>
    <div class="p-5 flex flex-1 flex-col">
      <h3 class="font-display font-semibold text-lg text-ink">{{ title }}</h3>
      <p class="text-sm text-primary font-medium">{{ destination }}</p>
      <div class="mt-4 flex items-end justify-between">
        <div>
          <p class="text-xs text-ink/50">Starting from</p>
          <p class="font-display font-bold text-ink text-lg">{{ priceLabel }}</p>
        </div>
        <span class="inline-flex items-center gap-1 text-sm font-semibold text-coral group-hover:gap-2 transition-all">
          View Offer
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
