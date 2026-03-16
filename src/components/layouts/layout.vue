<template>
  <component :is="currentLayout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { AuthService } from "@/services/auth.service";

// นำเข้า Layout แต่ละแบบมา
import LayoutEmpty from "./layout-empty.vue";
import LayoutUser from "./layout-user.vue";
import LayoutAdmin from "./layout-admin.vue";

const route = useRoute();
const authService = new AuthService();

// คำนวณหา Layout component จาก route.meta.layout
const currentLayout = computed(() => {
  let layoutStyle = route.meta.layout || "empty";

  // เช็คว่าถ้าเป็น empty แต่ผู้ใช้ Login แล้ว ให้สลับไปใช้ user layout
  if (layoutStyle === "empty") {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const role = authService.decodeToken()?.role;
            if (role && role.toLowerCase() === "admin") {
                layoutStyle = "admin";
            } else {
                layoutStyle = "user";
            }
        } catch (e) {
            layoutStyle = "empty";
        }
    }
  }

  // หากระบุเป็น user โดยตรงใน router ก็ให้เช็คด้วย
  if (layoutStyle === "user") {
    const token = localStorage.getItem("token");
    if (!token) {
      layoutStyle = "empty";
    }
  }

  switch (layoutStyle) {
    case "admin":
      return LayoutAdmin;
    case "user":
      return LayoutUser;
    case "empty":
    default:
      return LayoutEmpty;
  }
});
</script>
