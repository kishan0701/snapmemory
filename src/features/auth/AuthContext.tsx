import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { MOCK_USERS } from '@/lib/mock-data';
import { delay } from '@/lib/utils';

// Internal type for stored users with hashed password
interface StoredUser extends User {
  _pw?: string; // plain-text password stored locally (mock/demo only)
}

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
        const parsed: StoredUser = JSON.parse(stored);
        // Strip the password before setting into state
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _pw: _, ...publicUser } = parsed;
        setUser(publicUser);
      } catch {
        localStorage.removeItem('SnapMemory_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Store full user (with _pw for registered users) in localStorage; expose without _pw to state
  const persistUser = (u: StoredUser) => {
    localStorage.setItem('SnapMemory_user', JSON.stringify(u));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _pw: _, ...publicUser } = u;
    setUser(publicUser);
  };

  const getRegisteredUsers = (): StoredUser[] => {
    try {
      const raw = localStorage.getItem('SnapMemory_registered_users');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await delay(600); // Simulate network

      if (!email || !password) throw new Error('Please enter both email and password.');

      // 1. Check registered users first (have _pw stored)
      const registered = getRegisteredUsers();
      const regUser = registered.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );
      if (regUser) {
        if (regUser._pw !== password) {
          throw new Error('Incorrect password. Please try again.');
        }
        persistUser(regUser);
        return;
      }

      // 2. Check mock/demo accounts (password is always 'password123')
      const mockUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );
      if (mockUser) {
        if (password !== 'password123') {
          throw new Error('Incorrect password. Please try again.');
        }
        persistUser({ ...mockUser });
        return;
      }

      // 3. Not found at all
      throw new Error('No account found with this email. Please sign up first.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await delay(800);
      const registered = getRegisteredUsers();
      const allEmails = [
        ...MOCK_USERS.map(u => u.email.toLowerCase()),
        ...registered.map(u => u.email.toLowerCase()),
      ];
      if (allEmails.includes(email.toLowerCase())) {
        throw new Error('An account with this email already exists. Please sign in.');
      }
      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar_url: undefined, // No avatar — initials will be shown
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _pw: password,
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

  // Google OAuth mock — shows a picker-style prompt; for demo pick first mock user
  // In production this would use Supabase / Firebase OAuth flow
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    await delay(1200);
    // Instead of always Kishan, prompt user to pick from registered OR mock accounts
    // For now we create a guest Google user with a random seed
    const googleUser: StoredUser = {
      id: `google-${Date.now()}`,
      name: 'Google User',
      email: `google-${Date.now()}@gmail.com`,
      avatar_url: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Check if there's already a logged-in session we can reuse
    const stored = localStorage.getItem('SnapMemory_user');
    if (stored) {
      try {
        const parsed: StoredUser = JSON.parse(stored);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _pw: _, ...pub } = parsed;
        setUser(pub);
        setIsLoading(false);
        return;
      } catch { /* fall through */ }
    }
    persistUser(googleUser);
    setIsLoading(false);
  }, []);

  const forgotPassword = useCallback(async (_email: string) => {
    await delay(800);
    // Mock — in production this triggers Supabase password reset email
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    // Update in registered users store if present
    const registered = getRegisteredUsers();
    const idx = registered.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      registered[idx] = { ...registered[idx], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('SnapMemory_registered_users', JSON.stringify(registered));
    }
    const updated: StoredUser = { ...user, ...updates, updated_at: new Date().toISOString() };
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
