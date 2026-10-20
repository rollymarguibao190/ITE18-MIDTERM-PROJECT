<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } }>();
const is404 = computed(() => props.error?.statusCode === 404);

function goHome() {
  clearError({ redirect: '/' });
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-page">
    <AppHeader />
    <main class="flex-1 flex items-center">
      <div class="container-page py-20 text-center">
        <p class="font-display font-bold text-6xl text-primary">{{ error?.statusCode || 500 }}</p>
        <h1 class="font-display font-bold text-2xl text-ink mt-4">
          {{ is404 ? 'Page not found' : 'Something went wrong' }}
        </h1>
        <p class="mt-3 text-ink/70 max-w-md mx-auto">
          {{ is404
            ? "The page you're looking for doesn't exist or may have moved."
            : (error?.message || 'An unexpected error occurred. Please try again.') }}
        </p>
        <button class="btn-primary mt-7" @click="goHome">Back to Home</button>
      </div>
    </main>
    <AppFooter />
  </div>
</template>
