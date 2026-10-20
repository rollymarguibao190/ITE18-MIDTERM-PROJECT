<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBookingsStore } from '~/stores/bookings';
import type { Booking, BookingStatus } from '~/types';

definePageMeta({ middleware: 'auth' });

const store = useBookingsStore();
const cancelTarget = ref<Booking | null>(null);
const cancelling = ref(false);

onMounted(() => store.fetchMine());

function priceLabel(p: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(p);
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const statusClass: Record<BookingStatus, string> = {
  pending: 'bg-sand-light text-ink/70',
  confirmed: 'bg-success/15 text-success',
  cancelled: 'bg-coral/10 text-coral-dark line-through',
};

const sorted = computed(() =>
  [...store.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
);

async function confirmCancel() {
  if (!cancelTarget.value) return;
  cancelling.value = true;
  try {
    await store.cancel(cancelTarget.value.id);
    cancelTarget.value = null;
  } catch {
    // keep modal open so user sees error in store
  } finally {
    cancelling.value = false;
  }
}
</script>

<template>
  <div class="container-page py-10">
    <header class="mb-6">
      <h1 class="font-display font-bold text-3xl text-ink">My Bookings</h1>
      <p class="text-ink/60 mt-1">View and manage your tour bookings.</p>
    </header>

    <!-- Loading -->
    <div v-if="store.loading" class="space-y-3" aria-live="polite">
      <div v-for="n in 3" :key="n" class="card p-5">
        <div class="h-5 w-1/3 bg-primary-50 rounded animate-pulse mb-2" />
        <div class="h-4 w-1/4 bg-primary-50/70 rounded animate-pulse" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="card p-8 text-center" role="alert">
      <p class="text-coral font-semibold">Couldn't load bookings</p>
      <p class="text-ink/60 text-sm mt-1">{{ store.error }}</p>
      <button class="btn-primary mt-4" @click="store.fetchMine()">Try again</button>
    </div>

    <!-- Empty -->
    <div v-else-if="sorted.length === 0" class="card p-12 text-center">
      <div class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
      </div>
      <p class="font-display font-semibold text-lg text-ink">No bookings yet</p>
      <p class="text-ink/60 text-sm mt-1">Browse tour packages and book your first trip.</p>
      <NuxtLink to="/offers" class="btn-primary mt-4">Browse offers</NuxtLink>
    </div>

    <!-- Bookings list -->
    <div v-else class="space-y-4">
      <div
        v-for="b in sorted"
        :key="b.id"
        class="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <NuxtLink :to="`/packages/${b.packageId}`" class="font-display font-semibold text-lg text-ink hover:text-primary">
              {{ b.packageName }}
            </NuxtLink>
            <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize" :class="statusClass[b.status]">
              {{ b.status }}
            </span>
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/60 mt-1">
            <span><strong class="text-ink/80">Date:</strong> {{ formatDate(b.travelDate) }}</span>
            <span><strong class="text-ink/80">Travelers:</strong> {{ b.travelers }}</span>
            <span><strong class="text-ink/80">Total:</strong> {{ priceLabel(b.totalPrice) }}</span>
            <span class="text-ink/40">Booked {{ formatDate(b.createdAt.slice(0, 10)) }}</span>
          </div>
        </div>
        <div class="flex gap-2 shrink-0">
          <NuxtLink :to="`/packages/${b.packageId}`" class="btn-ghost text-sm">View tour</NuxtLink>
          <button
            v-if="b.status !== 'cancelled'"
            class="btn-ghost text-sm text-coral-dark hover:bg-coral/5"
            @click="cancelTarget = b"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Cancel confirmation modal -->
    <div
      v-if="cancelTarget"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50"
      @click.self="cancelTarget = null"
    >
      <div class="bg-white rounded-2xl shadow-lift max-w-sm w-full p-6 animate-fade-up" role="dialog" aria-modal="true">
        <h2 class="font-display font-bold text-xl text-ink">Cancel this booking?</h2>
        <p class="text-ink/70 text-sm mt-2">
          You're about to cancel your booking for
          <strong>{{ cancelTarget.packageName }}</strong> on
          {{ formatDate(cancelTarget.travelDate) }}. This can't be undone.
        </p>
        <div class="flex gap-3 mt-5">
          <button class="btn-ghost flex-1" :disabled="cancelling" @click="cancelTarget = null">Keep booking</button>
          <button class="btn-coral flex-1" :disabled="cancelling" @click="confirmCancel">
            {{ cancelling ? 'Cancelling…' : 'Yes, cancel' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
