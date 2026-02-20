let socket;

const getWebSocketUrl = () => {
  if (window.location.hostname === "localhost") {
    return "ws://localhost:8081";
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/`;
};

export const connectWebSocket = () => {
  const WS_URL = getWebSocketUrl();

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

