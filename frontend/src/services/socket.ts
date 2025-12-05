import { io } from 'socket.io-client';

// Points to your backend URL
export const socket = io(import.meta.env.VITE_API_URL + '', {
  autoConnect: false,
  transports: ['websocket']
});