<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10" v-if="movie">
    <!-- Hero Section with Backdrop -->
    <div class="relative w-full h-[60vh] md:h-[70vh]">
      <!-- Backdrop Image -->
      <div class="absolute inset-0">
        <img
          :src="movie.backdropUrl"
          alt="backdrop"
          class="w-full h-full object-cover"
        />
        <!-- Gradient Overlay -->
        <div
          class="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-slate-900 via-slate-900/80 to-slate-900/10 dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent"
        ></div>
      </div>

      <!-- Content Layout -->
      <div class="absolute inset-0 flex items-center">
        <div
          class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row gap-8 items-center md:items-end pt-16 md:pt-0 md:pb-12 text-center md:text-left"
        >
          <!-- Poster -->
          <div
            class="w-40 md:w-72 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black border border-slate-700/50 mt-16 md:mt-0"
          >
            <img
              :src="movie.posterUrl"
              :alt="movie.title"
              class="w-full h-auto object-cover"
            />
          </div>

          <!-- Movie Information -->
          <div class="flex-1 text-white">
            <h1 class="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-md">
              {{ movie.title }}
            </h1>

            <div
              class="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-5 text-sm md:text-base text-slate-200"
            >
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm md:text-base"
                  >calendar_today</span
                >
                {{ movie.releaseDate }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm md:text-base"
                  >schedule</span
                >
                {{ movie.duration }}
              </span>
              <span class="hidden md:inline">•</span>
              <div
                class="flex gap-2 justify-center w-full md:w-auto mt-2 md:mt-0"
              >
                <span
                  v-for="genre in movie.genres"
                  :key="genre"
                  class="px-3 py-1 bg-white/20 hover:bg-white/30 transition-colors rounded-full text-xs font-semibold backdrop-blur-md cursor-default"
                >
                  {{ genre }}
                </span>
              </div>
            </div>

            <p
              class="text-slate-300 max-w-3xl mb-8 line-clamp-4 md:line-clamp-none text-sm md:text-base leading-relaxed"
            >
              {{ movie.synopsis }}
            </p>

            <!-- Actions -->
            <div class="flex gap-4 justify-center md:justify-start">
              <Button
                label="Book Ticket"
                icon="pi pi-ticket"
                class="w-40 py-3 rounded-xl font-bold shadow-lg shadow-primary/30"
                @click="handleBookTicketClick"
              />
              <Button
                label="Watch Trailer"
                icon="pi pi-play"
                severity="secondary"
                outlined
                class="w-44 py-3 rounded-xl text-white border-white/30 hover:bg-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Extra Details Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Cast & Crew -->
        <div class="lg:col-span-2 space-y-10">
          <!-- Showtimes block -->
          <section id="showtimes-section" class="mt-8">
            <h2
              class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-primary"
                >schedule</span
              >
              Showtimes
            </h2>
            <DatePicker :dates="dates" @select="handleDateSelect" />

            <div v-if="showtimes.length > 0" class="mt-4 flex flex-wrap gap-3">
              <button
                v-for="st in showtimes"
                :key="st.id"
                @click="selectShowtime(st)"
                :class="[
                  'border px-5 py-3 rounded-xl transition-colors text-left',
                  selectedShowtime?.id === st.id
                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20',
                ]"
              >
                <div
                  class="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80"
                >
                  Theater {{ st.theater }}
                </div>
                <div class="font-semibold text-lg">{{ st.time }}</div>
                <div class="text-xs opacity-70 mt-0.5">
                  {{ st.price || 150 }} ฿
                </div>
              </button>
            </div>
            <div
              v-else
              class="mt-8 p-8 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-slate-500"
            >
              <p>No showtimes available for this date.</p>
            </div>
          </section>

          <!-- Seats Selection Block -->
          <section v-if="selectedShowtime" class="mt-8" id="seats-section">
            <h2
              class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-primary"
                >event_seat</span
              >
              Select Seats
              <span
                class="text-sm font-normal text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded ml-2"
                >Theater {{ selectedShowtime.theater }}</span
              >
            </h2>
            <div v-if="isLoadingSeats" class="flex justify-center p-8">
              <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
            </div>
            <div
              v-else-if="seatsMap.length > 0"
              class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto"
            >
              <div
                class="mb-10 w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-[100%] flex items-center justify-center text-xs font-bold text-slate-400 max-w-md mx-auto shadow-inner relative overflow-hidden border-b-4 border-slate-300 dark:border-slate-900"
              >
                SCREEN
              </div>

              <SeatLayout
                :seats="seatsMap"
                :isAdmin="false"
                :selectedSeats="selectedSeats"
                @selectSeat="toggleSeat"
              />

              <div
                class="mt-10 flex justify-center gap-6 text-sm bg-slate-50 dark:bg-slate-900/50 py-3 rounded-xl w-fit mx-auto px-6"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-4 h-4 bg-slate-100 dark:bg-slate-600 rounded"
                  ></div>
                  Available
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-4 h-4 bg-primary shadow-sm shadow-primary/40 rounded"
                  ></div>
                  Selected
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded"
                  ></div>
                  Booked
                </div>
              </div>

              <div
                class="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6 flex justify-center"
              >
                <Button
                  :label="
                    selectedSeats.length > 0
                      ? `Book ${selectedSeats.length} Ticket(s)`
                      : 'Select Seats to Book'
                  "
                  icon="pi pi-ticket"
                  class="px-12 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 text-base transition-all"
                  :disabled="selectedSeats.length === 0"
                  @click="handleBookTicketClick"
                />
              </div>
            </div>
            <div
              v-else
              class="p-8 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-slate-500"
            >
              <p>No seats configured for this showtime.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div
    v-else
    class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"
  >
    <div class="flex flex-col items-center gap-4">
      <i class="pi pi-spin pi-spinner text-5xl text-primary"></i>
      <p class="text-slate-500 font-medium">Loading movie details...</p>
    </div>
  </div>

  <!-- Booking & Payment Dialog -->
  <Dialog
    :visible="showBookingModal"
    @update:visible="
      (val) => {
        if (!val) releaseSeatsOnCancel();
      }
    "
    modal
    header="Confirm Booking"
    :style="{ width: '90vw', maxWidth: '450px' }"
    :closable="!isBooking"
  >
    <div v-if="selectedShowtime" class="flex flex-col gap-5 p-2">
      <div class="flex gap-4 items-center">
        <img
          :src="movie.posterUrl"
          class="w-16 h-24 object-cover rounded shadow"
        />
        <div>
          <h3 class="font-bold text-lg leading-tight">{{ movie.title }}</h3>
          <p class="text-sm opacity-80">
            {{ selectedDate }} • {{ selectedShowtime.time }}
          </p>
          <div
            class="mt-1 inline-block bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-semibold"
          >
            Theater {{ selectedShowtime.theater }}
          </div>
        </div>
      </div>

      <div
        class="border-t border-b border-slate-200 dark:border-slate-700 py-4 space-y-3 relative"
      >
        <div class="flex justify-between items-center">
          <span class="text-slate-500 font-medium text-sm"
            >Ticket ({{ selectedSeats.length }}x Adult)</span
          >
          <span class="font-semibold text-slate-800 dark:text-white"
            >THB
            {{ (selectedShowtime.price || 150) * selectedSeats.length }}</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500 font-medium text-sm">Seats</span>
          <span
            class="font-semibold text-slate-800 dark:text-white break-all text-right ml-4"
            >{{ selectedSeats.join(", ") }}</span
          >
        </div>
        <div
          class="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-slate-200 dark:border-slate-700"
        >
          <span class="font-bold">Total Payment</span>
          <span class="font-bold text-lg text-primary"
            >THB
            {{ (selectedShowtime.price || 150) * selectedSeats.length }}</span
          >
        </div>
      </div>

      <Button
        :label="isBooking ? 'Processing Payment...' : 'Pay & Confirm Booking'"
        :icon="isBooking ? 'pi pi-spinner pi-spin' : 'pi pi-check'"
        @click="confirmBooking"
        :disabled="isBooking"
        class="w-full py-3 rounded-xl font-bold"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useAppToast } from "@/shared/toast.service";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { AuthService } from "@/services/auth.service";
