import { defineStore } from 'pinia';
import type { Destination } from '~/types';

interface DestinationsState {
  items: Destination[];
  current: Destination | null;
  loading: boolean;
  error: string | null;
}

export const useDestinationsStore = defineStore('destinations', {
  state: (): DestinationsState => ({
    items: [],
    current: null,
    loading: false,
    error: null,
  }),
  getters: {
    loaded: (s) => s.items.length > 0,
    getById: (s) => (id: string) => s.items.find((d) => d.id === id),
    provinces: (s) => [...new Set(s.items.map((d) => d.province))].sort(),
  },
  actions: {
    async fetchAll(force = false) {
      if (this.loaded && !force) return;
      this.loading = true;
      this.error = null;
      try {
        const res = await $fetch<{ destinations: Destination[] }>('/api/destinations');
        this.items = res.destinations;
      } catch (e: any) {
        this.error = e?.statusMessage || 'Failed to load destinations.';
      } finally {
        this.loading = false;
      }
    },
    async fetchOne(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await $fetch<{ destination: Destination }>(`/api/destinations/${id}`);
        this.current = res.destination;
        if (!this.getById(id)) this.items.push(res.destination);
      } catch (e: any) {
        this.current = null;
        this.error = e?.statusMessage || 'Destination not found.';
        throw e;
      } finally {
        this.loading = false;
      }
    },
  },
});
