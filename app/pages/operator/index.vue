<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({ middleware: 'operator' });

const nav = [
  { label: 'Overview', to: '/operator', icon: 'home' as const },
  { label: 'My Packages', to: '/operator/packages', icon: 'tag' as const },
  { label: 'Bookings', to: '/operator/bookings', icon: 'calendar' as const },
];

const stats = ref([
  { label: 'Tour packages', value: '—', note: 'Live catalog' },
  { label: 'Total bookings', value: '—', note: 'All statuses' },
  { label: 'Pending approvals', value: '—', note: 'Awaiting action' },
]);
const revenue = ref('—');
const loading = ref(true);

function money(n: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n);
}

onMounted(async () => {
  try {
    const res = await $fetch<{
      packages: number; bookings: number; pendingBookings: number;
      confirmedBookings: number; cancelledBookings: number; revenue: number;
    }>('/api/operator/stats');
    stats.value = [
      { label: 'Tour packages', value: String(res.packages), note: 'Live catalog' },
      { label: 'Total bookings', value: String(res.bookings), note: `${res.confirmedBookings} confirmed · ${res.cancelledBookings} cancelled` },
      { label: 'Pending approvals', value: String(res.pendingBookings), note: 'Awaiting action' },
    ];
    revenue.value = money(res.revenue);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <DashboardShell title="Operator Dashboard" :nav="nav">
    <div class="grid gap-4 sm:grid-cols-3">
      <div v-for="s in stats" :key="s.label" class="card p-5">
        <p class="text-sm text-ink/60">{{ s.label }}</p>
        <p class="font-display font-bold text-2xl text-ink mt-1">{{ loading ? '—' : s.value }}</p>
        <p class="text-xs text-ink/40 mt-1">{{ s.note }}</p>
      </div>
    </div>

    <div class="card p-5 mt-4">
      <p class="text-sm text-ink/60">Confirmed revenue</p>
      <p class="font-display font-bold text-2xl text-primary mt-1">{{ revenue }}</p>
      <p class="text-xs text-ink/40 mt-1">From confirmed bookings</p>
    </div>

    <div class="card p-6 mt-6">
      <h2 class="font-display font-semibold text-lg text-ink">Welcome, operator</h2>
      <p class="text-ink/70 text-sm mt-2">
        This is your operator dashboard. Manage your tour packages, review incoming bookings, and track performance.
      </p>
      <div class="flex flex-wrap gap-3 mt-4">
        <NuxtLink to="/operator/packages" class="btn-primary">Manage packages</NuxtLink>
        <NuxtLink to="/operator/bookings" class="btn-ghost">Review bookings</NuxtLink>
      </div>
    </div>
  </DashboardShell>
</template>
