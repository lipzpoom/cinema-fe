<template>
  <div
    class="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex justify-center"
  >
    <div class="max-w-3xl w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white">
          Secure Checkout
        </h1>
        <p class="mt-2 text-slate-500">
          Complete your payment to finalize the booking.
        </p>
      </div>

      <div v-if="isLoading" class="flex justify-center p-12">
        <i class="pi pi-spin pi-spinner text-5xl text-primary"></i>
      </div>

      <div v-else-if="booking" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Order Summary -->
        <div
          class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit"
        >
          <div
            class="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
          >
            <h2 class="text-xl font-bold">Order Summary</h2>
            <div
              class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg flex items-center gap-2 font-mono text-sm font-bold border border-red-100 dark:border-red-900/30"
            >
              <span class="material-symbols-outlined text-[16px] animate-pulse"
                >timer</span
              >
              {{ timeLeft }}
            </div>
          </div>

          <div v-if="movie" class="flex gap-4 mb-6">
            <img
              :src="
                movie.image || movie.posterUrl || 'https://placehold.co/200x300'
              "
              class="w-20 h-28 object-cover rounded-lg shadow"
            />
            <div>
              <h3 class="font-bold text-lg leading-tight">{{ movie.title }}</h3>
              <p class="text-sm text-slate-500 mt-1" v-if="showtime">
                Theater {{ showtime.theater_number }}
              </p>
              <p class="text-sm text-slate-500" v-if="showtime">
                {{ formatTime(showtime.start_time) }}
              </p>
            </div>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Booking ID</span>
              <span class="font-mono text-xs">{{
                booking.id || booking._id
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500"
                >Seats ({{ booking.seats?.length }}x)</span
              >
              <span class="font-semibold">{{ booking.seats?.join(", ") }}</span>
            </div>
            <div
              class="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-3"
            >
              <span class="text-slate-500">Subtotal</span>
              <span
                >THB
                {{
                  (showtime?.price || 150) * (booking.seats?.length || 1)
                }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Tax & Fees</span>
              <span>THB 0</span>
            </div>
            <div
              class="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3 text-lg font-bold"
            >
              <span>Total</span>
              <span class="text-primary"
                >THB
                {{
                  (showtime?.price || 150) * (booking.seats?.length || 1)
                }}</span
              >
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="space-y-6">
          <div
            class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h2 class="text-xl font-bold mb-4">Payment Method</h2>

            <div class="space-y-3">
              <label
                class="flex items-center p-4 border rounded-xl cursor-pointer transition-colors"
                :class="
                  paymentMethod === 'credit'
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                "
              >
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="credit"
                  class="hidden"
                />
                <span class="material-symbols-outlined text-primary mr-3"
                  >credit_card</span
                >
                <span class="font-medium flex-1">Credit / Debit Card</span>
                <i
                  class="pi pi-check-circle text-primary"
                  v-if="paymentMethod === 'credit'"
                ></i>
              </label>

              <label
                class="flex items-center p-4 border rounded-xl cursor-pointer transition-colors"
                :class="
                  paymentMethod === 'qr'
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                "
              >
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="qr"
                  class="hidden"
                />
                <span class="material-symbols-outlined text-primary mr-3"
                  >qr_code_scanner</span
                >
                <span class="font-medium flex-1">PromptPay QR</span>
                <i
                  class="pi pi-check-circle text-primary"
                  v-if="paymentMethod === 'qr'"
                ></i>
              </label>
            </div>

            <!-- Card Mock Form -->
            <div
              v-if="paymentMethod === 'credit'"
              class="mt-6 space-y-4 animate-fade-in"
            >
              <div>
                <label
                  class="block text-xs font-semibold text-slate-500 uppercase mb-1"
                  >Card Number</label
                >
                <input
                  type="text"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:border-primary"
                  placeholder="0000 0000 0000 0000"
                />
              </div>
              <div class="flex gap-4">
                <div class="flex-1">
                  <label
                    class="block text-xs font-semibold text-slate-500 uppercase mb-1"
                    >Expiry</label
                  >
                  <input
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:border-primary"
                    placeholder="MM/YY"
                  />
                </div>
                <div class="flex-1">
                  <label
                    class="block text-xs font-semibold text-slate-500 uppercase mb-1"
                    >CVC</label
                  >
                  <input
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:border-primary"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <!-- QR Mock -->
            <div
              v-if="paymentMethod === 'qr'"
              class="mt-6 flex flex-col items-center animate-fade-in"
            >
              <div
                class="w-40 h-40 bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center"
              >
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MockPayment"
                  alt="QR Code"
                  class="w-full h-full opacity-80"
                />
              </div>
              <p class="text-sm text-slate-500 mt-3 text-center">
                Scan with any mobile banking app
              </p>
            </div>
          </div>

          <Button
            :label="isProcessing ? 'Processing Payment...' : 'Confirm Payment'"
            :icon="isProcessing ? 'pi pi-spinner pi-spin' : 'pi pi-check'"
            class="w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30"
            @click="processPayment"
            :disabled="isProcessing"
          />
        </div>
      </div>

      <div
        v-else
        class="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl"
      >
        <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h2 class="text-xl font-bold">Booking Not Found</h2>
        <p class="text-slate-500 mt-2">
          We couldn't locate your booking details.
        </p>
        <Button label="Back to Home" class="mt-6" @click="router.push('/')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import { useAppToast } from "@/shared/toast.service";
import { BookingsService } from "@/services/bookings.service";
import { ShowtimesService } from "@/services/showtimes.service";
import { MoviesService } from "@/services/movies.service";
import { useSeatWebSocket } from "@/composables/useSeatWebSocket";

const route = useRoute();
const router = useRouter();
const toast = useAppToast();

const bookingId = route.params.bookingId as string;
const isLoading = ref(true);
const isProcessing = ref(false);

const booking = ref<any>(null);
const showtime = ref<any>(null);
const movie = ref<any>(null);
const { connect, sendSeatLock, disconnect } = useSeatWebSocket();

const paymentMethod = ref("credit");

const timeLeft = ref("05:00");
let timerInterval: any = null;

const startTimer = (createdAt: string) => {
  if (timerInterval) clearInterval(timerInterval);

  const createdTime = new Date(createdAt).getTime();
  const expireTime = createdTime + 5 * 60 * 1000; // 5 minutes

  const updateTimer = () => {
    const now = new Date().getTime();
    const diff = expireTime - now;

    if (diff <= 0) {
      clearInterval(timerInterval);
      toast.showError("Booking expired. Please try booking again.");
      router.push("/my-tickets");
      return;
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    timeLeft.value = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  updateTimer(); // Run once immediately
  timerInterval = setInterval(updateTimer, 1000);
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

const fetchDetails = async () => {
  try {
    if (!bookingId || bookingId === "unknown")
      throw new Error("Invalid Booking ID");

    const bRes = await BookingsService.getBookingById(bookingId);
    if (bRes.data) {
      booking.value = bRes.data;

      // Start timer based on created_at or fallback to local time if missing
      if (booking.value.status !== "PENDING") {
        toast.showInfo(`This booking is currently ${booking.value.status}.`);
        router.push("/my-tickets");
        return;
      }
      const createdDate =
        booking.value.created_at ||
        booking.value.CreatedAt ||
        new Date().toISOString();
      startTimer(createdDate);
      if (booking.value.showtime_id) {
        connect(booking.value.showtime_id, () => {});
      }

      if (booking.value.showtime_id) {
        const sRes = await ShowtimesService.getShowtimeById(
          booking.value.showtime_id,
        );
        if (sRes.data) {
          showtime.value = sRes.data;

          if (showtime.value.movie_id) {
            const mRes = await MoviesService.getMovieById(
              showtime.value.movie_id,
            );
            if (mRes.data) {
              movie.value = mRes.data;
            }
          }
        }
      }
    }
  } catch (error: any) {
    console.error("Failed to load checkout details", error);
    toast.showError("Failed to fetch booking information.");
  } finally {
    isLoading.value = false;
  }
};

const processPayment = async () => {
  isProcessing.value = true;
  try {
    // Simulate payment gateway delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Send payment signal to booking backend
    await BookingsService.payBooking(bookingId);

    if (booking.value && booking.value.showtime_id && booking.value.seats) {
      booking.value.seats.forEach((seatNum: string) => {
        sendSeatLock(booking.value.showtime_id, seatNum, "BOOKED");
      });
      await new Promise((res) => setTimeout(res, 500));
      disconnect();
    }

    toast.showSuccess("Payment Successful! Enjoy your movie.");
    router.push("/my-tickets");
  } catch (error: any) {
    toast.showError(
      error?.response?.data?.error || "Payment failed. Please try again.",
    );
  } finally {
    isProcessing.value = false;
  }
};

import { onUnmounted } from "vue";

onMounted(() => {
  fetchDetails();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
