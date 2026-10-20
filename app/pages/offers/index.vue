<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { usePackagesStore } from '~/stores/packages';
import { useDestinationsStore } from '~/stores/destinations';
import type { TourPackage } from '~/types';

const pkgStore = usePackagesStore();
const destStore = useDestinationsStore();
const route = useRoute();

const searchQuery = ref('');
const selectedDestination = ref((route.query.destination as string) || '');
const selectedDuration = ref('');
const sortBy = ref('price-asc');

onMounted(async () => {
  await Promise.all([pkgStore.fetchAll(), destStore.fetchAll()]);
  if (route.query.destination) {
    selectedDestination.value = route.query.destination as string;
  }
});

watch(() => route.query, (q) => {
  selectedDestination.value = (q.destination as string) || '';
});

const filtered = computed<TourPackage[]>(() => {
  let list = [...pkgStore.items];
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.destinationName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }
  if (selectedDestination.value) {
    list = list.filter((p) => p.destinationId === selectedDestination.value);
  }
  if (selectedDuration.value === '1') list = list.filter((p) => p.durationDays === 1);
  if (selectedDuration.value === '2-3') list = list.filter((p) => p.durationDays >= 2 && p.durationDays <= 3);
  if (selectedDuration.value === '4+') list = list.filter((p) => p.durationDays >= 4);

  if (sortBy.value === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sortBy.value === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (sortBy.value === 'duration') list.sort((a, b) => a.durationDays - b.durationDays);
  return list;
});

function clearFilters() {
  searchQuery.value = '';
  selectedDestination.value = '';
  selectedDuration.value = '';
  sortBy.value = 'price-asc';
}

const searchSummary = computed(() => {
  const parts: string[] = [];
  if (selectedDestination.value) {
    const d = destStore.getById(selectedDestination.value);
    parts.push(`destination: ${d?.name || selectedDestination.value}`);
  }
  if (route.query.date) parts.push(`date: ${route.query.date}`);
  if (route.query.travelers) parts.push(`travelers: ${route.query.travelers}`);
  return parts.join(' · ');
});
</script>

<template>
  <div>
    <section class="bg-white border-b border-primary-100">
      <div class="container-page py-10">
        <p class="text-coral font-semibold text-sm uppercase tracking-wide">Special Offers</p>
        <h1 class="font-display font-bold text-3xl text-ink mt-1">Tour Packages & Offers</h1>
        <p class="mt-2 text-ink/70 max-w-2xl">
          Browse tour packages across the Caraga Region. Filter by destination or duration
          to find the trip that suits you.
        </p>
        <p v-if="searchSummary" class="mt-3 text-sm text-primary bg-primary-50 inline-block rounded-full px-4 py-1.5">
          Search: {{ searchSummary }}
        </p>
      </div>
    </section>

    <section class="container-page py-10">
      <!-- Filters -->
      <div class="card p-4 mb-8">
        <div class="grid gap-3 md:grid-cols-[1.4fr_1fr_0.8fr_1fr_auto] md:items-end">
          <div>
            <label class="label" for="pkg-search">Search</label>
            <input id="pkg-search" v-model="searchQuery" type="search" placeholder="Package name or destination" class="input" />
          </div>
          <div>
            <label class="label" for="pkg-dest">Destination</label>
            <select id="pkg-dest" v-model="selectedDestination" class="input">
              <option value="">All destinations</option>
              <option v-for="d in destStore.items" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div>
            <label class="label" for="pkg-dur">Duration</label>
            <select id="pkg-dur" v-model="selectedDuration" class="input">
              <option value="">Any</option>
              <option value="1">1 day</option>
              <option value="2-3">2–3 days</option>
              <option value="4+">4+ days</option>
            </select>
          </div>
          <div>
            <label class="label" for="pkg-sort">Sort by</label>
            <select id="pkg-sort" v-model="sortBy" class="input">
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="duration">Duration</option>
            </select>
          </div>
          <button class="btn-ghost h-[46px]" @click="clearFilters">Clear</button>
        </div>
      </div>

      <!-- States -->
      <div v-if="pkgStore.loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        <div v-for="n in 6" :key="n" class="card overflow-hidden">
          <div class="h-52 bg-primary-50 animate-pulse" />
          <div class="p-5 space-y-2">
            <div class="h-5 w-2/3 bg-primary-50 rounded animate-pulse" />
            <div class="h-4 w-1/2 bg-primary-50/70 rounded animate-pulse" />
            <div class="h-5 w-1/3 bg-primary-50/50 rounded animate-pulse mt-3" />
          </div>
        </div>
      </div>

      <div v-else-if="pkgStore.error" class="card p-10 text-center" role="alert">
        <p class="text-coral font-semibold">Couldn't load tour packages</p>
        <p class="text-ink/60 text-sm mt-1">{{ pkgStore.error }}</p>
        <button class="btn-primary mt-4" @click="pkgStore.fetchAll(true)">Try again</button>
      </div>

      <div v-else-if="filtered.length === 0" class="card p-12 text-center">
        <p class="font-display font-semibold text-lg text-ink">No packages found</p>
        <p class="text-ink/60 text-sm mt-1">Try adjusting your search or filters.</p>
        <button class="btn-ghost mt-4" @click="clearFilters">Clear filters</button>
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PackageCard
          v-for="p in filtered"
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

      <p class="text-xs text-ink/50 mt-8">
        Demo package data — prices, durations, and availability are illustrative only.
      </p>
    </section>
  </div>
</template>
