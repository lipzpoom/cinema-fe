<template>
  <div class="flex flex-col gap-4 max-w-4xl mx-auto items-center">
    <div
      v-for="row in groupedSeats"
      :key="row.letter"
      class="flex flex-wrap justify-center gap-2 md:gap-3 w-full"
    >
      <!-- Optional: Show Row Letter -->
      <div
        class="flex items-center justify-center w-6 h-10 md:h-12 text-sm font-bold text-slate-400 mr-2 shrink-0"
      >
        {{ row.letter }}
      </div>
      <template v-for="seat in row.seats" :key="seat.id || seat.seat_number">
        <!-- Interactive Seat for Users -->
        <button
          v-if="!isAdmin"
          @click="$emit('selectSeat', seat)"
          :disabled="
            seat.status !== 'AVAILABLE' && seat.status !== 'SELECTED_BY_ME'
          "
          class="w-10 h-10 md:w-12 md:h-12 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs md:text-sm font-bold transition-all shrink-0 select-none"
          :class="[
            seat.status === 'LOCKED' || seat.status === 'BOOKED'
              ? 'bg-slate-500/50 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none opacity-50'
              : selectedSeats.includes(seat.seat_number) ||
                  seat.status === 'SELECTED_BY_ME'
                ? 'bg-primary text-white shadow-md shadow-primary/40 -translate-y-1'
                : 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-primary/20 dark:hover:bg-primary/40 hover:-translate-y-0.5',
          ]"
        >
          {{ seat.seat_number }}
        </button>

        <!-- Read-Only Seat for Admins -->
        <div
          v-else
          class="w-10 h-10 md:w-12 md:h-12 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs md:text-sm font-bold shadow-sm transition-all shrink-0 select-none"
          :class="{
            'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200':
              seat.status === 'AVAILABLE',
            'bg-yellow-400 text-yellow-900 shadow-yellow-400/40':
              seat.status === 'LOCKED',
            'bg-red-500 text-white shadow-red-500/40': seat.status === 'BOOKED',
          }"
          :title="`Seat ${seat.seat_number} - ${seat.status}`"
        >
          {{ seat.seat_number }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  seats: {
    type: Array,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  selectedSeats: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["selectSeat"]);

const groupedSeats = computed(() => {
  const groups: Record<string, any[]> = {};

  props.seats.forEach((seat: any) => {
    // Extract letter part (e.g. from "A1", get "A")
    const match = seat.seat_number.match(/^([A-Z]+)(\d+)$/);
    if (!match) return;

    const letter = match[1];

    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(seat);
  });

  // Convert to array and sort rows by letter (from A to Z)
  return Object.keys(groups)
    .sort((a, b) => a.localeCompare(b))
    .map((letter) => {
      return {
        letter,
        // Sort seats within row by number ascending
        seats: groups[letter].sort((a, b) => {
          const numA = parseInt(a.seat_number.match(/\d+/)[0], 10);
          const numB = parseInt(b.seat_number.match(/\d+/)[0], 10);
          return numA - numB;
        }),
      };
    });
});
</script>
