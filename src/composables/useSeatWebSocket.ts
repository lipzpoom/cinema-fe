import { ref, onUnmounted } from "vue";

export function useSeatWebSocket() {
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

  const connect = (
    showtimeId: string,
    onSeatUpdate: (payload: any) => void,
  ) => {
    if (socket.value) {
      socket.value.close();
    }

    const wsUrl = getWsUrl(`/ws/seats?showtime_id=${showtimeId}`);
    console.log("Connecting to WS:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("🟢 Connected to real-time seat tracking:", showtimeId);
      isConnected.value = true;
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("📩 Received seat update:", payload);
        onSeatUpdate(payload);
      } catch (err) {
        console.warn("Failed to parse WS message", err);
      }
    };

    ws.onclose = () => {
      console.log("🔴 Disconnected from seat changes");
      isConnected.value = false;
      socket.value = null;
    };

    ws.onerror = (error) => {
      console.log("⚠️ WebSocket Error:", error);
    };

    socket.value = ws;
  };

  const sendSeatLock = (
    showtimeId: string,
    seatId: string,
    status: "LOCKED" | "AVAILABLE" | "BOOKED",
  ) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      const payload = {
        showtime_id: showtimeId,
        seat_id: seatId,
        status: status,
      };
      console.log("🚀 Sending WS message:", payload);
      socket.value.send(JSON.stringify(payload));
    } else if (
      socket.value &&
      socket.value.readyState === WebSocket.CONNECTING
    ) {
      console.warn("WS connecting, queuing message.");
      if (!socket.value.onopen) {
        socket.value.onopen = () => {};
      }
      const oldOpen = socket.value.onopen;
      socket.value.onopen = (e) => {
        if (typeof oldOpen === "function" && socket.value)
          oldOpen.call(socket.value, e);
        const payload = {
          showtime_id: showtimeId,
          seat_id: seatId,
          status: status,
        };
        console.log("?? Sending delayed WS message:", payload);
        socket.value?.send(JSON.stringify(payload));
      };
    } else {
      console.warn("WS not open. Cannot send message.");
    }
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
    sendSeatLock,
  };
}
