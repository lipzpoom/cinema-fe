<template>
  <div class="flex flex-col h-full bg-background overflow-hidden relative">
    <AdminHeader title="Theater & Seat Management" :showSearch="false" />

    <div class="flex-1 p-6 overflow-y-auto">
      <div v-if="isLoading" class="flex justify-center py-20">
        <span
          class="material-symbols-outlined animate-spin text-4xl text-primary"
          >progress_activity</span
        >
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-6 h-full">
        <!-- Theaters List -->
        <div class="w-full lg:w-1/3 flex flex-col gap-4">
          <h2 class="text-lg font-bold">Theaters</h2>
          <div class="flex flex-col gap-2">
            <button
              v-for="theater in uniqueTheaters"
              :key="theater"
              @click="selectTheater(theater)"
              :class="[
                'p-4 rounded-xl border text-left flex justify-between items-center transition-all',
                selectedTheater === theater
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card hover:border-primary/50',
              ]"
            >
              <span class="font-bold text-lg">Theater {{ theater }}</span>
              <span class="material-symbols-outlined text-sm"
                >chevron_right</span
              >
            </button>
            <div
              v-if="uniqueTheaters.length === 0"
              class="text-sm text-gray-500"
            >
              No theaters found from existing showtimes.
            </div>
          </div>
        </div>

        <!-- Showtimes List for Selected Theater -->
        <div v-if="selectedTheater" class="w-full lg:w-1/3 flex flex-col gap-4">
          <h2 class="text-lg font-bold flex items-center gap-2">
            Showtimes
            <span class="bg-primary text-white px-2 py-0.5 rounded text-[10px]"
              >T.{{ selectedTheater }}</span
            >
          </h2>
          <div
            class="flex flex-col gap-2 h-0 flex-1 overflow-y-auto pr-2 pb-10"
          >
            <button
              v-for="st in showtimesForTheater"
              :key="st.id"
              @click="selectShowtime(st)"
              :class="[
                'p-4 rounded-xl border text-left transition-all shrink-0',
                selectedShowtime?.id === st.id
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card hover:border-primary/50',
              ]"
            >
              <div class="font-bold mb-1 truncate">
                {{ getMovieTitle(st.movie_id) }}
              </div>
              <div class="flex items-center justify-between mt-2">
                <div
                  class="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[14px]"
                    >schedule</span
                  >
                  {{ formatTime(st.start_time) }}
                </div>
                <div
                  class="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary font-bold"
                >
                  {{ countSeats(st.id) }} Seats Authored
                </div>
              </div>
            </button>
            <div
              v-if="showtimesForTheater.length === 0"
              class="text-sm text-gray-500"
            >
              No showtimes found for this theater.
            </div>
          </div>
        </div>

        <!-- Seat Editor for Selected Showtime -->
        <div
          v-if="selectedShowtime"
          class="w-full lg:w-1/3 flex flex-col gap-4 bg-card border border-border rounded-xl p-4 shadow-sm h-fit max-h-full"
        >
          <div
            class="flex justify-between items-center pb-3 border-b border-border"
          >
            <div>
              <h2 class="text-base font-bold leading-tight">Config Seats</h2>
              <div class="text-xs text-gray-500">
                {{ formatTime(selectedShowtime.start_time) }}
              </div>
            </div>
            <button
              @click="openAddModal"
              class="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-primary/90 transition-all shadow-sm"
            >
              <span class="material-symbols-outlined text-[14px]">apps</span>
              Generate Seats
            </button>
          </div>

          <div class="overflow-y-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="text-xs text-gray-500">
                  <th class="pb-2 font-medium">Seat</th>
                  <th class="pb-2 font-medium">Status</th>
                  <th class="pb-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="seat in currentSeats"
                  :key="seat.id"
                  class="border-b border-border last:border-0 hover:bg-muted/50 group"
                >
                  <td class="py-2.5 font-mono font-bold">
                    {{ seat.seat_number }}
                  </td>
                  <td class="py-2.5">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      :class="
                        seat.status.toUpperCase() === 'AVAILABLE'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                      "
                    >
                      {{ seat.status }}
                    </span>
                  </td>
                  <td class="py-2.5 text-right">
                    <button
                      @click="deleteSeat(seat.id)"
                      class="text-red-500/50 group-hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-all"
                    >
                      <span class="material-symbols-outlined text-[16px] block"
                        >delete</span
                      >
                    </button>
                  </td>
                </tr>
                <tr v-if="currentSeats.length === 0">
                  <td
                    colspan="3"
                    class="py-10 text-center text-gray-400 italic"
                  >
                    No seats configured yet.<br /><span class="text-xs"
                      >Click Add Seat to start.</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Seats Modal -->
    <AdminModal
      :isOpen="isModalOpen"
      @update:isOpen="isModalOpen = $event"
      title="Generate Seats"
      confirmText="Generate & Save"
      :loading="isSaving"
      @confirm="generateSeats"
    >
      <div class="flex flex-col gap-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300"
              >Number of Rows</label
            >
            <input
              v-model="form.rows"
              type="number"
              min="1"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-mono"
              placeholder="e.g. 10 (A-J)"
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300"
              >Seats per Row</label
            >
            <input
              v-model="form.seatsPerRow"
              type="number"
              min="1"
              class="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-mono"
              placeholder="e.g. 15"
            />
          </div>
        </div>
        <div
          class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex gap-2 items-start leading-relaxed"
        >
          <span class="material-symbols-outlined text-[18px]">info</span>
          <span
            >This will auto-generate block of seats (e.g. A1, B1) and set them
            as <strong>AVAILABLE</strong>.<br />Existing seats in this showtime
            will be skipped.</span
          >
        </div>
      </div>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import AdminHeader from "@/components/layouts/AdminHeader.vue";
