import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { CURRENT_USER, MOCK_USERS } from '@/lib/mock-data';
import { delay } from '@/lib/utils';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('SnapMemory_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('SnapMemory_user');
      }
    }
    setIsLoading(false);
  }, []);

  const persistUser = (u: User) => {
    localStorage.setItem('SnapMemory_user', JSON.stringify(u));
    setUser(u);
  };

  const getRegisteredUsers = (): User[] => {
    try {
      const raw = localStorage.getItem('SnapMemory_registered_users');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      await delay(600); // Simulate network
      const allUsers = [...MOCK_USERS, ...getRegisteredUsers()];
      const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) throw new Error('No account found with this email address.');
      persistUser(found);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    try {
      await delay(800);
      const registered = getRegisteredUsers();
      const allUsers = [...MOCK_USERS, ...registered];
      const exists = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) throw new Error('An account with this email already exists.');
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=7c3aed`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('SnapMemory_registered_users', JSON.stringify([...registered, newUser]));
      persistUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await delay(300);
    localStorage.removeItem('SnapMemory_user');
    setUser(null);
    setIsLoading(false);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    await delay(1200);
    persistUser(CURRENT_USER);
    setIsLoading(false);
  }, []);

  const forgotPassword = useCallback(async (_email: string) => {
    await delay(800);
    // Mock — in production this triggers Supabase password reset email
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    persistUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      loginWithGoogle,
      forgotPassword,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
