<template>
  <div class="guest-layout min-h-screen flex flex-col">
    <div
      class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200 min-h-screen relative"
    >
      <!-- Navbar -->
      <Navbar></Navbar>

      <!-- เนื้อหาหลัก -->
      <main class="grow">
        <slot />
      </main>

      <!-- Footer -->
      <Footer></Footer>
    </div>
  </div>
</template>

<script>
import Navbar from "../navbar.vue";
import Footer from "../footer.vue";

export default {
  components: {
    Navbar,
    Footer,
  },
};
</script>
