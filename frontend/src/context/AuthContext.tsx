import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../services/socket';
import type { User } from '../types';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (token && storedUser) {
    setUser(JSON.parse(storedUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    socket.auth = { token };
    socket.connect();
    
    // Add these debug listeners
    socket.on('connect', () => {
      console.log(' Socket connected! ID:', socket.id);
    });
    
    socket.on('connect_error', (err) => {
      console.error(' Socket error:', err.message);
    });
    
    socket.on('error', (msg) => {
      console.error(' Server error:', msg);
    });
  }
}, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Connect Socket immediately
    socket.auth = { token: newToken };
    socket.connect();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
    socket.disconnect(); // Cut the connection
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);