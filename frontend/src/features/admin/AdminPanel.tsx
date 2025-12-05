// Fully Responsive AdminPanel with mobile-optimized layouts
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { socket } from '../../services/socket';
import type { Player } from '../../types';
import { PlusCircle, Gavel, UserPlus, Play, ChevronDown, ChevronUp, Search, Filter, Shuffle } from 'lucide-react';

export const AdminPanel = () => {
  const [pendingPlayers, setPendingPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'base' | 'role' | 'random'>('base');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [collapsed, setCollapsed] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchPending = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/players');
      setPendingPlayers(res.data.filter((p: Player) => p.status === 'PENDING'));
    } catch (error) {
      console.error('Failed to fetch players');
    }
  };

  useEffect(() => {
    fetchPending();
    socket.on('auction_sold', fetchPending);
    socket.on('auction_unsold', fetchPending);
    return () => {
      socket.off('auction_sold');
      socket.off('auction_unsold');
    };
  }, []);

  // Fisher-Yates shuffle
  const shuffleArray = (arr: Player[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const randomizeOrder = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setPendingPlayers(prev => shuffleArray(prev));
    setSortOption('random');
  };

  // Role color map
  const roleStyles: Record<string, string> = {
    Batsman: 'bg-yellow-600/15 border-yellow-500 text-yellow-300',
    Bowler: 'bg-blue-600/12 border-blue-400 text-blue-300',
    'All-Rounder': 'bg-purple-600/12 border-purple-400 text-purple-300',
    Wicketkeeper: 'bg-green-600/12 border-green-400 text-green-300',
  };

  // Filter and sort
  let filteredPlayers = pendingPlayers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (roleFilter === 'ALL' || p.role === roleFilter)
  );

  if (sortOption === 'base') {
    filteredPlayers = [...filteredPlayers].sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
  } else if (sortOption === 'role') {
    filteredPlayers = [...filteredPlayers].sort((a, b) => a.role.localeCompare(b.role));
  }

  const handleStartAuction = (playerId: string) => {
    socket.emit('admin_start_auction', { playerId });
    alert(`Auction started for player ID: ${playerId}`);
  };

  const onSubmitPlayer = async (data: any) => {
    try {
      await axios.post('http://localhost:3001/api/admin/players', {
        ...data,
        basePrice: parseFloat(data.basePrice),
      });
      alert('Player created successfully');
      reset();
      fetchPending();
    } catch (e) {
      alert('Failed to create player');
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
        Admin Panel
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Add Player Section */}
        <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-xl">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-4 sm:mb-6 flex items-center text-white">
            <UserPlus className="mr-2 text-ipl-blue w-4 h-4 sm:w-5 sm:h-5" /> 
            <span>Add Player to Pool</span>
          </h2>

          <form onSubmit={handleSubmit(onSubmitPlayer)} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-[10px] xs:text-xs text-gray-400 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  {...register('name', { required: true })}
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 sm:p-3 rounded mt-1 text-sm sm:text-base text-white"
                  placeholder="e.g. Jasprit Bumrah"
                />
              </div>
              <div>
                <label className="text-[10px] xs:text-xs text-gray-400 uppercase tracking-wide">
                  Role
                </label>
                <select
                  {...register('role')}
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 sm:p-3 rounded mt-1 text-sm sm:text-base text-white"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] xs:text-xs text-gray-400 uppercase tracking-wide">
                Base Price (Lakhs)
              </label>
              <input
                type="number"
                {...register('basePrice', { required: true })}
                className="w-full bg-slate-800 border border-slate-700 p-2.5 sm:p-3 rounded mt-1 text-sm sm:text-base text-white"
                placeholder="200"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-ipl-blue hover:bg-blue-600 py-2.5 sm:py-3 rounded font-bold text-sm sm:text-base flex justify-center items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" /> 
              <span>Add Player</span>
            </button>
          </form>
        </div>

        {/* Auction Queue */}
        <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-xl flex flex-col max-h-[600px] lg:max-h-[700px]">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-4 sm:mb-6 flex items-center text-white">
            <Gavel className="mr-2 text-ipl-gold w-4 h-4 sm:w-5 sm:h-5" /> 
            <span>Auction Queue ({pendingPlayers.length})</span>
          </h2>

          {/* Search + Filters */}
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 sm:p-3 pl-10 text-gray-200 text-sm sm:text-base"
                placeholder="Search players..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4 flex-shrink-0 hidden sm:block" />
              
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value as any)}
                className="flex-1 min-w-[120px] bg-slate-800 border border-slate-700 p-2 rounded-lg text-gray-200 text-xs sm:text-sm"
              >
                <option value="base">By Price</option>
                <option value="role">By Role</option>
                <option value="random">Random</option>
              </select>

              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="flex-1 min-w-[120px] bg-slate-800 border border-slate-700 p-2 rounded-lg text-gray-200 text-xs sm:text-sm"
              >
                <option value="ALL">All Roles</option>
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicketkeeper">Wicketkeeper</option>
              </select>

              <button
                type="button"
                onClick={randomizeOrder}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-white flex items-center gap-1.5 text-xs sm:text-sm font-medium"
              >
                <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                <span className="hidden xs:inline">Draw</span>
              </button>
            </div>
          </div>

          {/* Collapse Toggle */}
          <button
            type="button"
            className="text-xs sm:text-sm text-gray-300 flex items-center gap-1 mb-2 sm:mb-3 hover:text-white transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />} 
            <span>{collapsed ? 'Show Queue' : 'Hide Queue'}</span>
          </button>

          {/* Player Queue List */}
          {!collapsed && (
            <div className="overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 flex-1">
              {filteredPlayers.length === 0 ? (
                <div className="text-center text-gray-500 mt-6 sm:mt-10 text-sm">
                  No pending players found.
                </div>
              ) : (
                filteredPlayers.map(player => (
                  <div
                    key={player.id}
                    className={`p-3 sm:p-4 rounded-lg flex flex-col xs:flex-row justify-between xs:items-center gap-2 xs:gap-3 border ${
                      roleStyles[player.role] ?? 'border-white/5 bg-slate-800/50'
                    } hover:brightness-110 transition-all`}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-sm sm:text-base truncate">
                        {player.name}
                      </h4>
                      <p className="text-[10px] xs:text-xs text-gray-400">
                        {player.role} • Base: ₹{player.basePrice}L
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 xs:gap-3 self-end xs:self-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] xs:text-xs font-semibold ${
                        roleStyles[player.role] ?? 'bg-white/5 text-white'
                      }`}>
                        {player.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartAuction(player.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 sm:w-4 sm:h-4" /> 
                        <span>START</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};