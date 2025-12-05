import React from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { socket } from '../services/socket';
import { Gavel, User, Trophy, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { getNextBid, getBidIncrement } from '../utils/bidUtils';

// Small helper for responsive spacing
const panelBase = 'rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6';

// --- 1. THE TIMER ---
export const AuctionTimer = () => {
  const timer = useAuctionStore((s) => s.timer);
  const status = useAuctionStore((s) => s.status);
  const isCritical = timer <= 3;

  if (status !== 'RUNNING') return null;

  return (
    <div className={clsx(
      'flex flex-col items-center justify-center relative',
      'w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32',
      'rounded-full border-2 transition-all duration-300',
      isCritical 
        ? 'border-rose-500 bg-rose-600/10 scale-105 animate-pulse' 
        : 'border-amber-400/30 bg-gradient-to-br from-[#071025] to-[#0e1530]'
    )}>
      <span className={clsx(
        'font-extrabold leading-none',
        isCritical 
          ? 'text-rose-400 text-xl xs:text-2xl sm:text-3xl md:text-4xl' 
          : 'text-white text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
      )}>
        {timer}
      </span>
      {isCritical && (
        <span className="absolute -bottom-5 text-[10px] xs:text-xs text-rose-400 font-semibold uppercase tracking-wider">
          Closing
        </span>
      )}
    </div>
  );
};

// --- 2. PLAYER CARD ---
export const PlayerSpotlight = () => {
  const { activePlayerId, players, currentBid, status } = useAuctionStore();
  const player = players.find(p => p.id === activePlayerId);

  if (!player || status === 'IDLE') {
    return (
      <div className={`${panelBase} glass-panel min-h-[240px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[420px] flex flex-col items-center justify-center`}>
        <Trophy className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-amber-400 mb-2 sm:mb-3 opacity-60" />
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-300 text-center px-4">
          Waiting for Auctioneer...
        </h2>
      </div>
    );
  }

  return (
    <div className={`${panelBase} bg-gradient-to-br from-[#071025]/30 to-[#0c1730]/30 overflow-hidden flex flex-col md:flex-row gap-3 sm:gap-4`}>
      {/* Image Section */}
      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center py-3 sm:py-4 md:py-6">
        <div className="w-32 h-32 xs:w-36 xs:h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-64 lg:h-64 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center border-2 border-white/6 shadow-2xl">
          <User className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-slate-400" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 w-full md:w-1/2 px-2 sm:px-4 pb-3 md:py-4 lg:py-6 flex flex-col justify-center">
        <span className="inline-block px-2.5 py-1 sm:px-3 sm:py-1.5 bg-amber-300/10 text-amber-300 text-[10px] xs:text-xs sm:text-sm font-semibold rounded-full w-fit mb-2">
          {player.role.toUpperCase()}
        </span>
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3 text-white leading-tight">
          {player.name}
        </h1>

        <div className="mt-2 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-slate-400 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wide">Base Price</p>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-slate-100 mt-0.5">
              ₹{player.basePrice}L
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wide">Current Bid</p>
            <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-amber-300 mt-0.5">
              ₹{currentBid}L
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. BIDDING CONTROLS (RESPONSIVE) ---
export const BidControls = () => {
  const { currentBid, highestBidderId, currentUserTeamId, teams, status } = useAuctionStore();
  const myTeam = teams.find(t => t.id === currentUserTeamId);
  
  // Use dynamic increment calculation
  const nextBid = getNextBid(Number(currentBid || 0));
  const increment = getBidIncrement(Number(currentBid || 0));
  
  const canAfford = myTeam ? Number(myTeam.purseBalance) >= nextBid : false;
  const isWinning = highestBidderId === currentUserTeamId;

  if (!currentUserTeamId) {
    return (
      <div className={`${panelBase} bg-rose-900/6 border border-rose-800/20 rounded-lg sm:rounded-xl mt-3 sm:mt-4`}>
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 mr-2 sm:mr-3 flex-shrink-0" />
          <p className="text-rose-300 text-xs sm:text-sm md:text-base">⚠️ No team assigned to your account</p>
        </div>
      </div>
    );
  }

  if (status !== 'RUNNING') return null;

  const handleBid = () => {
    if (!myTeam) return;
    socket.emit('place_bid', { amount: nextBid });
  };

  return (
    <div className={`${panelBase} glass-panel mt-3 sm:mt-4 rounded-lg sm:rounded-xl`}>
      {/* Mobile: Stacked Layout */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 md:gap-6">
        {/* Purse Info */}
        <div className="flex-1 flex justify-between sm:block">
          <div>
            <p className="text-slate-400 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wide">Your Purse</p>
            <p className="text-lg xs:text-xl sm:text-2xl font-bold text-white mt-0.5">
              ₹{myTeam?.purseBalance}L
            </p>
          </div>
          
          {/* Show "Winning" badge on mobile next to purse */}
          {isWinning && (
            <div className="sm:hidden bg-emerald-700/10 border border-emerald-500/20 px-3 py-2 rounded-lg flex items-center gap-2 self-center">
              <Gavel className="w-4 h-4 text-emerald-300" />
              <span className="text-emerald-300 font-semibold text-xs">WINNING</span>
            </div>
          )}
        </div>

        {/* Bid Button / Winning Status */}
        <div className="flex-1 flex items-center justify-end">
          {isWinning ? (
            <div className="hidden sm:flex bg-emerald-700/10 border border-emerald-500/20 px-4 py-3 rounded-xl items-center gap-3">
              <Gavel className="w-5 h-5 text-emerald-300" />
              <span className="text-emerald-300 font-semibold text-sm md:text-base">YOU ARE WINNING</span>
            </div>
          ) : (
            <button
              onClick={handleBid}
              disabled={!canAfford}
              className={clsx(
                'w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl',
                'font-bold text-sm sm:text-base md:text-lg transition-all',
                'flex items-center justify-center gap-2',
                canAfford 
                  ? 'bg-amber-300 text-black hover:brightness-95 active:scale-95' 
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed'
              )}
            >
              <Gavel className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">
                BID ₹{nextBid}L
                <span className="hidden xs:inline"> (+{increment}L)</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 4. TEAM SIDEBAR (RESPONSIVE LIST) ---
export const TeamList = () => {
  const { teams, highestBidderId } = useAuctionStore();

  return (
    <div className="p-3 sm:p-4 md:p-6 h-full overflow-y-auto">
      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-amber-300 flex items-center gap-2">
        <Trophy className="w-4 h-4 sm:w-5 sm:h-5" /> 
        <span>Teams</span>
      </h3>

      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {teams.length === 0 ? (
          <div className="text-center text-slate-400 py-6 text-sm">No teams loaded</div>
        ) : (
          teams.map(team => (
            <div 
              key={team.id} 
              className={clsx(
                'p-2.5 sm:p-3 rounded-lg transition-colors',
                highestBidderId === team.id 
                  ? 'bg-amber-400/8 border border-amber-400/20' 
                  : 'bg-white/3 border border-transparent hover:bg-white/5'
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-white text-sm sm:text-base truncate pr-2">
                  {team.name}
                </span>
                {highestBidderId === team.id && (
                  <Gavel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Purse: <span className="font-mono text-white">₹{team.purseBalance}L</span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};