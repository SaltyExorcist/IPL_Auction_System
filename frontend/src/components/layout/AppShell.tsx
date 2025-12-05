// Fully Responsive AppShell with mobile-optimized navigation
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Gavel, LogOut, Shield, Menu, X, Trophy } from 'lucide-react';

export const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2.5 sm:py-2 rounded-lg transition-all mb-1 w-full text-sm sm:text-base ${
      isActive 
        ? 'bg-amber-300/10 text-amber-300 border border-amber-300/20 font-semibold' 
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="flex flex-col h-screen text-white bg-[#071025] overflow-hidden">
      {/* Mobile Topbar */}
      <header className="flex md:hidden items-center justify-between p-3 border-b border-white/6 bg-gradient-to-b from-[#071025] to-[#061020] z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileOpen(v => !v)} 
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors active:scale-95"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-amber-300" />
            ) : (
              <Menu className="w-5 h-5 text-amber-300" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-300" />
            <div>
              <h1 className="text-base font-bold text-amber-300 leading-tight">IPL ORACLE</h1>
              <p className="text-[10px] text-slate-400">Auction</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right hidden xs:block">
            <p className="text-xs text-slate-400">{user?.username}</p>
            <p className="text-[10px] text-amber-300">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-xs sm:text-sm text-rose-400 hover:text-rose-300 p-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-56 lg:w-64 flex-col border-r border-white/6 bg-[#071025]">
          {/* Desktop Logo */}
          <div className="p-4 lg:p-6 border-b border-white/6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-amber-300 leading-tight">
                  IPL ORACLE
                </h1>
                <p className="text-xs text-slate-400">Auction System</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 flex flex-col gap-1 p-3 lg:p-4 overflow-y-auto">
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard className="w-4 h-4 lg:w-5 lg:h-5 mr-3 flex-shrink-0" /> 
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/auction" className={navClass}>
              <Gavel className="w-4 h-4 lg:w-5 lg:h-5 mr-3 flex-shrink-0" /> 
              <span>Auction Room</span>
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={navClass}>
                <Shield className="w-4 h-4 lg:w-5 lg:h-5 mr-3 flex-shrink-0" /> 
                <span>Admin Panel</span>
              </NavLink>
            )}
          </nav>

          {/* Desktop User Info & Logout */}
          <div className="p-3 lg:p-4 border-t border-white/6">
            <div className="mb-3 p-2 bg-white/3 rounded-lg">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
              <p className="text-xs text-amber-300">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center text-rose-400 hover:text-rose-300 hover:bg-rose-400/5 w-full px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" /> 
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Slide-in Menu */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            
            {/* Slide-in Panel */}
            <div className="md:hidden fixed inset-y-0 left-0 w-64 sm:w-72 bg-[#071025] z-50 flex flex-col border-r border-white/6 shadow-2xl">
              {/* Mobile Menu Header */}
              <div className="p-4 border-b border-white/6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-amber-300">IPL ORACLE</h1>
                    <p className="text-xs text-slate-400">Auction System</p>
                  </div>
                </div>
                
                {/* User Info */}
                <div className="p-2 bg-white/3 rounded-lg">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                  <p className="text-xs text-amber-300">{user?.role}</p>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
                <NavLink 
                  to="/dashboard" 
                  className={navClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
                </NavLink>
                <NavLink 
                  to="/auction" 
                  className={navClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <Gavel className="w-5 h-5 mr-3" /> Auction Room
                </NavLink>
                {user?.role === 'ADMIN' && (
                  <NavLink 
                    to="/admin" 
                    className={navClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Shield className="w-5 h-5 mr-3" /> Admin Panel
                  </NavLink>
                )}
              </nav>

              {/* Mobile Logout */}
              <div className="p-3 border-t border-white/6">
                <button 
                  onClick={handleLogout} 
                  className="flex items-center text-rose-400 hover:text-rose-300 hover:bg-rose-400/5 w-full px-3 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#071025] to-[#071427]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};