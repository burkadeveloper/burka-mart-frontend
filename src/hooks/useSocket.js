import { useEffect, useState } from "react";
import socket from "../utils/socket";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!socket.connected && token) {
      socket.auth = { token };
      socket.connect();
    }

    const onConnect = () => {
      console.log("Socket connected");
      setIsConnected(true);
    };
    const onDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    };
    const onConnectError = (err) => {
      console.error("Socket connection error:", err.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  return { socket, isConnected };
};
