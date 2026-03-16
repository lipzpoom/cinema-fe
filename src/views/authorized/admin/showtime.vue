<template>
  <div class="flex flex-col h-full bg-background overflow-hidden relative">
    <AdminHeader
      title="Showtimes Management"
      searchPlaceholder="Search showtimes..."
      @search="searchQuery = $event"
    >
      <template #actions>
        <button
          @click="openAddModal"
          class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-px"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Add New Showtime
        </button>
      </template>
    </AdminHeader>

    <div class="flex-1 p-8 overflow-y-auto">
      <div v-if="isLoading" class="flex justify-center py-20">
        <span
          class="material-symbols-outlined animate-spin text-4xl text-primary"
          >progress_activity</span
        >
      </div>

      <!-- Showtimes Table -->
      <div
        v-else
        class="bg-card border border-border rounded-xl overflow-hidden"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-muted text-sm font-semibold border-b border-border">
              <th class="px-6 py-4">Movie</th>
              <th class="px-6 py-4">Duration</th>
              <th class="px-6 py-4">Theater Number</th>
              <th class="px-6 py-4">Start Time</th>
              <th class="px-6 py-4">End Time</th>
              <th class="px-6 py-4 text-right">Price</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="showtime in filteredShowtimes"
              :key="showtime.id"
              class="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td class="px-6 py-4">{{ getMovieTitle(showtime.movie_id) }}</td>
              <td class="px-6 py-4">
                {{ getMovieDuration(showtime.movie_id) }} mins
              </td>
              <td class="px-6 py-4">Theater {{ showtime.theater_number }}</td>
              <td class="px-6 py-4">
                {{ display.standardDatetime(showtime.start_time) }}
              </td>
              <td class="px-6 py-4">
                {{ display.standardDatetime(showtime.end_time) }}
              </td>
              <td class="px-6 py-4 text-right font-semibold text-primary">
                ฿{{ showtime.price || 0 }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(showtime)"
                    class="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <span class="material-symbols-outlined text-[20px]"
                      >edit</span
                    >
                  </button>
                  <button
                    @click="deleteShowtime(showtime.id)"
                    class="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <span class="material-symbols-outlined text-[20px]"
                      >delete</span
                    >
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="showtimes.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No showtimes found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <AdminModal
      :isOpen="isModalOpen"
      @update:isOpen="isModalOpen = $event"
      :title="isEditing ? 'Edit Showtime' : 'Add New Showtime'"
      :confirmText="isEditing ? 'Save Changes' : 'Create'"
      :loading="isSaving"
      @confirm="saveShowtime"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Movie</label>
          <Select
            v-model="form.movie_id"
            :options="movies"
            optionLabel="title"
            optionValue="id"
            placeholder="Select a Movie"
            class="w-full"
          />
          <label class="block text-sm font-medium mb-1">Theater Number</label>
          <input
            v-model="form.theater_number"
            type="text"
            placeholder="e.g. 1"
            class="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Start Time</label>
            <input
              v-model="form.start_time"
              type="datetime-local"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Price (฿)</label>
          <input
            v-model="form.price"
            type="number"
            min="0"
            class="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import AdminHeader from "@/components/layouts/AdminHeader.vue";
import AdminModal from "@/components/admin/AdminModal.vue";
import Select from "primevue/select";
import { ShowtimesService } from "@/services/showtimes.service";
import { MoviesService } from "@/services/movies.service";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { DisplayComponent } from "@/shared/display-component";

const display = new DisplayComponent();

const toast = useToast();
const confirm = useConfirm();

const showtimes = ref<any[]>([]);
const searchQuery = ref("");

const filteredShowtimes = computed(() => {
  if (!searchQuery.value) return showtimes.value;
  const q = searchQuery.value.toLowerCase();
  return showtimes.value.filter((st) => {
    // using find directly to avoid duplicate method definition issues here
    const m = movies.value.find((x) => x.id === st.movie_id);
    const movieTitle = m
      ? m.title.toLowerCase()
      : String(st.movie_id).toLowerCase();
    const strTheater = String(st.theater_number).toLowerCase();
    return movieTitle.includes(q) || strTheater.includes(q);
  });
});

const movies = ref<any[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);

const isModalOpen = ref(false);
const isEditing = ref(false);

const defaultForm = {
  id: "",
  movie_id: "",
  theater_number: "",
  start_time: "",
  price: 150,
};
const form = ref({ ...defaultForm });

const getMovieTitle = (movieId: string) => {
  const movie = movies.value.find((m) => m.id === movieId);
  return movie ? movie.title : movieId;
};

const getMovieDuration = (movieId: string) => {
  const movie = movies.value.find((m) => m.id === movieId);
  return movie ? movie.duration : "-";
};

const fetchMovies = async () => {
  try {
    const res = await MoviesService.getAllMovies();
    movies.value = res.data || [];
  } catch (error) {
    console.error("Failed to fetch movies:", error);
  }
};

const fetchShowtimes = async () => {
  isLoading.value = true;
  try {
    const res = await ShowtimesService.getAllShowtimes();
    showtimes.value = res.data || [];
  } catch (error) {
    console.error("Failed to fetch showtimes:", error);
  } finally {
    isLoading.value = false;
  }
};

const saveShowtime = async () => {
  if (!form.value.movie_id || !form.value.theater_number) {
    toast.add({
      severity: "warn",
      summary: "Validation Error",
      detail: "Movie and Theater Number are required",
      life: 3000,
    });
    return;
  }
  isSaving.value = true;

  try {
    const payload = {
      movie_id: form.value.movie_id,
      theater_number: form.value.theater_number,
      start_time: new Date(form.value.start_time).toISOString(),
      price: Number(form.value.price) || 0,
    };

    if (isEditing.value && form.value.id) {
      await ShowtimesService.updateShowtime(form.value.id, payload);
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Showtime updated successfully",
        life: 3000,
      });
    } else {
      await ShowtimesService.createShowtime(payload);
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Showtime created successfully",
        life: 3000,
      });
    }

    isModalOpen.value = false;
    fetchShowtimes();
  } catch (error) {
    console.error("Save failed:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        (error as any)?.response?.data?.error ||
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Failed to save showtime",
      life: 3000,
    });
  } finally {
    isSaving.value = false;
  }
};

const deleteShowtime = (id: string) => {
  confirm.require({
    message: "Are you sure you want to delete this showtime?",
    header: "Confirm Deletion",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: async () => {
      try {
        isLoading.value = true;
        await ShowtimesService.deleteShowtime(id);
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Showtime deleted successfully",
          life: 3000,
        });
        fetchShowtimes();
      } catch (error) {
        console.error("Delete failed:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail:
            (error as any)?.response?.data?.message ||
            (error as any)?.response?.data?.error ||
            (error as any)?.message ||
            "Failed to delete showtime",
          life: 3000,
        });
      } finally {
        fetchShowtimes();
      }
    },
  });
};

const openAddModal = () => {
  form.value = { ...defaultForm };

  // Set default datetime to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  form.value.start_time = now.toISOString().slice(0, 16);

  isEditing.value = false;
  isModalOpen.value = true;
};

const openEditModal = (showtime: any) => {
  form.value = {
    id: showtime.id,
    movie_id: showtime.movie_id,
    theater_number: showtime.theater_number,
    start_time: new Date(showtime.start_time).toISOString().slice(0, 16),
    price: showtime.price || 0,
  };
  isEditing.value = true;
  isModalOpen.value = true;
};

onMounted(() => {
  fetchMovies();
  fetchShowtimes();
});
</script>
