import { useEffect } from 'react';
import axios from 'axios';
import { useAuctionStore } from '../store/useAuctionStore';
import { useAuth } from '../context/AuthContext';

export const useAuctionData = () => {
  const store = useAuctionStore();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both teams and players in parallel
        const [teamsRes, playersRes] = await Promise.all([
          axios.get('http://localhost:3001/api/teams'),
          axios.get('http://localhost:3001/api/players')
        ]);
        
        // Update store with fetched data
        store.setTeams(teamsRes.data);
        store.setPlayers(playersRes.data);
        
        // Set current user's team ID from JWT token
        if (user?.teamId) {
          store.setCurrentUserTeamId(user.teamId);
          console.log(' User team set:', user.teamId);
        }
        
        console.log(' Auction data loaded:', {
          teams: teamsRes.data.length,
          players: playersRes.data.length,
          userTeam: user?.teamId
        });
      } catch (error) {
        console.error(' Failed to fetch auction data:', error);
      }
    };

    fetchData();
  }, [user?.teamId]);
};