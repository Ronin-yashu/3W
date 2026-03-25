/**
 * useSocket.js — singleton Socket.io connection.
 * Returns a stable ref object so consumers always get the live socket
 * even though it's set asynchronously inside useEffect.
 */
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(window.location.origin, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      socketInstance.on('connect',       () => console.log('[Socket] connected:', socketInstance.id));
      socketInstance.on('disconnect',    (r) => console.log('[Socket] disconnected:', r));
      socketInstance.on('connect_error', (e) => console.warn('[Socket] error:', e.message));
    }
    socketRef.current = socketInstance;
  }, []);

  // Return the REF — not .current — so consumers always read the latest value
  return socketRef;
}
