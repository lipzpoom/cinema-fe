<template>
  <div
    class="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow"
  >
    <div class="flex gap-4 items-center flex-1">
      <div class="w-16 h-24 rounded-lg overflow-hidden shrink-0 shadow-sm">
        <img
          class="w-full h-full object-cover"
          :alt="movie.title"
          :src="movie.image || 'https://placehold.co/200x300?text=No+Image'"
        />
      </div>
      <div>
        <h3 class="font-bold text-lg leading-tight">{{ movie.title }}</h3>
        <p class="text-slate-500 text-sm mt-1 mb-2 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">schedule</span>
          {{ movie.duration || "Unknown" }}
        </p>
      </div>
    </div>

    <button
      @click="router.push(`/movie/${movie.id}`)"
      class="w-full md:w-auto bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
    >
      Quick Book
    </button>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

export interface Showtime {
  theater?: string;
  id?: string;
  time: string;
  status: "available" | "fast-filling" | "full";
}

export interface ShowingMovie {
  id?: string;
  title: string;
  image: string;
  duration: string;
}

defineProps({
  movie: {
    type: Object as PropType<ShowingMovie>,
    required: true,
  },
});
</script>
