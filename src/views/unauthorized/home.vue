<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
    <!-- Quick Date Picker / Filter Row -->
    <DatePicker :dates="dates" @select="handleDateSelect" />

    <!-- High-Efficiency Schedule List -->
    <section class="mb-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold tracking-tight">Now Showing</h2>
      </div>

      <!-- No Movies Available State -->
      <div
        v-if="showingMovies.length === 0 && !isLoading"
        class="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700"
      >
        <span class="material-symbols-outlined text-6xl text-gray-400 mb-4"
          >movie_off</span
        >
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300">
          No showtimes available
        </h3>
        <p class="text-gray-500 mt-2">
          There are no movies scheduled for the selected date.
        </p>
      </div>

      <!-- Movies List -->
      <div v-else class="space-y-4">
        <MovieShowingCard
          v-for="(movie, index) in showingMovies"
          :key="'showing-' + index"
          :movie="movie"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import DatePicker from "@/components/date-picker.vue";
import MovieShowingCard, {
  type ShowingMovie,
} from "@/components/movie-showing-card.vue";
import { ShowtimesService } from "@/services/showtimes.service";

const dates = ref<any[]>([]);
const showingMovies = ref<ShowingMovie[]>([]);
const selectedDate = ref("");
const isLoading = ref(true);

const generateDates = () => {
  const datesArr = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName =
      i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    // Use local timezone offset to get correct local date string
    const offset = d.getTimezoneOffset() * 60000;
    const value = new Date(d.getTime() - offset).toISOString().split("T")[0];
    datesArr.push({
      dayName,
      day,
      month,
      value,
      active: i === 0,
    });
  }
  return datesArr;
};

const formatDuration = (minutes: number) => {
  if (!minutes) return "Unknown";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const fetchShowtimes = async (dateStr: string) => {
  isLoading.value = true;
  try {
    const response = await ShowtimesService.getNowShowing(dateStr);
    const rawData = response.data;
    if (rawData && Array.isArray(rawData)) {
      showingMovies.value = rawData.map((movie: any) => {
        return {
          id: movie.id,
          title: movie.title || "Unknown Title",
          image: movie.image || "https://placehold.co/400x600?text=No+Image",
          duration: formatDuration(movie.duration),
        };
      });
    } else {
      showingMovies.value = [];
    }
  } catch (error) {
    console.error("Failed to fetch showtimes", error);
    showingMovies.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleDateSelect = (selected: any) => {
  // Update active state visually
  dates.value.forEach((d) => {
    d.active = d.value === selected.value;
  });
  selectedDate.value = selected.value;
  fetchShowtimes(selected.value);
};

onMounted(() => {
  dates.value = generateDates();
  selectedDate.value = dates.value[0].value;
  fetchShowtimes(selectedDate.value);
});
</script>

<style scoped>
.font-display {
  font-family: "Public Sans", sans-serif;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
