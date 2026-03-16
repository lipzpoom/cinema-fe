<template>
  <div class="flex items-center gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
    <button
      v-for="(date, index) in dates"
      :key="index"
      @click="$emit('select', date)"
      :class="[
        'flex flex-col items-center justify-center min-w-17.5 h-20 rounded-xl cursor-pointer transition-colors',
        date.active
          ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all'
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
      ]"
    >
      <span
        :class="[
          'text-xs font-medium uppercase',
          date.active ? 'opacity-80' : 'opacity-60',
        ]"
        >{{ date.dayName }}</span
      >
      <span class="text-xl font-bold">{{ date.day }}</span>
      <span class="text-xs font-medium">{{ date.month }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from "vue";

defineEmits(["select"]);

defineProps({
  dates: {
    type: Array as PropType<
      {
        dayName: string;
        day: string | number;
        month: string;
        active?: boolean;
      }[]
    >,
    default: () => [],
  },
});
</script>
