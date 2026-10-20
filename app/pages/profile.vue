<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

definePageMeta({ middleware: 'auth' });

const auth = useAuthStore();
</script>

<template>
  <div class="container-page py-12">
    <div class="max-w-lg mx-auto">
      <h1 class="font-display font-bold text-3xl text-ink">My Profile</h1>
      <p class="text-ink/60 mt-1">Your account details.</p>

      <div class="card p-6 mt-6">
        <div class="flex items-center gap-4">
          <span class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal text-white font-display font-bold text-xl">
            {{ auth.user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() }}
          </span>
          <div>
            <p class="font-display font-semibold text-lg text-ink">{{ auth.user?.name }}</p>
            <p class="text-sm text-ink/60">{{ auth.user?.email }}</p>
            <span class="inline-block mt-1 rounded-full bg-primary-50 text-primary text-xs font-semibold px-2.5 py-0.5 capitalize">
              {{ auth.role }}
            </span>
          </div>
        </div>
      </div>

      <div class="card p-6 mt-4">
        <h2 class="font-display font-semibold text-ink">Account actions</h2>
        <p class="text-sm text-ink/60 mt-1">Profile editing arrives in Stage 4.</p>
        <div class="flex flex-wrap gap-3 mt-4">
          <NuxtLink to="/bookings" class="btn-primary">My Bookings</NuxtLink>
          <button class="btn-ghost" @click="auth.logout().then(() => navigateTo('/'))">Log out</button>
        </div>
      </div>
    </div>
  </div>
</template>
