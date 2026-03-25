/**
 * @file useSocket.js
 * @description Manages a single shared Socket.io connection for the app.
 * Connects once on mount, disconnects on unmount.
 * Exposes the socket instance for components to subscribe to events.
 */
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null; // singleton — one connection for entire app

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
    }
    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount — keep alive for entire session
      // Will disconnect when browser tab closes
    };
  }, []);

  return socketRef.current;
}
