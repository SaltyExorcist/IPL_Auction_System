import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/login', { username, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      alert("Invalid Credentials. Try 'admin'/'password'");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#03001C] via-[#071025] to-[#0b1530] text-white p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-300 mb-2">
            IPL ORACLE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Auction Management System
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-panel rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-white">
            Sign In
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-xs sm:text-sm text-gray-400 mb-2 block uppercase tracking-wide">
                Username
              </label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 p-3 sm:p-3.5 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm text-gray-400 mb-2 block uppercase tracking-wide">
                Password
              </label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 p-3 sm:p-3.5 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-amber-400 transition-colors"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black py-3 sm:py-3.5 rounded-lg font-bold text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2024 IPL Oracle. All rights reserved.
        </p>
      </div>
    </div>
  );
};