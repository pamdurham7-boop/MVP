let socket;

export const connectWebSocket = () => {
  const WS_URL =
    window.location.hostname === "localhost"
      ? "ws://localhost:8081"
      : `ws://${window.location.hostname}:8081`;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    console.log("Message from server:", event.data);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };
};

export const sendMessage = (msg) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(msg);
  }
};

export const sendWebSocketMessage = (action, data) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const message = { action, ...data };
    socket.send(JSON.stringify(message));
  }
};

