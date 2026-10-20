<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({ middleware: 'admin' });

const nav = [
  { label: 'Overview', to: '/admin', icon: 'home' as const },
  { label: 'Users', to: '/admin/users', icon: 'users' as const },
  { label: 'Destinations', to: '/admin/destinations', icon: 'pin' as const },
  { label: 'Packages', to: '/admin/packages', icon: 'tag' as const },
  { label: 'Bookings', to: '/admin/bookings', icon: 'calendar' as const },
];

const stats = ref([
  { label: 'Registered users', value: '—', note: 'Across all roles' },
  { label: 'Destinations', value: '—', note: 'Live catalog' },
  { label: 'Tour packages', value: '—', note: 'Live catalog' },
  { label: 'Total bookings', value: '—', note: 'All statuses' },
]);
const revenue = ref('—');
const pending = ref(0);
const loading = ref(true);

function money(n: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n);
}

onMounted(async () => {
  try {
    const res = await $fetch<{
      users: number; destinations: number; packages: number; bookings: number;
      pendingBookings: number; confirmedBookings: number; cancelledBookings: number; revenue: number;
    }>('/api/admin/stats');
    stats.value = [
      { label: 'Registered users', value: String(res.users), note: 'Across all roles' },
      { label: 'Destinations', value: String(res.destinations), note: 'Live catalog' },
      { label: 'Tour packages', value: String(res.packages), note: 'Live catalog' },
      { label: 'Total bookings', value: String(res.bookings), note: `${res.pendingBookings} pending · ${res.confirmedBookings} confirmed` },
    ];
    revenue.value = money(res.revenue);
    pending.value = res.pendingBookings;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <DashboardShell title="Admin Dashboard" :nav="nav">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="s in stats" :key="s.label" class="card p-5">
        <p class="text-sm text-ink/60">{{ s.label }}</p>
        <p class="font-display font-bold text-2xl text-ink mt-1">{{ loading ? '—' : s.value }}</p>
        <p class="text-xs text-ink/40 mt-1">{{ s.note }}</p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 mt-4">
      <div class="card p-5">
        <p class="text-sm text-ink/60">Confirmed revenue</p>
        <p class="font-display font-bold text-2xl text-primary mt-1">{{ revenue }}</p>
        <p class="text-xs text-ink/40 mt-1">From confirmed bookings</p>
      </div>
      <div class="card p-5">
        <p class="text-sm text-ink/60">Pending approvals</p>
        <p class="font-display font-bold text-2xl text-ink mt-1">{{ loading ? '—' : pending }}</p>
        <NuxtLink to="/admin/bookings" class="text-xs text-primary font-semibold mt-1 inline-block">Review bookings →</NuxtLink>
      </div>
    </div>

    <div class="card p-6 mt-6">
      <h2 class="font-display font-semibold text-lg text-ink">Admin controls</h2>
      <p class="text-ink/70 text-sm mt-2">
        Manage users, destinations, packages, and bookings across the platform.
      </p>
      <div class="flex flex-wrap gap-3 mt-4">
        <NuxtLink to="/admin/users" class="btn-ghost">Manage users</NuxtLink>
        <NuxtLink to="/admin/destinations" class="btn-ghost">Manage destinations</NuxtLink>
        <NuxtLink to="/admin/packages" class="btn-ghost">Manage packages</NuxtLink>
        <NuxtLink to="/admin/bookings" class="btn-primary">Review bookings</NuxtLink>
      </div>
    </div>
  </DashboardShell>
</template>