import { BookingsService } from "@/services/bookings.service";
import DatePicker from "@/components/date-picker.vue";
import SeatLayout from "@/components/seat-layout.vue";
import { MoviesService } from "@/services/movies.service";
import { ShowtimesService } from "@/services/showtimes.service";
import { SeatsService } from "@/services/seats.service";
import { useSeatWebSocket } from "@/composables/useSeatWebSocket";

const route = useRoute();
const router = useRouter();

const movieId = route.params.id as string;
const movie = ref<any>(null);
const showtimes = ref<any[]>([]);
const dates = ref<any[]>([]);
const selectedDate = ref("");

const selectedShowtime = ref<any>(null);
const seatsMap = ref<any[]>([]);
const selectedSeats = ref<string[]>([]);
const isLoadingSeats = ref(false);

const {
  connect: connectWs,
  disconnect: disconnectWs,
  sendSeatLock,
} = useSeatWebSocket();

const selectShowtime = async (st: any) => {
  selectedShowtime.value = st;
  selectedSeats.value = [];
  isLoadingSeats.value = true;
  try {
    // Disconnect old socket
    disconnectWs();

    const res = await SeatsService.getAllSeats();
    seatsMap.value =
      res.data
        ?.filter((s: any) => s.showtime_id === st.id)
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
        }) || [];
  } catch (err) {
    console.error("Failed to fetch seats", err);
    seatsMap.value = [];
  } finally {
    // Start listening to WebSocket
    if (st && st.id) {
      connectWs(st.id, (payload) => {
        if (payload && payload.seat_id) {
          // Determine if seat_id is sending seat_number or _id. Generally we use seat_number or _id.
          // We'll check both.
          const targetId = payload.seat_id;
          const seatIndex = seatsMap.value.findIndex(
            (s: any) => s.id === targetId || s.seat_number === targetId,
          );
          if (seatIndex !== -1) {
            // Update status from other users
            // Only update if it's not locked by current user's local state, or force sync
            seatsMap.value[seatIndex].status = payload.status;

            // If a seat we selected gets booked/locked by someone else, remove from our selection
            if (
              (payload.status === "LOCKED" || payload.status === "BOOKED") &&
              selectedSeats.value.includes(
                seatsMap.value[seatIndex].seat_number,
              )
            ) {
              if (!isBooking.value) {
                const seatNum = seatsMap.value[seatIndex].seat_number;
                selectedSeats.value = selectedSeats.value.filter(
                  (s) => s !== seatNum,
                );

                toast.showWarn(
                  `ที่นั่ง ${seatNum} ถูกทำรายการโดยผู้ใช้อื่นแล้ว`,
                );

                if (
                  showBookingModal.value &&
                  selectedSeats.value.length === 0
                ) {
                  showBookingModal.value = false;
                  toast.showError(
                    "ที่นั่งทั้งหมดที่คุณเลือกไม่ว่างแล้ว กรุณาเลือกใหม่",
                  );
                }
              }
            }
          }
        }
      });
    }

    isLoadingSeats.value = false;
    setTimeout(() => {
      document
        .getElementById("seats-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
};

const toggleSeat = (seat: any) => {
  if (seat.status !== "AVAILABLE" && seat.status !== "SELECTED_BY_ME") return;
  const idx = selectedSeats.value.indexOf(seat.seat_number);
  if (idx > -1) {
    selectedSeats.value.splice(idx, 1);
    seat.status = "AVAILABLE";
  } else {
    selectedSeats.value.push(seat.seat_number);
    seat.status = "SELECTED_BY_ME";
  }
};

const showBookingModal = ref(false);
const isBooking = ref(false);
const toast = useAppToast();
const authService = new AuthService();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    const response = await authService.googleLogin(idToken);
    if (response && response.token) {
      localStorage.setItem("token", response.token);
      toast.showSuccess("Logged in successfully");
      return true;
    } else {
      toast.showError("Failed to authenticate with server");
      return false;
    }
  } catch (error: any) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      toast.showWarn("User cancelled the login process");
      return false;
    }
    toast.showError("Error during login");
    console.error("Error Login:", error);
    return false;
  }
};