import AdminModal from "@/components/admin/AdminModal.vue";
import { ShowtimesService } from "@/services/showtimes.service";
import { MoviesService } from "@/services/movies.service";
import { DisplayComponent } from "@/shared/display-component";
import { SeatsService } from "@/services/seats.service";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();

const rawShowtimes = ref<any[]>([]);
const rawSeats = ref<any[]>([]);
const movies = ref<any[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);

const displayComp = new DisplayComponent();

const selectedTheater = ref<string | null>(null);
const selectedShowtime = ref<any>(null);

const countSeats = (st_id: string) => {
  return rawSeats.value.filter((s) => s.showtime_id === st_id).length;
};

const uniqueTheaters = computed(() => {
  const ts = new Set<string>();
  rawShowtimes.value.forEach((st) => {
    if (st.theater_number) ts.add(st.theater_number.toString());
  });
  return Array.from(ts).sort();
});

const showtimesForTheater = computed(() => {
  if (!selectedTheater.value) return [];
  return rawShowtimes.value
    .filter((st) => st.theater_number?.toString() === selectedTheater.value)
    .sort((a, b) => {
      const timeA = new Date(a.start_time).getTime();
      const timeB = new Date(b.start_time).getTime();
      return timeA - timeB;
    });
});

const currentSeats = computed(() => {
  if (!selectedShowtime.value) return [];
  // Backend returns status might be lowercase, handle strictly uppercase visually but sort intuitively
  return rawSeats.value
    .filter((s) => s.showtime_id === selectedShowtime.value.id)
    .sort((a: any, b: any) => {
      const regex = /^([A-Z]+)(\d+)$/;
      const matchA = a.seat_number.match(regex);
      const matchB = b.seat_number.match(regex);
      if (matchA && matchB) {
        if (matchA[1] !== matchB[1]) return matchA[1].localeCompare(matchB[1]);
        return parseInt(matchA[2], 10) - parseInt(matchB[2], 10);
      }
      return a.seat_number.localeCompare(b.seat_number);
    });
});

