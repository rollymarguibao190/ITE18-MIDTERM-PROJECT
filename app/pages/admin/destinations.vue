<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { Destination } from '~/types';

definePageMeta({ middleware: 'admin' });

const nav = [
  { label: 'Overview', to: '/admin', icon: 'home' as const },
  { label: 'Users', to: '/admin/users', icon: 'users' as const },
  { label: 'Destinations', to: '/admin/destinations', icon: 'pin' as const },
  { label: 'Packages', to: '/admin/packages', icon: 'tag' as const },
  { label: 'Bookings', to: '/admin/bookings', icon: 'calendar' as const },
];

const destinations = ref<Destination[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await $fetch<{ destinations: Destination[] }>('/api/admin/destinations');
    destinations.value = res.destinations;
  } catch (e: any) {
    error.value = e?.statusMessage || 'Failed to load destinations.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return destinations.value;
  return destinations.value.filter(
    (d) => d.name.toLowerCase().includes(q) || d.province.toLowerCase().includes(q),
  );
});

// Modal state
const modalOpen = ref(false);
const editing = ref<Destination | null>(null);
const saving = ref(false);
const formError = ref('');

const form = reactive({
  name: '',
  province: '',
  description: '',
  image: '',
  highlightsText: '',
});

function resetForm() {
  form.name = '';
  form.province = '';
  form.description = '';
  form.image = '';
  form.highlightsText = '';
  formError.value = '';
}

function openCreate() {
  editing.value = null;
  resetForm();
  modalOpen.value = true;
}

function openEdit(d: Destination) {
  editing.value = d;
  form.name = d.name;
  form.province = d.province;
  form.description = d.description;
  form.image = d.image;
  form.highlightsText = d.highlights.join('\n');
  formError.value = '';
  modalOpen.value = true;
}

async function save() {
  if (!form.name.trim()) { formError.value = 'Name is required.'; return; }
  if (!form.province.trim()) { formError.value = 'Province is required.'; return; }
  if (!form.description.trim()) { formError.value = 'Description is required.'; return; }

  saving.value = true;
  formError.value = '';
  const payload = {
    name: form.name.trim(),
    province: form.province.trim(),
    description: form.description.trim(),
    image: form.image.trim(),
    highlights: form.highlightsText.split('\n').map((h) => h.trim()).filter(Boolean),
  };
  try {
    if (editing.value) {
      const res = await $fetch<{ destination: Destination }>(`/api/admin/destinations/${editing.value.id}`, {
        method: 'PATCH', body: payload,
      });
      const idx = destinations.value.findIndex((d) => d.id === editing.value!.id);
      if (idx !== -1) destinations.value[idx] = res.destination;
    } else {
      const res = await $fetch<{ destination: Destination }>('/api/admin/destinations', {
        method: 'POST', body: payload,
      });
      destinations.value.push(res.destination);
    }
    modalOpen.value = false;
    resetForm();
  } catch (e: any) {
    formError.value = e?.statusMessage || 'Save failed.';
  } finally {
    saving.value = false;
  }
}

// Delete
const deleteTarget = ref<Destination | null>(null);
const deleting = ref(false);

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await $fetch(`/api/admin/destinations/${deleteTarget.value.id}`, { method: 'DELETE' });
    destinations.value = destinations.value.filter((d) => d.id !== deleteTarget.value!.id);
    deleteTarget.value = null;
  } catch (e: any) {
    error.value = e?.statusMessage || 'Delete failed.';
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <DashboardShell title="Manage Destinations" :nav="nav">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
      <input v-model="search" type="search" placeholder="Search destinations…" class="input max-w-xs" />
      <button class="btn-primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Add destination
      </button>
    </div>

    <div v-if="loading" class="card p-8 text-center text-ink/60" aria-live="polite">Loading destinations…</div>
    <div v-else-if="error" class="card p-8 text-center text-coral" role="alert">{{ error }}</div>
    <div v-else-if="filtered.length === 0" class="card p-12 text-center">
      <p class="font-display font-semibold text-lg text-ink">No destinations found</p>
      <p class="text-ink/60 text-sm mt-1" v-if="search">Try a different search.</p>
      <p class="text-ink/60 text-sm mt-1" v-else>Add your first destination to get started.</p>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-primary-50/60 text-ink/70">
            <tr>
              <th class="px-4 py-3 font-semibold">Name</th>
              <th class="px-4 py-3 font-semibold">Province</th>
              <th class="px-4 py-3 font-semibold hidden sm:table-cell">Highlights</th>
              <th class="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-100">
            <tr v-for="d in filtered" :key="d.id" class="hover:bg-primary-50/30">
              <td class="px-4 py-3 font-medium text-ink">{{ d.name }}</td>
              <td class="px-4 py-3 text-ink/70">{{ d.province }}</td>
              <td class="px-4 py-3 text-ink/50 hidden sm:table-cell">{{ d.highlights.length }} highlights</td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button class="text-xs font-semibold text-primary hover:underline mr-3" @click="openEdit(d)">Edit</button>
                <button class="text-xs font-semibold text-coral-dark hover:underline" @click="deleteTarget = d">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50" @click.self="modalOpen = false">
      <div class="bg-white rounded-2xl shadow-lift max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" role="dialog" aria-modal="true">
        <h2 class="font-display font-bold text-xl text-ink">{{ editing ? 'Edit destination' : 'Add destination' }}</h2>

        <div v-if="formError" class="mt-3 p-3 rounded-lg bg-coral/5 border border-coral/30 text-coral-dark text-sm" role="alert">{{ formError }}</div>

        <div class="mt-4 space-y-4">
          <div>
            <label class="label" for="d-name">Name</label>
            <input id="d-name" v-model="form.name" class="input" placeholder="e.g. Siargao Island" />
          </div>
          <div>
            <label class="label" for="d-province">Province</label>
            <input id="d-province" v-model="form.province" class="input" placeholder="e.g. Surigao del Norte" />
          </div>
          <div>
            <label class="label" for="d-desc">Description</label>
            <textarea id="d-desc" v-model="form.description" class="input min-h-[80px]" placeholder="Short description…" />
          </div>
          <div>
            <label class="label" for="d-image">Image URL (optional)</label>
            <input id="d-image" v-model="form.image" class="input" placeholder="https://…" />
          </div>
          <div>
            <label class="label" for="d-highlights">Highlights (one per line)</label>
            <textarea id="d-highlights" v-model="form.highlightsText" class="input min-h-[80px]" placeholder="Surfing at Cloud 9&#10;Island hopping" />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button class="btn-ghost flex-1" :disabled="saving" @click="modalOpen = false">Cancel</button>
          <button class="btn-primary flex-1" :disabled="saving" @click="save">
            {{ saving ? 'Saving…' : (editing ? 'Save changes' : 'Create') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50" @click.self="deleteTarget = null">
      <div class="bg-white rounded-2xl shadow-lift max-w-sm w-full p-6" role="dialog" aria-modal="true">
        <h2 class="font-display font-bold text-xl text-ink">Delete destination?</h2>
        <p class="text-ink/70 text-sm mt-2">
          This will permanently delete <strong>{{ deleteTarget.name }}</strong>. Packages linked to it will keep their data but lose the connection.
        </p>
        <div class="flex gap-3 mt-5">
          <button class="btn-ghost flex-1" :disabled="deleting" @click="deleteTarget = null">Cancel</button>
          <button class="btn-coral flex-1" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardShell>
</template>
