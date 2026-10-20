<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Booking, BookingStatus } from '~/types';

definePageMeta({ middleware: 'admin' });

const nav = [
  { label: 'Overview', to: '/admin', icon: 'home' as const },
  { label: 'Users', to: '/admin/users', icon: 'users' as const },
  { label: 'Destinations', to: '/admin/destinations', icon: 'pin' as const },
  { label: 'Packages', to: '/admin/packages', icon: 'tag' as const },
  { label: 'Bookings', to: '/admin/bookings', icon: 'calendar' as const },
];

const bookings = ref<Booking[]>([]);
const loading = ref(true);
const error = ref('');
const updatingId = ref('');
const statusFilter = ref<BookingStatus | ''>('');

onMounted(async () => {
  try {
    const res = await $fetch<{ bookings: Booking[] }>('/api/admin/bookings');
    bookings.value = res.bookings;
  } catch (e: any) {
    error.value = e?.statusMessage || 'Failed to load bookings.';
  } finally {
    loading.value = false;
  }
});

const filtered = computed(() => {
  let list = [...bookings.value];
  if (statusFilter.value) list = list.filter((b) => b.status === statusFilter.value);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});

const stats = computed(() => ({
  total: bookings.value.length,
  pending: bookings.value.filter((b) => b.status === 'pending').length,
  confirmed: bookings.value.filter((b) => b.status === 'confirmed').length,
  cancelled: bookings.value.filter((b) => b.status === 'cancelled').length,
}));

const revenue = computed(() =>
  bookings.value.filter((b) => b.status === 'confirmed').reduce((sum, b) => sum + b.totalPrice, 0),
);

function priceLabel(p: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(p);
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

const statusClass: Record<BookingStatus, string> = {
  pending: 'bg-sand-light text-ink/70',
  confirmed: 'bg-success/15 text-success',
  cancelled: 'bg-coral/10 text-coral-dark',
};

async function changeStatus(b: Booking, status: BookingStatus) {
  updatingId.value = b.id;
  try {
    const res = await $fetch<{ booking: Booking }>(`/api/admin/bookings/${b.id}`, {
      method: 'PATCH',
      body: { status },
    });
    const idx = bookings.value.findIndex((x) => x.id === b.id);
    if (idx !== -1) bookings.value[idx] = res.booking;
  } catch (e: any) {
    error.value = e?.statusMessage || 'Failed to update booking.';
  } finally {
    updatingId.value = '';
  }
}
</script>

<template>
  <DashboardShell title="All Bookings" :nav="nav">
    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      <div class="card p-4">
        <p class="text-xs text-ink/50">Total bookings</p>
        <p class="font-display font-bold text-2xl text-ink">{{ stats.total }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-ink/50">Pending</p>
        <p class="font-display font-bold text-2xl text-ink">{{ stats.pending }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-ink/50">Confirmed</p>
        <p class="font-display font-bold text-2xl text-success">{{ stats.confirmed }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-ink/50">Cancelled</p>
        <p class="font-display font-bold text-2xl text-coral-dark">{{ stats.cancelled }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-ink/50">Confirmed revenue</p>
        <p class="font-display font-bold text-2xl text-primary">{{ priceLabel(revenue) }}</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex items-center gap-3 mb-4">
      <label class="text-sm text-ink/60">Filter:</label>
      <select v-model="statusFilter" class="input max-w-[200px]">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <div v-if="loading" class="card p-8 text-center text-ink/60" aria-live="polite">Loading bookings…</div>
    <div v-else-if="error" class="card p-8 text-center text-coral" role="alert">{{ error }}</div>
    <div v-else-if="filtered.length === 0" class="card p-12 text-center">
      <p class="font-display font-semibold text-lg text-ink">No bookings found</p>
      <p class="text-ink/60 text-sm mt-1" v-if="statusFilter">Try a different status filter.</p>
      <p class="text-ink/60 text-sm mt-1" v-else>No bookings have been made on the platform yet.</p>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-primary-50/60 text-ink/70">
            <tr>
              <th class="px-4 py-3 font-semibold">Booking ID</th>
              <th class="px-4 py-3 font-semibold">Package</th>
              <th class="px-4 py-3 font-semibold">Travel date</th>
              <th class="px-4 py-3 font-semibold">Travelers</th>
              <th class="px-4 py-3 font-semibold">Total</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-100">
            <tr v-for="b in filtered" :key="b.id" class="hover:bg-primary-50/30">
              <td class="px-4 py-3 text-ink/50 font-mono text-xs">{{ b.id.slice(0, 8) }}</td>
              <td class="px-4 py-3 font-medium text-ink">{{ b.packageName }}</td>
              <td class="px-4 py-3 text-ink/70">{{ formatDate(b.travelDate) }}</td>
              <td class="px-4 py-3 text-ink/70">{{ b.travelers }}</td>
              <td class="px-4 py-3 text-ink/70">{{ priceLabel(b.totalPrice) }}</td>
              <td class="px-4 py-3">
                <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize" :class="statusClass[b.status]">
                  {{ b.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-1.5">
                  <button
                    v-if="b.status !== 'confirmed'"
                    class="text-xs font-semibold text-success hover:underline disabled:opacity-40"
                    :disabled="updatingId === b.id"
                    @click="changeStatus(b, 'confirmed')"
                  >Confirm</button>
                  <button
                    v-if="b.status !== 'cancelled'"
                    class="text-xs font-semibold text-coral-dark hover:underline disabled:opacity-40"
                    :disabled="updatingId === b.id"
                    @click="changeStatus(b, 'cancelled')"
                  >Cancel</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardShell>
</template>
