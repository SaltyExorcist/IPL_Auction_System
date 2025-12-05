import {Redis} from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL);

// Centralized Keys to avoid typos
export const REDIS_KEYS = {
  AUCTION_STATE: 'auction:state',
};