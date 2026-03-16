<template>
  <div id="app">
    <Toast />
    <ConfirmDialog />
    <LayoutMenu></LayoutMenu>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import LayoutMenu from "@/components/layouts/layout.vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";

onMounted(() => {
  // Global theme initialization
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } else {
    // If no save, check system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery.matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Listen for system changes if user hasn't explicitly set a preference
    mediaQuery.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    });
  }
});
</script>
