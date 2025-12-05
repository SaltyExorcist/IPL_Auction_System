import { io } from 'socket.io-client';

// Points to your backend URL
export const socket = io('http://localhost:3001', {
  autoConnect: false,
  transports: ['websocket']
});