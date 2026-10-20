<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

const props = defineProps<{
  title: string;
  nav: Array<{ label: string; to: string; icon: 'home' | 'tag' | 'calendar' | 'users' | 'pin' }>;
}>();

const auth = useAuthStore();
const route = useRoute();

const isActive = (to: string) =>
  to === props.nav[0]?.to ? route.path === to : route.path.startsWith(to);

const initials = computed(() =>
  auth.user?.name
    ? auth.user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '',
);

async function logout() {
  await auth.logout();
  await navigateTo('/');
}
</script>

<template>
  <div class="container-page py-8">
    <div class="grid lg:grid-cols-[260px_1fr] gap-8">
      <!-- Sidebar -->
      <aside class="lg:sticky lg:top-24 self-start">
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-4">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold">
              {{ initials }}
            </span>
            <div class="min-w-0">
              <p class="font-semibold text-ink truncate">{{ auth.user?.name }}</p>
              <p class="text-xs text-ink/50 truncate">{{ auth.user?.email }}</p>
            </div>
          </div>
          <span class="inline-block rounded-full bg-primary-50 text-primary text-xs font-semibold px-2.5 py-0.5 capitalize">
            {{ auth.role }}
          </span>
        </div>

        <nav class="card p-3 mt-4" :aria-label="`${title} navigation`">
          <NuxtLink
            v-for="l in nav"
            :key="l.to"
            :to="l.to"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition"
            :class="isActive(l.to) ? 'bg-primary-50 text-primary' : 'text-ink/70 hover:bg-primary-50/50'"
            :aria-current="isActive(l.to) ? 'page' : undefined"
          >
            <svg v-if="l.icon === 'home'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" /></svg>
            <svg v-else-if="l.icon === 'tag'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12 12 20l-9-9V3h8l9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>
            <svg v-else-if="l.icon === 'calendar'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
            <svg v-else-if="l.icon === 'users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 8a3 3 0 0 1 0 6M22 20a6 6 0 0 0-4.5-5.8" /></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {{ l.label }}
          </NuxtLink>
        </nav>

        <button class="btn-ghost w-full mt-4" @click="logout">Log out</button>
      </aside>

      <!-- Content -->
      <section>
        <header class="mb-6">
          <h1 class="font-display font-bold text-2xl text-ink">{{ title }}</h1>
          <p class="text-ink/60 text-sm mt-1">Signed in as {{ auth.user?.name }}</p>
        </header>
        <slot />
      </section>
    </div>
  </div>
</template>
