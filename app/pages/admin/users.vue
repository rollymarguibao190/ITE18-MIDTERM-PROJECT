<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { User } from '~/types';

definePageMeta({ middleware: 'admin' });

const nav = [
  { label: 'Overview', to: '/admin', icon: 'home' as const },
  { label: 'Users', to: '/admin/users', icon: 'users' as const },
  { label: 'Destinations', to: '/admin/destinations', icon: 'pin' as const },
  { label: 'Packages', to: '/admin/packages', icon: 'tag' as const },
  { label: 'Bookings', to: '/admin/bookings', icon: 'calendar' as const },
];

const users = ref<User[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const res = await $fetch<{ users: User[] }>('/api/admin/users');
    users.value = res.users;
  } catch (e: any) {
    error.value = e?.statusMessage || 'Failed to load users.';
  } finally {
    loading.value = false;
  }
});

const roleClass: Record<string, string> = {
  admin: 'bg-coral/10 text-coral-dark',
  operator: 'bg-primary-50 text-primary',
  customer: 'bg-sand-light text-ink/70',
};
</script>

<template>
  <DashboardShell title="Manage Users" :nav="nav">
    <div v-if="loading" class="card p-8 text-center text-ink/60" aria-live="polite">Loading users…</div>
    <div v-else-if="error" class="card p-8 text-center text-coral" role="alert">{{ error }}</div>
    <div v-else-if="!users.length" class="card p-8 text-center text-ink/60">No users yet.</div>
    <div v-else class="card overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-primary-50/60 text-ink/70">
          <tr>
            <th class="px-4 py-3 font-semibold">Name</th>
            <th class="px-4 py-3 font-semibold">Email</th>
            <th class="px-4 py-3 font-semibold">Role</th>
            <th class="px-4 py-3 font-semibold hidden sm:table-cell">Joined</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-100">
          <tr v-for="u in users" :key="u.id" class="hover:bg-primary-50/30">
            <td class="px-4 py-3 font-medium text-ink">{{ u.name }}</td>
            <td class="px-4 py-3 text-ink/70">{{ u.email }}</td>
            <td class="px-4 py-3">
              <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize" :class="roleClass[u.role]">
                {{ u.role }}
              </span>
            </td>
            <td class="px-4 py-3 text-ink/50 hidden sm:table-cell">{{ u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardShell>
</template>
