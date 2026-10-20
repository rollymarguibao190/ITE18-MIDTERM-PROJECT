<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();

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
  name: '',
  email: '',
  password: '',
  confirm: '',
  accept: false,
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirm: '',
  accept: '',
});

const touched = reactive({
  name: false,
  email: false,
  password: false,
  confirm: false,
  accept: false,
});

const submitting = ref(false);
const formError = ref('');

function validateField(field: keyof typeof errors) {
  switch (field) {
    case 'name':
      errors.name = form.name.trim().length >= 2 ? '' : 'Please enter your full name (at least 2 characters).';
      break;
    case 'email':
      errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ? ''
        : 'Enter a valid email address.';
      break;
    case 'password':
      errors.password = form.password.length >= 6 ? '' : 'Password must be at least 6 characters.';
      if (touched.confirm) validateField('confirm');
      break;
    case 'confirm':
      errors.confirm = form.confirm === form.password && form.confirm.length > 0
        ? ''
        : 'Passwords do not match.';
      break;
    case 'accept':
      errors.accept = form.accept ? '' : 'Please accept the Terms to continue.';
      break;
  }
}

const isValid = computed(
  () =>
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirm &&
    !errors.accept &&
    form.name &&
    form.email &&
    form.password &&
    form.confirm &&
    form.accept,
);

async function submit() {
  (Object.keys(touched) as Array<keyof typeof touched>).forEach((k) => (touched[k] = true));
  (Object.keys(errors) as Array<keyof typeof errors>).forEach((k) => validateField(k));
  if (!isValid.value) return;
  submitting.value = true;
  formError.value = '';
  try {
    await auth.register(form.name, form.email, form.password);
    await navigateTo('/');
  } catch (e: any) {
    formError.value = e?.statusMessage || 'Registration failed. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="container-page py-12 md:py-16">
    <div class="max-w-md mx-auto">
      <div class="text-center mb-6">
        <h1 class="font-display font-bold text-3xl text-ink">Create your account</h1>
        <p class="text-ink/60 mt-2">Register to book tours and manage your trips.</p>
      </div>

      <div v-if="formError" class="card p-4 mb-5 border-coral/40 bg-coral/5" role="alert">
        <p class="text-coral-dark text-sm">{{ formError }}</p>
      </div>

      <form class="card p-6" @submit.prevent="submit" novalidate>
        <div class="mb-4">
          <label class="label" for="name">Full name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            class="input"
            :class="{ 'border-coral': touched.name && errors.name }"
            @blur="touched.name = true; validateField('name')"
            @input="touched.name && validateField('name')"
          />
          <p v-if="touched.name && errors.name" class="text-coral text-xs mt-1">{{ errors.name }}</p>
        </div>

        <div class="mb-4">
          <label class="label" for="remail">Email</label>
          <input
            id="remail"
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

        <div class="mb-4">
          <label class="label" for="rpass">Password</label>
          <input
            id="rpass"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            class="input"
            :class="{ 'border-coral': touched.password && errors.password }"
            @blur="touched.password = true; validateField('password')"
            @input="touched.password && validateField('password')"
          />
          <p v-if="touched.password && errors.password" class="text-coral text-xs mt-1">{{ errors.password }}</p>
        </div>

        <div class="mb-4">
          <label class="label" for="rconf">Confirm password</label>
          <input
            id="rconf"
            v-model="form.confirm"
            type="password"
            autocomplete="new-password"
            class="input"
            :class="{ 'border-coral': touched.confirm && errors.confirm }"
            @blur="touched.confirm = true; validateField('confirm')"
            @input="touched.confirm && validateField('confirm')"
          />
          <p v-if="touched.confirm && errors.confirm" class="text-coral text-xs mt-1">{{ errors.confirm }}</p>
        </div>

        <div class="mb-6">
          <label class="flex items-start gap-2 text-sm text-ink/70">
            <input
              v-model="form.accept"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-primary-200 text-primary focus:ring-primary"
              @change="touched.accept = true; validateField('accept')"
            />
            <span>I agree to the
              <NuxtLink to="/terms" class="text-primary font-semibold hover:underline">Terms of Service</NuxtLink>
              and
              <NuxtLink to="/privacy" class="text-primary font-semibold hover:underline">Privacy Policy</NuxtLink>.
            </span>
          </label>
          <p v-if="touched.accept && errors.accept" class="text-coral text-xs mt-1">{{ errors.accept }}</p>
        </div>

        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Creating account…' : 'Create Account' }}
        </button>
      </form>

      <p class="text-center text-sm text-ink/60 mt-6">
        Already have an account?
        <NuxtLink to="/login" class="text-primary font-semibold hover:underline">Log in</NuxtLink>
      </p>
    </div>
  </div>
</template>
