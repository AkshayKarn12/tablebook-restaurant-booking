// src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRestaurantRoom = (restaurantId) => {
  if (socket) socket.emit("join_restaurant", restaurantId);
};

export const joinUserRoom = (userId) => {
  if (socket) socket.emit("join_user", userId);
};

export default { connectSocket, getSocket, disconnectSocket, joinRestaurantRoom, joinUserRoom };
