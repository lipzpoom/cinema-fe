<template>
  <div
    class="flex h-screen bg-[#f9fafb] dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden font-sans"
  >
    <!-- SideNavBar -->
    <aside
      class="w-64 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col h-full"
    >
      <div class="p-6 flex items-center gap-3">
        <div
          class="h-10 w-10 text-white rounded-xl bg-primary flex items-center justify-center"
        >
          <span class="material-symbols-outlined">movie</span>
        </div>
        <div>
          <h1 class="font-bold text-lg leading-none tracking-tight">
            Cinema Admin
          </h1>
          <p
            class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-wider"
          >
            Management Portal
          </p>
        </div>
      </div>

      <nav class="flex-1 px-4 space-y-1 overflow-y-auto mt-2 custom-scrollbar">
        <router-link
          to="/admin/dashboard"
          custom
          v-slot="{ isActive, navigate }"
        >
          <a
            @click="navigate"
            :class="[
              isActive
                ? 'bg-[#fef2e0] dark:bg-primary/20 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800',
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer',
            ]"
          >
            <span
              :class="[
                'material-symbols-outlined text-[22px]',
                isActive
                  ? 'font-variation-settings-fill-1'
                  : 'group-hover:text-primary',
              ]"
              >dashboard</span
            >
            <span
              :class="['text-sm', isActive ? 'font-semibold' : 'font-medium']"
              >Dashboard</span
            >
          </a>
        </router-link>

        <router-link to="/admin/movies" custom v-slot="{ isActive, navigate }">
          <a
            @click="navigate"
            :class="[
              isActive
                ? 'bg-[#fef2e0] dark:bg-primary/20 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800',
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer',
            ]"
          >
            <span
              :class="[
                'material-symbols-outlined text-[22px]',
                isActive
                  ? 'font-variation-settings-fill-1'
                  : 'group-hover:text-primary',
              ]"
              >movie</span
            >
            <span
              :class="['text-sm', isActive ? 'font-semibold' : 'font-medium']"
              >Movies</span
            >
          </a>
        </router-link>

        <router-link
          to="/admin/showtimes"
          custom
          v-slot="{ isActive, navigate }"
        >
          <a
            @click="navigate"
            :class="[
              isActive
                ? 'bg-[#fef2e0] dark:bg-primary/20 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800',
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer',
            ]"
          >
            <span
              :class="[
                'material-symbols-outlined text-[22px]',
                isActive
                  ? 'font-variation-settings-fill-1'
                  : 'group-hover:text-primary',
              ]"
              >schedule</span
            >
            <span
              :class="['text-sm', isActive ? 'font-semibold' : 'font-medium']"
              >Showtimes</span
            >
          </a>
        </router-link>

        <router-link
          to="/admin/theaters"
          custom
          v-slot="{ isActive, navigate }"
        >
          <a
            @click="navigate"
            :class="[
              isActive
                ? 'bg-[#fef2e0] dark:bg-primary/20 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800',
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer',
            ]"
          >
            <span
              :class="[
                'material-symbols-outlined text-[22px]',
                isActive
                  ? 'font-variation-settings-fill-1'
                  : 'group-hover:text-primary',
              ]"
              >theater_comedy</span
            >
            <span
              :class="['text-sm', isActive ? 'font-semibold' : 'font-medium']"
              >Theaters</span
            >
          </a>
        </router-link>

        <router-link
          to="/admin/bookings"
          custom
          v-slot="{ isActive, navigate }"
        >
          <a
            @click="navigate"
            :class="[
              isActive
                ? 'bg-[#fef2e0] dark:bg-primary/20 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800',
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer',
            ]"
          >
            <span
              :class="[
                'material-symbols-outlined text-[22px]',
                isActive
                  ? 'font-variation-settings-fill-1'
                  : 'group-hover:text-primary',
              ]"
              >confirmation_number</span
            >
            <span
              :class="['text-sm', isActive ? 'font-semibold' : 'font-medium']"
              >Bookings</span
            >
          </a>
        </router-link>

        <router-link
          to="/admin/seat-monitor"
          custom
          v-slot="{ isActive, navigate }"
        >
          <a
            @click="navigate"
            :class="[
              isActive
                ? 'bg-[#fef2e0] dark:bg-primary/20 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800',
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer',
            ]"
          >
            <span
              :class="[
                'material-symbols-outlined text-[22px]',
                isActive
                  ? 'font-variation-settings-fill-1'
                  : 'group-hover:text-primary',
              ]"
              >grid_view</span
            >
            <span
              :class="['text-sm', isActive ? 'font-semibold' : 'font-medium']"
              >Seat Monitor</span
            >
          </a>
        </router-link>

        <router-link
          to="/admin/audit-logs"
          custom
          v-slot="{ isActive, navigate }"
        >
          <a
            @click="navigate"
            :class="[
              isActive
                ? 'bg-[#fef2e0] dark:bg-primary/20 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800',
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer',
            ]"
          >
            <span
              :class="[
                'material-symbols-outlined text-[22px]',
                isActive
                  ? 'font-variation-settings-fill-1'
                  : 'group-hover:text-primary',
              ]"
              >history_edu</span
            >
            <span
              :class="['text-sm', isActive ? 'font-semibold' : 'font-medium']"
              >Audit Logs</span
            >
          </a>
        </router-link>

        <div class="pt-4 pb-2 px-3">
          <p
            class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none"
          >
            Settings
          </p>
        </div>

        <router-link to="/admin/users" custom v-slot="{ isActive, navigate }">
          <a
            @click="navigate"
            :class="[
              isActive
                ? 'bg-[#fef2e0] dark:bg-primary/20 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800',
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer',
            ]"
          >
            <span
              :class="[
                'material-symbols-outlined text-[22px]',
                isActive
                  ? 'font-variation-settings-fill-1'
                  : 'group-hover:text-primary',
              ]"
              >person</span
            >
            <span
              :class="['text-sm', isActive ? 'font-semibold' : 'font-medium']"
              >Users</span
            >
          </a>
        </router-link>
      </nav>

      <div class="p-4 mt-auto border-t border-slate-100 dark:border-slate-700">
        <div
          class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:bg-slate-800 cursor-pointer transition-colors group"
          @click="toggleLogoutPopover"
        >
          <div
            class="h-9 w-9 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white dark:ring-slate-900"
          >
            <img
              alt="Admin user avatar"
              class="h-full w-full object-cover"
              :src="
                userProfile?.img_profile ||
                'https://placehold.co/100x100?text=A'
              "
            />
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-semibold text-slate-900 dark:text-white truncate"
            >
              {{ userProfile?.name || "Loading..." }}
            </p>
            <p
              class="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate"
            >
              {{ userProfile?.role || "Admin" }}
            </p>
          </div>
          <span
            class="material-symbols-outlined text-slate-400 dark:text-slate-500 group-hover:text-slate-600"
            >more_vert</span
          >
        </div>

        <Popover ref="logoutPopover">
          <div class="flex flex-col gap-2 p-2 w-48">
            <div
              class="px-2 pb-2 mb-1 border-b border-surface-200 dark:border-surface-700"
            >
              <span class="text-sm font-medium">My Account</span>
            </div>
            <button
              @click="handleLogout"
              class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors w-full text-left cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        </Popover>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Alternatively, keep <slot/> if the app architecture injects pages differently -->
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { AuthService } from "@/services/auth.service";
import Popover from "primevue/popover";

const router = useRouter();
const authService = new AuthService();

const userProfile = ref<any>(null);
const logoutPopover = ref();

const fetchProfile = async () => {
  try {
    const res = await authService.profile();
    userProfile.value = res;
  } catch (error) {
    console.error("Failed to load profile", error);
  }
};

const toggleLogoutPopover = (event: any) => {
  if (logoutPopover.value) {
    logoutPopover.value.toggle(event);
  }
};

const handleLogout = async () => {
  await authService.logout();
  router.push("/");
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.font-variation-settings-fill-1 {
  font-variation-settings: "FILL" 1;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
