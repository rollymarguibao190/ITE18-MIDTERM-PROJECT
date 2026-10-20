<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { TourPackage, Destination } from '~/types';

definePageMeta({ middleware: 'admin' });

const nav = [
  { label: 'Overview', to: '/admin', icon: 'home' as const },
  { label: 'Users', to: '/admin/users', icon: 'users' as const },
  { label: 'Destinations', to: '/admin/destinations', icon: 'pin' as const },
  { label: 'Packages', to: '/admin/packages', icon: 'tag' as const },
  { label: 'Bookings', to: '/admin/bookings', icon: 'calendar' as const },
];

const packages = ref<TourPackage[]>([]);
const destinations = ref<Destination[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [pkgRes, destRes] = await Promise.all([
      $fetch<{ packages: TourPackage[] }>('/api/admin/packages'),
      $fetch<{ destinations: Destination[] }>('/api/admin/destinations'),
    ]);
    packages.value = pkgRes.packages;
    destinations.value = destRes.destinations;
  } catch (e: any) {
    error.value = e?.statusMessage || 'Failed to load packages.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return packages.value;
  return packages.value.filter(
    (p) => p.name.toLowerCase().includes(q) || p.destinationName.toLowerCase().includes(q),
  );
});

function priceLabel(p: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(p);
}

// Modal
const modalOpen = ref(false);
const editing = ref<TourPackage | null>(null);
const saving = ref(false);
const formError = ref('');

const form = reactive({
  name: '',
  destinationId: '',
  durationDays: 1,
  price: 0,
  image: '',
  description: '',
  includesText: '',
});

function resetForm() {
  form.name = '';
  form.destinationId = '';
  form.durationDays = 1;
  form.price = 0;
  form.image = '';
  form.description = '';
  form.includesText = '';
  formError.value = '';
}

function openCreate() {
  editing.value = null;
  resetForm();
  if (destinations.value.length > 0) form.destinationId = destinations.value[0].id;
  modalOpen.value = true;
}

function openEdit(p: TourPackage) {
  editing.value = p;
  form.name = p.name;
  form.destinationId = p.destinationId;
  form.durationDays = p.durationDays;
  form.price = p.price;
  form.image = p.image;
  form.description = p.description;
  form.includesText = p.includes.join('\n');
  formError.value = '';
  modalOpen.value = true;
}

