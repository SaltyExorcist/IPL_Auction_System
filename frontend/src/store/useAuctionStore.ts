import { create } from 'zustand';
import type{ AuctionState, Team, Player } from '../types';

interface StoreState extends AuctionState {
  // Data Caches
  teams: Team[];
  players: Player[];
  currentUserTeamId: string | null; // For simulating "Who am I?"

  // Actions
  setTeams: (teams: Team[]) => void;
  setPlayers: (players: Player[]) => void;
  setCurrentUserTeamId: (id: string) => void;
  
  // Socket Actions
  syncState: (state: Partial<AuctionState>) => void;
  setTimer: (time: number) => void;
  setNewBid: (amount: number, bidderId: string) => void;
  handlePlayerSold: (playerId: string, winnerId: string, amount: string) => void;
  handlePlayerUnsold: (playerId: string) => void;
}

export const useAuctionStore = create<StoreState>((set) => ({
  // Initial State
  status: 'IDLE',
  activePlayerId: null,
  currentBid: 0,
  highestBidderId: null,
  timer: 10,
  teams: [],
  players: [],
  currentUserTeamId: null,

  // Actions
  setTeams: (teams) => set({ teams }),
  setPlayers: (players) => set({ players }),
  setCurrentUserTeamId: (id) => set({ currentUserTeamId: id }),

 syncState: (newState) => set((state) => {
    const merged = { ...state, ...newState };

    // If auction is finished and there's no active player, reset to IDLE
    if (merged.status === 'FINISHED' && !merged.activePlayerId) {
      merged.status = 'IDLE';
      merged.currentBid = 0;
      merged.highestBidderId = null;
      merged.timer = 10;
    }

    return merged;
  }),

  
  setTimer: (timer) => set({ timer }),
  
  setNewBid: (amount, highestBidderId) => set({ 
    currentBid: amount, 
    highestBidderId, 
    timer: 10 // Visual reset immediately
  }),

  handlePlayerSold: (playerId, winnerId, amount) => set((state) => {
  const updatedPlayers = state.players.map(p => 
    p.id === playerId ? { ...p, status: 'SOLD' as const } : p
  );

  const updatedTeams = state.teams.map(t => 
    t.id === winnerId 
      ? { ...t, purseBalance: (parseFloat(t.purseBalance) - parseFloat(amount)).toString() } 
      : t
  );

  return {
    players: updatedPlayers,
    teams: updatedTeams,

    // RESET AUCTION STATE HERE:
    status: 'IDLE',
    activePlayerId: null,
    currentBid: 0,
    highestBidderId: null,
    timer: 10
  };
}),

  handlePlayerUnsold: (playerId) => set((state) => {
  const updatedPlayers = state.players.map(p =>
    p.id === playerId ? { ...p, status: 'UNSOLD' as const } : p
  );

  return {
    players: updatedPlayers,
    activePlayerId: null,
    currentBid: 0,
    highestBidderId: null,
    timer: 10,
    status: 'IDLE'
  };
})

}));