const handleBookTicketClick = async () => {
  if (!selectedShowtime.value) {
    toast.showWarn("Please select a showtime first.");
    const stSection = document.getElementById("showtimes-section");
    if (stSection) stSection.scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (selectedSeats.value.length === 0) {
    toast.showWarn("Please select at least one seat.");
    const seatSection = document.getElementById("seats-section");
    if (seatSection) seatSection.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    toast.showInfo("Please login to proceed with booking.");
    const success = await loginWithGoogle();
    if (!success) return;
  }

  showBookingModal.value = true;
};

// Removed release lock logic on cancel since they aren't locked during modal view anymore
const releaseSeatsOnCancel = () => {
  showBookingModal.value = false;
};

const confirmBooking = async () => {
  try {
    isBooking.value = true;

    // Snapshot seats before WebSocket echoes them back and clears them
    const finalSeats = [...selectedSeats.value];

    // ✅ ONLY send the WebSocket lock event right as they hit confirm and process starts
    finalSeats.forEach((seatNum) => {
      const seatObj = seatsMap.value.find(
        (s: any) => s.seat_number === seatNum,
      );
      if (seatObj && selectedShowtime.value) {
        // Avoid the websocket echo from removing this from our selectedSeats
        seatObj.status = "SELECTED_BY_ME";
        sendSeatLock(
          selectedShowtime.value.id,
          seatObj.id || seatObj.seat_number,
          "LOCKED",
        );
      }
    });

    // Fetch profile to get user_id
    let userId = null;
    try {
      const profileRes = await authService.profile();
      userId =
        profileRes?.data?.id ||
        profileRes?.id ||
        (await authService.getUserId());
    } catch (err) {
      console.warn("Failed to fetch profile, using token user_id instead");
      userId = await authService.getUserId();
    }

    const result = await BookingsService.createBooking({
      showtime_id: selectedShowtime.value.id,
      seats: finalSeats,
      user_id: userId,
    });
    toast.showSuccess("Booking created! Redirecting to payment...");

    // We intentionally don't call releaseSeatsOnCancel here because they're officially booked now!
    // Just close the modal state silently
    showBookingModal.value = false;

    console.log("Booking Result:", result);

    // Find ID in various possible response structures
    let bookingId = result?.data?.data?.id;

    // If string returned directly
    if (typeof result.data === "string") {
      bookingId = result.data;
    }

    if (bookingId) {
      router.push(`/payment/${bookingId}`);
    } else {
      console.error(
        "Could not find booking ID in array. Payload was:",
        result.data,
      );
      toast.showError(
        "Booking successful but unable to parse ID. Check Console.",
      );
    }
  } catch (error: any) {
    console.error("Booking Error:", error);
    toast.showError(
      error?.response?.data?.error || error?.message || "Booking failed",
    );
  } finally {
    isBooking.value = false;
  }
};

const formatTime = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDuration = (minutes: number) => {
  if (!minutes) return "Unknown";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

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
    // Use local timezone offset
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

const fetchMovieDetails = async () => {
  try {
    const res = await MoviesService.getMovieById(movieId);
    if (res.data) {
      let m = res.data;
      movie.value = {
        id: m.id,
        title: m.title || "Unknown",
        posterUrl: m.image || "https://placehold.co/500x750?text=No+Poster",
        backdropUrl:
          m.image || "https://placehold.co/1920x1080?text=No+Backdrop",

        duration: formatDuration(m.duration),
      };
    }
  } catch (error) {
    console.error("Failed to load movie", error);
  }
};

const fetchShowtimes = async (dateStr: string) => {
  try {
    // using the getNowShowing group and filtering by movieId
    const response = await ShowtimesService.getNowShowing(dateStr);
    const allGroups = response.data || [];

    // Find our movie in the grouped result
    const movieGroup = allGroups.find((g: any) => g.id === movieId);
    if (movieGroup && movieGroup.showtimes) {
      showtimes.value = movieGroup.showtimes
        .map((st: any) => ({
          id: st.id,
          time: formatTime(st.start_time),
          theater: st.theater_number,
          price: st.price,
          status: "available",
        }))
        .sort((a: any, b: any) => {
          return (
            new Date(`1970/01/01 ${a.time}`).getTime() -
            new Date(`1970/01/01 ${b.time}`).getTime()
          );
        });
    } else {
      showtimes.value = [];
    }
  } catch (error) {
    console.error("Failed to fetch showtimes", error);
    showtimes.value = [];
  }
};

const handleDateSelect = (selected: any) => {
  dates.value.forEach((d) => {
    d.active = d.value === selected.value;
  });
  selectedDate.value = selected.value;
  selectedShowtime.value = null;
  selectedSeats.value = [];
  seatsMap.value = [];
  fetchShowtimes(selected.value);
};

onMounted(() => {
  dates.value = generateDates();
  selectedDate.value = dates.value[0].value;
  fetchMovieDetails();
  fetchShowtimes(selectedDate.value);
});
</script>

<style scoped>
/* ซ่อน Scrollbar ของรายชื่อนักแสดง แต่ยังให้ Scroll ได้ปกติ */
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #334155;
}
</style>
