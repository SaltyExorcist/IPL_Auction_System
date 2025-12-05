import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuctionEngine } from '../services/AuctionEngine.js';
import { redis, REDIS_KEYS } from '../config/redis.js';
import { registerAuctionHandlers } from '../events/auction.handler.js';
import type { AuthenticatedUser } from '../types/socket.types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

export const setupSocket = (io: Server) => {
  const engine = new AuctionEngine(io);

  // --- MIDDLEWARE: AUTHENTICATION ---
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return next(new Error('Invalid token'));
      // Attach the typed user to the socket
      (socket as any).user = decoded as AuthenticatedUser;
      next();
    });
  });

  // --- CONNECTION HANDLER ---
  io.on('connection', async (socket: Socket) => {
    // 1. Retrieve User Context
    const user = (socket as any).user as AuthenticatedUser;
    
    console.log(`User connected: ${user.username} [${user.role}]`);

    // 2. Global Sync (Send immediate state)
    const currentState = await redis.hgetall(REDIS_KEYS.AUCTION_STATE);
    socket.emit('state_sync', currentState);

    // 3. Register Modules (Pass user context down)
    registerAuctionHandlers(io, socket, engine, user);

    // 4. Cleanup
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.username}`);
    });
  });
};