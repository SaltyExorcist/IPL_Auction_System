// Fully Responsive Dashboard with mobile-optimized layouts
import { useState, useMemo } from 'react';
import { useAuctionData } from '../../hooks/useAuctionData';
import { useAuctionStore } from '../../store/useAuctionStore';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Users, DollarSign, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

export const Dashboard = () => {
  useAuctionData();
  const { teams, players } = useAuctionStore();
  const { user } = useAuth();

  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name');

  const sortedTeams = useMemo(() => {
    const t = [...teams];
    if (sortOption === 'name') return t.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOption === 'players')
      return t.sort(
        (a, b) => players.filter(p => p.teamId === b.id).length - players.filter(p => p.teamId === a.id).length
      );
    if (sortOption === 'purse') return t.sort((a, b) => Number(b.purseBalance) - Number(a.purseBalance));
    return t;
  }, [teams, players, sortOption]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return sortedTeams;
    return sortedTeams.filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sortedTeams, searchQuery]);

  const myTeam = teams.find(t => t.id === user?.teamId);

  const soldPlayers = players.filter(p => p.status === 'SOLD');
  const pendingPlayers = players.filter(p => p.status === 'PENDING');
  const unsoldPlayers = players.filter(p => p.status === 'UNSOLD');

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Title - Mobile optimized */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
        Dashboard
      </h1>

      {/* Search + Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 sm:p-3 pl-10 text-gray-200 text-sm sm:text-base"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4 flex-shrink-0" />
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-800 border border-slate-700 p-2 sm:p-2.5 rounded-lg text-gray-200 text-xs sm:text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="players">Sort by Players</option>
            <option value="purse">Sort by Purse</option>
          </select>
        </div>
      </div>

      {/* Your Team Section */}
      {myTeam && (
        <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-xl border border-ipl-gold/30 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-300">Your Team</h2>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-ipl-gold" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{myTeam.name}</p>
          <p className="text-sm sm:text-base text-gray-400">
            Purse: <span className="text-ipl-gold font-mono">₹{myTeam.purseBalance}L</span>
          </p>

          <div className="mt-3 sm:mt-4 space-y-2">
            {players.filter(p => p.teamId === myTeam.id).length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500">No players bought yet.</p>
            ) : (
              players.filter(p => p.teamId === myTeam.id).map(p => (
                <div key={p.id} className="p-2.5 sm:p-3 bg-slate-900/40 rounded-lg border border-white/5 flex justify-between items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm sm:text-base truncate">{p.name}</p>
                    <p className="text-[10px] xs:text-xs text-gray-400">{p.role}</p>
                  </div>
                  <p className="text-ipl-gold font-mono text-xs sm:text-sm flex-shrink-0">
                    ₹{p.soldFor || p.basePrice}L
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Teams With Players */}
        <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-xl">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
            <Users className="mr-2 text-ipl-blue w-5 h-5 sm:w-6 sm:h-6" /> 
            <span>Teams & Players</span>
          </h2>

          <div className="space-y-3 sm:space-y-4 max-h-[450px] sm:max-h-[550px] overflow-y-auto pr-1">
            {filteredTeams.map(team => {
              const teamPlayers = players.filter(p => p.teamId === team.id);
              const isOpen = expandedTeam === team.id;

              return (
                <div
                  key={team.id}
                  className={`bg-slate-800/50 p-3 sm:p-4 rounded-lg border transition-colors ${
                    team.id === user?.teamId 
                      ? 'border-ipl-gold/50 bg-ipl-gold/5' 
                      : 'border-transparent hover:border-white/10'
                  }`}
                >
                  <div 
                    className="flex justify-between items-center cursor-pointer" 
                    onClick={() => setExpandedTeam(isOpen ? null : team.id)}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-white text-sm sm:text-base truncate">{team.name}</p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Players: {teamPlayers.length}
                      </p>
                    </div>
                    <button className="flex-shrink-0 p-1">
                      {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="space-y-2 mt-3 sm:mt-4">
                      {teamPlayers.length === 0 ? (
                        <p className="text-gray-500 text-xs sm:text-sm">No players bought yet.</p>
                      ) : (
                        teamPlayers.map(player => (
                          <div key={player.id} className="bg-slate-900/40 p-2.5 sm:p-3 rounded-lg border border-white/5 flex justify-between items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-white text-xs sm:text-sm truncate">{player.name}</p>
                              <p className="text-[10px] xs:text-xs text-gray-400">{player.role}</p>
                            </div>
                            <p className="text-ipl-gold font-mono text-xs sm:text-sm flex-shrink-0">
                              ₹{player.soldFor || player.basePrice}L
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Players Overview */}
        <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-xl">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
            <Trophy className="mr-2 text-ipl-gold w-5 h-5 sm:w-6 sm:h-6" /> 
            <span>Players Status</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Sold Players</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">{soldPlayers.length}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Pending Auction</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{pendingPlayers.length}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Unsold</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-400">{unsoldPlayers.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};