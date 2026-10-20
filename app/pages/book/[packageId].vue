<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { usePackagesStore } from '~/stores/packages';
import { useBookingsStore } from '~/stores/bookings';
import { useAuthStore } from '~/stores/auth';
import type { TourPackage } from '~/types';

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const pkgStore = usePackagesStore();
const bookingsStore = useBookingsStore();
const auth = useAuthStore();

const packageId = computed(() => route.params.packageId as string);
const pkg = ref<TourPackage | null>(null);
const notFound = ref(false);
const loadingPkg = ref(true);

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  travelDate: (route.query.date as string) || '',
  travelers: Number(route.query.travelers) || 2,
});

const errors = reactive({ travelDate: '', travelers: '' });
const touched = reactive({ travelDate: false, travelers: false });
const submitting = ref(false);
const formError = ref('');
const success = ref(false);

onMounted(async () => {
  try {
    await pkgStore.fetchOne(packageId.value);
    if (!pkgStore.current) {
      notFound.value = true;
      return;
    }
    pkg.value = pkgStore.current;
  } catch {
    notFound.value = true;
  } finally {
    loadingPkg.value = false;
  }
});

function priceLabel(p: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(p);
}

const totalPrice = computed(() => (pkg.value ? pkg.value.price * form.travelers : 0));

function validateField(field: 'travelDate' | 'travelers') {
  if (field === 'travelDate') {
    if (!form.travelDate) errors.travelDate = 'Please pick a travel date.';
    else if (form.travelDate < today) errors.travelDate = 'Travel date cannot be in the past.';
    else errors.travelDate = '';
  }
  if (field === 'travelers') {
    if (form.travelers < 1) errors.travelers = 'At least 1 traveler.';
    else if (form.travelers > 20) errors.travelers = 'Maximum 20 travelers.';
    else errors.travelers = '';
  }
}

const isValid = computed(() => !errors.travelDate && !errors.travelers && form.travelDate && form.travelers >= 1);

async function submit() {
  touched.travelDate = true;
  touched.travelers = true;
  validateField('travelDate');
  validateField('travelers');
  if (!isValid.value || !pkg.value) return;
  submitting.value = true;
  formError.value = '';
  try {
    await bookingsStore.create(pkg.value.id, form.travelDate, form.travelers);
    success.value = true;
  } catch (e: any) {
    formError.value = e?.statusMessage || 'Booking failed. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="container-page py-10">
    <!-- Loading -->
    <div v-if="loadingPkg" class="max-w-3xl mx-auto" aria-live="polite">
      <div class="h-64 bg-primary-50 rounded-2xl animate-pulse mb-6" />
      <div class="h-8 w-1/2 bg-primary-50 rounded animate-pulse" />
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="max-w-md mx-auto text-center py-12">
      <p class="font-display font-bold text-3xl text-ink">Package not found</p>
      <p class="mt-2 text-ink/60">This tour package doesn't exist.</p>
      <NuxtLink to="/offers" class="btn-primary mt-6">Back to Offers</NuxtLink>
    </div>

    <!-- Success -->
    <div v-else-if="success" class="max-w-lg mx-auto text-center py-12">
      <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 13l4 4L19 7" /></svg>
      </div>
      <h1 class="font-display font-bold text-3xl text-ink">Booking confirmed!</h1>
      <p class="mt-2 text-ink/70">
        Your booking for <strong>{{ pkg?.name }}</strong> on
        <strong>{{ form.travelDate }}</strong> for
        <strong>{{ form.travelers }}</strong> {{ form.travelers === 1 ? 'traveler' : 'travelers' }}
        has been submitted. Status: <span class="font-semibold">Pending</span>.
      </p>
      <div class="flex flex-wrap justify-center gap-3 mt-6">
        <NuxtLink to="/bookings" class="btn-primary">View My Bookings</NuxtLink>
        <NuxtLink to="/offers" class="btn-ghost">Browse more tours</NuxtLink>
      </div>
    </div>

    <!-- Booking form -->
    <div v-else-if="pkg" class="max-w-4xl mx-auto">
      <NuxtLink :to="`/packages/${pkg.id}`" class="text-primary text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M11 19l-7-7 7-7" /></svg>
        Back to package
      </NuxtLink>

      <div class="grid lg:grid-cols-[1fr_340px] gap-8 mt-4">
        <!-- Form -->
        <div>
          <h1 class="font-display font-bold text-3xl text-ink">Book this tour</h1>
          <p class="text-ink/60 mt-1">Confirm your travel date and number of travelers.</p>

          <div v-if="formError" class="card p-4 mt-5 border-coral/40 bg-coral/5" role="alert">
            <p class="text-coral-dark text-sm">{{ formError }}</p>
          </div>

          <form class="card p-6 mt-5" @submit.prevent="submit" novalidate>
            <div class="mb-5">
              <label class="label" for="travel-date">Travel date</label>
              <input
                id="travel-date"
                type="date"
                v-model="form.travelDate"
                :min="today"
                class="input"
                :class="{ 'border-coral': touched.travelDate && errors.travelDate }"
                @blur="touched.travelDate = true; validateField('travelDate')"
                @input="touched.travelDate && validateField('travelDate')"
              />
              <p v-if="touched.travelDate && errors.travelDate" class="text-coral text-xs mt-1">{{ errors.travelDate }}</p>
            </div>

            <div class="mb-6">
              <label class="label" for="travelers">Number of travelers</label>
              <input
                id="travelers"
                type="number"
                v-model.number="form.travelers"
                min="1"
                max="20"
                class="input"
                :class="{ 'border-coral': touched.travelers && errors.travelers }"
                @blur="touched.travelers = true; validateField('travelers')"
                @input="touched.travelers && validateField('travelers')"
              />
              <p v-if="touched.travelers && errors.travelers" class="text-coral text-xs mt-1">{{ errors.travelers }}</p>
              <p v-else class="text-ink/50 text-xs mt-1">Up to 20 travelers per booking.</p>
            </div>

            <button type="submit" class="btn-primary w-full" :disabled="submitting">
              {{ submitting ? 'Submitting…' : 'Confirm Booking' }}
            </button>
          </form>
        </div>

        <!-- Summary -->
        <aside>
          <div class="card overflow-hidden sticky top-24">
            <img :src="pkg.image" :alt="pkg.name" class="h-40 w-full object-cover" />
            <div class="p-5">
              <p class="text-xs text-primary font-semibold uppercase tracking-wide">Booking summary</p>
              <h2 class="font-display font-bold text-lg text-ink mt-1">{{ pkg.name }}</h2>
              <p class="text-sm text-ink/60">{{ pkg.destinationName }}</p>
              <hr class="my-3 border-primary-100" />
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between">
                  <span class="text-ink/60">Duration</span>
                  <span class="font-medium text-ink">{{ pkg.durationDays === 1 ? '1 day' : `${pkg.durationDays} days` }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink/60">Price per person</span>
                  <span class="font-medium text-ink">{{ priceLabel(pkg.price) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink/60">Travelers</span>
                  <span class="font-medium text-ink">{{ form.travelers }}</span>
                </div>
              </div>
              <hr class="my-3 border-primary-100" />
              <div class="flex justify-between items-end">
                <span class="text-sm text-ink/60">Total</span>
                <span class="font-display font-bold text-2xl text-ink">{{ priceLabel(totalPrice) }}</span>
              </div>
              <p class="text-xs text-ink/50 mt-3">
                Signed in as {{ auth.user?.name }}. Bookings start as "pending" and are confirmed by the operator.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
