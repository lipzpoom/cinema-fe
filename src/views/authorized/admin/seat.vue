<template>
  <div class="px-6 py-8 flex-1 overflow-y-auto h-full w-full">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
    >
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white">
          Real-Time Seat Monitor
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Monitor seat bookings and locks in real-time.
        </p>
      </div>
    </div>

    <!-- Controls -->
    <div
      class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60 mb-8 flex flex-col md:flex-row gap-4 items-end md:items-center"
    >
      <div class="w-full md:w-1/3">
        <label
          class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          >Select Date</label
        >
        <DatePicker
          v-model="selectedDate"
          @update:modelValue="fetchShowtimes"
          dateFormat="yy-mm-dd"
          class="w-full"
          inputClass="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-slate-900 dark:text-slate-100"
        />
      </div>
      <div v-if="showtimes.length > 0" class="w-full md:w-1/3">
        <label
          class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          >Select Showtime</label
        >
        <select
          v-model="selectedShowtimeId"
          @change="onSelectShowtime"
          class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-slate-900 dark:text-slate-100"
        >
          <option value="">-- Choose Showtime --</option>
          <option v-for="st in showtimes" :key="st.id" :value="st.id">
            Theater {{ st.theater_number }} -
            {{ formatTime(st.start_time) }} ({{ st.movie_title || "Movie" }})
          </option>
        </select>
      </div>
      <div class="w-full md:w-1/3 mt-4 md:mt-0 flex justify-end">
        <div class="flex items-center gap-2">
          <div
            class="w-3 h-3 rounded-full"
            :class="
              isConnected
                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                : 'bg-slate-400'
            "
          ></div>
          <span
            class="text-sm font-semibold text-slate-600 dark:text-slate-300"
            >{{ isConnected ? "Live" : "Disconnected" }}</span
          >
        </div>
      </div>
    </div>

    <!-- Seat Matrix -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
    </div>
    <div
      v-else-if="selectedShowtimeId && seatsMap.length"
      class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60 overflow-x-auto text-center"
    >
      <div
        class="mb-14 w-full h-10 bg-slate-200 dark:bg-slate-700 rounded-[100%] flex items-center justify-center text-sm font-bold text-slate-400 max-w-2xl mx-auto shadow-inner relative overflow-hidden border-b-4 border-slate-300 dark:border-slate-900"
      >
        SCREEN
      </div>

      <SeatLayout :isAdmin="true" :seats="seatsMap" />

      <div
        class="mt-12 flex justify-center gap-8 text-sm bg-slate-50 dark:bg-slate-900 py-4 rounded-xl w-fit mx-auto px-8"
      >
        <div class="flex items-center gap-2 font-medium">
          <div
            class="w-5 h-5 bg-slate-100 dark:bg-slate-600 rounded drop-shadow-sm"
          ></div>
          Available ({{ statCounts.available }})
        </div>
        <div class="flex items-center gap-2 font-medium">
          <div class="w-5 h-5 bg-yellow-400 rounded drop-shadow-sm"></div>
          Locked/In-Process ({{ statCounts.locked }})
        </div>
        <div class="flex items-center gap-2 font-medium">
          <div class="w-5 h-5 bg-red-500 rounded drop-shadow-sm"></div>
          Booked ({{ statCounts.booked }})
        </div>
      </div>
    </div>
    <div
      v-else-if="selectedShowtimeId && !seatsMap.length"
      class="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500"
    >
      No seats found for this showtime.
    </div>
    <div
      v-else-if="!showtimes.length && !isLoading"
      class="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500"
    >
      No movies/showtimes available for this date.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import DatePicker from "primevue/datepicker";
import SeatLayout from "@/components/seat-layout.vue";
import { ShowtimesService } from "@/services/showtimes.service";
import { SeatsService } from "@/services/seats.service";
import { useSeatWebSocket } from "@/composables/useSeatWebSocket";

const selectedDate = ref<Date>(new Date());
const selectedShowtimeId = ref("");
const showtimes = ref<any[]>([]);
const seatsMap = ref<any[]>([]);
const isLoading = ref(false);

const {
  connect: connectWs,
  disconnect: disconnectWs,
  isConnected,
} = useSeatWebSocket();

const fetchShowtimes = async () => {
  if (!selectedDate.value) return;
  try {
    const d = new Date(selectedDate.value);
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
    const response = await ShowtimesService.getNowShowing(dateStr);
    const groups = response.data || [];
    showtimes.value = [];

    let allST: any[] = [];
    groups.forEach((g: any) => {
      if (g.showtimes) {
        g.showtimes.forEach((st: any) => {
          st.movie_title = g.title || "Movie";
          allST.push(st);
        });
      }
    });

    allST.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );
    showtimes.value = allST;
    seatsMap.value = [];
    disconnectWs();

    if (allST.length > 0) {
      selectedShowtimeId.value = allST[0].id;
      onSelectShowtime();
    } else {
      selectedShowtimeId.value = "";
    }
  } catch (err) {
    console.error("Failed to load showtimes:", err);
  }
};

const onSelectShowtime = async () => {
  if (!selectedShowtimeId.value) {
    seatsMap.value = [];
    disconnectWs();
    return;
  }

  isLoading.value = true;
  disconnectWs();

  try {
    const res = await SeatsService.getAllSeats();
    seatsMap.value = (res.data || [])
      .filter((s: any) => s.showtime_id === selectedShowtimeId.value)
      .sort((a: any, b: any) => {
        const regex = /^([A-Z]+)(\d+)$/;
        const matchA = a.seat_number.match(regex);
        const matchB = b.seat_number.match(regex);
        if (matchA && matchB) {
          if (matchA[1] !== matchB[1])
            return matchA[1].localeCompare(matchB[1]);
          return parseInt(matchA[2], 10) - parseInt(matchB[2], 10);
        }
        return a.seat_number.localeCompare(b.seat_number);
      });

    // Setup WS
    connectWs(selectedShowtimeId.value, (payload) => {
      if (payload && payload.seat_id) {
        const targetId = payload.seat_id;
        const seatIndex = seatsMap.value.findIndex(
          (s: any) => s.id === targetId || s.seat_number === targetId,
        );
        if (seatIndex !== -1) {
          // Admin views "SELECTED_BY_ME" from other clients as "LOCKED"
          let incomingStatus = payload.status;
          if (
            incomingStatus === "SELECTED_BY_ME" ||
            incomingStatus === "SELECTED"
          ) {
            incomingStatus = "LOCKED";
          }
          seatsMap.value[seatIndex].status = incomingStatus;
        }
      }
    });
  } catch (err) {
    console.error("fetch seats error", err);
  } finally {
    isLoading.value = false;
  }
};

const formatTime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const statCounts = computed(() => {
  const counts = { available: 0, locked: 0, booked: 0 };
  seatsMap.value.forEach((s) => {
    if (s.status === "AVAILABLE") counts.available++;
    if (s.status === "LOCKED") counts.locked++;
    if (s.status === "BOOKED") counts.booked++;
  });
  return counts;
});

onMounted(() => {
  fetchShowtimes();
});
</script>
