<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
const route = useRoute();
const mobileOpen = ref(false);
const accountOpen = ref(false);
const accountMenuRef = ref<HTMLElement | null>(null);

const links = [
  { label: 'Home', to: '/' },
  { label: 'Offers', to: '/offers' },
  { label: 'Support', to: '/contact' },
];

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path.startsWith(to);

const initials = computed(() =>
  auth.user?.name
    ? auth.user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '',
);

const dashboardLink = computed(() => {
  if (auth.role === 'admin') return '/admin';
  if (auth.role === 'operator') return '/operator';
  return null;
});

function closeMenus() {
  mobileOpen.value = false;
  accountOpen.value = false;
}

async function handleLogout() {
  await auth.logout();
  closeMenus();
  await navigateTo('/');
}

function onDocClick(e: MouseEvent) {
  if (accountMenuRef.value && !accountMenuRef.value.contains(e.target as Node)) {
    accountOpen.value = false;
  }
}

onMounted(() => {
  auth.init();
  document.addEventListener('click', onDocClick);
});
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-primary-100 shadow-sm"
  >
    <div class="container-page">
      <div class="flex h-16 items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 shrink-0"
          aria-label="Caraga Tour home"
          @click="closeMenus"
        >
          <span
            class="inline-flex h-9 w-9 items-center justify-center rounded-xl
                   bg-gradient-to-br from-primary to-teal text-white font-display font-bold"
            >CT</span
          >
          <span class="flex flex-col leading-tight">
            <span class="font-display font-bold text-ink text-lg">Caraga Tour</span>
            <span class="text-[11px] text-ink/55 -mt-0.5 hidden sm:block">
              Discover the beauty of Caraga
            </span>
          </span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav
          class="hidden md:flex items-center gap-1"
          aria-label="Primary"
        >
          <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="px-4 py-2 rounded-full text-sm font-medium transition relative"
            :class="[
              isActive(l.to)
                ? 'text-primary bg-primary-50'
                : 'text-ink/70 hover:text-primary hover:bg-primary-50/60',
            ]"
            :aria-current="isActive(l.to) ? 'page' : undefined"
          >
            {{ l.label }}
          </NuxtLink>
        </nav>

        <!-- Right side: account -->
        <div class="flex items-center gap-2">
          <NuxtLink to="/login" class="btn-primary hidden md:inline-flex" v-if="!auth.isAuthenticated">
            Log In / Sign Up
          </NuxtLink>

          <div class="relative hidden md:block" ref="accountMenuRef" v-else>
            <button
              class="flex items-center gap-2 rounded-full border border-primary-100 bg-white pl-1.5 pr-3 py-1.5 hover:bg-primary-50 transition"
              :aria-expanded="accountOpen"
              aria-haspopup="menu"
              @click="accountOpen = !accountOpen"
            >
              <span
                class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold"
                >{{ initials }}</span
              >
              <span class="text-sm font-medium text-ink">{{ auth.user?.name }}</span>
            </button>
            <div
              v-if="accountOpen"
              class="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-lift border border-primary-100 py-1.5 animate-fade-up"
              role="menu"
            >
              <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-ink hover:bg-primary-50" role="menuitem" @click="accountOpen = false">Profile</NuxtLink>
              <NuxtLink v-if="dashboardLink" :to="dashboardLink" class="block px-4 py-2 text-sm text-ink hover:bg-primary-50" role="menuitem" @click="accountOpen = false">Dashboard</NuxtLink>
              <NuxtLink to="/bookings" class="block px-4 py-2 text-sm text-ink hover:bg-primary-50" role="menuitem" @click="accountOpen = false">My Bookings</NuxtLink>
              <button class="block w-full text-left px-4 py-2 text-sm text-coral-dark hover:bg-primary-50" role="menuitem" @click="handleLogout">Logout</button>
            </div>
          </div>

          <!-- Hamburger -->
          <button
            class="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-primary-50"
            :aria-expanded="mobileOpen"
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            @click="mobileOpen = !mobileOpen"
          >
            <svg v-if="!mobileOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="mobileOpen"
      id="mobile-menu"
      class="md:hidden border-t border-primary-100 bg-white animate-fade-up"
    >
      <nav class="container-page py-3 flex flex-col gap-1" aria-label="Mobile">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="px-4 py-3 rounded-lg text-base font-medium"
          :class="isActive(l.to) ? 'text-primary bg-primary-50' : 'text-ink hover:bg-primary-50'"
          :aria-current="isActive(l.to) ? 'page' : undefined"
          @click="closeMenus"
        >
          {{ l.label }}
        </NuxtLink>
        <div class="h-px bg-primary-100 my-2" />
        <template v-if="!auth.isAuthenticated">
          <NuxtLink to="/login" class="btn-primary w-full" @click="closeMenus">Log In / Sign Up</NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/profile" class="px-4 py-3 rounded-lg text-ink hover:bg-primary-50" @click="closeMenus">Profile</NuxtLink>
          <NuxtLink v-if="dashboardLink" :to="dashboardLink" class="px-4 py-3 rounded-lg text-ink hover:bg-primary-50" @click="closeMenus">Dashboard</NuxtLink>
          <NuxtLink to="/bookings" class="px-4 py-3 rounded-lg text-ink hover:bg-primary-50" @click="closeMenus">My Bookings</NuxtLink>
          <button class="px-4 py-3 rounded-lg text-left text-coral-dark hover:bg-primary-50" @click="handleLogout">Logout</button>
        </template>
      </nav>
    </div>
  </header>
</template>
