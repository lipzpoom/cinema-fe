<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 class="text-3xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-4xl">local_activity</span>
        My Tickets
      </h1>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-4">
        <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        <span class="text-slate-500 font-medium">Loading your tickets...</span>
      </div>

      <div v-else-if="tickets.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow-sm border border-slate-200 dark:border-slate-700">
        <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">receipt_long</span>
        <h2 class="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No tickets found</h2>
        <p class="text-slate-500 mb-6">Looks like you haven't booked any movies yet!</p>
        <router-link to="/home" class="inline-block bg-primary text-white font-semibold py-2 px-6 rounded-xl hover:bg-primary/90 transition-colors shadow shadow-primary/30">
          Browse Movies
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="ticket in sortedTickets" :key="ticket.id" 
             class="flex bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow relative">
          
          <!-- Movie Poster -->
          <div class="w-32 shrink-0 bg-slate-200 dark:bg-slate-700">
            <img v-if="ticket.movie" :src="ticket.movie.image || ticket.movie.posterUrl || 'https://placehold.co/200x300'" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
               <i class="pi pi-image text-3xl"></i>
            </div>
          </div>
          
          <!-- Ticket Info -->
          <div class="p-5 flex flex-col w-full">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-lg leading-tight text-slate-900 dark:text-white line-clamp-2">
                {{ ticket.movie ? ticket.movie.title : 'Loading...' }}
              </h3>
              <!-- Status Badge -->
              <span :class="getStatusClass(ticket.status)" class="text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded uppercase tracking-wider whitespace-nowrap">
                <i :class="getStatusIcon(ticket.status)"></i> {{ ticket.status }}
              </span>
            </div>
            
            <div class="flex flex-col gap-1.5 mt-auto text-sm text-slate-600 dark:text-slate-400">
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px]">calendar_month</span>
                {{ formatDate(ticket.createdAt) }}
              </span>
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
                {{ ticket.showtime ? formatTime(ticket.showtime.start_time) : '...' }}
              </span>
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px]">chair</span>
                Seats: <b class="text-slate-800 dark:text-slate-200">{{ ticket.seats.join(', ') }}</b>
              </span>
              <span class="flex items-center gap-2" v-if="ticket.showtime">
                <span class="material-symbols-outlined text-[16px]">theaters</span>
                Theater {{ ticket.showtime.theater_number }}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-end">
              <button 
                  v-if="ticket.status === 'PENDING'"
                  @click="goToPayment(ticket.id)" 
                  class="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                Proceed to Payment <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button 
                  v-else-if="ticket.status === 'SUCCESS'"
                  class="text-sm font-semibold text-green-600 dark:text-green-400 hover:opacity-80 transition-colors flex items-center gap-1">
                View QR Code <span class="material-symbols-outlined text-sm">qr_code_2</span>
              </button>
               <span v-else class="text-sm font-medium text-slate-400 italic">
                Booking Expired
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { AuthService } from "@/services/auth.service";
import { BookingsService } from "@/services/bookings.service";
import { ShowtimesService } from "@/services/showtimes.service";
import { MoviesService } from "@/services/movies.service";
import { useAppToast } from "@/shared/toast.service";

const router = useRouter();
const toast = useAppToast();
const authService = new AuthService();

const tickets = ref<any[]>([]);
const isLoading = ref(true);

const movieCache = new Map();
const showtimeCache = new Map();

onMounted(async () => {
  await loadTickets();
});

const loadTickets = async () => {
  isLoading.value = true;
  try {
    let userId = null;
    try {
      const profile = await authService.profile();
      userId = profile?.data?.id || profile?.id || await authService.getUserId();
    } catch {
      userId = await authService.getUserId();
    }

    if (!userId) {
      toast.showError("Please login first");
      router.push("/");
      return;
    }

    const result = await BookingsService.getBookingsByUserId(userId);
    const bookings = result.data || result;
    
    // Sort array before assigning, if empty array received from backend
    if (Array.isArray(bookings)) {
      tickets.value = bookings;
    } else {
      tickets.value = [];
    }

    // Now populate movie and showtime info
    for (let ticket of tickets.value) {
       enrichTicket(ticket);
    }

  } catch (error) {
    console.error("Failed to load tickets:", error);
    toast.showError("Could not load tickets");
  } finally {
    isLoading.value = false;
  }
};

const sortedTickets = computed(() => {
  return [...tickets.value].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
});

const enrichTicket = async (ticket: any) => {
  ticket.createdAt = ticket.created_at || ticket.CreatedAt;
  
  if (ticket.showtime_id) {
    try {
      if (!showtimeCache.has(ticket.showtime_id)) {
        const stRes = await ShowtimesService.getShowtimeById(ticket.showtime_id);
        if (stRes.data) {
           showtimeCache.set(ticket.showtime_id, stRes.data);
        }
      }
      
      const st = showtimeCache.get(ticket.showtime_id);
      ticket.showtime = st;

      if (st && st.movie_id) {
        if (!movieCache.has(st.movie_id)) {
          const mvRes = await MoviesService.getMovieById(st.movie_id);
          if (mvRes.data) {
             movieCache.set(st.movie_id, mvRes.data);
          }
        }
        ticket.movie = movieCache.get(st.movie_id);
      }
    } catch (e) {
      console.warn("Failed to enrich ticket details", e);
    }
  }
};

const goToPayment = (id: string) => {
  router.push(`/payment/${id}`);
};

const formatTime = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const formatDate = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const getStatusClass = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'FAILED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS': return 'pi pi-check-circle';
    case 'PENDING': return 'pi pi-clock';
    case 'FAILED': return 'pi pi-times-circle';
    default: return 'pi pi-info-circle';
  }
};
</script>
