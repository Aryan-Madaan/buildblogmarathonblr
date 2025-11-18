
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { User } from '../types';
import { LOCAL_STORAGE_KEY_USER, LOCAL_STORAGE_KEY_TRIPS } from '../constants';
import * as db from '../services/firestore';
// FIX: Import Spinner component to be used in the loading state.
import { Spinner } from '../components/ui/Icons';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isOnboardingComplete: boolean;
  login: () => void;
  logout: () => void;
  completeOnboarding: (details: Omit<User, 'avatar'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const checkUser = async () => {
      const { exists, data } = await db.getDoc(LOCAL_STORAGE_KEY_USER);
      // FIX: Check for truthy data in addition to existence to prevent setting user to null on auth.
      if (exists && data) {
        setUser(data);
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
      }
    };
    checkUser();
  }, []);

  const isOnboardingComplete = useMemo(() => !!user, [user]);
  const isAuthenticated = authStatus === 'authenticated';

  const login = () => {
    // In a real app, this would involve a call to an auth provider.
    // We'll just set authenticated and let the app flow to onboarding if needed.
    setAuthStatus('authenticated');
  };

  const logout = async () => {
    setAuthStatus('unauthenticated');
    setUser(null);
    // In a real app, you'd clear tokens, etc. Here we clear the mock DB.
    await db.setDoc(LOCAL_STORAGE_KEY_USER, null);
    await db.setDoc(LOCAL_STORAGE_KEY_TRIPS, null);
    window.location.reload(); // Force a clean state
  };

  const completeOnboarding = async (details: Omit<User, 'avatar'>) => {
    const newUser: User = {
      ...details,
      avatar: `https://api.dicebear.com/8.x/adventurer/svg?seed=${details.name}`,
    };
    await db.setDoc(LOCAL_STORAGE_KEY_USER, newUser);
    setUser(newUser);
    setAuthStatus('authenticated');
  };

  if (authStatus === 'loading') {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-900"><Spinner className="w-8 h-8 text-white" /></div>
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isOnboardingComplete, login, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
