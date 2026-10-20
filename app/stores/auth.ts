import { defineStore } from 'pinia';
import type { User, UserRole } from '~/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (s) => !!s.user,
    role: (s): UserRole | null => s.user?.role ?? null,
    isCustomer: (s) => s.user?.role === 'customer',
    isOperator: (s) => s.user?.role === 'operator',
    isAdmin: (s) => s.user?.role === 'admin',
  },
  actions: {
    setUser(user: User | null) {
      this.user = user;
      this.error = null;
    },
    async init() {
      if (this.initialized) return;
      this.initialized = true;
      await this.fetchMe();
    },
    async fetchMe() {
      this.loading = true;
      try {
        const res = await $fetch<{ user: User | null }>('/api/auth/me');
        this.user = res.user;
      } catch {
        this.user = null;
      } finally {
        this.loading = false;
      }
    },
    async login(email: string, password: string) {
      this.error = null;
      try {
        const res = await $fetch<{ user: User }>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        this.user = res.user;
        return res.user;
      } catch (e: any) {
        this.error = e?.statusMessage || 'Login failed.';
        throw e;
      }
    },
    async register(name: string, email: string, password: string) {
      this.error = null;
      try {
        const res = await $fetch<{ user: User }>('/api/auth/register', {
          method: 'POST',
          body: { name, email, password },
        });
        this.user = res.user;
        return res.user;
      } catch (e: any) {
        this.error = e?.statusMessage || 'Registration failed.';
        throw e;
      }
    },
    async logout() {
      try {
        await $fetch('/api/auth/logout', { method: 'POST' });
      } finally {
        this.user = null;
      }
    },
  },
});
