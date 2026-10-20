<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePackagesStore } from '~/stores/packages';
import type { TourPackage } from '~/types';

const route = useRoute();
const pkgStore = usePackagesStore();

const id = computed(() => route.params.id as string);
const pkg = computed<TourPackage | null>(() => pkgStore.current);
const notFound = ref(false);

onMounted(async () => {
  try {
    await pkgStore.fetchOne(id.value);
    if (pkgStore.error || !pkgStore.current) notFound.value = true;
  } catch {
    notFound.value = true;
  }
});

function priceLabel(p: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(p);
}

const durationLabel = computed(() => {
  if (!pkg.value) return '';
  return pkg.value.durationDays === 1 ? '1 day' : `${pkg.value.durationDays} days`;
});
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="pkgStore.loading" class="container-page py-16" aria-live="polite">
      <div class="h-72 bg-primary-50 rounded-2xl animate-pulse mb-6" />
      <div class="h-8 w-1/2 bg-primary-50 rounded animate-pulse mb-3" />
      <div class="h-5 w-1/3 bg-primary-50/70 rounded animate-pulse" />
    </div>

    <!-- Not found -->
    <div v-else-if="notFound || pkgStore.error" class="container-page py-20 text-center">
      <p class="font-display font-bold text-3xl text-ink">Package not found</p>
      <p class="mt-2 text-ink/60">The tour package you're looking for doesn't exist.</p>
      <NuxtLink to="/offers" class="btn-primary mt-6">Back to Offers</NuxtLink>
    </div>

    <!-- Content -->
    <div v-else-if="pkg">
      <section class="relative isolate overflow-hidden">
        <div class="absolute inset-0 -z-10">
          <img :src="pkg.image" :alt="`${pkg.name} tour in ${pkg.destinationName}`" class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-b from-teal-deep/55 to-teal-deep/80" />
        </div>
        <div class="container-page py-20 text-white">
          <NuxtLink to="/offers" class="text-white/80 text-sm hover:text-sky inline-flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M11 19l-7-7 7-7" /></svg>
            All offers
          </NuxtLink>
          <span class="inline-block mt-4 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">{{ durationLabel }}</span>
          <h1 class="font-display font-bold text-4xl sm:text-5xl mt-3 max-w-2xl">{{ pkg.name }}</h1>
          <p class="mt-2 text-white/85">{{ pkg.destinationName }}</p>
        </div>
      </section>

      <section class="container-page py-12">
        <div class="grid lg:grid-cols-3 gap-10">
          <div class="lg:col-span-2">
            <h2 class="font-display font-bold text-2xl text-ink mb-3">Tour overview</h2>
            <p class="text-ink/75 leading-relaxed">{{ pkg.description }}</p>

            <h2 class="font-display font-bold text-2xl text-ink mt-8 mb-3">What's included</h2>
            <ul class="grid sm:grid-cols-2 gap-2">
              <li v-for="inc in pkg.includes" :key="inc" class="flex items-start gap-2 text-ink/80">
                <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-coral text-white text-xs shrink-0">✓</span>
                {{ inc }}
              </li>
            </ul>

            <NuxtLink :to="`/destinations/${pkg.destinationId}`" class="inline-flex items-center gap-1 text-primary font-semibold mt-8 hover:gap-2 transition-all">
              Explore {{ pkg.destinationName }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </NuxtLink>
          </div>

          <aside>
            <div class="card p-6 sticky top-24">
              <p class="text-sm text-ink/50">Starting from</p>
              <p class="font-display font-bold text-3xl text-ink">{{ priceLabel(pkg.price) }}</p>
              <p class="text-sm text-ink/60 mt-1">per person · {{ durationLabel }}</p>
              <hr class="my-4 border-primary-100" />
              <NuxtLink :to="`/book/${pkg.id}`" class="btn-primary w-full">Book this tour</NuxtLink>
              <NuxtLink to="/offers" class="btn-ghost w-full mt-2">Back to offers</NuxtLink>
              <p class="text-xs text-ink/50 mt-4">
                Demo pricing — booking confirmation arrives in Stage 4.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  </div>
</template>
