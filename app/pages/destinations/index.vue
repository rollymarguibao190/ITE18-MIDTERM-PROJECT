<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDestinationsStore } from '~/stores/destinations';
import type { Destination } from '~/types';

const store = useDestinationsStore();
const route = useRoute();

const searchQuery = ref((route.query.destination as string) || '');
const selectedProvince = ref('');
const sortBy = ref('name');

onMounted(() => store.fetchAll());
watch(() => route.query, (q) => {
  searchQuery.value = (q.destination as string) || '';
});

const filtered = computed<Destination[]>(() => {
  let list = [...store.items];
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.province.toLowerCase().includes(q) ||
        d.highlights.some((h) => h.toLowerCase().includes(q)),
    );
  }
  if (selectedProvince.value) {
    list = list.filter((d) => d.province === selectedProvince.value);
  }
  if (sortBy.value === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy.value === 'province') list.sort((a, b) => a.province.localeCompare(b.province));
  return list;
});

function clearFilters() {
  searchQuery.value = '';
  selectedProvince.value = '';
  sortBy.value = 'name';
}
</script>

<template>
  <div>
    <section class="bg-white border-b border-primary-100">
      <div class="container-page py-10">
        <p class="text-primary font-semibold text-sm uppercase tracking-wide">Explore</p>
        <h1 class="font-display font-bold text-3xl text-ink mt-1">Destinations in Caraga</h1>
        <p class="mt-2 text-ink/70 max-w-2xl">
          Browse tourist destinations across the Caraga Region — from surf spots and hidden
          islands to waterfalls and wetland sanctuaries.
        </p>
      </div>
    </section>

    <section class="container-page py-10">
      <!-- Filters -->
      <div class="card p-4 mb-8">
        <div class="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end">
          <div>
            <label class="label" for="dest-search">Search</label>
            <input
              id="dest-search"
              v-model="searchQuery"
              type="search"
              placeholder="Name, province, or highlight"
              class="input"
            />
          </div>
          <div>
            <label class="label" for="dest-province">Province</label>
            <select id="dest-province" v-model="selectedProvince" class="input">
              <option value="">All provinces</option>
              <option v-for="p in store.provinces" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div>
            <label class="label" for="dest-sort">Sort by</label>
            <select id="dest-sort" v-model="sortBy" class="input">
              <option value="name">Name (A–Z)</option>
              <option value="province">Province (A–Z)</option>
            </select>
          </div>
          <button class="btn-ghost h-[46px]" @click="clearFilters">Clear</button>
        </div>
      </div>

      <!-- States -->
      <div v-if="store.loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        <div v-for="n in 6" :key="n" class="card overflow-hidden">
          <div class="h-52 bg-primary-50 animate-pulse" />
          <div class="p-5 space-y-2">
            <div class="h-5 w-2/3 bg-primary-50 rounded animate-pulse" />
            <div class="h-4 w-1/2 bg-primary-50/70 rounded animate-pulse" />
            <div class="h-4 w-full bg-primary-50/50 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div
        v-else-if="store.error"
        class="card p-10 text-center"
        role="alert"
      >
        <p class="text-coral font-semibold">Couldn't load destinations</p>
        <p class="text-ink/60 text-sm mt-1">{{ store.error }}</p>
        <button class="btn-primary mt-4" @click="store.fetchAll(true)">Try again</button>
      </div>

      <div
        v-else-if="filtered.length === 0"
        class="card p-12 text-center"
      >
        <p class="font-display font-semibold text-lg text-ink">No destinations found</p>
        <p class="text-ink/60 text-sm mt-1">Try adjusting your search or filters.</p>
        <button class="btn-ghost mt-4" @click="clearFilters">Clear filters</button>
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DestinationCard
          v-for="d in filtered"
          :key="d.id"
          :title="d.name"
          :subtitle="d.province"
          :description="d.description"
          :image="d.image"
          :alt="`${d.name} in ${d.province}, Caraga Region`"
          :to="`/destinations/${d.id}`"
        />
      </div>
    </section>
  </div>
</template>
