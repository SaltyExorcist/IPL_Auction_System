import { useEffect } from 'react';
import { socket } from '../services/socket';
import { useAuctionStore } from '../store/useAuctionStore';

export const useAuctionSocket = () => {
  const syncState = useAuctionStore((s) => s.syncState);
  const setTimer = useAuctionStore((s) => s.setTimer);
  const setNewBid = useAuctionStore((s) => s.setNewBid);
  const handlePlayerSold = useAuctionStore((s) => s.handlePlayerSold);
  const handlePlayerUnsold = useAuctionStore((s) => s.handlePlayerUnsold);

  useEffect(() => {
    //socket.connect();

    const onStateSync = (data: any) => {
      // Backend redis stores strings, ensure numbers where needed
      syncState({
        ...data,
        currentBid: Number(data.currentBid || 0),
        timer: Number(data.timer || 10)
      });
    };

    const onTimerUpdate = (time: number) => {
      setTimer(time);
    };

    const onBidUpdate = (data: { amount: number; teamId: string }) => {
      setNewBid(data.amount, data.teamId);
    };

    const onSold = (data: { playerId: string; winnerId: string; amount: number }) => {
      handlePlayerSold(data.playerId, data.winnerId, data.amount.toString());
    };

    const onUnsold = (data: { playerId: string }) => {
      handlePlayerUnsold(data.playerId);
    };


    socket.on('state_sync', onStateSync);
    socket.on('timer_update', onTimerUpdate);
    socket.on('bid_update', onBidUpdate);
    socket.on('auction_sold', onSold);
    socket.on('auction_unsold',onUnsold);

    return () => {
      socket.off('state_sync');
      socket.off('timer_update');
      socket.off('bid_update');
      socket.off('auction_sold');
      socket.off('auction_unsold');
      //socket.disconnect();
    };
  }, [syncState, setTimer, setNewBid, handlePlayerSold, handlePlayerUnsold]);
};