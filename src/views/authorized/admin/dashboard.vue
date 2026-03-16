<template>
  <div class="flex flex-col h-full bg-background overflow-hidden relative">
    <AdminHeader
      title="Dashboard"
      searchPlaceholder="Search recent bookings by ID..."
      @search="searchQuery = $event"
    />

    <div class="flex-1 p-8 overflow-y-auto">
      <div v-if="isLoading" class="flex justify-center py-20">
        <span
          class="material-symbols-outlined animate-spin text-4xl text-primary"
          >progress_activity</span
        >
      </div>

      <div v-else class="flex flex-col gap-8">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            class="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between"
          >
            <div>
              <p class="text-sm text-gray-500 font-medium mb-1">Total Movies</p>
              <h3 class="text-3xl font-bold">{{ movies.length }}</h3>
            </div>
            <div
              class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center"
            >
              <span class="material-symbols-outlined">movie</span>
            </div>
          </div>

          <div
            class="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between"
          >
            <div>
              <p class="text-sm text-gray-500 font-medium mb-1">
                Total Showtimes
              </p>
              <h3 class="text-3xl font-bold">{{ showtimes.length }}</h3>
            </div>
            <div
              class="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center"
            >
              <span class="material-symbols-outlined">event_seat</span>
            </div>
          </div>

          <div
            class="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between"
          >
            <div>
              <p class="text-sm text-gray-500 font-medium mb-1">
                Total Bookings
              </p>
              <h3 class="text-3xl font-bold">{{ bookings.length }}</h3>
            </div>
            <div
              class="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center"
            >
              <span class="material-symbols-outlined">confirmation_number</span>
            </div>
          </div>
        </div>

        <!-- Recent Bookings Table -->
        <div
          class="bg-card border border-border rounded-xl flex flex-col overflow-hidden"
        >
          <div
            class="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30"
          >
            <h2 class="font-bold text-lg">Recent Bookings</h2>
            <router-link
              to="/admin/bookings"
              class="text-sm text-primary font-medium hover:underline"
              >View All</router-link
            >
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="bg-muted text-sm font-semibold border-b border-border"
                >
                  <th class="px-6 py-4">Booking ID</th>
                  <th class="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="booking in recentBookings"
                  :key="booking.id"
                  class="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td class="px-6 py-4 font-mono text-xs">{{ booking.id }}</td>
                  <td class="px-6 py-4">
                    <span
                      class="px-2 py-1 rounded-full text-xs font-bold"
                      :class="{
                        'bg-yellow-100 text-yellow-700':
                          booking.status === 'pending',
                        'bg-green-100 text-green-700':
                          booking.status === 'confirmed',
                        'bg-red-100 text-red-700':
                          booking.status === 'cancelled',
                      }"
                    >
                      {{ booking.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="recentBookings.length === 0">
                  <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                    No recent bookings
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import AdminHeader from "@/components/layouts/AdminHeader.vue";
import { MoviesService } from "@/services/movies.service";
import { ShowtimesService } from "@/services/showtimes.service";
import { BookingsService } from "@/services/bookings.service";

const movies = ref<any[]>([]);
const showtimes = ref<any[]>([]);
const bookings = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref("");

const recentBookings = computed(() => {
  let list = [...bookings.value].reverse();
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((b) => b.id && b.id.toLowerCase().includes(q));
  }
  return list.slice(0, 5);
});

const fetchDashboardData = async () => {
  isLoading.value = true;
  try {
    const [moviesRes, showtimesRes, bookingsRes] = await Promise.all([
      MoviesService.getAllMovies().catch(() => ({ data: [] })),
      ShowtimesService.getAllShowtimes().catch(() => ({ data: [] })),
      BookingsService.getAllBookings().catch(() => ({ data: [] })),
    ]);

    movies.value = moviesRes.data || [];
    showtimes.value = showtimesRes.data || [];
    bookings.value = bookingsRes.data || [];
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>
