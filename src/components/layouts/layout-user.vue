<template>
  <div class="user-layout min-h-screen flex flex-col">
    <div
      class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200 min-h-screen flex flex-col relative"
    >
      <!-- Navbar ฝั่ง User -->
      <header
        class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 p-4 shadow-sm sticky top-0 z-50"
      >
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <router-link to="/">
             <h1 class="text-2xl font-black text-primary flex items-center gap-2">
               <span class="material-symbols-outlined text-3xl">movie</span>
               CineReserve
             </h1>
          </router-link>

          <!-- เมนูของ User -->
          <div class="flex items-center gap-4">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-200">Hello, {{ userName || 'User' }}</span>
            
            
            <div class="flex items-center gap-3">
               <!-- Dark Mode Toggle -->
               <button
                 @click="toggleTheme"
                 class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                 title="Toggle theme"
               >
                 <span class="material-symbols-outlined">{{
                   isDark ? "light_mode" : "dark_mode"
                 }}</span>
               </button>

               <button @click="$router.push('/my-tickets')" class="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors flex items-center gap-1">
                  <span class="material-symbols-outlined text-[20px]">local_activity</span> My Tickets
               </button>
               
               <div class="h-10 w-10 rounded-full border-2 border-primary overflow-hidden shadow-sm" >
                 <img :src="userImage || `https://ui-avatars.com/api/?name=${userName || 'User'}&background=random`" alt="User Profile" class="w-full h-full object-cover" />
               </div>

               <button @click="logout" class="ml-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-colors shadow shadow-red-500/30 flex items-center" title="Logout">
                 <span class="material-symbols-outlined text-[18px]">logout</span>
               </button>
            </div>
          </div>
        </div>
      </header>

      <!-- เนื้อหาหลัก -->
      <main class="grow">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t border-slate-800 mt-auto">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4">
          <p>© 2026 CineReserve. All rights reserved.</p>
          <div class="flex gap-4">
             <a href="#" class="hover:text-white transition-colors">Terms</a>
             <a href="#" class="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '@/services/auth.service';
import { getAuth, signOut } from "firebase/auth";

const router = useRouter();
const authService = new AuthService();

const userName = ref('');
const userImage = ref('');

// Theme logic
const isDark = ref(false);
const applyTheme = (dark) => {
  isDark.value = dark;
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
const toggleTheme = () => {
  const newDark = !isDark.value;
  applyTheme(newDark);
  localStorage.setItem("theme", newDark ? "dark" : "light");
};

onMounted(async () => {
    // Theme Init
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        applyTheme(savedTheme === "dark");
    } else {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        applyTheme(mediaQuery.matches);
        mediaQuery.addEventListener("change", (e) => {
            if (!localStorage.getItem("theme")) {
                applyTheme(e.matches);
            }
        });
    }

    try {
        const payload = authService.decodeToken();

        if (payload) {
            userName.value = payload.name || payload.email?.split('@')[0] || '';
            userImage.value = payload.img_profile || payload.picture || '';
        }
    } catch(e) {}
});

const logout = async () => {
    try {
        const auth = getAuth();
        await signOut(auth);
    } catch(e) {}
    authService.logout();
    window.location.href = '/';
};
</script>
<style scoped>
/* Removed strict background color overrides that broke the theme */
</style>
