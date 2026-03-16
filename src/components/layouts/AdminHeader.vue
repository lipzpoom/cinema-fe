<template>
  <header
    class="h-20 shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-8 flex items-center justify-between"
  >
    <div class="flex items-center gap-8 flex-1">
      <h2
        class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
      >
        {{ title }}
      </h2>

      <div v-if="showSearch" class="max-w-md w-full">
        <div class="relative group">
          <span
            class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
            >search</span
          >
          <input
            class="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800/80 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all"
            :placeholder="searchPlaceholder"
            type="text"
            @input="$emit('search', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
      <slot name="center-action"></slot>
    </div>

    <div class="flex items-center gap-4">
      <slot name="actions"></slot>

      <div class="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

      <!-- Dark Mode Toggle -->
      <button
        @click="toggleTheme"
        class="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
      >
        <span class="material-symbols-outlined text-[22px]">{{
          isDark ? "light_mode" : "dark_mode"
        }}</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  searchPlaceholder: {
    type: String,
    default: "Search...",
  },
});

defineEmits(["search"]);

const isDark = ref(false);

const applyTheme = (dark: boolean) => {
  isDark.value = dark;
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

onMounted(() => {
  // Just sync the state from document class on mount
  isDark.value = document.documentElement.classList.contains("dark");

  // Create an observer to listen for class changes from other components (like navbar)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        isDark.value = document.documentElement.classList.contains("dark");
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });
});

const toggleTheme = () => {
  const newDark = !isDark.value;
  applyTheme(newDark);
  localStorage.setItem("theme", newDark ? "dark" : "light");
};
</script>
