<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDestinationsStore } from '~/stores/destinations';
import { usePackagesStore } from '~/stores/packages';

const destStore = useDestinationsStore();
const pkgStore = usePackagesStore();

onMounted(async () => {
  await Promise.all([destStore.fetchAll(), pkgStore.fetchAll()]);
});

const featuredDestinations = computed(() => destStore.items.slice(0, 3));
const featuredPackages = computed(() =>
  [...pkgStore.items].sort((a, b) => a.price - b.price).slice(0, 3),
);

const features = [
  { icon: 'compass', title: 'Easy Trip Discovery', description: 'Browse curated destinations across the Caraga Region and find your next adventure in minutes.' },
  { icon: 'map', title: 'Organized Tour Info', description: 'See clear durations, inclusions, and destinations for every tour package before you book.' },
  { icon: 'calendar', title: 'Convenient Booking', description: 'Pick a date, set travelers, and manage all your bookings in one customer dashboard.' },
  { icon: 'pin', title: 'Local Exploration', description: 'Discover Siargao, Dinagat, Agusan Marsh, and more — the hidden paradise of the Philippines.' },
] as const;

const exploreImage =
  'https://images.pexels.com/photos/4809521/pexels-photo-4809521.jpeg?auto=compress&cs=tinysrgb&w=1600';
</script>

<template>
  <div>
    <HeroSection />

    <!-- Featured Destinations -->
    <section class="container-page py-16">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p class="text-primary font-semibold text-sm uppercase tracking-wide">Featured</p>
          <h2 class="font-display font-bold text-3xl text-ink mt-1">Destinations in Caraga</h2>
        </div>
        <NuxtLink to="/destinations" class="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
          View all destinations
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </NuxtLink>
      </div>

      <!-- Skeletons -->
      <div v-if="destStore.loading && !featuredDestinations.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 3" :key="n" class="card overflow-hidden">
          <div class="h-52 bg-primary-50 animate-pulse" />
          <div class="p-5 space-y-2">
            <div class="h-5 w-2/3 bg-primary-50 rounded animate-pulse" />
            <div class="h-4 w-1/2 bg-primary-50/70 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DestinationCard
          v-for="d in featuredDestinations"
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

    <!-- Special Offers -->
    <section class="bg-primary-50/60 py-16">
      <div class="container-page">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p class="text-coral font-semibold text-sm uppercase tracking-wide">Special Offers</p>
            <h2 class="font-display font-bold text-3xl text-ink mt-1">Tour Packages</h2>
          </div>
          <NuxtLink to="/offers" class="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all offers
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </NuxtLink>
        </div>

        <div v-if="pkgStore.loading && !featuredPackages.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="n in 3" :key="n" class="card overflow-hidden">
            <div class="h-52 bg-primary-50 animate-pulse" />
            <div class="p-5 space-y-2">
              <div class="h-5 w-2/3 bg-primary-50 rounded animate-pulse" />
              <div class="h-5 w-1/3 bg-primary-50/50 rounded animate-pulse mt-3" />
            </div>
          </div>
        </div>

        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PackageCard
            v-for="p in featuredPackages"
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
        <p class="text-xs text-ink/50 mt-6">Demo package data — prices and availability are illustrative only.</p>
      </div>
    </section>

    <!-- Explore Caraga -->
    <section class="container-page py-16">
      <div class="grid lg:grid-cols-2 gap-10 items-center">
        <div class="rounded-2xl overflow-hidden shadow-card">
          <img :src="exploreImage" alt="Ocean waves near a tropical beach in the Caraga Region." class="w-full h-72 lg:h-96 object-cover" loading="lazy" />
        </div>
        <div>
          <p class="text-primary font-semibold text-sm uppercase tracking-wide">Explore Caraga</p>
          <h2 class="font-display font-bold text-3xl text-ink mt-1">Nature, Culture, and Island Adventure</h2>
          <p class="mt-4 text-ink/70 leading-relaxed">
            From the surf breaks of Siargao to the floating villages of Agusan Marsh,
            the Caraga Region offers pristine beaches, lush waterfalls, and vibrant
            local culture. Whether you're chasing adventure or relaxation, Caraga has
            a destination for every traveler.
          </p>
          <ul class="mt-6 space-y-3">
            <li class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-coral text-white text-xs">✓</span>
              <span class="text-ink/80"><strong class="text-ink">Island experiences</strong> — hidden coves, limestone cliffs, and turquoise water.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-coral text-white text-xs">✓</span>
              <span class="text-ink/80"><strong class="text-ink">Nature & waterfalls</strong> — lush jungles, rivers, and wetland sanctuaries.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-coral text-white text-xs">✓</span>
              <span class="text-ink/80"><strong class="text-ink">Adventure</strong> — surfing, island hopping, and river safaris.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Why Choose Caraga Tour -->
    <section class="bg-white py-16 border-y border-primary-100">
      <div class="container-page">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <p class="text-primary font-semibold text-sm uppercase tracking-wide">Why Caraga Tour</p>
          <h2 class="font-display font-bold text-3xl text-ink mt-1">Plan your trip with confidence</h2>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard v-for="f in features" :key="f.title" :icon="f.icon" :title="f.title" :description="f.description" />
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="container-page py-16">
      <div class="rounded-2xl bg-gradient-to-br from-primary to-teal text-white p-8 sm:p-12 text-center shadow-panel">
        <h2 class="font-display font-bold text-3xl">Ready to explore Caraga?</h2>
        <p class="mt-3 text-white/85 max-w-xl mx-auto">
          Browse tour offers across the region, or search for your next destination and start planning your trip.
        </p>
        <div class="mt-7 flex flex-wrap justify-center gap-3">
          <NuxtLink to="/offers" class="btn-coral">View Tour Offers</NuxtLink>
          <NuxtLink to="/destinations" class="btn-ghost bg-white/10 border-white/30 text-white hover:bg-white/20">Explore Destinations</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
