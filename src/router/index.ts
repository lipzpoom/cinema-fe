import { createRouter, createWebHistory, RouterView } from "vue-router";
import { APP_URL } from "./app.url";
import { AuthService } from "@/services/auth.service";

const routes = [
  {
    path: "/",
    redirect: `/${APP_URL.HOME}`,
  },
  {
    path: "/home",
    component: () => import("@/views/unauthorized/home.vue"),
    meta: { layout: "empty", requiresAuth: false },
  },
  {
    path: "/movie/:id",
    component: () => import("@/views/unauthorized/movie-detail.vue"),
    meta: { layout: "empty", requiresAuth: false },
  },
  {
    path: "/payment/:bookingId",
    component: () => import("@/views/authorized/user/payment.vue"),
    meta: { layout: "user", requiresAuth: true, role: "user" },
  },
  {
    path: "/my-tickets",
    component: () => import("@/views/authorized/user/my-tickets.vue"),
    meta: { layout: "user", requiresAuth: true, role: "user" },
  },
  {
    path: "/admin",
    component: RouterView,
    redirect: "/admin/dashboard",
    meta: { layout: "admin", requiresAuth: true, role: "admin" },
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/authorized/admin/dashboard.vue"),
      },
      {
        path: "movies",
        component: () => import("@/views/authorized/admin/movie.vue"),
      },
      {
        path: "theaters",
        component: () => import("@/views/authorized/admin/theater.vue"),
      },
      {
        path: "showtimes",
        component: () => import("@/views/authorized/admin/showtime.vue"),
      },
      {
        path: "seat-monitor",
        component: () => import("@/views/authorized/admin/seat.vue"),
      },
      {
        path: "bookings",
        component: () => import("@/views/authorized/admin/booking.vue"),
      },
      {
        path: "audit-logs",
        component: () => import("@/views/authorized/admin/audit-log.vue"),
      },
      {
        path: "users",
        component: () => import("@/views/authorized/admin/user.vue"),
      },
    ],
  },
  {
    path: `/:pathMatch(.*)*`,
    redirect: `/${APP_URL.HOME}`,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    return next("/");
  }

  if (token) {
    let decodeToken;
    try {
      decodeToken = new AuthService().decodeToken();
    } catch (e) {
      new AuthService().logout();
      return next("/");
    }

    const role = decodeToken.role;

    if (role.toLowerCase() === "admin") {
      if (!to.path.startsWith("/admin")) {
        return next("/admin");
      }
    } else if (role.toLowerCase() === "user") {
      if (to.path.startsWith("/admin") || to.meta.role === "admin") {
        return next(`/${APP_URL.HOME}`);
      }
    }

    if (to.meta.role && to.meta.role !== role.toLowerCase()) {
      return next(`/${APP_URL.HOME}`);
    }
  }

  next();
});

export default router;
