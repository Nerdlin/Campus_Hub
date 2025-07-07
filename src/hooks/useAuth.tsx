'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  grades?: any[];
  schedule?: any[];
  attendanceRate?: number;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      const user = await authApi.register(userData);
      setUser(user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 