import { ref, onUnmounted } from "vue";

export function useAuditLogWebSocket() {
  const socket = ref<WebSocket | null>(null);
  const isConnected = ref(false);

  // Parse HTTP URL to WS URL
  const getWsUrl = (path: string) => {
    const coreApi =
      import.meta.env.VITE_APP_CORE_API || "http://localhost:8080";
    try {
      const url = new URL(coreApi);
      const protocol = url.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${url.host}${path}`;
    } catch {
      return `ws://localhost:8080${path}`;
    }
  };

  const connect = (onLogReceived: (payload: any) => void) => {
    if (socket.value) {
      socket.value.close();
    }

    const wsUrl = getWsUrl("/ws/auditlogs");
    console.log("Connecting to Audit Log WS:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ Connected to Audit Log WebSocket");
      isConnected.value = true;
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onLogReceived(payload);
      } catch (err) {
        console.warn("Failed to parse Audit WS message", err);
      }
    };

    ws.onclose = () => {
      console.log("🔴 Disconnected from Audit Log WebSocket");
      isConnected.value = false;
      socket.value = null;
    };

    ws.onerror = (error) => {
      console.warn("⚠️ Audit Log WebSocket Error:", error);
    };

    socket.value = ws;
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
}
