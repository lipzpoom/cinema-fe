<template>
  <div class="flex flex-col h-full bg-background overflow-hidden relative">
    <AdminHeader
      title="Movies Management"
      searchPlaceholder="Search movies by title..."
      @search="searchQuery = $event"
    >
      <template #actions>
        <button
          @click="openAddModal"
          class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-px"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Add New Movie
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

      <!-- Movies Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6"
      >
        <div
          v-for="movie in filteredMovies"
          :key="movie.id"
          class="rounded-xl overflow-hidden bg-card border border-border relative group shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <!-- Image -->
          <div class="relative aspect-2/3 bg-muted w-full overflow-hidden">
            <img
              :src="getPosterImage(movie)"
              alt="poster"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
            ></div>

            <!-- Actions Hover -->
            <div
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-300 backdrop-blur-[2px]"
            >
              <button
                @click="openEditModal(movie)"
                class="w-12 h-12 rounded-full bg-white/20 hover:bg-primary text-white flex items-center justify-center transition-colors"
              >
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button
                @click="deleteMovie(movie.id)"
                class="w-12 h-12 rounded-full bg-white/20 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>

            <!-- Movie Info -->
            <div class="absolute bottom-0 left-0 right-0 p-4 pt-10 text-white">
              <h3 class="font-bold text-lg leading-tight mb-1 truncate">
                {{ movie.title }}
              </h3>
              <div
                class="flex items-center gap-4 text-xs font-medium text-white/80"
              >
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]"
                    >schedule</span
                  >
                  {{ movie.duration }} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <AdminModal
      :isOpen="isModalOpen"
      @update:isOpen="isModalOpen = $event"
      :title="isEditing ? 'Edit Movie' : 'Add New Movie'"
      :confirmText="isEditing ? 'Save Changes' : 'Create'"
      :loading="isSaving"
      @confirm="saveMovie"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Movie Title</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Enter movie title"
            class="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1"
            >Duration (minutes)</label
          >
          <input
            v-model="form.duration"
            type="number"
            min="1"
            class="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="Brief movie description"
            class="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
          ></textarea>
        </div>
      </div>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import AdminHeader from "@/components/layouts/AdminHeader.vue";
import AdminModal from "@/components/admin/AdminModal.vue";
import { MoviesService } from "@/services/movies.service";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();

const movies = ref<any[]>([]);
const searchQuery = ref("");
const filteredMovies = computed(() => {
  if (!searchQuery.value) return movies.value;
  const q = searchQuery.value.toLowerCase();
  return movies.value.filter(
    (m) => m.title && m.title.toLowerCase().includes(q),
  );
});
const isLoading = ref(false);
const isSaving = ref(false);

const isModalOpen = ref(false);
const isEditing = ref(false);

const defaultForm = { id: "", title: "", duration: 120, description: "" };
const form = ref({ ...defaultForm });

const getPosterImage = (movie: any) => {
  // Use a reliable placeholder service with default dimensions that always works
  return (
    movie.posterUrl ||
    "https://placehold.co/400x600/333333/FFFFFF?text=No+Poster"
  );
};

const fetchMovies = async () => {
  isLoading.value = true;
  try {
    const res = await MoviesService.getAllMovies();
    movies.value = res.data || [];
  } catch (error) {
    console.error("Failed to fetch movies:", error);
  } finally {
    isLoading.value = false;
  }
};

const saveMovie = async () => {
  if (!form.value.title) {
    toast.add({
      severity: "warn",
      summary: "Validation Error",
      detail: "Title is required",
      life: 3000,
    });
    return;
  }
  isSaving.value = true;

  try {
    const payload = {
      title: form.value.title,
      duration: Number(form.value.duration),
      description: form.value.description,
    };

    if (isEditing.value && form.value.id) {
      await MoviesService.updateMovie(form.value.id, payload);
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Movie updated successfully",
        life: 3000,
      });
    } else {
      await MoviesService.createMovie(payload);
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Movie created successfully",
        life: 3000,
      });
    }

    isModalOpen.value = false;
    fetchMovies();
  } catch (error: any) {
    console.error("Save failed:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save movie",
      life: 3000,
    });
  } finally {
    isSaving.value = false;
  }
};

const deleteMovie = (id: string) => {
  confirm.require({
    message: "Are you sure you want to delete this movie?",
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
        await MoviesService.deleteMovie(id);
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Movie deleted successfully",
          life: 3000,
        });
        fetchMovies();
      } catch (error: any) {
        console.error("Delete failed:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail:
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to delete movie",
          life: 3000,
        });
      } finally {
        fetchMovies();
      }
    },
  });
};

const openAddModal = () => {
  form.value = { ...defaultForm };
  isEditing.value = false;
  isModalOpen.value = true;
};

const openEditModal = (movie: any) => {
  form.value = {
    id: movie.id,
    title: movie.title,
    duration: movie.duration,
    description: movie.description || "",
  };
  isEditing.value = true;
  isModalOpen.value = true;
};

onMounted(() => {
  fetchMovies();
});
</script>
