// Fully Responsive AuctionRoom.tsx with mobile-optimized layouts
import React from 'react';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { useAuctionData } from '../../hooks/useAuctionData';
import { AuctionTimer, PlayerSpotlight, BidControls, TeamList } from '../../components/AuctionComponents';

export const AuctionRoom = () => {
  // Connect to socket and set up event listeners
  useAuctionSocket();
  useAuctionData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071025] to-[#0b1530]">
      {/* Mobile & Tablet: Stacked layout, Desktop: Grid with sidebar */}
      <div className="h-full">
        {/* Desktop Grid Layout (lg+) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 xl:gap-6 h-screen p-4 xl:p-6">
          {/* Main Arena */}
          <div className="lg:col-span-8 flex flex-col gap-4 xl:gap-6 overflow-y-auto">
            <div className="flex justify-center pt-4">
              <AuctionTimer />
            </div>

            <div className="w-full">
              <PlayerSpotlight />
            </div>

            <div className="w-full">
              <BidControls />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 glass-panel rounded-xl overflow-hidden h-[calc(100vh-2rem)]">
            <TeamList />
          </aside>
        </div>

        {/* Mobile & Tablet Layout */}
        <div className="lg:hidden flex flex-col min-h-screen">
          {/* Timer at top - always visible */}
          <div className="sticky top-0 z-10 bg-gradient-to-b from-[#071025] to-transparent py-3 sm:py-4 flex justify-center">
            <AuctionTimer />
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 px-3 sm:px-4 pb-4 space-y-3 sm:space-y-4">
            {/* Player Spotlight */}
            <div className="w-full">
              <PlayerSpotlight />
            </div>

            {/* Bid Controls - Sticky on mobile for easy access */}
            <div className="w-full sticky bottom-0 z-10 pb-2 bg-gradient-to-t from-[#071025] via-[#071025] to-transparent pt-2">
              <BidControls />
            </div>

            {/* Teams List - Collapsible on mobile */}
            <div className="w-full glass-panel rounded-xl overflow-hidden max-h-[400px] sm:max-h-[500px]">
              <TeamList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};