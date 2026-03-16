<template>
  <div class="flex flex-col h-full bg-background overflow-hidden relative">
    <AdminHeader
      title="Bookings Management"
      searchPlaceholder="Search bookings by ID..."
      @search="searchQuery = $event"
    >
      <template #actions>
        <button
          class="flex items-center gap-2 px-5 py-2.5 bg-background border border-border text-foreground text-sm font-bold rounded-xl hover:bg-muted transition-all shadow-sm"
          @click="fetchBookings"
        >
          <span class="material-symbols-outlined text-[20px]">refresh</span>
          Refresh
        </button>
      </template>
    </AdminHeader>

    <div class="flex-1 p-8 overflow-y-auto">
      <div v-if="isLoading" class="flex justify-center py-20">
        <span
          class="material-symbols-outlined animate-spin text-4xl text-primary"
          >progress_activity</span
        >
      </div>

      <!-- Bookings Table -->
      <div
        v-else
        class="bg-card border border-border rounded-xl overflow-hidden"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-muted text-sm font-semibold border-b border-border">
              <th class="px-6 py-4">Booking ID</th>
              <th class="px-6 py-4">User ID</th>
              <th class="px-6 py-4">Showtime ID</th>
              <th class="px-6 py-4">Seats</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="booking in filteredBookings"
              :key="booking.id"
              class="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td class="px-6 py-4 font-mono text-xs">{{ booking.id }}</td>
              <td class="px-6 py-4 font-mono text-xs">{{ booking.user_id }}</td>
              <td class="px-6 py-4 font-mono text-xs">
                {{ booking.showtime_id }}
              </td>
              <td class="px-6 py-4">
                {{ booking.seats?.join(", ") || "N/A" }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold"
                  :class="{
                    'bg-green-100 text-green-700 dark:bg-green-900/30':
                      booking.status === 'SUCCESS',
                    'bg-red-100 text-red-700 dark:bg-red-900/30':
                      booking.status === 'FAILED',
                  }"
                >
                  {{ booking.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <Select
                  v-model="booking.status"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Change Status"
                  @change="updateStatus(booking, $event.value)"
                  class="w-full text-sm text-left"
                />
              </td>
            </tr>
            <tr v-if="bookings.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No bookings found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import AdminHeader from "@/components/layouts/AdminHeader.vue";
import Select from "primevue/select";
import { BookingsService } from "@/services/bookings.service";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();

const bookings = ref<any[]>([]);
const searchQuery = ref("");

const filteredBookings = computed(() => {
  if (!searchQuery.value) return bookings.value;
  const q = searchQuery.value.toLowerCase();
  return bookings.value.filter((b) => {
    return (
      (b.id && b.id.toLowerCase().includes(q)) ||
      (b.user_id && b.user_id.toLowerCase().includes(q))
    );
  });
});

const isLoading = ref(false);

const statusOptions = ref([
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
]);

const fetchBookings = async () => {
  isLoading.value = true;
  try {
    const res = await BookingsService.getAllBookings();
    bookings.value = res.data || [];
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
  } finally {
    isLoading.value = false;
  }
};

const updateStatus = (booking: any, newStatus: string) => {
  if (!newStatus) return;

  confirm.require({
    message: `Are you sure you want to change booking status to ${newStatus}?`,
    header: "Confirm Status Change",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Confirm",
      severity: "primary",
    },
    accept: async () => {
      try {
        await BookingsService.updateBooking(booking.id, {
          ...booking,
          status: newStatus,
        });
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Booking status updated",
          life: 3000,
        });
        fetchBookings();
      } catch (error) {
        console.error("Update status failed:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail:
            (error as any)?.response?.data?.message ||
            (error as any)?.response?.data?.error ||
            (error as any)?.message ||
            "Failed to update status",
          life: 3000,
        });
        fetchBookings(); // refresh to reset select
      }
    },
    reject: () => {
      fetchBookings(); // Reset select if user canceled
    },
  });
};

onMounted(() => {
  fetchBookings();
});
</script>