const fetchAll = async () => {
  isLoading.value = true;
  try {
    const [shows, seats, moviesRes] = await Promise.all([
      ShowtimesService.getAllShowtimes(),
      SeatsService.getAllSeats(),
      MoviesService.getAllMovies(),
    ]);
    rawShowtimes.value = shows.data || [];
    rawSeats.value = seats.data || [];
    movies.value = moviesRes.data || [];
  } catch (e) {
    console.error(e);
    toast.add({
      severity: "error",
      summary: "Error fetching",
      detail: "Could not load data",
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};

const selectTheater = (t: string) => {
  selectedTheater.value = t;
  selectedShowtime.value = null; // reset
};

const selectShowtime = (st: any) => {
  selectedShowtime.value = st;
};

const getMovieTitle = (movieId: string) => {
  const movie = movies.value.find((m) => m.id === movieId);
  return movie ? movie.title : "Unknown Movie";
};

const formatTime = (isoString: string) => {
  if (!isoString) return "";
  return displayComp.standardDatetime(isoString);
};

// Generate Seat Logic
const isModalOpen = ref(false);
const form = ref({ rows: 8, seatsPerRow: 12 });

const openAddModal = () => {
  form.value = { rows: 8, seatsPerRow: 12 };
  isModalOpen.value = true;
};

const getRowLetter = (index: number) => {
  let name = "";
  let i = index;
  while (i >= 0) {
    name = String.fromCharCode((i % 26) + 65) + name;
    i = Math.floor(i / 26) - 1;
  }
  return name;
};

const generateSeats = async () => {
  if (
    !form.value.rows ||
    !form.value.seatsPerRow ||
    form.value.rows <= 0 ||
    form.value.seatsPerRow <= 0
  ) {
    toast.add({
      severity: "warn",
      summary: "Invalid Input",
      detail: "Rows and Seats per row must be greater than 0",
      life: 3000,
    });
    return;
  }

  try {
    isSaving.value = true;

    const existingNumbers = new Set(
      currentSeats.value.map((s) => s.seat_number),
    );
    const promises = [];

    for (let r = 0; r < form.value.rows; r++) {
      const letter = getRowLetter(r);
      for (let c = 1; c <= form.value.seatsPerRow; c++) {
        const seatNo = `${letter}${c}`;
        if (!existingNumbers.has(seatNo)) {
          promises.push(
            SeatsService.createSeat({
              showtime_id: selectedShowtime.value.id,
              seat_number: seatNo,
              status: "AVAILABLE",
            }),
          );
        }
      }
    }

    if (promises.length === 0) {
      toast.add({
        severity: "info",
        summary: "Info",
        detail: "All generated seats already exist in this showtime!",
        life: 3000,
      });
      isModalOpen.value = false;
      return;
    }

    toast.add({
      severity: "info",
      summary: "Processing",
      detail: `Generating ${promises.length} seats... Please wait.`,
      life: 3000,
    });

    // Use Promise.allSettled to parallelize API requests without failing all if one fails
    await Promise.allSettled(promises);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Seats generated successfully",
      life: 3000,
    });
    isModalOpen.value = false;

    // Re-fetch only seats
    const res = await SeatsService.getAllSeats();
    rawSeats.value = res.data || [];
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to generate some seats",
      life: 3000,
    });
  } finally {
    isSaving.value = false;
  }
};

const deleteSeat = (id: string) => {
  confirm.require({
    message: "Delete this seat?",
    header: "Confirm Deletion",
    acceptProps: { label: "Delete", severity: "danger" },
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    accept: async () => {
      try {
        await SeatsService.deleteSeat(id);
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Deleted",
          life: 3000,
        });
        const res = await SeatsService.getAllSeats();
        rawSeats.value = res.data || [];
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: error.response?.data.error || "Failed to delete",
          life: 3000,
        });
      }
    },
  });
};

onMounted(() => {
  fetchAll();
});
</script>
