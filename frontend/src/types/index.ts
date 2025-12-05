export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'BIDDER';
  teamId?: string;
  teamName?: string;
}


export interface Team {
  id: string;
  name: string;
  purseBalance: string; 
  players?: Player[];

}

export interface Player {
  id: string;
  name: string;
  role: string;
  basePrice: string;
  status: 'PENDING' | 'SOLD' | 'UNSOLD';
  image?: string; // Optional URL
  soldFor?: string;
  teamId: string;

}

export interface AuctionState {
  status: 'IDLE' | 'RUNNING' | 'FINISHED';
  activePlayerId: string | null;
  currentBid: number;
  highestBidderId: string | null;
  timer: number;
}