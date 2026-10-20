<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useDestinationsStore } from '~/stores/destinations';

const destStore = useDestinationsStore();

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  destination: '',
  date: '',
  travelers: '2',
});

const errors = reactive({
  destination: '',
  date: '',
});

const touched = ref(false);

onMounted(() => {
  if (!destStore.loaded) destStore.fetchAll();
});

const isValid = computed(() => !!form.destination && !!form.date);

function validate() {
  errors.destination = form.destination ? '' : 'Please choose a destination.';
  errors.date = form.date ? '' : 'Please pick a travel date.';
  return !errors.destination && !errors.date;
}

function submit() {
  touched.value = true;
  if (!validate()) return;
  const query = new URLSearchParams({
    destination: form.destination,
    date: form.date,
    travelers: form.travelers,
  }).toString();
  navigateTo(`/offers?${query}`);
}
</script>

<template>
  <form
    class="bg-white rounded-2xl shadow-panel p-3 sm:p-4 w-full max-w-4xl"
    @submit.prevent="submit"
    aria-label="Search trips"
    novalidate
  >
    <div class="grid gap-3 md:grid-cols-[1.4fr_1fr_0.8fr_auto] md:items-end">
      <div>
        <label class="label" for="dest">Destination</label>
        <select
          id="dest"
          v-model="form.destination"
          class="input"
          :class="{ 'border-coral': touched && errors.destination }"
          aria-required="true"
        >
          <option value="" disabled>Select a destination</option>
          <option v-for="d in destStore.items" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
        <p v-if="touched && errors.destination" class="text-coral text-xs mt-1">{{ errors.destination }}</p>
      </div>

      <div>
        <label class="label" for="date">Travel Date</label>
        <input
          id="date"
          type="date"
          v-model="form.date"
          :min="today"
          class="input"
          :class="{ 'border-coral': touched && errors.date }"
          aria-required="true"
        />
        <p v-if="touched && errors.date" class="text-coral text-xs mt-1">{{ errors.date }}</p>
      </div>

      <div>
        <label class="label" for="trav">Travelers</label>
        <select id="trav" v-model="form.travelers" class="input">
          <option v-for="n in 10" :key="n" :value="n">{{ n }} {{ n === 1 ? 'traveler' : 'travelers' }}</option>
        </select>
      </div>

      <button type="submit" class="btn-primary h-[46px] px-6 md:mt-0 mt-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        Search Trips
      </button>
    </div>
  </form>
</template>
