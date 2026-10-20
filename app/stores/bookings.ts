import { defineStore } from 'pinia';
import type { Booking, BookingStatus } from '~/types';

interface BookingsState {
  items: Booking[];
  loading: boolean;
  error: string | null;
  lastCreated: Booking | null;
}

export const useBookingsStore = defineStore('bookings', {
  state: (): BookingsState => ({
    items: [],
    loading: false,
    error: null,
    lastCreated: null,
  }),
  getters: {
    upcoming: (s) =>
      [...s.items]
        .filter((b) => b.status !== 'cancelled')
        .sort((a, b) => a.travelDate.localeCompare(b.travelDate)),
    byId: (s) => (id: string) => s.items.find((b) => b.id === id),
  },
  actions: {
    async fetchMine() {
      this.loading = true;
      this.error = null;
      try {
        const res = await $fetch<{ bookings: Booking[] }>('/api/bookings');
        this.items = res.bookings;
      } catch (e: any) {
        this.error = e?.statusMessage || 'Failed to load bookings.';
      } finally {
        this.loading = false;
      }
    },
    async create(packageId: string, travelDate: string, travelers: number) {
      this.error = null;
      try {
        const res = await $fetch<{ booking: Booking }>('/api/bookings', {
          method: 'POST',
          body: { packageId, travelDate, travelers },
        });
        this.lastCreated = res.booking;
        this.items.push(res.booking);
        return res.booking;
      } catch (e: any) {
        this.error = e?.statusMessage || 'Booking failed.';
        throw e;
      }
    },
    async cancel(id: string) {
      try {
        const res = await $fetch<{ booking: Booking }>(`/api/bookings/${id}`, {
          method: 'PATCH',
          body: { status: 'cancelled' },
        });
        const idx = this.items.findIndex((b) => b.id === id);
        if (idx !== -1) this.items[idx] = res.booking;
        return res.booking;
      } catch (e: any) {
        this.error = e?.statusMessage || 'Cancel failed.';
        throw e;
      }
    },
    async updateStatusAll(id: string, status: BookingStatus, endpoint: 'operator' | 'admin') {
      try {
        const res = await $fetch<{ booking: Booking }>(`/api/${endpoint}/bookings/${id}`, {
          method: 'PATCH',
          body: { status },
        });
        return res.booking;
      } catch (e: any) {
        throw e;
      }
    },
  },
});
