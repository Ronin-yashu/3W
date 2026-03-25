/**
 * @file useSocket.js
 * @description Singleton Socket.io connection.
 * Connects to the SAME host/port as the page — works on any device
 * (laptop via localhost, phone via 192.168.x.x) because Vite proxies /socket.io.
 */
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      // Connect to the same origin as the page — Vite proxy forwards to backend
      // On laptop: window.location.origin = http://localhost:5173 → proxied to :5000
      // On phone:  window.location.origin = http://192.168.1.x:5173 → proxied to :5000
      socketInstance = io(window.location.origin, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'], // fallback to polling if WS blocked
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketInstance.on('connect', () =>
        console.log('[Socket] Connected:', socketInstance.id)
      );
      socketInstance.on('disconnect', (reason) =>
        console.log('[Socket] Disconnected:', reason)
      );
      socketInstance.on('connect_error', (err) =>
        console.warn('[Socket] Error:', err.message)
      );
    }
    socketRef.current = socketInstance;
  }, []);

  return socketRef.current;
}
