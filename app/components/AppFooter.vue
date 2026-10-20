<script setup lang="ts">
const year = new Date().getFullYear();

const groups = [
  {
    title: 'About Caraga Tour',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Travel Guide', to: '/travel-guide' },
      { label: 'FAQs', to: '/faqs' },
    ],
  },
  {
    title: 'Explore Destinations',
    links: [
      { label: 'Destinations', to: '/destinations' },
      { label: 'Tour Offers', to: '/offers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
];
</script>

<template>
  <footer class="bg-teal text-white/90 mt-16">
    <div class="container-page py-12 grid gap-10 md:grid-cols-4">
      <div class="md:col-span-1">
        <div class="flex items-center gap-2.5 mb-3">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white font-display font-bold">CT</span>
          <span class="font-display font-bold text-white text-lg">Caraga Tour</span>
        </div>
        <p class="text-sm text-white/70 leading-relaxed">
          Discover tourist destinations, tour offers, and packages across the
          Caraga Region, Philippines. Search trips and book memorable travel
          experiences.
        </p>
      </div>

      <div v-for="g in groups" :key="g.title">
        <h3 class="font-display font-semibold text-white mb-3">{{ g.title }}</h3>
        <ul class="space-y-2">
          <li v-for="l in g.links" :key="l.to">
            <NuxtLink :to="l.to" class="text-sm text-white/70 hover:text-sky transition">
              {{ l.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/60">
        <p>© {{ year }} Caraga Tour. A student project for ITE 18. Demo content only.</p>
        <p>Caraga Region, Philippines</p>
      </div>
    </div>
  </footer>
</template>
