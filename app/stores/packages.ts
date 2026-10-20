import { defineStore } from 'pinia';
import type { TourPackage } from '~/types';

interface PackagesState {
  items: TourPackage[];
  current: TourPackage | null;
  loading: boolean;
  error: string | null;
}

export const usePackagesStore = defineStore('packages', {
  state: (): PackagesState => ({
    items: [],
    current: null,
    loading: false,
    error: null,
  }),
  getters: {
    loaded: (s) => s.items.length > 0,
    getById: (s) => (id: string) => s.items.find((p) => p.id === id),
    byDestination: (s) => (destinationId: string) =>
      s.items.filter((p) => p.destinationId === destinationId),
  },
  actions: {
    async fetchAll(force = false) {
      if (this.loaded && !force) return;
      this.loading = true;
      this.error = null;
      try {
        const res = await $fetch<{ packages: TourPackage[] }>('/api/packages');
        this.items = res.packages;
      } catch (e: any) {
        this.error = e?.statusMessage || 'Failed to load packages.';
      } finally {
        this.loading = false;
      }
    },
    async fetchOne(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await $fetch<{ package: TourPackage }>(`/api/packages/${id}`);
        this.current = res.package;
        if (!this.getById(id)) this.items.push(res.package);
      } catch (e: any) {
        this.current = null;
        this.error = e?.statusMessage || 'Package not found.';
        throw e;
      } finally {
        this.loading = false;
      }
    },
  },
});
