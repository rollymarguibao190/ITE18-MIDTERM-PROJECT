<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDestinationsStore } from '~/stores/destinations';
import { usePackagesStore } from '~/stores/packages';
import type { TourPackage } from '~/types';

const route = useRoute();
const destStore = useDestinationsStore();
const pkgStore = usePackagesStore();

const id = computed(() => route.params.id as string);
const destination = computed(() => destStore.current);
const packages = ref<TourPackage[]>([]);
const notFound = ref(false);

onMounted(async () => {
  try {
    await destStore.fetchOne(id.value);
    if (destStore.error || !destStore.current) {
      notFound.value = true;
      return;
    }
    // Load all packages and filter locally so the store is populated for the offers page.
    await pkgStore.fetchAll();
    packages.value = pkgStore.byDestination(id.value);
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
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="destStore.loading" class="container-page py-16" aria-live="polite">
      <div class="h-72 bg-primary-50 rounded-2xl animate-pulse mb-6" />
      <div class="h-8 w-1/2 bg-primary-50 rounded animate-pulse mb-3" />
      <div class="h-5 w-1/3 bg-primary-50/70 rounded animate-pulse" />
    </div>

    <!-- Error / not found -->
    <div v-else-if="notFound || destStore.error" class="container-page py-20 text-center">
      <p class="font-display font-bold text-3xl text-ink">Destination not found</p>
      <p class="mt-2 text-ink/60">The destination you're looking for doesn't exist.</p>
      <NuxtLink to="/destinations" class="btn-primary mt-6">Back to Destinations</NuxtLink>
    </div>

    <!-- Content -->
    <div v-else-if="destination">
      <!-- Hero image -->
      <section class="relative isolate overflow-hidden">
        <div class="absolute inset-0 -z-10">
          <img
            :src="destination.image"
            :alt="`${destination.name} in ${destination.province}`"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-teal-deep/60 to-teal-deep/80" />
        </div>
        <div class="container-page py-20 text-white">
          <NuxtLink to="/destinations" class="text-white/80 text-sm hover:text-sky inline-flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M11 19l-7-7 7-7" /></svg>
            All destinations
          </NuxtLink>
          <p class="text-sky-light font-semibold text-sm mt-4 uppercase tracking-wide">{{ destination.province }}</p>
          <h1 class="font-display font-bold text-4xl sm:text-5xl mt-1">{{ destination.name }}</h1>
        </div>
      </section>

      <section class="container-page py-12">
        <div class="grid lg:grid-cols-3 gap-10">
          <div class="lg:col-span-2">
            <h2 class="font-display font-bold text-2xl text-ink mb-3">About this destination</h2>
            <p class="text-ink/75 leading-relaxed">{{ destination.description }}</p>

            <h2 class="font-display font-bold text-2xl text-ink mt-8 mb-3">Highlights</h2>
            <ul class="grid sm:grid-cols-2 gap-2">
              <li
                v-for="h in destination.highlights"
                :key="h"
                class="flex items-start gap-2 text-ink/80"
              >
                <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-coral text-white text-xs shrink-0">✓</span>
                {{ h }}
              </li>
            </ul>
          </div>

          <aside>
            <div class="card p-6 sticky top-24">
              <h3 class="font-display font-semibold text-lg text-ink">Plan your visit</h3>
              <p class="text-sm text-ink/60 mt-1">
                {{ packages.length }} tour {{ packages.length === 1 ? 'package' : 'packages' }} available.
              </p>
              <NuxtLink to="/offers" class="btn-primary w-full mt-4">View tour offers</NuxtLink>
              <NuxtLink to="/" class="btn-ghost w-full mt-2">Search trips</NuxtLink>
            </div>
          </aside>
        </div>
      </section>

      <!-- Packages for this destination -->
      <section v-if="packages.length" class="bg-primary-50/60 py-12">
        <div class="container-page">
          <h2 class="font-display font-bold text-2xl text-ink mb-6">Tours to {{ destination.name }}</h2>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PackageCard
              v-for="p in packages"
              :key="p.id"
              :title="p.name"
              :destination="p.destinationName"
              :duration-days="p.durationDays"
              :price="p.price"
              :image="p.image"
              :alt="`${p.name} tour in ${p.destinationName}`"
              :to="`/packages/${p.id}`"
            />
          </div>
        </div>
      </section>

      <p class="container-page text-xs text-ink/50 py-6">
        Demo content — descriptions are illustrative; prices and availability come from mock data only.
      </p>
    </div>
  </div>
</template>
