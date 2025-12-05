import { Server } from 'socket.io';
import { prisma } from '../config/prisma';
import { redis, REDIS_KEYS } from '../config/redis';

/**
 * Calculate the bid increment based on current bid amount
 * Matches the frontend logic exactly
 */
const getBidIncrement = (currentBid: number): number => {
  if (currentBid < 200) {
    return 10; // 100L-200L → +10L
  } else if (currentBid < 500) {
    return 20; // 200L-500L → +20L
  } else {
    return 25; // 500L+ → +25L
  }
};

/**
 * Calculate the minimum valid next bid
 */
const getMinimumNextBid = (currentBid: number): number => {
  const increment = getBidIncrement(currentBid);
  return currentBid + increment;
};

export class AuctionEngine {
  private io: Server;
  private timerInterval: NodeJS.Timeout | null = null;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Initializes the auction state for a specific player
   */
  async startAuction(playerId: string) {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new Error("Player not found");

    // Define the initial state - currentBid starts at base price
    // No bids have been placed yet
    const initialState = {
      status: 'RUNNING',
      currentBid: player.basePrice.toString(),
      highestBidderId: '', // Empty means no bids yet
      activePlayerId: playerId,
      timer: 10, // 10 seconds default
    };

    // Save to Redis
    await redis.hset(REDIS_KEYS.AUCTION_STATE, initialState);
    
    // Notify all clients
    this.io.emit('state_sync', initialState);
    
    // Start the countdown loop
    this.startTimer();
  }

  /**
   * Handles the countdown logic
   */
  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(async () => {
      // Atomic decrement in Redis
      const timer = await redis.hincrby(REDIS_KEYS.AUCTION_STATE, 'timer', -1);

      if (timer > 0) {
        // Optimization: Only send the number, not the full state
        this.io.emit('timer_update', timer);
      } else {
        this.endAuction();
      }
    }, 1000);
  }

  /**
   * Handles logic when timer hits 0
   */
  private async endAuction() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    // Fetch final state
    const state = await redis.hgetall(REDIS_KEYS.AUCTION_STATE);
    const { activePlayerId, highestBidderId, currentBid } = state;

    if (!activePlayerId) return;

    // Scenario A: Unsold
    if (!highestBidderId || highestBidderId === '') {
      await prisma.player.update({
        where: { id: activePlayerId },
        data: { status: 'UNSOLD' }
      });
      this.io.emit('auction_unsold', { playerId: activePlayerId });
    } 
    // Scenario B: Sold (Requires ACID Transaction)
    else {
      try {
        // Convert currentBid (which comes from Redis as a string | undefined) to a number
        const bidAmount = currentBid ? Number(currentBid) : 0;
        if (!bidAmount || bidAmount <= 0) {
          throw new Error("Invalid bid amount");
        }

        await prisma.$transaction(async (tx) => {
          // 1. Deduct Money
          const team = await tx.team.update({
            where: { id: highestBidderId },
            data: { purseBalance: { decrement: bidAmount } }
          });

          if (Number(team.purseBalance) < 0) {
            throw new Error("Insufficient funds"); // Triggers rollback
          }

          // 2. Assign Player
          await tx.player.update({
            where: { id: activePlayerId },
            data: { 
              status: 'SOLD', 
              soldFor: bidAmount, 
              teamId: highestBidderId 
            }
          });

          // 3. Create Audit Log
          await tx.bid.create({
            data: {
              amount: bidAmount,
              teamId: highestBidderId,
              playerId: activePlayerId
            }
          });
        });

        this.io.emit('auction_sold', { 
          playerId: activePlayerId, 
          winnerId: highestBidderId, 
          amount: bidAmount 
        });

      } catch (error) {
        console.error("Settlement Transaction Failed:", error);
        this.io.emit('error', "CRITICAL: Settlement failed");
      }
    }

    await redis.hset(REDIS_KEYS.AUCTION_STATE, 'status', 'FINISHED');
  }

  /**
   * Uses a Lua script to ensure atomic bidding with dynamic increment validation
   */
  async placeBid(teamId: string, amount: number) {
    const script = `
      local current = tonumber(redis.call('HGET', KEYS[1], 'currentBid'))
      local newAmt = tonumber(ARGV[1])
      
      -- Calculate minimum required bid based on current bid
      local increment = 10
      if current >= 500 then
        increment = 25
      elseif current >= 200 then
        increment = 20
      end
      
      local minBid = current + increment
      
      -- Logic: Bid must meet or exceed minimum increment
      if current == nil or newAmt >= minBid then
        redis.call('HSET', KEYS[1], 'currentBid', newAmt, 'highestBidderId', ARGV[2], 'timer', 10)
        return 1
      else
        return 0
      end
    `;

    // Execute script
    const result = await redis.eval(script, 1, REDIS_KEYS.AUCTION_STATE, amount, teamId);

    if (result === 1) {
      // Reset timer to 10s visually for clients
      this.io.emit('bid_update', { teamId, amount, timer: 10 });
      return true;
    }
    return false;
  }
}