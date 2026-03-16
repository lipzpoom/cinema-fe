<template>
  <!-- Top Navigation Bar -->
  <header
    class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <div class="text-primary">
            <span class="material-symbols-outlined text-3xl">movie_filter</span>
          </div>
          <h1
            class="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase"
          >
            CineReserve
          </h1>
        </div>
        <!-- Search Bar -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <span class="material-symbols-outlined text-slate-400"
                >search</span
              >
            </div>
            <input
              class="block w-full pl-10 pr-3 py-2 border-none bg-slate-100 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-primary text-sm placeholder-slate-500"
              placeholder="Search movies, actors, genres..."
              type="text"
            />
          </div>
        </div>
        <!-- Actions -->
        <div class="flex items-center gap-4">
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleTheme"
            class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center"
            title="Toggle theme"
          >
            <span class="material-symbols-outlined">{{
              isDark ? "light_mode" : "dark_mode"
            }}</span>
          </button>

          <!-- Firebase Auth Profile / Login -->
          <template v-if="user">
            <div
              class="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-primary/20 cursor-pointer flex items-center justify-center"
              @click="toggleProfileMenu"
              title="Profile"
              aria-haspopup="true"
              aria-controls="profile_menu"
            >
              <img
                v-if="user.img_profile"
                class="h-full w-full object-cover"
                :src="user.img_profile"
                alt="User profile avatar"
                referrerpolicy="no-referrer"
              />
              <span
                v-else
                class="material-symbols-outlined text-slate-500 text-lg"
                >person</span
              >
            </div>

            <!-- User Profile Popover -->
            <Popover ref="profileMenu" id="profile_menu">
              <div
                class="flex flex-col items-center gap-4 py-2 px-4 shadow-sm w-60"
              >
                <div
                  class="h-20 w-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 flex items-center justify-center"
                >
                  <img
                    v-if="user.img_profile"
                    class="h-full w-full object-cover"
                    :src="user.img_profile"
                    alt="Profile image"
                    referrerpolicy="no-referrer"
                  />
                  <span
                    v-else
                    class="material-symbols-outlined text-slate-400 text-4xl"
                    >person</span
                  >
                </div>
                <div class="text-center w-full">
                  <p
                    class="font-bold text-base text-slate-900 dark:text-white truncate"
                  >
                    {{ user.name || "No Name" }}
                  </p>
                  <p class="text-sm text-slate-500 truncate">
                    {{ user.email }}
                  </p>
                </div>
                <Button
                  type="button"
                  label="My Tickets"
                  icon="pi pi-ticket"
                  severity="secondary"
                  class="w-full mt-2 mb-2"
                  @click="
                    (e: Event) => {
                      $router.push('/my-tickets');
                      profileMenu.toggle(e);
                    }
                  "
                ></Button>
                <Button
                  type="button"
                  label="Logout"
                  severity="danger"
                  class="w-full mt-2"
                  @click="logout"
                ></Button>
              </div>
            </Popover>
          </template>
          <template v-else>
            <button
              class="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors"
              @click="loginWithGoogle"
            >
              Login/Register
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Popover from "primevue/popover";
import Button from "primevue/button";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { AuthService } from "../services/auth.service";
import { useAppToast } from "@/shared/toast.service";

interface UserJWT {
  user_id: string;
  img_profile: string;
  email: string;
  name: string;
  role: string;
}

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
const authService = new AuthService();
const router = useRouter();
const toast = useAppToast();

const user = ref<UserJWT | null>(null);
const profileMenu = ref();
const isDark = ref(false);

const applyTheme = (dark: boolean) => {
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

const toggleProfileMenu = (event: Event) => {
  profileMenu.value.toggle(event);
};

const loadUserFromToken = () => {
  const decoded = authService.decodeToken();
  if (decoded) {
    user.value = {
      user_id: decoded.user_id,
      img_profile: decoded.img_profile,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } else {
    user.value = null;
  }
};

onMounted(() => {
  loadUserFromToken();

  // Sync theme
  isDark.value = document.documentElement.classList.contains("dark");
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        isDark.value = document.documentElement.classList.contains("dark");
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });
});

const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    // Call backend API
    const response = await authService.googleLogin(idToken);

    // ตรวจสอบข้อมูลจาก backend
    if (response && response.token) {
      localStorage.setItem("token", response.token);
      loadUserFromToken();
      toast.showSuccess("Logged in successfully");

      // หลังจาก load token เสร็จ ถ้าระบุสิทธิ์เป็น admin ให้ไปหน้า Dashboard
      setTimeout(() => {
        if (user.value?.role.toLowerCase() === "admin") {
          router.push("/admin");
        } else {
          // ถ้าเป็น user จะ push ไปที่ home หรือรีโหลดตามที่ตั้งใจไว้ได้โดยมี delay ให้ toast แสดงก่อน
          if (router.currentRoute.value.path !== "/") {
            router.push("/");
          } else {
            window.location.reload();
          }
        }
      }, 1000); // ให้เวลา Toast เด้งโชว์ 1 วินาทีก่อนจะเปลี่ยนหน้า
    } else {
      toast.showError("Failed to authenticate with server");
    }
  } catch (error: any) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      toast.showWarn("User cancelled the login process");
      return;
    }
    toast.showError("Error during login");
    console.error("Error Login:", error);
  }
};

const logout = async () => {
  try {
    // นำ session ออกจาก Firebase ด้วยเพื่อความสมบูรณ์
    await signOut(auth);

    // เคลียร์ Local Storage และ State
    authService.logout();
    user.value = null;

    if (profileMenu.value) {
      profileMenu.value.hide();
    }

    // Refresh หรือ Redirect ไปหน้าแรก
    router.push("/");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};
</script>
