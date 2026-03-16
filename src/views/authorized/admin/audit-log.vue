<template>
  <div class="flex flex-col h-full bg-background overflow-hidden relative">
    <AdminHeader
      title="Audit Logs"
      searchPlaceholder="Search logs by action or user..."
      @search="searchQuery = $event"
    >
      <template #actions>
        <div class="flex items-center gap-4">
          <!-- Mode Toggle -->
          <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              @click="setMode('live')"
              class="px-4 py-1.5 text-sm font-bold rounded-md transition-all"
              :class="
                mode === 'live'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              "
            >
              Live
            </button>
            <button
              @click="setMode('history')"
              class="px-4 py-1.5 text-sm font-bold rounded-md transition-all"
              :class="
                mode === 'history'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              "
            >
              History
            </button>
          </div>

          <div
            v-if="mode === 'live'"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors"
            :class="
              isConnected
                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
            "
          >
            <div
              class="w-2.5 h-2.5 rounded-full"
              :class="
                isConnected
                  ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                  : 'bg-slate-400'
              "
            ></div>
            <span class="text-xs font-bold uppercase tracking-wider">{{
              isConnected ? "Live" : "Offline"
            }}</span>
          </div>

          <button
            v-if="mode === 'history'"
            class="flex items-center gap-2 px-5 py-2.5 bg-background border border-border text-foreground text-sm font-bold rounded-xl hover:bg-muted transition-all shadow-sm"
            @click="fetchLogs"
          >
            <span class="material-symbols-outlined text-[20px]">refresh</span>
            Refresh
          </button>
        </div>
      </template>
    </AdminHeader>

    <div class="flex-1 p-8 overflow-y-auto">
      <div v-if="isLoading" class="flex justify-center py-20">
        <span
          class="material-symbols-outlined animate-spin text-4xl text-primary"
          >progress_activity</span
        >
      </div>

      <!-- Logs Table -->
      <div
        v-else
        class="bg-card border border-border rounded-xl overflow-hidden"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-muted text-sm font-semibold border-b border-border">
              <th class="px-6 py-4">Timestamp</th>
              <th class="px-6 py-4">Event</th>
              <th class="px-6 py-4">User ID</th>
              <th class="px-6 py-4">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in filteredLogs"
              :key="log.id || Math.random()"
              class="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td class="px-6 py-4 text-xs">
                {{ new Date(log.timestamp || log.created_at).toLocaleString() }}
              </td>
              <td class="px-6 py-4 font-semibold">
                <span
                  class="px-2 py-1 rounded-md text-xs"
                  :class="{
                    'bg-green-100 text-green-700':
                      log.event?.includes('CREATE') ||
                      log.action?.includes('CREATE'),
                    'bg-blue-100 text-blue-700':
                      log.event?.includes('UPDATE') ||
                      log.action?.includes('UPDATE'),
                    'bg-red-100 text-red-700':
                      log.event?.includes('DELETE') ||
                      log.action?.includes('DELETE'),
                    'bg-amber-100 text-amber-700': log.event?.includes('PAY'),
                    'bg-gray-100 text-gray-700': !(
                      log.event || log.action
                    )?.match(/CREATE|UPDATE|DELETE|PAY/),
                  }"
                >
                  {{ log.event || log.action }}
                </span>
              </td>
              <td class="px-6 py-4 font-mono text-xs">{{ log.user_id }}</td>
              <td
                class="px-6 py-4 text-sm text-gray-500 max-w-sm truncate font-mono"
                :title="log.value || log.details"
              >
                {{ log.value || log.details }}
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                No audit logs found
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
import { AuditLogService } from "@/services/audit-log";
import { useAuditLogWebSocket } from "@/composables/useAuditLogWebSocket";

const mode = ref<"live" | "history">("live");
const liveLogs = ref<any[]>([]);
const historyLogs = ref<any[]>([]);

const logs = computed(() => {
  return mode.value === "live" ? liveLogs.value : historyLogs.value;
});

const searchQuery = ref("");

const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value;
  const q = searchQuery.value.toLowerCase();
  return logs.value.filter((log) => {
    return (
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.event && log.event.toLowerCase().includes(q)) ||
      (log.user_id && log.user_id.toLowerCase().includes(q)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(q)) ||
      (log.value && JSON.stringify(log.value).toLowerCase().includes(q))
    );
  });
});

const isLoading = ref(false);

const { connect, isConnected } = useAuditLogWebSocket();

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const res = await AuditLogService.getAllAuditLogs();
    console.log("📜 Fetched audit logs:", res);
    historyLogs.value = res.data?.data || res.data || [];
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
  } finally {
    isLoading.value = false;
  }
};

const setMode = (m: "live" | "history") => {
  mode.value = m;
  if (m === "history" && historyLogs.value.length === 0) {
    fetchLogs();
  }
};

onMounted(() => {
  // Connect to realtime Audit Log WebSocket using the composable
  connect((newLog) => {
    console.log("📥 New audit log received:", newLog);

    // Adapt payload if backend sends `event` and `seat_number`
    const formattedLog = {
      ...newLog,
      id: newLog.id || Math.random().toString(),
      timestamp:
        newLog.created_at || newLog.timestamp || new Date().toISOString(),
      event: newLog.event || newLog.action || "UNKNOWN",
      user_id: newLog.user_id || "System",
      value:
        newLog.value ||
        newLog.details ||
        (newLog.seat_number ? `Target: ${newLog.seat_number}` : ""),
    };

    // Push real-time log to the top
    liveLogs.value.unshift(formattedLog);

    // Prevent the list from growing indefinitely (keep max 100 on screen)
    if (liveLogs.value.length > 100) {
      liveLogs.value.pop();
    }
  });
});
</script>
