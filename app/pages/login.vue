<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
const route = useRoute();

definePageMeta({
  middleware: async () => {
    const { useAuthStore } = await import('~/stores/auth');
    const a = useAuthStore();
    await a.init();
    if (a.isAuthenticated) {
      if (a.role === 'admin') return navigateTo('/admin');
      if (a.role === 'operator') return navigateTo('/operator');
      return navigateTo('/');
    }
  },
});

const form = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: '',
  password: '',
});
const touched = reactive({ email: false, password: false });
const submitting = ref(false);
const formError = ref('');

const redirect = computed(() => (route.query.redirect as string) || '/');

function validateField(field: 'email' | 'password') {
  if (field === 'email') {
    errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? ''
      : 'Enter a valid email address.';
  }
  if (field === 'password') {
    errors.password = form.password.length >= 1 ? '' : 'Password is required.';
  }
}

const isValid = computed(() => !errors.email && !errors.password && form.email && form.password);

async function submit() {
  touched.email = true;
  touched.password = true;
  validateField('email');
  validateField('password');
  if (!isValid.value) return;
  submitting.value = true;
  formError.value = '';
  try {
    const user = await auth.login(form.email, form.password);
    if (user.role === 'admin') await navigateTo('/admin');
    else if (user.role === 'operator') await navigateTo('/operator');
    else await navigateTo(redirect.value);
  } catch (e: any) {
    formError.value = e?.statusMessage || 'Login failed. Please try again.';
  } finally {
    submitting.value = false;
  }
}

const demoAccounts = [
  { role: 'Customer', email: 'customer@caraga.dev', password: 'customer123' },
  { role: 'Operator', email: 'operator@caraga.dev', password: 'operator123' },
  { role: 'Admin', email: 'admin@caraga.dev', password: 'admin123' },
];

function fillDemo(a: { email: string; password: string }) {
  form.email = a.email;
  form.password = a.password;
  touched.email = true;
  touched.password = true;
  validateField('email');
  validateField('password');
}
</script>

<template>
  <div class="container-page py-12 md:py-16">
    <div class="max-w-md mx-auto">
      <div class="text-center mb-6">
        <h1 class="font-display font-bold text-3xl text-ink">Welcome back</h1>
        <p class="text-ink/60 mt-2">Sign in to manage your bookings and trips.</p>
      </div>

      <div v-if="formError" class="card p-4 mb-5 border-coral/40 bg-coral/5" role="alert">
        <p class="text-coral-dark text-sm">{{ formError }}</p>
      </div>

      <form class="card p-6" @submit.prevent="submit" novalidate>
        <div class="mb-4">
          <label class="label" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            class="input"
            :class="{ 'border-coral': touched.email && errors.email }"
            @blur="touched.email = true; validateField('email')"
            @input="touched.email && validateField('email')"
          />
          <p v-if="touched.email && errors.email" class="text-coral text-xs mt-1">{{ errors.email }}</p>
        </div>

        <div class="mb-6">
          <label class="label" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            class="input"
            :class="{ 'border-coral': touched.password && errors.password }"
            @blur="touched.password = true; validateField('password')"
            @input="touched.password && validateField('password')"
          />
          <p v-if="touched.password && errors.password" class="text-coral text-xs mt-1">{{ errors.password }}</p>
        </div>

        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Log In' }}
        </button>
      </form>

      <div class="card p-5 mt-4 bg-primary-50/40">
        <p class="text-sm font-semibold text-ink mb-2">Demo accounts</p>
        <ul class="space-y-2">
          <li
            v-for="a in demoAccounts"
            :key="a.email"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-ink/70">
              <strong class="text-ink">{{ a.role }}</strong> · {{ a.email }}
            </span>
            <button type="button" class="text-primary font-semibold hover:underline" @click="fillDemo(a)">
              Use
            </button>
          </li>
        </ul>
        <p class="text-xs text-ink/50 mt-3">
          These accounts are seeded automatically on first server start.
        </p>
      </div>

      <p class="text-center text-sm text-ink/60 mt-6">
        Need an account?
        <NuxtLink to="/register" class="text-primary font-semibold hover:underline">Sign up</NuxtLink>
      </p>
    </div>
  </div>
</template>
