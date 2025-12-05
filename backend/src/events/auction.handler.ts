import { Server, Socket } from 'socket.io';
import { AuctionEngine } from '../services/AuctionEngine.js';
import type { AuthenticatedUser } from '../types/socket.types.js';

export const registerAuctionHandlers = (
  io: Server, 
  socket: Socket, 
  engine: AuctionEngine,
  user: AuthenticatedUser
) => {
  
  /**
   * EVENT: PLACE BID
   * Permission: Only BIDDERS who own the specific Team
   */
  socket.on('place_bid', async (data: { amount: number }) => {
    try {
      // 1. Role Check
      if (user.role !== 'BIDDER') {
        throw new Error('Only authorized bidders can place bids');
      }

      // 2. Team Integrity Check
      if (!user.teamId) {
        throw new Error('You are not linked to a valid team');
      }

      // 3. Execution (Use teamId from Token, not from Client Payload)
      // This prevents spoofing
      console.log(`Bid received from ${user.username} (${user.teamId})`);
      await engine.placeBid(user.teamId, data.amount);

    } catch (e) {
      socket.emit('error', (e as Error).message);
    }
  });

  /**
   * EVENT: ADMIN START
   * Permission: Only ADMIN
   */
  socket.on('admin_start_auction', async (data: { playerId: string }) => {
    try {
      // 1. Role Check
      if (user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin privileges required');
      }

      console.log(`Admin ${user.username} starting auction for ${data.playerId}`);
      await engine.startAuction(data.playerId);

    } catch (e) {
      socket.emit('error', (e as Error).message);
    }
  });
};