async function save() {
  if (!form.name.trim()) { formError.value = 'Name is required.'; return; }
  if (!form.destinationId) { formError.value = 'Destination is required.'; return; }
  if (form.durationDays < 1) { formError.value = 'Duration must be at least 1 day.'; return; }
  if (form.price < 1) { formError.value = 'Price must be positive.'; return; }
  if (!form.description.trim()) { formError.value = 'Description is required.'; return; }

  saving.value = true;
  formError.value = '';
  const payload = {
    name: form.name.trim(),
    destinationId: form.destinationId,
    durationDays: Number(form.durationDays),
    price: Number(form.price),
    image: form.image.trim(),
    description: form.description.trim(),
    includes: form.includesText.split('\n').map((i) => i.trim()).filter(Boolean),
  };
  try {
    if (editing.value) {
      const res = await $fetch<{ package: TourPackage }>(`/api/admin/packages/${editing.value.id}`, {
        method: 'PATCH', body: payload,
      });
      const idx = packages.value.findIndex((p) => p.id === editing.value!.id);
      if (idx !== -1) packages.value[idx] = res.package;
    } else {
      const res = await $fetch<{ package: TourPackage }>('/api/admin/packages', {
        method: 'POST', body: payload,
      });
      packages.value.push(res.package);
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
const deleteTarget = ref<TourPackage | null>(null);
const deleting = ref(false);

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await $fetch(`/api/admin/packages/${deleteTarget.value.id}`, { method: 'DELETE' });
    packages.value = packages.value.filter((p) => p.id !== deleteTarget.value!.id);
    deleteTarget.value = null;
  } catch (e: any) {
    error.value = e?.statusMessage || 'Delete failed.';
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <DashboardShell title="Manage Packages" :nav="nav">
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
      <input v-model="search" type="search" placeholder="Search packages…" class="input max-w-xs" />
      <button class="btn-primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Add package
      </button>
    </div>

    <div v-if="loading" class="card p-8 text-center text-ink/60" aria-live="polite">Loading packages…</div>
    <div v-else-if="error" class="card p-8 text-center text-coral" role="alert">{{ error }}</div>
    <div v-else-if="filtered.length === 0" class="card p-12 text-center">
      <p class="font-display font-semibold text-lg text-ink">No packages found</p>
      <p class="text-ink/60 text-sm mt-1" v-if="search">Try a different search.</p>
      <p class="text-ink/60 text-sm mt-1" v-else>Add your first tour package to get started.</p>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-primary-50/60 text-ink/70">
            <tr>
              <th class="px-4 py-3 font-semibold">Package</th>
              <th class="px-4 py-3 font-semibold">Destination</th>
              <th class="px-4 py-3 font-semibold">Duration</th>
              <th class="px-4 py-3 font-semibold">Price</th>
              <th class="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-100">
            <tr v-for="p in filtered" :key="p.id" class="hover:bg-primary-50/30">
              <td class="px-4 py-3 font-medium text-ink">{{ p.name }}</td>
              <td class="px-4 py-3 text-ink/70">{{ p.destinationName }}</td>
              <td class="px-4 py-3 text-ink/70">{{ p.durationDays }}d</td>
              <td class="px-4 py-3 text-ink/70">{{ priceLabel(p.price) }}</td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button class="text-xs font-semibold text-primary hover:underline mr-3" @click="openEdit(p)">Edit</button>
                <button class="text-xs font-semibold text-coral-dark hover:underline" @click="deleteTarget = p">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50" @click.self="modalOpen = false">
      <div class="bg-white rounded-2xl shadow-lift max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" role="dialog" aria-modal="true">
        <h2 class="font-display font-bold text-xl text-ink">{{ editing ? 'Edit package' : 'Add package' }}</h2>

        <div v-if="formError" class="mt-3 p-3 rounded-lg bg-coral/5 border border-coral/30 text-coral-dark text-sm" role="alert">{{ formError }}</div>

        <div class="mt-4 space-y-4">
          <div>
            <label class="label" for="p-name">Package name</label>
            <input id="p-name" v-model="form.name" class="input" placeholder="e.g. Siargao Surf & Island Escape" />
          </div>
          <div>
            <label class="label" for="p-dest">Destination</label>
            <select id="p-dest" v-model="form.destinationId" class="input">
              <option value="" disabled>Select a destination</option>
              <option v-for="d in destinations" :key="d.id" :value="d.id">{{ d.name }} ({{ d.province }})</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label" for="p-dur">Duration (days)</label>
              <input id="p-dur" type="number" min="1" v-model.number="form.durationDays" class="input" />
            </div>
            <div>
              <label class="label" for="p-price">Price (PHP)</label>
              <input id="p-price" type="number" min="1" v-model.number="form.price" class="input" />
            </div>
          </div>
          <div>
            <label class="label" for="p-image">Image URL (optional)</label>
            <input id="p-image" v-model="form.image" class="input" placeholder="https://…" />
          </div>
          <div>
            <label class="label" for="p-desc">Description</label>
            <textarea id="p-desc" v-model="form.description" class="input min-h-[80px]" placeholder="Tour description…" />
          </div>
          <div>
            <label class="label" for="p-includes">Inclusions (one per line)</label>
            <textarea id="p-includes" v-model="form.includesText" class="input min-h-[80px]" placeholder="Hotel accommodation&#10;Island hopping tour" />
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
        <h2 class="font-display font-bold text-xl text-ink">Delete package?</h2>
        <p class="text-ink/70 text-sm mt-2">
          This will permanently delete <strong>{{ deleteTarget.name }}</strong>. Existing bookings for this package will remain in the system.
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
