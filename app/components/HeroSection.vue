<script setup lang="ts">
// Hero background image — attribution: Ariel Raz / Pexels (Caraga, Philippines).
const heroImage =
  'https://images.pexels.com/photos/38370402/pexels-photo-38370402.jpeg?auto=compress&cs=tinysrgb&w=1920';
</script>

<template>
  <section class="relative isolate overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 -z-10">
      <img
        :src="heroImage"
        alt="Aerial view of a turquoise tropical beach in the Caraga Region with lush greenery."
        class="h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-teal-deep/70 via-teal-deep/45 to-teal-deep/75" />
    </div>

    <div class="container-page py-20 md:py-28 lg:py-32 flex flex-col items-center text-center text-white">
      <p class="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-sm font-medium mb-6 animate-fade-up">
        <span class="h-2 w-2 rounded-full bg-coral" />
        Caraga Region, Philippines
      </p>
      <h1 class="font-display font-bold text-4xl sm:text-5xl lg:text-6xl max-w-3xl leading-tight animate-fade-up">
        Discover the Hidden Paradise of Caraga
      </h1>
      <p class="mt-5 max-w-xl text-base sm:text-lg text-white/85 animate-fade-up">
        Explore pristine beaches, islands, waterfalls, and adventure across the
        Caraga Region. Find a destination and book a memorable tour.
      </p>

      <div class="mt-8 w-full flex justify-center animate-fade-up">
        <SearchPanel />
      </div>
    </div>
  </section>
</template>
